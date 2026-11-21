/**
 * 절입 경계와 시각을 받는 연주·월주 — 1.2.0
 *
 * 연주·월주의 경계는 절입 시각 표(1390년 대설 ~ 2051년 입춘, 분 단위)로 정한다.
 * 절입 분부터가 뒤다. 날짜는 라이브러리 날짜(1582-10-04까지 율리우스력, 1582-10-15부터 그레고리력)다.
 */

import {
  datePillarIds,
  entryOfJd,
  jdFromSolar,
  legacyPillarIds,
  solarFromJd,
} from '../data/date-index';
import { getPillarById } from '../data/sixty-pillars';
import { SOLAR_TERM_NAMES } from '../data/solar-terms';
import { isSupportedYear } from '../utils/range';
import { InvalidDateError, OutOfRangeError } from '../types';
import type {
  BoundaryOptions,
  BoundaryRule,
  ClockNotice,
  DateTimeParts,
  GapjaResult,
  SajuBoundary,
  SajuPillarPair,
  TimeOptions,
} from '../types';
import { formatGapjaByIds } from './gapja-calculator';
import { checkClock, checkFold, legalOffsetAt, readWallClock } from './clock';
import {
  EPOCH_JD,
  gregorianYearOfMinute,
  jeolAt,
  jeolAtOrBefore,
  jeolOnKstDay,
  kstDayStartMinute,
  kstOfMinute,
  nameIndexOfK,
  pillarIdsAtMinute,
  uncertainMinutesOfTerm,
  type Jeol,
} from './terms';
import { termWithDateOf, type SolarTermWithDate } from './solar-term';

const mod = (n: number, m: number): number => ((n % m) + m) % m;
const DAY_PILLAR_EPOCH = 2415011;

// ─────────────────────────────────────────────
// 입력 검사
// ─────────────────────────────────────────────

/** 양력 날짜 → JD. solarToLunar와 같은 조건으로 OutOfRangeError·InvalidDateError를 던진다 */
export function requireJd(year: number, month: number, day: number): number {
  if (!isSupportedYear(year)) throw new OutOfRangeError(year);
  const jd = jdFromSolar(year, month, day);
  if (jd === undefined || !entryOfJd(jd)) {
    throw new InvalidDateError(`Invalid solar date: ${year}-${month}-${day}`);
  }
  return jd;
}

function requireTime(hour: number, minute: number): void {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new InvalidDateError(`Invalid time: ${hour}:${minute}`);
  }
}

/** 선택 인자가 객체가 아니면(null 등) 빈 객체로 */
export function normalizeOptions<T extends object>(options: T | null | undefined): Partial<T> {
  return options !== null && typeof options === 'object' ? options : {};
}

export function checkBoundaryRule(rule: BoundaryRule | undefined): BoundaryRule {
  const r = rule ?? 'noon';
  if (r !== 'noon' && r !== 'day-end' && r !== 'day-start' && r !== 'legacy-fixed') {
    throw new TypeError(`Unknown boundaryRule: ${String(rule)}`);
  }
  return r;
}

// ─────────────────────────────────────────────
// 경계 정보
// ─────────────────────────────────────────────

function pairOf(yearPillarId: number, monthPillarId: number): SajuPillarPair {
  const y = getPillarById(yearPillarId);
  const m = getPillarById(monthPillarId);
  return {
    yearPillar: y.combined.hangul,
    yearPillarHanja: y.combined.hanja,
    monthPillar: m.combined.hangul,
    monthPillarHanja: m.combined.hanja,
  };
}

/** 벽시계 분(1970-01-01 0시부터 센 분을 UTC처럼) → 라이브러리 날짜·시각 */
function partsOfLocalMinute(local: number): DateTimeParts {
  const day = Math.floor(local / 1440);
  const mod1440 = local - day * 1440;
  const s = solarFromJd(EPOCH_JD + day);
  return { year: s.year, month: s.month, day: s.day, hour: Math.floor(mod1440 / 60), minute: Math.floor(mod1440 % 60) };
}

