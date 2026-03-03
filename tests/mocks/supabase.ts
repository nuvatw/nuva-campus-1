import { vi } from 'vitest';

/**
 * Supabase Mock 工具
 */

export const mockSupabaseResponse = <T>(data: T, error: Error | null = null) => ({
  data,
  error,
});

export const createMockSupabase = () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockIn = vi.fn();
  const mockOrder = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  // Chain setup
  mockFrom.mockReturnValue({
    select: mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        single: mockSingle,
        order: mockOrder,
        in: mockIn,
      }),
      in: mockIn,
      order: mockOrder,
    }),
    insert: mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle,
      }),
    }),
    update: mockUpdate.mockReturnValue({
      eq: mockEq.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
    delete: mockDelete.mockReturnValue({
      eq: mockEq,
    }),
  });

  return {
    supabase: { from: mockFrom },
    mocks: {
      from: mockFrom,
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      in: mockIn,
      order: mockOrder,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    },
    // Helper to set response
    setResponse: (data: unknown, error: Error | null = null) => {
      mockSingle.mockResolvedValue({ data, error });
      mockOrder.mockResolvedValue({ data, error });
      mockIn.mockResolvedValue({ data, error });
    },
    // Reset all mocks
    reset: () => {
      vi.clearAllMocks();
    },
  };
};

/**
 * 測試資料工廠
 */
export const testData = {
  accessPassword: (overrides = {}) => ({
    id: 'test-id',
    key: 'nunu',
    password: '1234',
    description: 'Test password',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  event: (overrides = {}) => ({
    id: 'event-1',
    type: 'workshop',
    title: 'Test Workshop',
    description: 'Test description',
    date: '2026-02-15',
    start_time: '14:00:00',
    end_time: '16:00:00',
    location: 'Test Location',
    online_link: null,
    status: 'published',
    metadata: {},
    password: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  registration: (overrides = {}) => ({
    id: 'reg-1',
    event_id: 'event-1',
    member_type: 'general',
    ambassador_id: null,
    participant_name: 'Test User',
    participant_email: 'test@example.com',
    attendance_mode: 'offline',
    lunch_box_required: true,
    attended: false,
    attended_at: null,
    checkin_code: 'ABC123',
    lunch_code: 'XYZ789',
    lunch_collected: false,
    lunch_collected_at: null,
    notification_sent: false,
    notification_sent_at: null,
    registered_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  workshop: (overrides = {}) => ({
    id: 'workshop-1',
    title: 'Test Workshop',
    type: 'offline',
    date: '2026-02-15',
    start_time: '14:00:00',
    end_time: '16:00:00',
    location: 'Test Location',
    online_link: null,
    description: 'Test description',
    max_capacity: 50,
    tally_form_id: null,
    status: 'upcoming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
};
