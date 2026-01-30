import { describe, it, expect, beforeEach } from 'vitest';
import { AuthStorage } from '@/app/utils/authStorage';
import { AUTH_CONFIG } from '@/app/constants/auth';

describe('AuthStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get', () => {
    it('should return initial state when localStorage is empty', () => {
      const state = AuthStorage.get();

      expect(state.nunu).toEqual({ verified: false, expiry: 0 });
      expect(state.ambassador).toEqual({ verified: false, expiry: 0 });
      expect(state.guardian).toEqual({ verified: false, expiry: 0 });
      expect(state.guardian_admin).toEqual({ verified: false, expiry: 0 });
      expect(state.events).toEqual({});
    });

    it('should return stored state', () => {
      const storedState = {
        nunu: { verified: true, expiry: Date.now() + 10000 },
        ambassador: { verified: false, expiry: 0 },
        guardian: { verified: false, expiry: 0 },
        guardian_admin: { verified: false, expiry: 0 },
        events: {},
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(storedState));

      const state = AuthStorage.get();

      expect(state.nunu.verified).toBe(true);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, 'invalid json');

      const state = AuthStorage.get();

      expect(state.nunu).toEqual({ verified: false, expiry: 0 });
    });
  });

  describe('getClean', () => {
    it('should clean expired states', () => {
      const storedState = {
        nunu: { verified: true, expiry: Date.now() - 1000 }, // Expired
        ambassador: { verified: true, expiry: Date.now() + 10000 }, // Valid
        guardian: { verified: false, expiry: 0 },
        guardian_admin: { verified: false, expiry: 0 },
        events: {
          'event-1': { verified: true, expiry: Date.now() - 1000 }, // Expired
          'event-2': { verified: true, expiry: Date.now() + 10000 }, // Valid
        },
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(storedState));

      const state = AuthStorage.getClean();

      expect(state.nunu.verified).toBe(false);
      expect(state.ambassador.verified).toBe(true);
      expect(state.events['event-1']).toBeUndefined();
      expect(state.events['event-2']?.verified).toBe(true);
    });
  });

  describe('set', () => {
    it('should store state in localStorage', () => {
      const state = {
        nunu: { verified: true, expiry: Date.now() + 10000 },
        ambassador: { verified: false, expiry: 0 },
        guardian: { verified: false, expiry: 0 },
        guardian_admin: { verified: false, expiry: 0 },
        events: {},
      };

      AuthStorage.set(state);

      const stored = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEY) || '{}');
      expect(stored.nunu.verified).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove state from localStorage', () => {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, '{}');

      AuthStorage.clear();

      expect(localStorage.getItem(AUTH_CONFIG.STORAGE_KEY)).toBeNull();
    });
  });

  describe('isVerified', () => {
    it('should return false for non-verified role', () => {
      expect(AuthStorage.isVerified('nunu')).toBe(false);
    });

    it('should return true for verified non-expired role', () => {
      const state = {
        nunu: { verified: true, expiry: Date.now() + 10000 },
        ambassador: { verified: false, expiry: 0 },
        guardian: { verified: false, expiry: 0 },
        guardian_admin: { verified: false, expiry: 0 },
        events: {},
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(state));

      expect(AuthStorage.isVerified('nunu')).toBe(true);
    });

    it('should return false for expired role', () => {
      const state = {
        nunu: { verified: true, expiry: Date.now() - 1000 },
        ambassador: { verified: false, expiry: 0 },
        guardian: { verified: false, expiry: 0 },
        guardian_admin: { verified: false, expiry: 0 },
        events: {},
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(state));

      expect(AuthStorage.isVerified('nunu')).toBe(false);
    });

    it('should handle event keys', () => {
      const state = {
        nunu: { verified: false, expiry: 0 },
        ambassador: { verified: false, expiry: 0 },
        guardian: { verified: false, expiry: 0 },
        guardian_admin: { verified: false, expiry: 0 },
        events: {
          'my-event': { verified: true, expiry: Date.now() + 10000 },
        },
      };
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(state));

      expect(AuthStorage.isVerified('event_my-event')).toBe(true);
      expect(AuthStorage.isVerified('event_other')).toBe(false);
    });
  });

  describe('setVerified', () => {
    it('should set role as verified', () => {
      AuthStorage.setVerified('nunu');

      const state = AuthStorage.get();
      expect(state.nunu.verified).toBe(true);
      expect(state.nunu.expiry).toBeGreaterThan(Date.now());
    });

    it('should set event as verified', () => {
      AuthStorage.setVerified('event_my-event');

      const state = AuthStorage.get();
      expect(state.events['my-event']?.verified).toBe(true);
    });
  });

  describe('clearKey', () => {
    it('should clear specific role', () => {
      AuthStorage.setVerified('nunu');
      AuthStorage.setVerified('ambassador');

      AuthStorage.clearKey('nunu');

      const state = AuthStorage.get();
      expect(state.nunu.verified).toBe(false);
      expect(state.ambassador.verified).toBe(true);
    });

    it('should clear specific event', () => {
      AuthStorage.setVerified('event_event1');
      AuthStorage.setVerified('event_event2');

      AuthStorage.clearKey('event_event1');

      const state = AuthStorage.get();
      expect(state.events['event1']).toBeUndefined();
      expect(state.events['event2']?.verified).toBe(true);
    });
  });
});
