/**
 * 양력 ↔ 음력 변환 모듈
 *
 * 한국천문연구원 음력 달 표와 율리우스 적일(JD) 계산으로 양력과 음력 간 변환을 수행합니다.
 */

import {
  entryOfJd,
  jdFromLunar,
  jdFromSolar,
  lunarCalendarGanjiIds,
  lunarFromJd,
  weekdayOfJd,
} from '../data/date-index';
import { formatGapjaByIds } from './gapja-calculator';
import { getPillarById } from '../data/sixty-pillars';
import { isSupportedYear } from '../utils/range';
import { OutOfRangeError, InvalidDateError } from '../types';
import type { SolarToLunarResult, LunarToSolarResult, LunarCalendarGanji } from '../types';

function lunarCalendarGanji(lunarYear: number, lunarMonth: number, isLeap: boolean): LunarCalendarGanji {
  const { yearId, monthId } = lunarCalendarGanjiIds(lunarYear, lunarMonth);
  const y = getPillarById(yearId);
  const m = isLeap ? null : getPillarById(monthId);
  return {
    year: y.combined.hangul,
    yearHanja: y.combined.hanja,
    month: m ? m.combined.hangul : null,
    monthHanja: m ? m.combined.hanja : null,
  };
}

/** JD 하나에 대한 공통 결과(양력·음력·간지·부가 정보) */
function resultOfJd(jd: number) {
  const entry = entryOfJd(jd);
  const lunar = lunarFromJd(jd);
  if (!entry || !lunar) return undefined;
  return {
    entry,
    gapja: formatGapjaByIds(entry.gapja.yearPillarId, entry.gapja.monthPillarId, entry.gapja.dayPillarId),
    lunarMonthDays: lunar.monthDays,
    weekday: weekdayOfJd(jd),
    lunarCalendarGanji: lunarCalendarGanji(lunar.year, lunar.month, lunar.isLeap),
  };
}

/**
 * 양력 → 음력 변환
 * @param solarYear 양력 년 (1391~2050, 1582-10-15 이전은 율리우스력 날짜)
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
  if (!isSupportedYear(solarYear)) {
    throw new OutOfRangeError(solarYear);
  }

  const jd = jdFromSolar(solarYear, solarMonth, solarDay);
  const r = jd === undefined ? undefined : resultOfJd(jd);
  if (jd === undefined || !r) {
    throw new InvalidDateError(`Invalid solar date: ${solarYear}-${solarMonth}-${solarDay}`);
  }

  return {
    solar: { year: solarYear, month: solarMonth, day: solarDay },
    lunar: {
      year: r.entry.lunar.year,
      month: r.entry.lunar.month,
      day: r.entry.lunar.day,
      isLeapMonth: r.entry.lunar.isLeap,
    },
    gapja: r.gapja,
    julianDay: jd,
    lunarMonthDays: r.lunarMonthDays,
    weekday: r.weekday,
    lunarCalendarGanji: r.lunarCalendarGanji,
  };
}

/**
 * 음력 → 양력 변환
 * @param lunarYear 음력 년 (1391~2050)
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
  if (!isSupportedYear(lunarYear)) {
    throw new OutOfRangeError(lunarYear);
  }

  const jd = jdFromLunar(lunarYear, lunarMonth, lunarDay, isLeapMonth);
  const r = jd === undefined ? undefined : resultOfJd(jd);
  if (jd === undefined || !r) {
    throw new InvalidDateError(`Invalid lunar date: ${lunarYear}-${lunarMonth}-${lunarDay}${isLeapMonth ? ' (leap)' : ''}`);
  }

  return {
    lunar: { year: lunarYear, month: lunarMonth, day: lunarDay, isLeapMonth },
    solar: {
      year: r.entry.solar.year,
      month: r.entry.solar.month,
      day: r.entry.solar.day,
    },
    gapja: r.gapja,
    julianDay: jd,
    lunarMonthDays: r.lunarMonthDays,
    weekday: r.weekday,
    lunarCalendarGanji: r.lunarCalendarGanji,
  };
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
