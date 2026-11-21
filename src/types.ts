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
  /** 그날 절(12절)이 들면 바뀌는 시각과 앞뒤의 연주·월주. 없으면 null — 1.2.0 */
  sajuBoundary: SajuBoundary | null;
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
  /** 그날 절(12절)이 들면 바뀌는 시각과 앞뒤의 연주·월주. 없으면 null — 1.2.0 */
  sajuBoundary: SajuBoundary | null;
}

// ─────────────────────────────────────────────
// 1.2.0: 절입 경계·시계
// ─────────────────────────────────────────────

/**
 * 날짜만 받을 때 절입일의 연주·월주를 어느 쪽으로 낼지 — 1.2.0
 * - `'noon'`(기본): 그날 한국 시각(고정 UTC+9) 12:00의 값. 절입 분이 12:00 이하면 새 달
 * - `'day-end'`: 절입이 든 날은 하루 전체를 새 달로(책력의 표기 관례)
 * - `'day-start'`: 절입이 든 날은 하루 전체를 앞 달로
 * - `'legacy-fixed'`: 1.1.0의 양력 고정 날짜 규칙(옮겨 가는 동안만 — 2.0에서 없앤다)
 */
export type BoundaryRule = 'noon' | 'day-end' | 'day-start' | 'legacy-fixed';

/** 날짜만 받는 함수의 선택 인자 — 1.2.0 */
export interface BoundaryOptions {
  boundaryRule?: BoundaryRule;
}

/**
 * 입력 시각을 읽는 시계 — 1.2.0
 * - `'kst-fixed'`(1.x 기본): 언제나 UTC+9
 * - `'korea-legal'`: 그때의 한국 법정 시계(1908~1911·1954~1961 UTC+8:30, 서머타임 포함, 1908년 전은 지방 평균시 UTC+8:27:52)
 * - `{ utcOffsetMinutes }`: 호출자가 준 고정 차이(분, 예: 서울 밖 출생)
 */
export type ClockOption = 'kst-fixed' | 'korea-legal' | { utcOffsetMinutes: number };

/** 시각을 받는 함수의 선택 인자 — 1.2.0 */
export interface TimeOptions {
  /** 입력 시각을 읽는 시계(기본 'kst-fixed') */
  clock?: ClockOption;
  /** 서머타임이 끝나며 두 번 지나간 시각: 0 = 앞의 것(기본), 1 = 뒤의 것. `clock: 'korea-legal'`에서만 쓴다 */
  fold?: 0 | 1;
}

/** 시계에 관한 알림 — 1.2.0 */
export interface ClockNotice {
  /** 그때 한국 법정 시계의 UTC 차이(분). 1908년 전 지방 평균시는 507.8666…(8시간 27분 52초) */
  legalOffsetMinutes: number;
  /** 그 시계가 서머타임이었는가 */
  dst: boolean;
  /** 사람에게 보여 줄 설명 */
  message: string;
}

/** 경계 앞·뒤의 연주·월주 */
export interface SajuPillarPair {
  yearPillar: string;
  yearPillarHanja: string;
  monthPillar: string;
  monthPillarHanja: string;
}

/** 날짜·시각(분 단위) */
export interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * 그날 드는 절(12절)의 경계 정보 — 1.2.0
 *
 * 날짜는 라이브러리 날짜(1582-10-04까지 율리우스력, 1582-10-15부터 그레고리력)다.
 */
export interface SajuBoundary {
  /** 그날 드는 절. index는 SOLAR_TERM_NAMES의 번호(0 = 입춘) */
  term: { name: string; hanja: string; index: number };
  /** 바뀌는 시각 — 한국 시각(고정 UTC+9), 분 단위. 이 분부터가 뒤다 */
  at: DateTimeParts;
  /** 같은 순간의 절대 시각(UTC, ISO 8601 분 단위 — 날짜는 ISO 8601대로 그레고리력, 예: '2024-02-04T08:27Z') */
  atUtc: string;
  /** 이 시각 앞에 태어났을 때 */
  before: SajuPillarPair;
  /** 이 시각부터(뒤) */
  after: SajuPillarPair;
  /** 연주도 바뀌는가(입춘) */
  yearChanges: boolean;
  /** gapja(또는 결과의 연주·월주)에 실린 쪽 */
  chosen: 'before' | 'after';
  /** 이 시각 앞뒤 몇 분은 앞·뒤를 정할 수 없는가 */
  uncertainMinutes: number;
  /**
   * 그날의 법정 시계가 고정 UTC+9와 달랐으면 그 시계로 본 시각(분 아래는 버림). 같으면 null.
   * 1908-04-01 전은 법정 시계가 아니라 서울 지방 평균시(UTC+8:27:52)로 본 시각이다
   */
  atLegalClock: (DateTimeParts & { offsetMinutes: number }) | null;
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