function isoUtcMinute(t: number): string {
  return new Date(t * 60000).toISOString().slice(0, 16) + 'Z';
}

/** 절 하나의 경계 정보(chosen은 부르는 쪽이 정한다) */
export function boundaryOfJeol(jeol: Jeol, chosen: 'before' | 'after'): SajuBoundary {
  const info = SOLAR_TERM_NAMES[nameIndexOfK(jeol.k)];
  const b = pillarIdsAtMinute(jeol.t - 1);
  const a = pillarIdsAtMinute(jeol.t);
  if (!a || !b) throw new RangeError('No solar term data around this boundary');
  const legal = legalOffsetAt(jeol.t * 60);
  return {
    term: { name: info.name, hanja: info.hanja, index: nameIndexOfK(jeol.k) },
    at: partsOfLocalMinute(jeol.t + 540),
    atUtc: isoUtcMinute(jeol.t),
    before: pairOf(b.yearPillarId, b.monthPillarId),
    after: pairOf(a.yearPillarId, a.monthPillarId),
    yearChanges: a.yearPillarId !== b.yearPillarId,
    chosen,
    uncertainMinutes: uncertainMinutesOfTerm(jeol.t),
    atLegalClock:
      legal.offset === 32400
        ? null
        : { ...partsOfLocalMinute(Math.floor((jeol.t * 60 + legal.offset) / 60)), offsetMinutes: legal.offset / 60 },
  };
}

/**
 * legacy-fixed의 값이 경계의 어느 쪽과 같은가.
 * 어느 쪽과도 다르면 'before'로 두지만, 1391~2050년 전수로 확인한 결과 그런 날은 없다(방어용).
 */
function chosenOfIds(jeol: Jeol, ids: { yearPillarId: number; monthPillarId: number }): 'before' | 'after' {
  const a = pillarIdsAtMinute(jeol.t);
  return a && a.yearPillarId === ids.yearPillarId && a.monthPillarId === ids.monthPillarId ? 'after' : 'before';
}

/** 날짜만 주었을 때의 경계 정보(chosen은 boundaryRule대로). 그날 절이 없으면 null */
export function dateBoundary(jd: number, rule: BoundaryRule = 'noon'): SajuBoundary | null {
  const jeol = jeolOnKstDay(jd);
  if (!jeol) return null;
  let chosen: 'before' | 'after';
  if (rule === 'day-end') chosen = 'after';
  else if (rule === 'day-start') chosen = 'before';
  else if (rule === 'legacy-fixed') chosen = chosenOfIds(jeol, datePillarIds(jd, rule));
  else chosen = kstDayStartMinute(jd) + 720 >= jeol.t ? 'after' : 'before';
  return boundaryOfJeol(jeol, chosen);
}

// ─────────────────────────────────────────────
// 시각을 받는 셈
// ─────────────────────────────────────────────

export interface MomentResult {
  jd: number;
  /** 절대 시각(UTC 분, 지방 평균시면 분 아래가 있을 수 있다) */
  x: number;
  /** 읽는 데 쓴 UTC 차이(초) */
  offsetSec: number;
  /**
   * 일주를 정하는 날짜(JD). 입력 날짜와 같다. 다만 'korea-legal'로 읽은 시계가 서머타임이면
   * 벽시계에서 1시간 뺀 표준시의 날짜다(서머타임 0시대는 하루 전).
   */
  dayJd: number;
  yearPillarId: number;
  monthPillarId: number;
  sajuMonth: number;
  sajuBoundary: SajuBoundary | null;
  nearBoundary: boolean;
  clockNotice: ClockNotice | null;
}

/**
 * 날짜(JD)와 벽시계 시·분을 시계 옵션대로 절대 시각으로 바꿔 절입과 견준다.
 * legacy가 참이면 연주·월주는 1.1.0의 고정 날짜 규칙(시각을 보지 않음)으로 낸다.
 */
