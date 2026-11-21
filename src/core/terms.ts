/**
 * 절입 시각 표 풀기와 조회 (내부 모듈) — 1.2.0
 *
 * 표(src/data/terms-table.ts)는 처음 쓸 때 한 번 풀어 메모리에 둔다. 조회는 이분 탐색.
 * 시각은 모두 "UTC 분"(1970-01-01T00:00Z부터 센 분)이다. 절입 분부터가 그 절의 뒤다.
 */

import {
  TERMS_BODY,
  TERMS_COUNT,
  TERMS_HEAD_GAPS,
  TERMS_START_K,
  TERMS_START_UTC_MINUTE,
  TERMS_UNCERTAINTY,
  TERMS_ZERO,
} from '../data/terms-table';

/** 1970-01-01의 율리우스 적일(JD) */
export const EPOCH_JD = 2440588;
/** 고정 UTC+9(분) */
export const KST_OFFSET_MINUTES = 540;

/** 寅月 시작 60갑자 ID (연간 甲己·乙庚·丙辛·丁壬·戊癸) */
export const MONTH_PILLAR_BASE = [2, 14, 26, 38, 50] as const;

const mod = (n: number, m: number): number => ((n % m) + m) % m;

let _all: Int32Array | null = null;
let _jeol: Int32Array | null = null;
let _jeolK: Uint8Array | null = null;

/** 24절기 전부의 UTC 분(시간 차례) */
export function allTerms(): Int32Array {
  if (_all) return _all;
  const t = new Int32Array(TERMS_COUNT);
  const gaps = new Int32Array(TERMS_COUNT - 1);
  for (let i = 0; i < TERMS_HEAD_GAPS.length; i++) gaps[i] = TERMS_HEAD_GAPS[i];
  for (let i = 0; i < TERMS_BODY.length; i++) gaps[i + 24] = gaps[i] + TERMS_BODY.charCodeAt(i) - TERMS_ZERO;
  t[0] = TERMS_START_UTC_MINUTE;
  for (let i = 1; i < TERMS_COUNT; i++) t[i] = t[i - 1] + gaps[i - 1];
  _all = t;
  return t;
}

/** i번째 절기의 번호 k(태양 황경 ÷ 15도, 0 = 춘분, 21 = 입춘) */
export function kOfIndex(i: number): number {
  return (TERMS_START_K + i) % 24;
}

/** 절기 번호 k → SOLAR_TERM_NAMES의 번호(0 = 입춘) */
export function nameIndexOfK(k: number): number {
  return mod(k - 21, 24);
}

/** 절(12절, 홀수 k)만 모은 표 */
function jeolTable(): { t: Int32Array; k: Uint8Array } {
  if (_jeol && _jeolK) return { t: _jeol, k: _jeolK };
  const all = allTerms();
  const ts: number[] = [];
  const ks: number[] = [];
  for (let i = 0; i < all.length; i++) {
    const k = kOfIndex(i);
    if (k % 2 === 1) {
      ts.push(all[i]);
      ks.push(k);
    }
  }
  _jeol = Int32Array.from(ts);
  _jeolK = Uint8Array.from(ks);
  return { t: _jeol, k: _jeolK };
}

/** 정렬된 배열에서 값이 x 이하인 마지막 칸(없으면 -1) */
function lastAtOrBefore(arr: Int32Array, x: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  if (hi < 0 || arr[0] > x) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (arr[mid] <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** 24절기 표에서 UTC 분 x 이하인 마지막 칸 */
export function termIndexAtOrBefore(x: number): number {
  return lastAtOrBefore(allTerms(), x);
}

/** 절(12절) 하나 */
export interface Jeol {
  /** 절 표 안의 번호 */
  j: number;
  /** 절입 순간(UTC 분) */
  t: number;
  /** 절기 번호 k */
  k: number;
}

export function jeolCount(): number {
  return jeolTable().t.length;
}

export function jeolAt(j: number): Jeol | undefined {
  const { t, k } = jeolTable();
  if (j < 0 || j >= t.length) return undefined;
  return { j, t: t[j], k: k[j] };
}

/** UTC 분 x에 이미 든 마지막 절(절입 분 ≤ x) */
export function jeolAtOrBefore(x: number): Jeol | undefined {
  return jeolAt(lastAtOrBefore(jeolTable().t, x));
}

/** 절 번호 k → 사주 월(1 = 寅月 … 11 = 子月, 12 = 丑月) */
export function sajuMonthOfK(k: number): number {
  return mod(k - 21, 24) / 2 + 1;
}

/** UTC 분 → 그레고리력 해(ISO 8601) */
export function gregorianYearOfMinute(x: number): number {
  return new Date(x * 60000).getUTCFullYear();
}

/** 그 순간의 연주·월주 ID와 사주 월. 표 범위 밖이면 undefined */
export function pillarIdsAtMinute(x: number): { yearPillarId: number; monthPillarId: number; sajuMonth: number } | undefined {
  const jeol = jeolAtOrBefore(x);
  if (!jeol) return undefined;
  const sajuMonth = sajuMonthOfK(jeol.k);
  const ipchun = jeolAt(jeol.j - (sajuMonth - 1));
  if (!ipchun) return undefined;
  const yearPillarId = mod(gregorianYearOfMinute(ipchun.t) - 4, 60);
  const monthPillarId = (MONTH_PILLAR_BASE[(yearPillarId % 10) % 5] + sajuMonth - 1) % 60;
  return { yearPillarId, monthPillarId, sajuMonth };
}

/** 그 날짜(JD)의 한국 시각(고정 UTC+9) 0시의 UTC 분 */
export function kstDayStartMinute(jd: number): number {
  return (jd - EPOCH_JD) * 1440 - KST_OFFSET_MINUTES;
}

/** UTC 분 → 한국 시각(고정 UTC+9)의 날짜(JD)와 그날의 분 */
export function kstOfMinute(x: number): { jd: number; minuteOfDay: number } {
  const local = x + KST_OFFSET_MINUTES;
  const day = Math.floor(local / 1440);
  return { jd: EPOCH_JD + day, minuteOfDay: local - day * 1440 };
}

/** 그 날짜(JD, 한국 시각 고정 UTC+9)에 드는 절. 없으면 undefined */
export function jeolOnKstDay(jd: number): Jeol | undefined {
  const start = kstDayStartMinute(jd);
  const jeol = jeolAtOrBefore(start + 1439);
  return jeol && jeol.t >= start ? jeol : undefined;
}

/** 그 해(그레고리력) 절기 시각의 앞뒤를 정할 수 없는 폭(분) */
export function uncertainMinutesOfYear(year: number): number {
  for (const [from, to, min] of TERMS_UNCERTAINTY) if (year >= from && year <= to) return min;
  // 표 밖(1390년 대설, 2051년 소한·대한·입춘)은 가장 가까운 끝 구간의 값
  return year < TERMS_UNCERTAINTY[0][0] ? TERMS_UNCERTAINTY[0][2] : TERMS_UNCERTAINTY[TERMS_UNCERTAINTY.length - 1][2];
}

/** 그 절입의 폭(분) */
export function uncertainMinutesOfTerm(t: number): number {
  return uncertainMinutesOfYear(gregorianYearOfMinute(t));
}
