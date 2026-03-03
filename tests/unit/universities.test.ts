import { describe, it, expect } from 'vitest';
import {
  universities,
  cityOrder,
  getUniversitiesByCity,
  getCityByCode,
  getUniversityByCode,
  citiesByRegion,
  universitiesByCity,
} from '@/app/data/universities';

describe('University Data', () => {
  describe('City Order', () => {
    it('should have exactly 18 cities', () => {
      expect(cityOrder).toHaveLength(18);
    });

    it('should have unique city codes from 01 to 18', () => {
      const codes = cityOrder.map(c => c.code);
      const expected = Array.from({ length: 18 }, (_, i) =>
        String(i + 1).padStart(2, '0')
      );
      expect(codes).toEqual(expected);
    });

    it('should have unique city names', () => {
      const names = cityOrder.map(c => c.name);
      expect(new Set(names).size).toBe(18);
    });

    it('should cover all four regions', () => {
      const regions = new Set(cityOrder.map(c => c.region));
      expect(regions).toEqual(new Set(['north', 'central', 'south', 'east']));
    });

    it('should follow counter-clockwise order starting from 基隆', () => {
      expect(cityOrder[0].name).toBe('基隆市');
      expect(cityOrder[17].name).toBe('宜蘭縣');
    });
  });

  describe('School Codes', () => {
    it('should have continuous school codes starting from 1', () => {
      for (let i = 0; i < universities.length; i++) {
        expect(universities[i].schoolCode).toBe(i + 1);
      }
    });

    it('should have display codes matching UNI- + padded schoolCode', () => {
      for (const u of universities) {
        const expected = `UNI-${String(u.schoolCode).padStart(3, '0')}`;
        expect(u.displayCode).toBe(expected);
      }
    });

    it('should have unique display codes', () => {
      const codes = universities.map(u => u.displayCode);
      expect(new Set(codes).size).toBe(universities.length);
    });

    it('should have unique university IDs', () => {
      const ids = universities.map(u => u.id);
      expect(new Set(ids).size).toBe(universities.length);
    });
  });

  describe('City Assignment', () => {
    it('every university should belong to a valid city in cityOrder', () => {
      const validCities = new Set(cityOrder.map(c => c.name));
      for (const u of universities) {
        expect(validCities.has(u.city)).toBe(true);
      }
    });

    it('every university should have a valid cityCode', () => {
      const validCodes = new Set(cityOrder.map(c => c.code));
      for (const u of universities) {
        expect(validCodes.has(u.cityCode)).toBe(true);
      }
    });

    it('cityCode should match the city name', () => {
      const cityToCode = new Map(cityOrder.map(c => [c.name, c.code]));
      for (const u of universities) {
        expect(u.cityCode).toBe(cityToCode.get(u.city));
      }
    });
  });

  describe('Merged Universities', () => {
    it('暨大 (南投) should be assigned to 台中市', () => {
      const ncnu = universities.find(u => u.id === 'ncnu');
      expect(ncnu).toBeDefined();
      expect(ncnu!.city).toBe('台中市');
      expect(ncnu!.cityCode).toBe('08');
    });

    it('金門大學 should be assigned to 高雄市', () => {
      const nqu = universities.find(u => u.id === 'nqu');
      expect(nqu).toBeDefined();
      expect(nqu!.city).toBe('高雄市');
      expect(nqu!.cityCode).toBe('14');
    });

    it('澎科大 should be assigned to 嘉義市', () => {
      const npu = universities.find(u => u.id === 'npu');
      expect(npu).toBeDefined();
      expect(npu!.city).toBe('嘉義市');
      expect(npu!.cityCode).toBe('11');
    });
  });

  describe('Helper Functions', () => {
    it('getUniversitiesByCity should return correct universities', () => {
      const keelung = getUniversitiesByCity('基隆市');
      expect(keelung.length).toBeGreaterThan(0);
      expect(keelung.every(u => u.city === '基隆市')).toBe(true);
    });

    it('getUniversitiesByCity should return empty for non-existent city', () => {
      expect(getUniversitiesByCity('火星市')).toEqual([]);
    });

    it('getCityByCode should return correct city info', () => {
      const city = getCityByCode('03');
      expect(city).toBeDefined();
      expect(city!.name).toBe('台北市');
      expect(city!.region).toBe('north');
    });

    it('getCityByCode should return undefined for invalid code', () => {
      expect(getCityByCode('99')).toBeUndefined();
    });

    it('getUniversityByCode should return correct university', () => {
      const first = getUniversityByCode('UNI-001');
      expect(first).toBeDefined();
      expect(first!.schoolCode).toBe(1);
    });

    it('getUniversityByCode should return undefined for invalid code', () => {
      expect(getUniversityByCode('UNI-999')).toBeUndefined();
    });
  });

  describe('Grouped Data', () => {
    it('citiesByRegion should cover all cities', () => {
      const total =
        citiesByRegion.north.length +
        citiesByRegion.central.length +
        citiesByRegion.south.length +
        citiesByRegion.east.length;
      expect(total).toBe(18);
    });

    it('universitiesByCity should cover all universities', () => {
      const total = Object.values(universitiesByCity).reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      expect(total).toBe(universities.length);
    });
  });
});
