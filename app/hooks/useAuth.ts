'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';

interface AuthEntry {
  verified: boolean;
  expiry: number;
}

interface AuthState {
  nunu: AuthEntry;
  ambassador: AuthEntry;
  guardian: AuthEntry;
  fafa: AuthEntry;
  events: {
    [eventId: string]: AuthEntry;
  };
}

type RoleKey = 'nunu' | 'ambassador' | 'guardian' | 'fafa';

const AUTH_STORAGE_KEY = 'nuva_campus_auth';
const EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const defaultAuthEntry: AuthEntry = { verified: false, expiry: 0 };

const defaultAuthState: AuthState = {
  nunu: { ...defaultAuthEntry },
  ambassador: { ...defaultAuthEntry },
  guardian: { ...defaultAuthEntry },
  fafa: { ...defaultAuthEntry },
  events: {},
};

const roleKeys: RoleKey[] = ['nunu', 'ambassador', 'guardian', 'fafa'];

function isRoleKey(key: string): key is RoleKey {
  return roleKeys.includes(key as RoleKey);
}

function getStoredAuthState(): AuthState {
  if (typeof window === 'undefined') return defaultAuthState;

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return defaultAuthState;

    const parsed = JSON.parse(stored) as AuthState;
    return { ...defaultAuthState, ...parsed };
  } catch {
    return defaultAuthState;
  }
}

function saveAuthState(state: AuthState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save auth state');
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const state = getStoredAuthState();
    setAuthState(state);
    setIsLoading(false);
  }, []);

  const verifyPassword = useCallback(async (key: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('access_passwords')
        .select('password')
        .eq('key', key)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Password verification error:', error);
        return false;
      }

      if (data.password === password) {
        const newState = { ...authState };
        const entry: AuthEntry = {
          verified: true,
          expiry: Date.now() + EXPIRY_DURATION,
        };

        if (key.startsWith('event_')) {
          newState.events = { ...newState.events, [key]: entry };
        } else if (isRoleKey(key)) {
          newState[key] = entry;
        }

        setAuthState(newState);
        saveAuthState(newState);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Password verification failed:', err);
      return false;
    }
  }, [authState]);

  const isVerified = useCallback((key: string): boolean => {
    const now = Date.now();

    if (key.startsWith('event_')) {
      const eventAuth = authState.events[key];
      return eventAuth?.verified && eventAuth.expiry > now;
    }

    if (isRoleKey(key)) {
      const roleAuth = authState[key];
      return roleAuth?.verified && roleAuth.expiry > now;
    }

    return false;
  }, [authState]);

  const logout = useCallback((key?: string): void => {
    const newState = { ...authState };

    if (key) {
      if (key.startsWith('event_')) {
        delete newState.events[key];
      } else if (isRoleKey(key)) {
        newState[key] = { ...defaultAuthEntry };
      }
    } else {
      Object.assign(newState, defaultAuthState);
    }

    setAuthState(newState);
    saveAuthState(newState);
  }, [authState]);

  const getAuthState = useCallback((): AuthState => {
    return authState;
  }, [authState]);

  return {
    verifyPassword,
    isVerified,
    logout,
    getAuthState,
    isLoading,
  };
}
