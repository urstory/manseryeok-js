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
  julianDay: number;
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
}

/**
 * 갑자 정보
 */
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
    super(`Year ${year} is out of supported range (1000~2050)`);
    this.name = 'OutOfRangeError';
  }
}
