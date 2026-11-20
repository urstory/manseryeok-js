/**
 * 양력 ↔ 음력 날짜 인덱스
 *
 * 음력 달 표(lunar-table.ts, 한국천문연구원 자료)와 율리우스 적일(JD) 계산으로
 * 1391~2050년의 날짜 정보를 필요할 때 만든다. 날짜별 데이터를 통째로 싣지 않아 작고 빠르다.
 *
 * 양력 날짜 체계: 1582-10-15(JD 2299161) 이전은 율리우스력, 그 뒤는 그레고리력
 * (한국천문연구원 음양력 서비스와 같은 관례). 1582-10-05 ~ 1582-10-14는 존재하지 않는 날짜다.
 */

import type { SolarToLunarEntry } from '../types';
import {
  LUNAR_TABLE_B64,
  LUNAR_TABLE_MONTHS,
  LUNAR_TABLE_START_JD,
  LUNAR_TABLE_START_YEAR,
  LUNAR_TABLE_END_JD,
} from './lunar-table';

/**
 * 월별 인덱스 엔트리
 */
export interface MonthlyIndex {
  year: number;
  month: number;
  entries: SolarToLunarEntry[];
  startJD: number;
  endJD: number;
}

/** 지원 범위(양력 연도) */
export const START_YEAR = 1391;
export const END_YEAR = 2050;
const TOTAL_MONTHS = (END_YEAR - START_YEAR + 1) * 12;

/** 그레고리력이 시작되는 JD (1582-10-15) */
export const GREGORIAN_START_JD = 2299161;

/** 일진 계산 기준: dayPillarId = (JD - 2415011) mod 60 (甲子 = 0) */
const DAY_PILLAR_EPOCH = 2415011;

const mod = (n: number, m: number): number => ((n % m) + m) % m;

// ─────────────────────────────────────────────
// 양력 날짜 ↔ JD
// ─────────────────────────────────────────────

