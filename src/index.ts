/**
 * @fullstackfamily/manseryeok
 *
 * Korean Lunar Calendar (만세력) JavaScript Library
 *
 * @description
 * 1900년 ~ 2050년 한국 음력 데이터를 제공하는 순수 JavaScript 라이브러리입니다.
 * DB 없이 동작하며, 빠른 조회 성능과 완전한 TypeScript 지원을 제공합니다.
 *
 * @example
 * ```ts
 * import { solarToLunar, getGapja } from '@fullstackfamily/manseryeok';
 *
 * // 양력 → 음력 변환
 * const lunar = solarToLunar(2024, 2, 10);
 * console.log(lunar.lunar);
 * // { year: 2024, month: 1, day: 1, isLeapMonth: false }
 *
 * // 갑자 계산
 * const gapja = getGapja(1984, 2, 2);
 * console.log(gapja.yearPillar); // '갑자'
 * ```
 *
 * @license MIT
 * @author fullstackfamily
 * @copyright 2026
 */

// ============================================
// Types
// ============================================
export * from './types';

// ============================================
// Utility Functions
// ============================================
export { isSupportedYear, getSupportedRange } from './utils/range';

// ============================================
// Core Functions
// ============================================
export { solarToLunar, lunarToSolar, getGapja } from './core/solar-lunar-converter';

// ============================================
// Solar Terms (절기)
// ============================================
export {
  getAllSolarTerms,
  getSolarTermInfoByIndex,
  getSolarTermInfoByName,
  getSolarTermsBySajuMonth,
  getSolarTermsByYear,
  getSolarTermForDate,
  getSolarTermsByMonth,
  getSupportedSolarTermYears,
  getSajuMonth,
  isBeforeLichun,
} from './core/solar-term';
export { SOLAR_TERM_NAMES } from './data/solar-terms';
export { SOLAR_TERMS_DATA, SUPPORTED_SOLAR_TERM_YEARS } from './data/solar-terms-data';
export type { SolarTermWithDate } from './core/solar-term';

// ============================================
// Data Access (for advanced usage)
// ============================================
export { SIXTY_PILLARS, getPillarById, getPillarByHangul } from './data/sixty-pillars';
export { SOLAR_TO_LUNAR_INDEX, getMonthlyIndex } from './data/date-index';
