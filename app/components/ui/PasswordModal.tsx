'use client';

import { useState, useCallback, useEffect } from 'react';
import { Modal } from './Modal';
import { NumericKeypad } from './NumericKeypad';
import { CodeInput } from './CodeInput';
import { useAuth } from '@/app/hooks/useAuth';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleKey: string;
  roleTitle: string;
  onSuccess: () => void;
}

export function PasswordModal({
  isOpen,
  onClose,
  roleKey,
  roleTitle,
  onSuccess,
}: PasswordModalProps) {
  const [code, setCode] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { verifyPassword } = useAuth();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setIsShaking(false);
    }
  }, [isOpen]);

  // Handle keyboard input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9' && code.length < 4) {
        setCode(prev => prev + e.key);
        setError('');
      } else if (e.key === 'Backspace') {
        setCode(prev => prev.slice(0, -1));
        setError('');
      } else if (e.key === 'Enter' && code.length === 4) {
        handleVerify();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, code, onClose]);

  const handleDigit = useCallback((digit: string) => {
    if (code.length < 4) {
      setCode(prev => prev + digit);
      setError('');
    }
  }, [code.length]);

  const handleBackspace = useCallback(() => {
    setCode(prev => prev.slice(0, -1));
    setError('');
  }, []);

  const handleVerify = useCallback(async () => {
    if (code.length !== 4 || isVerifying) return;

    setIsVerifying(true);
    setError('');

    try {
      const success = await verifyPassword(roleKey, code);

      if (success) {
        onSuccess();
        onClose();
      } else {
        setIsShaking(true);
        setError('密碼錯誤');
        setCode('');
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch {
      setError('驗證失敗，請稍後再試');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  }, [code, isVerifying, roleKey, verifyPassword, onSuccess, onClose]);

  // Auto verify when 4 digits entered
  useEffect(() => {
    if (code.length === 4 && !isVerifying) {
      handleVerify();
    }
  }, [code.length, isVerifying, handleVerify]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`進入${roleTitle}專區`}>
      <div className="py-4">
        <p className="text-center text-text-secondary text-sm mb-6">
          請輸入 4 位數密碼
        </p>

        {/* Code Display */}
        <div className={`mb-6 ${isShaking ? 'animate-shake' : ''}`}>
          <CodeInput code={[...code.padEnd(4, ' ')].map(c => c === ' ' ? '' : c)} error={!!error} />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-center text-error text-sm mb-4 animate-fade-in">
            {error}
          </p>
        )}

        {/* Numeric Keypad */}
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          size="md"
        />

        {/* Loading State */}
        {isVerifying && (
          <div className="absolute inset-0 bg-bg-card/80 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </Modal>
  );
}
