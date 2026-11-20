/**
 * 만세력 JavaScript 라이브러리 타입 정의
 * Korean Lunar Calendar (만세력) Type Definitions
 */

/**
 * 오행 (五行)
 */
export type Element = '목' | '화' | '토' | '금' | '수';

/**
 * 양력 → 음력 변환 결과
 */
export interface SolarToLunarResult {
  solar: {
    year: number;
    month: number;
    day: number;
  };
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  gapja: {
    yearPillar: string;      // "갑진"
    yearPillarHanja: string; // "甲辰"
    monthPillar: string;
    monthPillarHanja: string;
    dayPillar: string;
    dayPillarHanja: string;
  };
  /** 율리우스 적일(JD) */
  julianDay: number;
  /** 그 음력 달의 날수(29 또는 30) — 1.1.0 */
  lunarMonthDays: number;
  /** 요일(0 = 일요일 … 6 = 토요일) — 1.1.0 */
  weekday: number;
  /** 음력 기준 간지(한국천문연구원 '세차'·'월건'). 사주 연주·월주(절기 기준)가 아니다 — 1.1.0 */
  lunarCalendarGanji: LunarCalendarGanji;
}

/**
 * 음력 → 양력 변환 결과
 */
export interface LunarToSolarResult {
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  solar: {
    year: number;
    month: number;
    day: number;
  };
  gapja: {
    yearPillar: string;
    yearPillarHanja: string;
    monthPillar: string;
    monthPillarHanja: string;
    dayPillar: string;
    dayPillarHanja: string;
  };
  /** 율리우스 적일(JD) */
  julianDay: number;
  /** 그 음력 달의 날수(29 또는 30) — 1.1.0 */
  lunarMonthDays: number;
  /** 요일(0 = 일요일 … 6 = 토요일) — 1.1.0 */
  weekday: number;
  /** 음력 기준 간지(한국천문연구원 '세차'·'월건'). 사주 연주·월주(절기 기준)가 아니다 — 1.1.0 */
  lunarCalendarGanji: LunarCalendarGanji;
}

/**
 * 갑자 정보
 */
/** 음력 기준 간지(세차·월건) */
export interface LunarCalendarGanji {
  /** 세차(음력 해의 간지), 예: "갑진" */
  year: string;
  yearHanja: string;
  /** 월건(음력 달의 간지), 예: "병인". 윤달에는 월건이 없어 null(한국천문연구원 자료와 같음) */
  month: string | null;
  monthHanja: string | null;
}

export interface GapjaResult {
  yearPillar: string;
  yearPillarHanja: string;
  monthPillar: string;
  monthPillarHanja: string;
  dayPillar: string;
  dayPillarHanja: string;
}

/**
 * 절기 정보
 */
export interface SolarTermInfo {
  name: string;           // 입춘, 경칩, ...
  index: number;          // 0~23
  longitude: number;      // 태양 황경
  type: 'jeolgi' | 'junggi';
  sajuMonth: number;
  datetime: Date;
}

/**
 * 절기 일시 정보
 */
export interface SolarTermDateTime {
  name: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * 양력 → 음력 변환 인덱스 엔트리 (내부용)
 */
export interface SolarToLunarEntry {
  jd: number;
  solar: { year: number; month: number; day: number };
  lunar: { year: number; month: number; day: number; isLeap: boolean };
  gapja: { yearPillarId: number; monthPillarId: number; dayPillarId: number };
}

/**
 * 유효하지 않은 날짜 에러
 */
export class InvalidDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateError';
  }
}

/**
 * 지원 범위 밖 에러
 */
export class OutOfRangeError extends Error {
  constructor(year: number) {
    super(`Year ${year} is out of supported range (1391~2050)`);
    this.name = 'OutOfRangeError';
  }
}