export function momentPillars(jd: number, hour: number, minute: number, options: TimeOptions = {}, legacy = false): MomentResult {
  const opts = normalizeOptions(options);
  checkClock(opts.clock);
  const fold = checkFold(opts.fold);
  const clock = opts.clock ?? 'kst-fixed';
  const dayStartSec = (jd - EPOCH_JD) * 86400;
  const localSec = dayStartSec + hour * 3600 + minute * 60;
  const reading = readWallClock(localSec, clock, fold);
  const dayJd = clock === 'korea-legal' && reading.dst ? EPOCH_JD + Math.floor((localSec - 3600) / 86400) : jd;
  const x = reading.utcSec / 60;
  const exact = pillarIdsAtMinute(x);
  if (!exact) throw new RangeError('No solar term data for this moment');
  let ids = exact;
  if (legacy) {
    const s = solarFromJd(jd);
    ids = legacyPillarIds(s.year, s.month, s.day);
  }

  // 경계: 입력 날짜(고정 UTC+9 달력), 입력 시계의 달력으로 본 입력 날짜 하루, 그 순간의 한국 시각 날짜에
  // 드는 절 가운데 입력 시각에 가까운 것
  const cands: Jeol[] = [];
  const add = (j: Jeol | undefined) => {
    if (j && !cands.some((c) => c.j === j.j)) cands.push(j);
  };
  add(jeolOnKstDay(jd));
  {
    const lo = (dayStartSec - reading.offsetSec) / 60;
    const hi = (dayStartSec + 86400 - reading.offsetSec) / 60;
    const j3 = jeolAtOrBefore(hi - 1e-6);
    if (j3 && j3.t >= lo) add(j3);
  }
  add(jeolOnKstDay(kstOfMinute(Math.floor(x)).jd));
  cands.sort((p, q) => Math.abs(p.t - x) - Math.abs(q.t - x));
  const jeol = cands[0];
  const sajuBoundary = jeol
    ? boundaryOfJeol(jeol, legacy ? chosenOfIds(jeol, ids) : x >= jeol.t ? 'after' : 'before')
    : null;

  // 가까움: 직전 절과 다음 절
  const prev = jeolAtOrBefore(x);
  const next = prev ? jeolAt(prev.j + 1) : undefined;
  const nearBoundary =
    (!!prev && x - prev.t <= uncertainMinutesOfTerm(prev.t)) ||
    (!!next && next.t - x <= uncertainMinutesOfTerm(next.t));

  return {
    jd,
    x,
    offsetSec: reading.offsetSec,
    dayJd,
    yearPillarId: ids.yearPillarId,
    monthPillarId: ids.monthPillarId,
    sajuMonth: ids.sajuMonth,
    sajuBoundary,
    nearBoundary,
    clockNotice: reading.notice,
  };
}

// ─────────────────────────────────────────────
// 공개 함수
// ─────────────────────────────────────────────

/** getGapjaAt의 결과 */
export type GapjaAtResult = GapjaResult & {
  /**
   * 입력 날짜(고정 UTC+9 달력 또는 입력 시계의 달력)나 그 순간의 한국 시각 날짜에 드는 절 가운데
   * 입력 시각에 가까운 것의 경계. chosen은 시각으로 정한 쪽
   */
  sajuBoundary: SajuBoundary | null;
  /** 입력 시각이 절입에서 uncertainMinutes 안이면 true(값은 그래도 견준 대로 낸다) */
  nearBoundary: boolean;
  /** 시계 알림 */
  clockNotice: ClockNotice | null;
};

/**
 * 시각까지 주고 연주·월주·일주를 구한다(시주 없음) — 1.2.0
 *
 * 연주·월주는 입력 시각을 절대 시각으로 바꿔 절입 시각과 견줘 정한다. 일주는 입력 날짜의 일진이다(다만 korea-legal로 읽은 시계가 서머타임이면 1시간 뺀 표준시의 날짜 — 서머타임 0시대는 하루 전).
 * @param year 양력 년(1391~2050, 1582-10-15 전은 율리우스력 날짜)
 * @param month 양력 월(1~12)
 * @param day 양력 일
 * @param hour 시(0~23)
 * @param minute 분(0~59, 기본 0)
 * @param options 시계(`clock`)·`fold`
 * @throws {OutOfRangeError} 지원 범위 밖 연도
 * @throws {InvalidDateError} 유효하지 않은 날짜·시각
 */
