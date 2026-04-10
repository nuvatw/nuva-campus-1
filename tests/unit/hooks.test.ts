import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// =============================================
// useSection Tests
// =============================================

// We need to control usePathname per-test, so we mock it dynamically
let mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Must import after vi.mock
import { useSection } from '@/app/hooks/useSection';

describe('useSection', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('returns HOME section for "/" pathname', () => {
    mockPathname = '/';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('home');
    expect(result.current.section.label).toBe('首頁');
  });

  it('returns ambassadors section for "/ambassadors"', () => {
    mockPathname = '/ambassadors';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('ambassadors');
    expect(result.current.section.label).toBe('大使們');
  });

  it('returns guardian section for "/guardian"', () => {
    mockPathname = '/guardian';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('guardian');
    expect(result.current.section.label).toBe('守護者專區');
  });

  it('returns nunu section for "/nunu"', () => {
    mockPathname = '/nunu';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('nunu');
    expect(result.current.section.label).toBe('努努專區');
  });

  it('returns fafa section for "/fafa"', () => {
    mockPathname = '/fafa';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('fafa');
    expect(result.current.section.label).toBe('法法專區');
  });

  it('returns isDeep: true for nested paths like "/ambassadors/missions/1"', () => {
    mockPathname = '/ambassadors/missions/1';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('ambassadors');
    expect(result.current.isDeep).toBe(true);
  });

  it('returns isDeep: false for base paths like "/ambassadors"', () => {
    mockPathname = '/ambassadors';
    const { result } = renderHook(() => useSection());
    expect(result.current.isDeep).toBe(false);
  });

  it('returns HOME for unknown paths like "/unknown"', () => {
    mockPathname = '/unknown';
    const { result } = renderHook(() => useSection());
    expect(result.current.section.id).toBe('home');
  });
});

// =============================================
// useAuth Tests (pure state logic, no Supabase calls)
// =============================================

// We need a fresh import for useAuth — it uses localStorage heavily
import { useAuth } from '@/app/hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with isLoading: true then false after mount', async () => {
    const { result } = renderHook(() => useAuth());

    // After the effect runs, isLoading should be false
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('isVerified returns false for unverified keys', async () => {
    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVerified('nunu')).toBe(false);
    expect(result.current.isVerified('guardian')).toBe(false);
    expect(result.current.isVerified('ambassador')).toBe(false);
    expect(result.current.isVerified('fafa')).toBe(false);
  });

  it('isVerified returns false for unknown keys', async () => {
    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVerified('unknown_key')).toBe(false);
  });

  it('isVerified returns false for event keys when not verified', async () => {
    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVerified('event_123')).toBeFalsy();
  });

  it('logout() clears all roles', async () => {
    // Seed localStorage with some auth state
    const seededState = {
      nunu: { verified: true, expiry: Date.now() + 100000 },
      ambassador: { verified: true, expiry: Date.now() + 100000 },
      guardian: { verified: false, expiry: 0 },
      fafa: { verified: false, expiry: 0 },
      events: {},
    };
    localStorage.setItem('nuva_campus_auth', JSON.stringify(seededState));

    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Before logout — should be verified
    expect(result.current.isVerified('nunu')).toBe(true);

    // Logout all
    act(() => {
      result.current.logout();
    });

    expect(result.current.isVerified('nunu')).toBe(false);
    expect(result.current.isVerified('ambassador')).toBe(false);
  });

  it('logout(key) clears specific role', async () => {
    const seededState = {
      nunu: { verified: true, expiry: Date.now() + 100000 },
      ambassador: { verified: true, expiry: Date.now() + 100000 },
      guardian: { verified: false, expiry: 0 },
      fafa: { verified: false, expiry: 0 },
      events: {},
    };
    localStorage.setItem('nuva_campus_auth', JSON.stringify(seededState));

    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Logout only nunu
    act(() => {
      result.current.logout('nunu');
    });

    expect(result.current.isVerified('nunu')).toBe(false);
    // Ambassador should still be verified
    expect(result.current.isVerified('ambassador')).toBe(true);
  });

  it('isVerified returns true when verified and within expiry', async () => {
    const seededState = {
      nunu: { verified: true, expiry: Date.now() + 100000 },
      ambassador: { verified: false, expiry: 0 },
      guardian: { verified: false, expiry: 0 },
      fafa: { verified: false, expiry: 0 },
      events: {},
    };
    localStorage.setItem('nuva_campus_auth', JSON.stringify(seededState));

    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVerified('nunu')).toBe(true);
  });

  it('isVerified returns false after expiry', async () => {
    const seededState = {
      nunu: { verified: true, expiry: Date.now() - 1000 }, // Expired
      ambassador: { verified: false, expiry: 0 },
      guardian: { verified: false, expiry: 0 },
      fafa: { verified: false, expiry: 0 },
      events: {},
    };
    localStorage.setItem('nuva_campus_auth', JSON.stringify(seededState));

    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVerified('nunu')).toBe(false);
  });

  it('localStorage persistence: reads saved state on init', async () => {
    const seededState = {
      nunu: { verified: true, expiry: Date.now() + 100000 },
      ambassador: { verified: false, expiry: 0 },
      guardian: { verified: true, expiry: Date.now() + 100000 },
      fafa: { verified: false, expiry: 0 },
      events: { event_42: { verified: true, expiry: Date.now() + 100000 } },
    };
    localStorage.setItem('nuva_campus_auth', JSON.stringify(seededState));

    const { result } = renderHook(() => useAuth());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isVerified('nunu')).toBe(true);
    expect(result.current.isVerified('guardian')).toBe(true);
    expect(result.current.isVerified('ambassador')).toBe(false);
    expect(result.current.isVerified('event_42')).toBe(true);
  });
});
