/**
 * @urstory/manseryeok
 *
 * Korean Lunar Calendar (만세력) JavaScript Library
 *
 * @description
 * 1000년 ~ 2050년 한국 음력 데이터를 제공하는 순수 JavaScript 라이브러리입니다.
 * DB 없이 동작하며, 빠른 조회 성능과 완전한 TypeScript 지원을 제공합니다.
 *
 * @example
 * ```ts
 * import { solarToLunar, getGapja } from '@urstory/manseryeok';
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
 * @author urstory
 * @copyright 2026
 */

// ============================================
// Types
// ============================================
export * from './types';

// ============================================
// Utility Functions
// ============================================

/**
 * 지원 범위 확인
 * @param year 확인할 연도
 * @returns 지원 여부 (1000~2050)
 */
export function isSupportedYear(year: number): boolean {
  return year >= 1000 && year <= 2050;
}

/**
 * 지원 연도 범위 조회
 * @returns { min, max } 지원 범위
 */
export function getSupportedRange(): { min: number; max: number } {
  return { min: 1000, max: 2050 };
}

// ============================================
// Main API (TODO: 구현 필요)
// ============================================

/**
 * 양력 → 음력 변환
 * @param solarYear 양력 년 (1000~2050)
 * @param solarMonth 양력 월 (1~12)
 * @param solarDay 양력 일 (1~31)
 * @returns 음력 날짜와 갑자 정보
 * @throws {OutOfRangeError} 지원 범위 밖 연도
 * @throws {InvalidDateError} 유효하지 않은 날짜
 */
export function solarToLunar(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): import('./types').SolarToLunarResult {
  if (!isSupportedYear(solarYear)) {
    throw new import('./types').OutOfRangeError(solarYear);
  }
  // TODO: 구현 필요
  throw new Error('Not implemented yet');
}

/**
 * 음력 → 양력 변환
 * @param lunarYear 음력 년 (1000~2050)
 * @param lunarMonth 음력 월 (1~12)
 * @param lunarDay 음력 일 (1~30)
 * @param isLeapMonth 윤달 여부
 * @returns 양력 날짜와 갑자 정보
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false
): import('./types').LunarToSolarResult {
  // TODO: 구현 필요
  throw new Error('Not implemented yet');
}

/**
 * 특정 날짜의 갑자 계산
 * @param solarYear 양력 년
 * @param solarMonth 양력 월
 * @param solarDay 양력 일
 * @returns 갑자 정보
 */
export function getGapja(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): import('./types').GapjaResult {
  // TODO: 구현 필요
  throw new Error('Not implemented yet');
}

/**
 * 특정 연도의 절기 전체 조회
 * @param year 양력 년
 * @returns 24절기 정보 배열
 */
export function getSolarTerms(year: number): import('./types').SolarTermInfo[] {
  // TODO: 구현 필요
  throw new Error('Not implemented yet');
}

/**
 * 사주 월 계산 (절기 기준)
 * @param solarYear 양력 년
 * @param solarMonth 양력 월
 * @param solarDay 양력 일
 * @returns 사주 월 (1~12)
 */
export function getSajuMonth(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): number {
  // TODO: 구현 필요
  throw new Error('Not implemented yet');
}