export function getGapjaAt(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
  options: TimeOptions = {}
): GapjaAtResult {
  const jd = requireJd(year, month, day);
  requireTime(hour, minute);
  const r = momentPillars(jd, hour, minute, normalizeOptions(options));
  return {
    ...formatGapjaByIds(r.yearPillarId, r.monthPillarId, mod(r.dayJd - DAY_PILLAR_EPOCH, 60)),
    sajuBoundary: r.sajuBoundary,
    nearBoundary: r.nearBoundary,
    clockNotice: r.clockNotice,
  };
}

/**
 * 그 날짜(한국 시각 고정 UTC+9)에 드는 절(12절)의 경계 정보 — 1.2.0
 * chosen은 날짜만 넣었을 때의 기본값(정오의 값)이 실린 쪽이다.
 * @returns 경계 정보. 그날 절이 없으면 null
 */
export function getSajuBoundary(year: number, month: number, day: number): SajuBoundary | null {
  return dateBoundary(requireJd(year, month, day), 'noon');
}

/**
 * 그 순간의 직전 절과 다음 절(12절) — 1.2.0. 대운 계산 등에 쓴다.
 * prev는 절입 분이 입력 시각 이하인 마지막 절(같은 분이면 prev), next는 그 다음 절이다.
 * 날짜·시각은 한국 시각(고정 UTC+9)으로 적는다.
 */
export function getJeolAround(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
  options: TimeOptions = {}
): { prev: SolarTermWithDate; next: SolarTermWithDate } {
  const jd = requireJd(year, month, day);
  requireTime(hour, minute);
  const r = momentPillars(jd, hour, minute, normalizeOptions(options));
  const prev = jeolAtOrBefore(r.x);
  const next = prev ? jeolAt(prev.j + 1) : undefined;
  if (!prev || !next) throw new RangeError('No solar term data around this moment');
  return { prev: termWithDateOf(prev.t, prev.k), next: termWithDateOf(next.t, next.k) };
}

/**
 * 그 해(1391~2050)의 입춘 — 1.2.0
 * @throws {OutOfRangeError} 지원 범위 밖 연도
 */
export function getIpchun(year: number): SolarTermWithDate {
  if (!Number.isInteger(year) || !isSupportedYear(year)) throw new OutOfRangeError(year);
  // 입춘(2월 초)은 그 해 3월 1일(그레고리력) 앞의 마지막 절이다
  const jeol = jeolAtOrBefore(Date.UTC(year, 2, 1) / 60000);
  if (!jeol || jeol.k !== 21 || gregorianYearOfMinute(jeol.t) !== year) {
    throw new RangeError(`No Ipchun data for year ${year}`);
  }
  return termWithDateOf(jeol.t, jeol.k);
}

/**
 * 연도까지 받아 사주 월(1 = 寅月 … 11 = 子月, 12 = 丑月)을 구한다 — 1.2.0
 * 시를 주면 절입 시각과 견주고, 주지 않으면 boundaryRule(기본 'noon')대로 낸다.
 */
export function getSajuMonthAt(
  year: number,
  month: number,
  day: number,
  hour?: number,
  minute: number = 0,
  options: BoundaryOptions & TimeOptions = {}
): number {
  const jd = requireJd(year, month, day);
  const opts = normalizeOptions(options);
  const rule = checkBoundaryRule(opts.boundaryRule);
  if (hour === undefined || hour === null) return datePillarIds(jd, rule).sajuMonth;
  requireTime(hour, minute);
  return momentPillars(jd, hour, minute, opts, rule === 'legacy-fixed').sajuMonth;
}
