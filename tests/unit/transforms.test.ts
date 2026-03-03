import { describe, it, expect } from 'vitest';
import {
  formatEventDate,
  formatEventTime,
  calculateAttendanceRate,
  getEventTypeLabel,
  getEventStatusConfig,
  transformEventForDisplay,
  transformEventWithStatsForDisplay,
  transformEventsForList,
  filterEventsByStatus,
  sortEventsByDate,
} from '@/app/transforms/event';
import {
  formatWorkshopDate,
  formatWorkshopTime,
  getWorkshopLocation,
  getWorkshopTypeConfig,
  getWorkshopStatusConfig,
  transformWorkshopForDisplay,
  transformWorkshopWithStatsForDisplay,
  filterUpcomingWorkshops,
  sortWorkshopsByDate,
  isWorkshopFull,
  getRemainingSlots,
} from '@/app/transforms/workshop';
import { testData } from '../mocks/supabase';

describe('Event Transforms', () => {
  describe('formatEventDate', () => {
    it('should format valid date', () => {
      const result = formatEventDate('2026-02-15');
      expect(result).toContain('2026');
      expect(result).toContain('2');
      expect(result).toContain('15');
    });

    it('should return "未定" for null date', () => {
      expect(formatEventDate(null)).toBe('未定');
    });
  });

  describe('formatEventTime', () => {
    it('should format time range', () => {
      const result = formatEventTime('14:00:00', '16:00:00');
      expect(result).toBe('14:00 - 16:00');
    });

    it('should handle missing end time', () => {
      const result = formatEventTime('14:00:00', null);
      expect(result).toBe('14:00');
    });

    it('should return "未定" for null start time', () => {
      expect(formatEventTime(null, null)).toBe('未定');
    });
  });

  describe('calculateAttendanceRate', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateAttendanceRate(50, 100)).toBe(50);
      expect(calculateAttendanceRate(75, 100)).toBe(75);
      expect(calculateAttendanceRate(1, 3)).toBe(33);
    });

    it('should return 0 for zero registered', () => {
      expect(calculateAttendanceRate(0, 0)).toBe(0);
    });
  });

  describe('getEventTypeLabel', () => {
    it('should return correct labels', () => {
      expect(getEventTypeLabel('workshop')).toBe('工作坊');
      expect(getEventTypeLabel('mission')).toBe('任務');
      expect(getEventTypeLabel('nunu_activity')).toBe('Nunu 活動');
    });

    it('should return original value for unknown type', () => {
      expect(getEventTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('transformEventForDisplay', () => {
    it('should transform event correctly', () => {
      const event = testData.event();
      const result = transformEventForDisplay(event as any);

      expect(result.id).toBe(event.id);
      expect(result.title).toBe(event.title);
      expect(result.typeLabel).toBe('工作坊');
      expect(result.statusLabel).toBe('已發布');
      expect(result.statusVariant).toBe('info');
    });
  });
});

describe('Workshop Transforms', () => {
  describe('formatWorkshopDate', () => {
    it('should format valid date', () => {
      const result = formatWorkshopDate('2026-02-15');
      expect(result).toContain('2026');
    });
  });

  describe('formatWorkshopTime', () => {
    it('should format time range', () => {
      const result = formatWorkshopTime('14:00:00', '16:00:00');
      expect(result).toBe('14:00 - 16:00');
    });
  });

  describe('getWorkshopLocation', () => {
    it('should return location for offline workshop', () => {
      const workshop = testData.workshop({ type: 'offline', location: 'Test Location' });
      expect(getWorkshopLocation(workshop as any)).toBe('Test Location');
    });

    it('should return "線上活動" for online workshop', () => {
      const workshop = testData.workshop({ type: 'online', location: null });
      expect(getWorkshopLocation(workshop as any)).toBe('線上活動');
    });

    it('should return combined location for hybrid workshop', () => {
      const workshop = testData.workshop({ type: 'hybrid', location: 'Test Location' });
      expect(getWorkshopLocation(workshop as any)).toBe('Test Location / 線上');
    });
  });

  describe('transformWorkshopForDisplay', () => {
    it('should transform workshop correctly', () => {
      const workshop = testData.workshop();
      const result = transformWorkshopForDisplay(workshop as any);

      expect(result.id).toBe(workshop.id);
      expect(result.title).toBe(workshop.title);
      expect(result.typeLabel).toBe('實體');
      expect(result.statusLabel).toBe('即將舉行');
    });
  });

  describe('isWorkshopFull', () => {
    it('should return true when capacity reached', () => {
      const workshop = {
        maxCapacity: 50,
        stats: { registered: 50, ambassadors: 0, lunchRequired: 0, capacityRate: 100 },
      };
      expect(isWorkshopFull(workshop as any)).toBe(true);
    });

    it('should return false when capacity not reached', () => {
      const workshop = {
        maxCapacity: 50,
        stats: { registered: 30, ambassadors: 0, lunchRequired: 0, capacityRate: 60 },
      };
      expect(isWorkshopFull(workshop as any)).toBe(false);
    });

    it('should return false when no capacity limit', () => {
      const workshop = {
        maxCapacity: null,
        stats: { registered: 100, ambassadors: 0, lunchRequired: 0, capacityRate: null },
      };
      expect(isWorkshopFull(workshop as any)).toBe(false);
    });
  });

  describe('getRemainingSlots', () => {
    it('should calculate remaining slots', () => {
      const workshop = {
        maxCapacity: 50,
        stats: { registered: 30, ambassadors: 0, lunchRequired: 0, capacityRate: 60 },
      };
      expect(getRemainingSlots(workshop as any)).toBe(20);
    });

    it('should return 0 when overbooked', () => {
      const workshop = {
        maxCapacity: 50,
        stats: { registered: 60, ambassadors: 0, lunchRequired: 0, capacityRate: 120 },
      };
      expect(getRemainingSlots(workshop as any)).toBe(0);
    });

    it('should return null when no capacity limit', () => {
      const workshop = {
        maxCapacity: null,
        stats: { registered: 100, ambassadors: 0, lunchRequired: 0, capacityRate: null },
      };
      expect(getRemainingSlots(workshop as any)).toBeNull();
    });
  });
});

// =============================================
// Extended Event Transform Tests
// =============================================

describe('Event Transforms — Extended', () => {
  describe('getEventStatusConfig', () => {
    it('should return config for draft status', () => {
      const config = getEventStatusConfig('draft');
      expect(config.label).toBe('草稿');
      expect(config.variant).toBe('default');
    });

    it('should return config for published status', () => {
      const config = getEventStatusConfig('published');
      expect(config.label).toBe('已發布');
      expect(config.variant).toBe('info');
    });

    it('should return config for ongoing status', () => {
      const config = getEventStatusConfig('ongoing');
      expect(config.label).toBe('進行中');
      expect(config.variant).toBe('warning');
    });

    it('should return config for completed status', () => {
      const config = getEventStatusConfig('completed');
      expect(config.label).toBe('已結束');
      expect(config.variant).toBe('success');
    });

    it('should return config for cancelled status', () => {
      const config = getEventStatusConfig('cancelled');
      expect(config.label).toBe('已取消');
      expect(config.variant).toBe('error');
    });

    it('should return fallback for unknown status', () => {
      const config = getEventStatusConfig('unknown');
      expect(config.label).toBe('unknown');
      expect(config.variant).toBe('default');
    });
  });

  describe('transformEventWithStatsForDisplay', () => {
    it('should compute stats from event with registrations', () => {
      const event = {
        ...testData.event(),
        registrationCount: 100,
        checkedInCount: 75,
        lunchRequiredCount: 60,
        lunchCollectedCount: 30,
      };
      const result = transformEventWithStatsForDisplay(event as any);

      expect(result.stats.registered).toBe(100);
      expect(result.stats.checkedIn).toBe(75);
      expect(result.stats.attendanceRate).toBe(75);
      expect(result.stats.lunchRequired).toBe(60);
      expect(result.stats.lunchCollected).toBe(30);
      expect(result.stats.lunchRate).toBe(50);
    });

    it('should handle zero lunch required', () => {
      const event = {
        ...testData.event(),
        registrationCount: 10,
        checkedInCount: 5,
        lunchRequiredCount: 0,
        lunchCollectedCount: 0,
      };
      const result = transformEventWithStatsForDisplay(event as any);
      expect(result.stats.lunchRate).toBe(0);
    });
  });

  describe('transformEventsForList', () => {
    it('should transform an array of events', () => {
      const events = [
        testData.event({ id: 'e1', title: 'Event 1' }),
        testData.event({ id: 'e2', title: 'Event 2' }),
      ];
      const result = transformEventsForList(events as any);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('e1');
      expect(result[1].id).toBe('e2');
      expect(result[0].typeLabel).toBe('工作坊');
    });

    it('should return empty array for empty input', () => {
      expect(transformEventsForList([])).toEqual([]);
    });
  });

  describe('filterEventsByStatus', () => {
    it('should filter events by status', () => {
      const events = [
        testData.event({ id: 'e1', status: 'published' }),
        testData.event({ id: 'e2', status: 'completed' }),
        testData.event({ id: 'e3', status: 'published' }),
      ];
      const transformed = transformEventsForList(events as any);
      const filtered = filterEventsByStatus(transformed, 'published');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.status === 'published')).toBe(true);
    });

    it('should return empty if no match', () => {
      const events = [testData.event({ status: 'published' })];
      const transformed = transformEventsForList(events as any);
      const filtered = filterEventsByStatus(transformed, 'cancelled');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('sortEventsByDate', () => {
    it('should sort ascending by default', () => {
      const events = [
        testData.event({ id: 'e1', date: '2026-03-15' }),
        testData.event({ id: 'e2', date: '2026-01-10' }),
        testData.event({ id: 'e3', date: '2026-02-20' }),
      ];
      const transformed = transformEventsForList(events as any);
      const sorted = sortEventsByDate(transformed);

      expect(sorted[0].id).toBe('e2');
      expect(sorted[1].id).toBe('e3');
      expect(sorted[2].id).toBe('e1');
    });

    it('should sort descending when specified', () => {
      const events = [
        testData.event({ id: 'e1', date: '2026-03-15' }),
        testData.event({ id: 'e2', date: '2026-01-10' }),
      ];
      const transformed = transformEventsForList(events as any);
      const sorted = sortEventsByDate(transformed, false);

      expect(sorted[0].id).toBe('e1');
      expect(sorted[1].id).toBe('e2');
    });
  });
});

// =============================================
// Extended Workshop Transform Tests
// =============================================

describe('Workshop Transforms — Extended', () => {
  describe('getWorkshopTypeConfig', () => {
    it('should return config for online type', () => {
      const config = getWorkshopTypeConfig('online');
      expect(config.label).toBe('線上');
      expect(config.icon).toBe('video');
    });

    it('should return config for offline type', () => {
      const config = getWorkshopTypeConfig('offline');
      expect(config.label).toBe('實體');
      expect(config.icon).toBe('location');
    });

    it('should return config for hybrid type', () => {
      const config = getWorkshopTypeConfig('hybrid');
      expect(config.label).toBe('混合');
      expect(config.icon).toBe('hybrid');
    });

    it('should return fallback for unknown type', () => {
      const config = getWorkshopTypeConfig('unknown');
      expect(config.label).toBe('unknown');
      expect(config.icon).toBe('location');
    });
  });

  describe('getWorkshopStatusConfig', () => {
    it('should return config for upcoming status', () => {
      expect(getWorkshopStatusConfig('upcoming').label).toBe('即將舉行');
      expect(getWorkshopStatusConfig('upcoming').variant).toBe('info');
    });

    it('should return config for ongoing status', () => {
      expect(getWorkshopStatusConfig('ongoing').label).toBe('進行中');
    });

    it('should return config for completed status', () => {
      expect(getWorkshopStatusConfig('completed').label).toBe('已結束');
    });

    it('should return config for cancelled status', () => {
      expect(getWorkshopStatusConfig('cancelled').label).toBe('已取消');
    });

    it('should return fallback for unknown status', () => {
      const config = getWorkshopStatusConfig('unknown');
      expect(config.label).toBe('unknown');
      expect(config.variant).toBe('default');
    });
  });

  describe('filterUpcomingWorkshops', () => {
    it('should filter only upcoming workshops', () => {
      const workshops = [
        testData.workshop({ id: 'w1', status: 'upcoming' }),
        testData.workshop({ id: 'w2', status: 'completed' }),
        testData.workshop({ id: 'w3', status: 'upcoming' }),
      ];
      const transformed = workshops.map(w => transformWorkshopForDisplay(w as any));
      const filtered = filterUpcomingWorkshops(transformed);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(w => w.status === 'upcoming')).toBe(true);
    });
  });

  describe('sortWorkshopsByDate', () => {
    it('should sort ascending by default', () => {
      const workshops = [
        testData.workshop({ id: 'w1', date: '2026-03-15' }),
        testData.workshop({ id: 'w2', date: '2026-01-10' }),
      ];
      const transformed = workshops.map(w => transformWorkshopForDisplay(w as any));
      const sorted = sortWorkshopsByDate(transformed);

      expect(sorted[0].id).toBe('w2');
      expect(sorted[1].id).toBe('w1');
    });

    it('should sort descending when specified', () => {
      const workshops = [
        testData.workshop({ id: 'w1', date: '2026-03-15' }),
        testData.workshop({ id: 'w2', date: '2026-01-10' }),
      ];
      const transformed = workshops.map(w => transformWorkshopForDisplay(w as any));
      const sorted = sortWorkshopsByDate(transformed, false);

      expect(sorted[0].id).toBe('w1');
      expect(sorted[1].id).toBe('w2');
    });
  });

  describe('transformWorkshopWithStatsForDisplay', () => {
    it('should compute stats and capacity rate', () => {
      const workshop = {
        ...testData.workshop({ max_capacity: 100 }),
        registrationCount: 75,
        ambassadorCount: 10,
        lunchCount: 50,
      };
      const result = transformWorkshopWithStatsForDisplay(workshop as any);

      expect(result.stats.registered).toBe(75);
      expect(result.stats.ambassadors).toBe(10);
      expect(result.stats.lunchRequired).toBe(50);
      expect(result.stats.capacityRate).toBe(75);
    });

    it('should return null capacityRate when no max_capacity', () => {
      const workshop = {
        ...testData.workshop({ max_capacity: null }),
        registrationCount: 50,
        ambassadorCount: 5,
        lunchCount: 20,
      };
      const result = transformWorkshopWithStatsForDisplay(workshop as any);
      expect(result.stats.capacityRate).toBeNull();
    });
  });
});
