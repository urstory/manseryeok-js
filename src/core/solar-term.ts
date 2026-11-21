/**
 * 절기 계산 모듈
 *
 * 한국 24절기 정보를 제공합니다.
 */

import { SOLAR_TERM_NAMES } from '../data/solar-terms';
import { solarFromJd } from '../data/date-index';
import { isSupportedYear } from '../utils/range';
import { allTerms, kOfIndex, kstOfMinute, nameIndexOfK } from './terms';

/**
 * 절기 시각 정보 (날짜 포함)
 */
export interface SolarTermWithDate {
  name: string;
  nameHanja: string;
  index: number;
  longitude: number;
  type: 'jeolgi' | 'junggi';
  sajuMonth: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * 24절기 기본 정보 조회
 * @returns 24절기 정보 배열
 */
export function getAllSolarTerms(): typeof SOLAR_TERM_NAMES {
  return SOLAR_TERM_NAMES;
}

/**
 * 절기 인덱스로 기본 정보 조회
 * @param index 절기 인덱스 (0~23)
 * @returns 절기 기본 정보
 */
export function getSolarTermInfoByIndex(index: number) {
  if (index < 0 || index >= 24) {
    throw new RangeError(`Solar term index must be 0~23, got ${index}`);
  }
  return SOLAR_TERM_NAMES[index];
}

/**
 * 절기 이름으로 기본 정보 조회
 * @param name 절기 이름 (예: '입춘', '경칩')
 * @returns 절기 기본 정보 또는 undefined
 */
export function getSolarTermInfoByName(name: string) {
  return SOLAR_TERM_NAMES.find(t => t.name === name);
}

/**
 * 사주 월에 해당하는 절기 목록 조회
 * @param sajuMonth 사주 월 (1~12)
 * @returns 해당 월의 절기 목록
 */
export function getSolarTermsBySajuMonth(sajuMonth: number): typeof SOLAR_TERM_NAMES {
  if (sajuMonth < 1 || sajuMonth > 12) {
    throw new RangeError(`Saju month must be 1~12, got ${sajuMonth}`);
  }
  return SOLAR_TERM_NAMES.filter(term => term.sajuMonth === sajuMonth);
}

/** 절입 순간(UTC 분)과 절기 번호 k → 한국 시각(고정 UTC+9) 날짜·시각의 절기 정보 */
export function termWithDateOf(t: number, k: number): SolarTermWithDate {
  const idx = nameIndexOfK(k);
  const base = SOLAR_TERM_NAMES[idx];
  const { jd, minuteOfDay } = kstOfMinute(t);
  const d = solarFromJd(jd);
  return {
    name: base.name,
    nameHanja: base.hanja,
    index: idx,
    longitude: base.longitude,
    type: base.type,
    sajuMonth: base.sajuMonth,
    year: d.year,
    month: d.month,
    day: d.day,
    hour: Math.floor(minuteOfDay / 60),
    minute: minuteOfDay % 60,
  };
}

let _byYear: Map<number, SolarTermWithDate[]> | null = null;

/** 라이브러리 날짜(한국 시각 고정 UTC+9)의 해로 묶은 절기 목록. 지원 범위(1391~2050) 밖이면 undefined */
export function termsOfYear(year: number): SolarTermWithDate[] | undefined {
  if (!Number.isInteger(year) || !isSupportedYear(year)) return undefined;
  if (!_byYear) {
    const map = new Map<number, SolarTermWithDate[]>();
    const all = allTerms();
    for (let i = 0; i < all.length; i++) {
      const term = termWithDateOf(all[i], kOfIndex(i));
      if (!isSupportedYear(term.year)) continue;
      const list = map.get(term.year);
      if (list) list.push(term);
      else map.set(term.year, [term]);
    }
    _byYear = map;
  }
  return _byYear.get(year);
}

/**
 * 특정 연도의 모든 절기 조회 (시각 포함)
 *
 * 값은 절입 시각 표에서 낸 한국 시각(고정 UTC+9)의 월·일·시·분이다(1.2.0부터 실제 값).
 * 해는 절입 순간을 라이브러리 날짜로 옮긴 해로 묶는다. 그래서 1391~1581년(율리우스력)은 대한부터 다음 소한까지 24개,
 * 1582년은 10월 5~14일이 없어 23개다.
 * @param year 연도 (1391~2050)
 * @returns 해당 연도의 절기 시각 정보(시간 차례)
 */
export function getSolarTermsByYear(year: number): SolarTermWithDate[] {
  const list = termsOfYear(year);
  if (!list) {
    throw new Error(`No solar terms data for year ${year}. Supported years: 1391~2050`);
  }
  return list.map((t) => ({ ...t }));
}

/**
 * 특정 날짜의 절기 조회 (±1일 이내)
 * @param year 연도 (1391~2050)
 * @param month 월 (1~12)
 * @param day 일 (1~31)
 * @returns 해당 날짜의 절기 정보 또는 null
 */
export function getSolarTermForDate(year: number, month: number, day: number): SolarTermWithDate | null {
  const list = termsOfYear(year);
  if (!list) return null;
  for (const term of list) {
    if (term.month === month && Math.abs(term.day - day) <= 1) return { ...term };
  }
  return null;
}

/**
 * 특정 월의 모든 절기 조회
 * @param year 연도 (1391~2050)
 * @param month 월 (1~12)
 * @returns 해당 월의 절기 목록
 */
export function getSolarTermsByMonth(year: number, month: number): SolarTermWithDate[] {
  const list = termsOfYear(year);
  if (!list) return [];
  return list.filter((t) => t.month === month).map((t) => ({ ...t }));
}

/**
 * 지원되는 절기 연도 목록 조회
 * @returns 지원되는 연도 배열 (1391~2050)
 */
export function getSupportedSolarTermYears(): number[] {
  const years: number[] = [];
  for (let y = 1391; y <= 2050; y++) years.push(y);
  return years;
}

/**
 * 현재 날짜가 속한 사주 월 계산 (대략값)
 *
 * @deprecated 해를 받지 않아 양력 고정 날짜(1/6·2/4·3/6…)로 셈하는 대략값입니다(1.1.0과 같은 값).
 * 실제 절입 시각으로 셈하려면 `getSajuMonthAt(year, month, day, hour?, minute?)`을 쓰세요.
 *
 * @description
 * 사주에서 월주는 절기(節氣)를 기준으로 계산합니다.
 * 입춘(立春, 황경 315°)부터 2월, 경칩(驚蟄, 황경 345°)부터 3월, ...
 *
 * @param month 양력 월 (1~12)
 * @param day 양력 일 (1~31)
 * @returns 사주 월 (1~12)
 */
export function getSajuMonth(month: number, day: number): number {
  // 백엔드 코드와 동일한 방식으로 사주 월 계산
  const termDates = [
    { solarMonth: 1, day: 6, sajuMonth: 12 }, // 소한 → 축월
    { solarMonth: 2, day: 4, sajuMonth: 1 }, // 입춘 → 인월
    { solarMonth: 3, day: 6, sajuMonth: 2 }, // 경칩 → 묘월
    { solarMonth: 4, day: 5, sajuMonth: 3 }, // 청명 → 진월
    { solarMonth: 5, day: 6, sajuMonth: 4 }, // 입하 → 사월
    { solarMonth: 6, day: 6, sajuMonth: 5 }, // 망종 → 오월
    { solarMonth: 7, day: 7, sajuMonth: 6 }, // 소서 → 미월
    { solarMonth: 8, day: 8, sajuMonth: 7 }, // 입추 → 신월
    { solarMonth: 9, day: 8, sajuMonth: 8 }, // 백로 → 유월
    { solarMonth: 10, day: 8, sajuMonth: 9 }, // 한로 → 술월
    { solarMonth: 11, day: 8, sajuMonth: 10 }, // 입동 → 해월
    { solarMonth: 12, day: 7, sajuMonth: 11 }, // 대설 → 자월
  ];

  // 역순으로 검사하여 현재 날짜가 속한 월 찾기
  for (let i = termDates.length - 1; i >= 0; i--) {
    const term = termDates[i];
    if (month > term.solarMonth || (month === term.solarMonth && day >= term.day)) {
      return term.sajuMonth;
    }
  }

  // 1월 소한 이전은 자월(11) (대설 12/7 ~ 소한 1/6 구간)
  return 11;
}

/**
 * 입춘 이전인지 확인 (대략값)
 *
 * @deprecated 해를 받지 않아 2월 4일 고정으로 셈하는 대략값입니다(1.1.0과 같은 값).
 * 그 해의 실제 입춘은 `getIpchun(year)`으로 구하세요.
 * @param month 양력 월
 * @param day 양력 일
 * @returns 입춘 이전이면 true
 */
export function isBeforeLichun(month: number, day: number): boolean {
  // 입춘은 대략 2월 4일
  if (month < 2) {
    return true;
  }
  if (month === 2 && day < 4) {
    return true;
  }
  return false;
}
