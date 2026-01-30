import { describe, it, expect } from 'vitest';
import {
  formatEventDate,
  formatEventTime,
  calculateAttendanceRate,
  getEventTypeLabel,
  transformEventForDisplay,
} from '@/app/transforms/event';
import {
  formatWorkshopDate,
  formatWorkshopTime,
  getWorkshopLocation,
  transformWorkshopForDisplay,
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
