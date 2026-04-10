import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testData } from '../mocks/supabase';

// =============================================
// Mock cache module — make cache.get always call the fetcher
// =============================================
const mockInvalidateEventCache = vi.fn();

vi.mock('@/app/lib/cache', () => ({
  getCacheManager: () => ({
    get: vi.fn(async (_key: string, fetcher: () => Promise<unknown>) => fetcher()),
    set: vi.fn(),
    delete: vi.fn(),
    invalidateByTag: vi.fn(),
  }),
  CACHE_STRATEGIES: {
    events: { ttl: { l1: 300 }, tags: ['events'] },
    eventStats: { ttl: { l1: 60 }, tags: ['events', 'stats'] },
    dashboardStats: { ttl: { l1: 30 }, tags: ['dashboard', 'stats'] },
  },
  CACHE_KEY_PREFIX: {
    EVENT: 'event:',
    EVENT_STATS: 'event:stats:',
    EVENT_LIST: 'events:list:',
    DASHBOARD: 'dashboard:',
  },
  generateCacheKey: (...parts: string[]) => parts.join(':'),
  invalidateEventCache: (...args: unknown[]) => mockInvalidateEventCache(...args),
}));

// =============================================
// Mock Supabase — per-test setup via mockFrom
// =============================================
const mockFrom = vi.fn();

vi.mock('@/app/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
  isSupabaseConfigured: true,
}));

/**
 * Helper to create a chainable Supabase-like query builder.
 * Any method call returns the same chain. When awaited, resolves to `result`.
 */
function createQueryChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const handler = {
    get(_target: unknown, prop: string) {
      if (prop === 'then') {
        // Make it thenable — resolve immediately with `result`
        return (resolve: (v: unknown) => void) => resolve(result);
      }
      // Any method call returns the same proxy
      return (..._args: unknown[]) => new Proxy(chain, handler);
    },
  };
  return new Proxy(chain, handler);
}

// Import after mocks
import { eventsService } from '@/app/services/events.service';

describe('eventsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReset();
  });

  describe('getAll', () => {
    it('returns events from Supabase', async () => {
      const events = [testData.event({ id: 'e1' }), testData.event({ id: 'e2' })];
      mockFrom.mockReturnValue(createQueryChain({ data: events, error: null }));

      const result = await eventsService.getAll();

      expect(mockFrom).toHaveBeenCalledWith('events');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('e1');
    });

    it('returns empty array on error', async () => {
      mockFrom.mockReturnValue(createQueryChain({ data: null, error: new Error('DB error') }));

      const result = await eventsService.getAll();
      expect(result).toEqual([]);
    });

    it('filters by type when options.type is provided', async () => {
      const events = [testData.event({ type: 'workshop' })];
      mockFrom.mockReturnValue(createQueryChain({ data: events, error: null }));

      const result = await eventsService.getAll({ type: 'workshop' });
      expect(result).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('returns single event', async () => {
      const event = testData.event({ id: 'event-42' });
      mockFrom.mockReturnValue(createQueryChain({ data: event, error: null }));

      const result = await eventsService.getById('event-42');

      expect(mockFrom).toHaveBeenCalledWith('events');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('event-42');
    });

    it('returns null on error', async () => {
      mockFrom.mockReturnValue(createQueryChain({ data: null, error: new Error('Not found') }));

      const result = await eventsService.getById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getWithStats', () => {
    it('computes registration stats', async () => {
      const event = testData.event({ id: 'event-1' });
      const registrations = [
        { attended: true, lunch_box_required: true, lunch_collected: true },
        { attended: true, lunch_box_required: true, lunch_collected: false },
        { attended: false, lunch_box_required: false, lunch_collected: false },
      ];

      // getWithStats calls from() twice via Promise.all:
      // 1st: from('events').select('*').eq('id', id).single()
      // 2nd: from('event_registrations').select(...).eq('event_id', id)
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createQueryChain({ data: event, error: null });
        }
        return createQueryChain({ data: registrations, error: null });
      });

      const result = await eventsService.getWithStats('event-1');

      expect(result).not.toBeNull();
      expect(result!.registrationCount).toBe(3);
      expect(result!.checkedInCount).toBe(2);
      expect(result!.lunchRequiredCount).toBe(2);
      expect(result!.lunchCollectedCount).toBe(1);
    });

    it('returns null when event not found', async () => {
      mockFrom.mockReturnValue(createQueryChain({ data: null, error: new Error('Not found') }));

      const result = await eventsService.getWithStats('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('invalidates cache after successful creation', async () => {
      const newEvent = testData.event({ id: 'new-event' });
      mockFrom.mockReturnValue(createQueryChain({ data: newEvent, error: null }));

      const result = await eventsService.create(newEvent as any);

      expect(result).not.toBeNull();
      expect(result!.id).toBe('new-event');
      expect(mockInvalidateEventCache).toHaveBeenCalled();
    });

    it('returns null on error', async () => {
      mockFrom.mockReturnValue(createQueryChain({ data: null, error: new Error('Insert failed') }));

      const result = await eventsService.create(testData.event() as any);
      expect(result).toBeNull();
    });
  });
});
