'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PasswordKey } from '@/app/types/password';
import { AuthStorage } from '@/app/utils/authStorage';
import { PinInput } from './PinInput';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleKey: PasswordKey;
  onSuccess: () => void;
  title?: string;
}

/**
 * PasswordModal - 密碼輸入 Modal
 *
 * 使用 PinInput 元件簡化實作
 */
export function PasswordModal({
  isOpen,
  onClose,
  roleKey,
  onSuccess,
  title = '輸入通行密碼',
}: PasswordModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setError(false);
      setClearTrigger(prev => prev + 1);
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // 驗證密碼
  const handleComplete = useCallback(async (pin: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: roleKey, password: pin }),
      });

      const { success } = await res.json();

      if (success) {
        AuthStorage.setVerified(roleKey);
        onSuccess();
      } else {
        setError(true);
        setClearTrigger(prev => prev + 1);
      }
    } catch {
      setError(true);
      setClearTrigger(prev => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  }, [roleKey, onSuccess, isVerifying]);

  if (!isOpen) return null;

  const titleId = 'password-modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative bg-bg-card rounded-2xl p-8 w-full max-w-sm mx-4 shadow-xl ${error ? 'animate-shake' : ''}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="關閉"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 id={titleId} className="text-xl font-medium text-text-primary text-center mb-8">
          {title}
        </h2>

        {/* PIN Input */}
        <PinInput
          onComplete={handleComplete}
          error={error}
          errorMessage="密碼錯誤，請重新輸入"
          loading={isVerifying}
          enableKeyboard={isOpen}
          onEscape={onClose}
          clearTrigger={clearTrigger}
          keypadSize="sm"
        />
      </div>
    </div>
  );
}
