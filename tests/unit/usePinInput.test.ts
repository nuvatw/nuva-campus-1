import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePinInput } from '@/app/hooks/usePinInput';

describe('usePinInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty code array', () => {
    const { result } = renderHook(() => usePinInput());

    expect(result.current.code).toEqual(['', '', '', '']);
    expect(result.current.pin).toBe('');
    expect(result.current.isFull).toBe(false);
    expect(result.current.isEmpty).toBe(true);
  });

  it('should initialize with custom length', () => {
    const { result } = renderHook(() => usePinInput({ length: 6 }));

    expect(result.current.code).toEqual(['', '', '', '', '', '']);
  });

  it('should handle digit input', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
    });

    expect(result.current.code).toEqual(['1', '', '', '']);
    expect(result.current.pin).toBe('1');
    expect(result.current.isEmpty).toBe(false);
  });

  it('should handle multiple digit inputs', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleDigit('3');
    });

    expect(result.current.code).toEqual(['1', '2', '3', '']);
    expect(result.current.pin).toBe('123');
    expect(result.current.isFull).toBe(false);
  });

  it('should detect when code is full', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleDigit('3');
      result.current.handleDigit('4');
    });

    expect(result.current.code).toEqual(['1', '2', '3', '4']);
    expect(result.current.pin).toBe('1234');
    expect(result.current.isFull).toBe(true);
  });

  it('should not accept more digits when full', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleDigit('3');
      result.current.handleDigit('4');
      result.current.handleDigit('5'); // Should be ignored
    });

    expect(result.current.code).toEqual(['1', '2', '3', '4']);
    expect(result.current.pin).toBe('1234');
  });

  it('should only accept numeric digits', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('a');
      result.current.handleDigit('!');
      result.current.handleDigit(' ');
    });

    expect(result.current.code).toEqual(['', '', '', '']);
    expect(result.current.isEmpty).toBe(true);
  });

  it('should handle backspace', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleBackspace();
    });

    expect(result.current.code).toEqual(['1', '', '', '']);
    expect(result.current.pin).toBe('1');
  });

  it('should handle backspace on empty code', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleBackspace();
    });

    expect(result.current.code).toEqual(['', '', '', '']);
    expect(result.current.isEmpty).toBe(true);
  });

  it('should clear all digits', () => {
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleDigit('3');
      result.current.clear();
    });

    expect(result.current.code).toEqual(['', '', '', '']);
    expect(result.current.isEmpty).toBe(true);
  });

  it('should call onComplete when code is full', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => usePinInput({ onComplete }));

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleDigit('3');
      result.current.handleDigit('4');
    });

    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should not call onComplete until code is full', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => usePinInput({ onComplete }));

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.handleDigit('3');
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should reset with delay', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePinInput());

    act(() => {
      result.current.handleDigit('1');
      result.current.handleDigit('2');
      result.current.reset(100);
    });

    // Not cleared yet
    expect(result.current.code).toEqual(['1', '2', '', '']);

    // Advance time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.code).toEqual(['', '', '', '']);

    vi.useRealTimers();
  });
});
