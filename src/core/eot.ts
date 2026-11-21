/**
 * 균시차(equation of time) — 1.3.0
 *
 * 날마다 12:00 UT의 균시차(초로 반올림)를 실은 표(src/data/eot-table.ts)를 처음 쓸 때 한 번 풀고,
 * 날 사이는 선형 보간한다. 라이브러리 안에서 천문 계산은 하지 않는다.
 * 균시차 = 시태양시 − 평균 태양시(해시계가 시계보다 빠르면 +). 범위는 1800-01-01 ~ 2050-12-31.
 */

import { EOT_BODY, EOT_COUNT, EOT_HEAD, EOT_START_JD, EOT_ZERO } from '../data/eot-table';
import type { TimeOptions } from '../types';
import { checkClock, checkFold, readWallClock } from './clock';
import { normalizeOptions, requireJd, requireTime } from './saju-boundary';
import { EPOCH_JD } from './terms';

/** 1970-01-01T00:00Z의 JD */
const UNIX_EPOCH_JD = 2440587.5;

let values: Int16Array | null = null;

function table(): Int16Array {
  if (values) return values;
  const v = new Int16Array(EOT_COUNT);
  v[0] = EOT_HEAD[0];
  v[1] = EOT_HEAD[1];
  for (let i = 2; i < EOT_COUNT; i++) {
    v[i] = 2 * v[i - 1] - v[i - 2] + EOT_BODY.charCodeAt(i - 2) - EOT_ZERO;
  }
  values = v;
  return v;
}

/** 표가 덮는 절대 시각(UTC 분)의 범위 [처음, 끝] */
export const EOT_FIRST_UTC_MINUTE = (EOT_START_JD - UNIX_EPOCH_JD) * 1440;
export const EOT_LAST_UTC_MINUTE = (EOT_START_JD + EOT_COUNT - 1 - UNIX_EPOCH_JD) * 1440;

/** 지원 범위 문구(오류 메시지용) */
export const EOT_RANGE_TEXT = '1800-01-01 ~ 2050-12-31';

/**
 * 그 순간(UTC 분, 1970-01-01T00:00Z부터)의 균시차(초). 표 밖이면 RangeError.
 */
export function equationOfTimeAtUtcMinute(x: number): number {
  if (!Number.isFinite(x) || x < EOT_FIRST_UTC_MINUTE || x > EOT_LAST_UTC_MINUTE) {
    throw new RangeError(`Equation of time is available for ${EOT_RANGE_TEXT} only`);
  }
  const v = table();
  const p = (x - EOT_FIRST_UTC_MINUTE) / 1440;
  const i = Math.min(Math.floor(p), EOT_COUNT - 2);
  const f = p - i;
  return v[i] + (v[i + 1] - v[i]) * f;
}

/**
 * 그 날짜·시각의 균시차(초, 소수 첫째 자리) — 1.3.0
 *
 * 균시차 = 시태양시 − 평균 태양시. 양수면 해시계가 평균 태양시보다 빠르다.
 * 날마다 12:00 UT의 값(초로 반올림)을 선형 보간한다.
 * @param year 양력 년(1800~2050)
 * @param month 양력 월
 * @param day 양력 일
 * @param hour 시(0~23, 기본 12)
 * @param minute 분(0~59, 기본 0)
 * @param options 시계(`clock`, 기본 'kst-fixed')·`fold`
 * @throws {RangeError} 1800년 전
 * @throws {OutOfRangeError} 2050년 뒤 등 라이브러리 범위 밖
 * @throws {InvalidDateError} 유효하지 않은 날짜·시각
 */
export function getEquationOfTime(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0,
  options: TimeOptions = {}
): number {
  const jd = requireJd(year, month, day);
  requireTime(hour, minute);
  if (year < 1800) throw new RangeError(`Equation of time is available for ${EOT_RANGE_TEXT} only`);
  const opts = normalizeOptions(options);
  checkClock(opts.clock);
  const fold = checkFold(opts.fold);
  const localSec = (jd - EPOCH_JD) * 86400 + hour * 3600 + minute * 60;
  const reading = readWallClock(localSec, opts.clock ?? 'kst-fixed', fold);
  return Math.round(equationOfTimeAtUtcMinute(reading.utcSec / 60) * 10) / 10;
}
