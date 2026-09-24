/**
 * 양력 ↔ 음력 변환 모듈
 *
 * 만세력 인덱스를 사용하여 양력과 음력 간 변환을 수행합니다.
 */

import { getMonthlyIndex } from '../data/date-index';
import { formatGapjaByIds } from './gapja-calculator';
import { isSupportedYear } from '../utils/range';
import { OutOfRangeError, InvalidDateError } from '../types';
import type { SolarToLunarResult, LunarToSolarResult } from '../types';

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
): SolarToLunarResult {
  // 1. 범위 검증
  if (!isSupportedYear(solarYear)) {
    throw new OutOfRangeError(solarYear);
  }

  // 2. 월별 인덱스 조회
  const monthKey = `${solarYear}-${String(solarMonth).padStart(2, '0')}`;
  const monthIndex = getMonthlyIndex(solarYear, solarMonth);

  if (!monthIndex) {
    throw new InvalidDateError(`No data found for ${solarYear}-${solarMonth}`);
  }

  // 3. 월 내에서 해당 날짜 찾기
  const entry = monthIndex.entries.find(
    e => e.solar.year === solarYear && e.solar.month === solarMonth && e.solar.day === solarDay
  );

  if (!entry) {
    throw new InvalidDateError(`Invalid solar date: ${solarYear}-${solarMonth}-${solarDay}`);
  }

  // 4. 갑자 계산
  const gapja = formatGapjaByIds(
    entry.gapja.yearPillarId,
    entry.gapja.monthPillarId,
    entry.gapja.dayPillarId
  );

  // 5. 결과 반환
  return {
    solar: { year: solarYear, month: solarMonth, day: solarDay },
    lunar: {
      year: entry.lunar.year,
      month: entry.lunar.month,
      day: entry.lunar.day,
      isLeapMonth: entry.lunar.isLeap,
    },
    gapja,
    julianDay: entry.jd,
  };
}

/**
 * 음력 → 양력 변환
 * @param lunarYear 음력 년 (1000~2050)
 * @param lunarMonth 음력 월 (1~12)
 * @param lunarDay 음력 일 (1~30)
 * @param isLeapMonth 윤달 여부
 * @returns 양력 날짜와 갑자 정보
 * @throws {OutOfRangeError} 지원 범위 밖 연도
 * @throws {InvalidDateError} 유효하지 않은 날짜
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false
): LunarToSolarResult {
  // 1. 범위 검증
  if (!isSupportedYear(lunarYear)) {
    throw new OutOfRangeError(lunarYear);
  }

  // 2. 음력 → 양력 역인덱스 조회
  // 음력 11·12월은 대부분 다음 해 양력 1~2월에 해당하므로
  // 같은 해 양력 1~12월에 더해 다음 해 양력 1~3월 인덱스까지 조회합니다.
  const searchMonths: Array<[number, number]> = [];
  for (let month = 1; month <= 12; month++) searchMonths.push([lunarYear, month]);
  for (let month = 1; month <= 3; month++) searchMonths.push([lunarYear + 1, month]);

  for (const [solarYear, solarMonth] of searchMonths) {
    const monthIndex = getMonthlyIndex(solarYear, solarMonth);
    if (!monthIndex) continue;

    const entry = monthIndex.entries.find(
      e => e.lunar.year === lunarYear &&
           e.lunar.month === lunarMonth &&
           e.lunar.day === lunarDay &&
           e.lunar.isLeap === isLeapMonth
    );

    if (entry) {
      // 갑자 계산
      const gapja = formatGapjaByIds(
        entry.gapja.yearPillarId,
        entry.gapja.monthPillarId,
        entry.gapja.dayPillarId
      );

      return {
        lunar: { year: lunarYear, month: lunarMonth, day: lunarDay, isLeapMonth },
        solar: {
          year: entry.solar.year,
          month: entry.solar.month,
          day: entry.solar.day,
        },
        gapja,
      };
    }
  }

  throw new InvalidDateError(`Invalid lunar date: ${lunarYear}-${lunarMonth}-${lunarDay}${isLeapMonth ? ' (leap)' : ''}`);
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
): import('../types').GapjaResult {
  const result = solarToLunar(solarYear, solarMonth, solarDay);
  return {
    yearPillar: result.gapja.yearPillar,
    yearPillarHanja: result.gapja.yearPillarHanja,
    monthPillar: result.gapja.monthPillar,
    monthPillarHanja: result.gapja.monthPillarHanja,
    dayPillar: result.gapja.dayPillar,
    dayPillarHanja: result.gapja.dayPillarHanja,
  };
}
