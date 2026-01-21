/**
 * 절기 계산 모듈
 *
 * 한국 24절기 정보를 제공합니다.
 */

import { SOLAR_TERM_NAMES } from '../data/solar-terms';
import { SOLAR_TERMS_DATA, SUPPORTED_SOLAR_TERM_YEARS } from '../data/solar-terms-data';
import type { SolarTermDateTime } from '../types';

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

/**
 * 특정 연도의 모든 절기 조회 (시각 포함)
 * @param year 연도 (2020~2030)
 * @returns 해당 연도의 24절기 시각 정보
 */
export function getSolarTermsByYear(year: number): SolarTermWithDate[] {
  if (!SOLAR_TERMS_DATA[year]) {
    throw new Error(`No solar terms data for year ${year}. Supported years: ${SUPPORTED_SOLAR_TERM_YEARS.join(', ')}`);
  }

  const yearData = SOLAR_TERMS_DATA[year];
  const result: SolarTermWithDate[] = [];

  yearData.forEach((termData, i) => {
    // 절기 이름으로 기본 정보 찾기
    const baseInfo = SOLAR_TERM_NAMES.find(t => t.name === termData.name);
    if (!baseInfo) return;

    result.push({
      name: baseInfo.name,
      nameHanja: baseInfo.hanja,
      index: baseInfo.index,
      longitude: baseInfo.longitude,
      type: baseInfo.type,
      sajuMonth: baseInfo.sajuMonth,
      year,
      month: termData.month,
      day: termData.day,
      hour: termData.hour,
      minute: termData.minute,
    });
  });

  return result;
}

/**
 * 특정 날짜의 절기 조회 (±1일 이내)
 * @param year 연도
 * @param month 월 (1~12)
 * @param day 일 (1~31)
 * @returns 해당 날짜의 절기 정보 또는 null
 */
export function getSolarTermForDate(year: number, month: number, day: number): SolarTermWithDate | null {
  if (!SOLAR_TERMS_DATA[year]) {
    return null;
  }

  const yearData = SOLAR_TERMS_DATA[year];

  for (const termData of yearData) {
    if (termData.month === month && Math.abs(termData.day - day) <= 1) {
      const baseInfo = SOLAR_TERM_NAMES.find(t => t.name === termData.name);
      if (!baseInfo) continue;

      return {
        name: baseInfo.name,
        nameHanja: baseInfo.hanja,
        index: baseInfo.index,
        longitude: baseInfo.longitude,
        type: baseInfo.type,
        sajuMonth: baseInfo.sajuMonth,
        year,
        month: termData.month,
        day: termData.day,
        hour: termData.hour,
        minute: termData.minute,
      };
    }
  }

  return null;
}

/**
 * 특정 월의 모든 절기 조회
 * @param year 연도
 * @param month 월 (1~12)
 * @returns 해당 월의 절기 목록
 */
export function getSolarTermsByMonth(year: number, month: number): SolarTermWithDate[] {
  if (!SOLAR_TERMS_DATA[year]) {
    return [];
  }

  const yearData = SOLAR_TERMS_DATA[year];
  const result: SolarTermWithDate[] = [];

  yearData.forEach((termData) => {
    if (termData.month !== month) return;

    const baseInfo = SOLAR_TERM_NAMES.find(t => t.name === termData.name);
    if (!baseInfo) return;

    result.push({
      name: baseInfo.name,
      nameHanja: baseInfo.hanja,
      index: baseInfo.index,
      longitude: baseInfo.longitude,
      type: baseInfo.type,
      sajuMonth: baseInfo.sajuMonth,
      year,
      month: termData.month,
      day: termData.day,
      hour: termData.hour,
      minute: termData.minute,
    });
  });

  return result;
}

/**
 * 지원되는 절기 연도 목록 조회
 * @returns 지원되는 연도 배열
 */
export function getSupportedSolarTermYears(): number[] {
  return [...SUPPORTED_SOLAR_TERM_YEARS];
}

/**
 * 현재 날짜가 속한 사주 월 계산
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

  // 1월 소한 이전은 축월(12)
  return 12;
}

/**
 * 입춘 이전인지 확인 (년주 결정에 사용)
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
