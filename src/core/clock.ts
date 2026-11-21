/**
 * 입력 시각 → 절대 시각 (내부 모듈) — 1.2.0
 *
 * 한국 법정 시계의 UTC 차이는 IANA tz database(Asia/Seoul)에서 만든 상수(src/data/tz-seoul.ts)로 본다.
 * 플랫폼의 Intl 자료에 기대지 않는다.
 */

import { TZ_SEOUL_INITIAL_OFFSET, TZ_SEOUL_TRANSITIONS } from '../data/tz-seoul';
import type { ClockNotice, ClockOption } from '../types';

const KST_SEC = 32400;

/** 그 순간(UTC 초)의 한국 법정 시계 UTC 차이(초)와 서머타임 여부 */
export function legalOffsetAt(utcSec: number): { offset: number; dst: boolean } {
  let offset = TZ_SEOUL_INITIAL_OFFSET;
  let dst = false;
  for (const [t, o, d] of TZ_SEOUL_TRANSITIONS) {
    if (utcSec < t) break;
    offset = o;
    dst = d === 1;
  }
  return { offset, dst };
}

/** "UTC+8:30" 꼴 */
export function formatOffset(sec: number): string {
  const sign = sec < 0 ? '-' : '+';
  const a = Math.abs(sec);
  const h = Math.floor(a / 3600);
  const m = Math.floor((a % 3600) / 60);
  const s = a % 60;
  return `UTC${sign}${h}:${String(m).padStart(2, '0')}${s ? ':' + String(s).padStart(2, '0') : ''}`;
}

