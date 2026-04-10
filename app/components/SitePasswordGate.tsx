'use client';

import { useState, useCallback, useEffect } from 'react';
import { NumericKeypad } from '@/app/components/ui/NumericKeypad';
import { CodeInput } from '@/app/components/ui/CodeInput';

const CORRECT_PASSWORD = '0801';
const COOKIE_NAME = 'site_auth';
const COOKIE_DAYS = 30;

interface SitePasswordGateProps {
  children: React.ReactNode;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function isAuthed(): boolean {
  return getCookie(COOKIE_NAME) === 'true';
}

export default function SitePasswordGate({ children }: SitePasswordGateProps) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(isAuthed());
    setLoading(false);
  }, []);

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

  const handleVerify = useCallback(() => {
    if (code === CORRECT_PASSWORD) {
      setCookie(COOKIE_NAME, 'true', COOKIE_DAYS);
      setAuthed(true);
    } else {
      setIsShaking(true);
      setError('密碼錯誤');
      setCode('');
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [code]);

  // Auto verify when 4 digits entered
  useEffect(() => {
    if (code.length === 4) {
      handleVerify();
    }
  }, [code.length, handleVerify]);

  // Keyboard input
  useEffect(() => {
    if (authed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authed, handleDigit, handleBackspace]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">nuva Campus</h1>
          <p className="text-sm text-text-secondary">請輸入 4 位數密碼</p>
        </div>

        <div className={`mb-6 ${isShaking ? 'animate-shake' : ''}`}>
          <CodeInput
            code={[...code.padEnd(4, ' ')].map(c => c === ' ' ? '' : c)}
            error={!!error}
          />
        </div>

        {error && (
          <p className="text-center text-error text-sm mb-4 animate-fade-in">{error}</p>
        )}

        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          size="md"
        />
      </div>
    </div>
  );
}