function jdnGregorian(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jdnJulian(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083;
}

/** JD → 양력 날짜 (1582-10-15 이전은 율리우스력) */
export function solarFromJd(jd: number): { year: number; month: number; day: number } {
  let c: number;
  if (jd >= GREGORIAN_START_JD) {
    const a = jd + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    return {
      year: 100 * b + d - 4800 + Math.floor(m / 10),
      month: m + 3 - 12 * Math.floor(m / 10),
      day: e - Math.floor((153 * m + 2) / 5) + 1,
    };
  }
  c = jd + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    year: d - 4800 + Math.floor(m / 10),
    month: m + 3 - 12 * Math.floor(m / 10),
    day: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

/**
 * 양력 날짜 → JD. 존재하지 않는 날짜(2월 30일, 1582-10-05~14 등)면 undefined
 */
export function jdFromSolar(year: number, month: number, day: number): number | undefined {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined;
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const g = jdnGregorian(year, month, day);
  const jd = g >= GREGORIAN_START_JD ? g : jdnJulian(year, month, day);
  const back = solarFromJd(jd);
  if (back.year !== year || back.month !== month || back.day !== day) return undefined;
  return jd;
}

// ─────────────────────────────────────────────
// 음력 달 표
// ─────────────────────────────────────────────

interface LunarMonth {
  startJd: number;
  year: number;
  month: number;
  isLeap: boolean;
  days: number;
}

let _months: LunarMonth[] | null = null;
let _byLunar: Map<string, number> | null = null;

function lunarKey(year: number, month: number, isLeap: boolean): string {
  return `${year}-${month}${isLeap ? 'L' : ''}`;
}

function decodeTable(): LunarMonth[] {
  if (_months) return _months;
  const bin = atob(LUNAR_TABLE_B64);
  const months: LunarMonth[] = new Array(LUNAR_TABLE_MONTHS);
  let jd = LUNAR_TABLE_START_JD;
  let year = LUNAR_TABLE_START_YEAR;
  for (let i = 0; i < LUNAR_TABLE_MONTHS; i++) {
    const b = bin.charCodeAt(i);
    const month = (b & 15) + 1;
    const isLeap = (b & 16) !== 0;
    const days = b & 32 ? 30 : 29;
    if (i > 0 && month === 1 && !isLeap) year++;
    months[i] = { startJd: jd, year, month, isLeap, days };
    jd += days;
  }
  _months = months;
  return months;
}

function byLunar(): Map<string, number> {
  if (_byLunar) return _byLunar;
  const map = new Map<string, number>();
  decodeTable().forEach((m, i) => map.set(lunarKey(m.year, m.month, m.isLeap), i));
  _byLunar = map;
  return map;
}

/** 지원하는 마지막 날(양력 2050-12-31). 표의 마지막 음력 달은 이 날 뒤로 이어지지만 그 부분은 지원하지 않는다 */
const LAST_JD = Math.min(LUNAR_TABLE_END_JD, 2470172);

/** JD가 속한 음력 달 (지원 범위 밖이면 undefined) */
function lunarMonthAt(jd: number): LunarMonth | undefined {
  if (jd < LUNAR_TABLE_START_JD || jd > LAST_JD) return undefined;
  const months = decodeTable();
  let lo = 0;
  let hi = months.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (months[mid].startJd <= jd) lo = mid;
    else hi = mid - 1;
  }
  return months[lo];
}

/** JD → 음력 날짜 + 그 달의 날수 */
export function lunarFromJd(
  jd: number
): { year: number; month: number; day: number; isLeap: boolean; monthDays: number } | undefined {
  const m = lunarMonthAt(jd);
  if (!m) return undefined;
  return { year: m.year, month: m.month, day: jd - m.startJd + 1, isLeap: m.isLeap, monthDays: m.days };
}

/** 음력 날짜 → JD. 없는 날짜(평달의 30일이 없는 달, 그 해에 없는 윤달 등)면 undefined */
export function jdFromLunar(year: number, month: number, day: number, isLeap: boolean): number | undefined {
  const idx = byLunar().get(lunarKey(year, month, isLeap));
  if (idx === undefined) return undefined;
  const m = decodeTable()[idx];
  if (!Number.isInteger(day) || day < 1 || day > m.days) return undefined;
  const jd = m.startJd + day - 1;
  return jd <= LAST_JD ? jd : undefined;
}

// ─────────────────────────────────────────────
// 간지 ID (1.0.x와 같은 규칙)
// ─────────────────────────────────────────────

/**
 * 연주·월주 경계 날짜(양력 월·일 고정, 1.0.x와 같음).
 * 실제 절입 시각을 쓰지 않는 근사 규칙이다.
 */
const SAJU_MONTH_START: Array<[number, number, number]> = [
  [1, 6, 12], [2, 4, 1], [3, 6, 2], [4, 5, 3], [5, 6, 4], [6, 6, 5],
  [7, 7, 6], [8, 8, 7], [9, 8, 8], [10, 8, 9], [11, 8, 10], [12, 7, 11],
];

function sajuMonthOf(month: number, day: number): number {
  for (let i = SAJU_MONTH_START.length - 1; i >= 0; i--) {
    const [m, d, s] = SAJU_MONTH_START[i];
    if (month > m || (month === m && day >= d)) return s;
  }
  return 11;
}

/** 寅月 시작 60갑자 ID (연간 甲己·乙庚·丙辛·丁壬·戊癸) */
const MONTH_PILLAR_BASE = [2, 14, 26, 38, 50] as const;

function pillarIds(year: number, month: number, day: number, jd: number) {
  const beforeLichun = month < 2 || (month === 2 && day < 4);
  const yearPillarId = mod(year - (beforeLichun ? 1 : 0) - 4, 60);
  const monthPillarId = (MONTH_PILLAR_BASE[(yearPillarId % 10) % 5] + sajuMonthOf(month, day) - 1) % 60;
  const dayPillarId = mod(jd - DAY_PILLAR_EPOCH, 60);
  return { yearPillarId, monthPillarId, dayPillarId };
}

/**
 * 음력 기준 간지 ID (한국천문연구원 '세차'·'월건'과 같은 규칙).
 * 사주 연주·월주(절기 기준)와 다르다.
 */
export function lunarCalendarGanjiIds(lunarYear: number, lunarMonth: number): { yearId: number; monthId: number } {
  const yearId = mod(lunarYear - 4, 60);
  const monthId = (MONTH_PILLAR_BASE[(yearId % 10) % 5] + lunarMonth - 1) % 60;
  return { yearId, monthId };
}

/** 요일 (0 = 일요일 … 6 = 토요일) */
export function weekdayOfJd(jd: number): number {
  return mod(jd + 1, 7);
}

// ─────────────────────────────────────────────
// 월별 인덱스 (1.0.x 공개 API와 같은 모양)
// ─────────────────────────────────────────────

/** JD 하나의 엔트리 */
export function entryOfJd(jd: number): SolarToLunarEntry | undefined {
  const lunar = lunarFromJd(jd);
  if (!lunar) return undefined;
  const solar = solarFromJd(jd);
  return {
    jd,
    solar,
    lunar: { year: lunar.year, month: lunar.month, day: lunar.day, isLeap: lunar.isLeap },
    gapja: pillarIds(solar.year, solar.month, solar.day, jd),
  };
}

const _cache = new Map<string, MonthlyIndex>();

export function getMonthlyIndex(year: number, month: number): MonthlyIndex | undefined {
  if (!Number.isInteger(year) || !Number.isInteger(month)) return undefined;
  if (year < START_YEAR || year > END_YEAR || month < 1 || month > 12) return undefined;

  const key = `${year}-${String(month).padStart(2, '0')}`;
  const cached = _cache.get(key);
  if (cached) return cached;

  const startJD = jdFromSolar(year, month, 1);
  const nextJD = month === 12 ? jdFromSolar(year + 1, 1, 1) : jdFromSolar(year, month + 1, 1);
  if (startJD === undefined || nextJD === undefined) return undefined;

  const entries: SolarToLunarEntry[] = [];
  for (let jd = startJD; jd < nextJD; jd++) {
    const e = entryOfJd(jd);
    if (e) entries.push(e);
  }
  if (entries.length === 0) return undefined;

  const result: MonthlyIndex = { year, month, entries, startJD: entries[0].jd, endJD: entries[entries.length - 1].jd };
  _cache.set(key, result);
  return result;
}

/** @deprecated getMonthlyIndex() 사용 권장 */
export const SOLAR_TO_LUNAR_INDEX = new Proxy(new Map<string, MonthlyIndex>(), {
  get(target, prop) {
    if (prop === 'get') return (key: string) => getMonthlyIndex(+key.slice(0, 4), +key.slice(5, 7));
    if (prop === 'has') return (key: string) => {
      const y = +key.slice(0, 4), m = +key.slice(5, 7);
      return y >= START_YEAR && y <= END_YEAR && m >= 1 && m <= 12;
    };
    if (prop === 'keys') return function* () {
      for (let y = START_YEAR; y <= END_YEAR; y++)
        for (let m = 1; m <= 12; m++)
          yield `${y}-${String(m).padStart(2, '0')}`;
    };
    if (prop === 'size') return TOTAL_MONTHS;
    if (prop === Symbol.iterator) return function* () {
      for (let y = START_YEAR; y <= END_YEAR; y++)
        for (let m = 1; m <= 12; m++) {
          const key = `${y}-${String(m).padStart(2, '0')}`;
          const idx = getMonthlyIndex(y, m);
          if (idx) yield [key, idx] as [string, MonthlyIndex];
        }
    };
    const value = Reflect.get(target, prop);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