/** 초 차이 → "30분", "1시간", "1시간 30분", "32분 8초" */
function formatDiff(sec: number): string {
  const a = Math.abs(sec);
  const h = Math.floor(a / 3600);
  const m = Math.floor((a % 3600) / 60);
  const s = a % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}시간`);
  if (m) parts.push(`${m}분`);
  if (s) parts.push(`${s}초`);
  return parts.join(' ');
}

export interface WallReading {
  /** 절대 시각(UTC 초) */
  utcSec: number;
  /** 읽는 데 쓴 UTC 차이(초) */
  offsetSec: number;
  /** 읽는 데 쓴 시계가 서머타임이었는가('korea-legal'에서만 true일 수 있다) */
  dst: boolean;
  /** 알림(없으면 null) */
  notice: ClockNotice | null;
}

/** {utcOffsetMinutes}로 받을 수 있는 범위(분) */
export const UTC_OFFSET_MIN = -720;
export const UTC_OFFSET_MAX = 840;

/** 시계 옵션 검사 */
export function checkClock(clock: ClockOption | undefined): void {
  if (clock === undefined || clock === 'kst-fixed' || clock === 'korea-legal') return;
  if (
    typeof clock === 'object' &&
    clock !== null &&
    Number.isFinite(clock.utcOffsetMinutes) &&
    clock.utcOffsetMinutes >= UTC_OFFSET_MIN &&
    clock.utcOffsetMinutes <= UTC_OFFSET_MAX
  ) return;
  throw new TypeError(`Unknown clock: ${JSON.stringify(clock)} (utcOffsetMinutes must be ${UTC_OFFSET_MIN}~${UTC_OFFSET_MAX})`);
}

/** fold 옵션 검사 */
export function checkFold(fold: unknown): 0 | 1 {
  if (fold === undefined) return 0;
  if (fold === 0 || fold === 1) return fold;
  throw new TypeError(`fold must be 0 or 1, got ${JSON.stringify(fold)}`);
}

/** 1908-04-01 전(서울 지방 평균시)인가 — 첫 전이 전의 구간 */
function isLocalMeanTime(offsetSec: number, utcSec: number): boolean {
  return offsetSec === TZ_SEOUL_INITIAL_OFFSET && utcSec < TZ_SEOUL_TRANSITIONS[0][0];
}

/** 알림에 쓰는 시계 이름 */
function clockLabel(offsetSec: number, dst: boolean, lmt: boolean): string {
  if (lmt) return `지방 평균시 ${formatOffset(offsetSec)}`;
  return `${formatOffset(offsetSec)}${dst ? '(서머타임)' : ''}`;
}

/**
 * 벽시계 시각(그 날짜 0시부터 센 초를 UTC처럼 센 값, localSec)을 시계 옵션대로 절대 시각으로 바꾼다.
 */
export function readWallClock(localSec: number, clock: ClockOption = 'kst-fixed', fold: 0 | 1 = 0): WallReading {
  checkClock(clock);
  checkFold(fold);
  if (clock === 'kst-fixed') {
    const utcSec = localSec - KST_SEC;
    const legal = legalOffsetAt(utcSec);
    let notice: ClockNotice | null = null;
    if (legal.offset !== KST_SEC) {
      const diff = legal.offset - KST_SEC;
      const lmt = isLocalMeanTime(legal.offset, utcSec);
      const head = lmt
        ? `이때 서울의 시계(지방 평균시, ${formatOffset(legal.offset)})는 `
        : `이때 한국의 법정 시계(${formatOffset(legal.offset)}${legal.dst ? ', 서머타임' : ''})는 `;
      notice = {
        legalOffsetMinutes: legal.offset / 60,
        dst: legal.dst,
        message:
          head +
          `고정 UTC+9보다 ${formatDiff(diff)} ${diff < 0 ? '늦었습니다' : '빨랐습니다'}. ` +
          `태어난 시각을 그때의 시계로 적었다면 clock: 'korea-legal'로 다시 셈하면 결과가 달라질 수 있습니다.`,
      };
    }
    return { utcSec, offsetSec: KST_SEC, dst: false, notice };
  }
  if (clock !== 'korea-legal') {
    const offsetSec = Math.round(clock.utcOffsetMinutes * 60);
    return { utcSec: localSec - offsetSec, offsetSec, dst: false, notice: null };
  }

  // 법정 시계: 구간마다 [시작, 끝)에 드는 읽기를 모은다
  const starts = [-Infinity, ...TZ_SEOUL_TRANSITIONS.map((x) => x[0])];
  const offsets = [TZ_SEOUL_INITIAL_OFFSET, ...TZ_SEOUL_TRANSITIONS.map((x) => x[1])];
  const dsts = [false, ...TZ_SEOUL_TRANSITIONS.map((x) => x[2] === 1)];
  const label = (i: number) => clockLabel(offsets[i], dsts[i], i === 0);
  const hits: number[] = [];
  for (let i = 0; i < starts.length; i++) {
    const u = localSec - offsets[i];
    const end = i + 1 < starts.length ? starts[i + 1] : Infinity;
    if (u >= starts[i] && u < end) hits.push(i);
  }
  if (hits.length === 1) {
    const i = hits[0];
    return { utcSec: localSec - offsets[i], offsetSec: offsets[i], dst: dsts[i], notice: null };
  }
  if (hits.length >= 2) {
    // 두 번 지나간 시각: 앞의 것(이른 순간) = 먼저 나온 구간
    const i = fold === 1 ? hits[hits.length - 1] : hits[0];
    return {
      utcSec: localSec - offsets[i],
      offsetSec: offsets[i],
      dst: dsts[i],
      notice: {
        legalOffsetMinutes: offsets[i] / 60,
        dst: dsts[i],
        message:
          `이 시각은 한국 법정 시계가 바뀌며 두 번 지나간 시각입니다(${label(hits[0])} → ${label(hits[hits.length - 1])}). ` +
          `fold: ${fold}(${fold === 1 ? '뒤의 것' : '앞의 것'})로 읽어 ${label(i)}로 셈했습니다.`,
      },
    };
  }
  // 건너뛴 시각: 전이 직전의 차이로 읽는다
  // 전이 i가 앞으로 당긴 구간 [starts[i] + offsets[i-1], starts[i] + offsets[i])에 든다
  let prev = 0;
  for (let i = 1; i < starts.length; i++) {
    if (localSec - offsets[i - 1] >= starts[i] && localSec - offsets[i] < starts[i]) {
      prev = i - 1;
      break;
    }
  }
  const what = prev === 0 ? '서울의 시계가 지방 평균시에서 표준시로 바뀌며' : '한국 법정 시계가 바뀌며';
  return {
    utcSec: localSec - offsets[prev],
    offsetSec: offsets[prev],
    dst: dsts[prev],
    notice: {
      legalOffsetMinutes: offsets[prev] / 60,
      dst: dsts[prev],
      message:
        `이 시각은 ${what} 건너뛴 시각이라 실제로는 없었습니다. ` +
        `바뀌기 직전의 시계(${label(prev)})로 읽어 셈했습니다.`,
    },
  };
}
