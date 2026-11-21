/**
 * 1.2.0과의 격자 견줌 (1900-01-01 ~ 2050-12-31, 날마다)
 *
 * 1.2.0 값은 npm에 올린 @fullstackfamily/manseryeok@1.2.0(개발 의존성 manseryeok-v120)을 실제로 돌려 얻는다.
 * 1.3.0의 새 옵션(equationOfTime·lunar·isLeapMonth)을 주지 않으면(또는 끄는 값을 주면) 결과가
 * JSON 문자열(속성 차례까지)로 같아야 한다.
 */

import { calculateSaju } from '../core/saju';
import { getGapjaAt } from '../core/saju-boundary';
import { solarToLunar, lunarToSolar } from '../core/solar-lunar-converter';
import { getMonthlyIndex } from '../data/date-index';
import type { SajuOptions } from '../core/saju';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OLD = require('manseryeok-v120');

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** 날마다 돌려 가며 쓰는 옵션 */
const SAJU_OPTIONS: Array<SajuOptions | undefined> = [
  undefined,
  {},
  { longitude: 126.98 },
  { longitude: 129.3, boundaryRule: 'day-end' },
  { clock: 'korea-legal' },
  { clock: 'korea-legal', fold: 1, longitude: 126.5 },
  { clock: { utcOffsetMinutes: 480 } },
  { clock: { utcOffsetMinutes: 480 }, longitude: 116.4 },
  { applyTimeCorrection: false },
  { boundaryRule: 'legacy-fixed' },
  { longitude: 140 },
];
/** 1.3.0 옵션을 끄는 값으로 준 것 — 주지 않은 것과 같아야 한다 */
const OFF: SajuOptions[] = [{ equationOfTime: false }, { lunar: false }, { lunar: false, isLeapMonth: false, equationOfTime: false }];
const OFF_AT: Array<Record<string, unknown>> = [{ lunar: false }, { lunar: false, isLeapMonth: false }, {}];

function eachDay(fn: (y: number, m: number, d: number, i: number) => void): number {
  let i = 0;
  for (let y = 1900; y <= 2050; y++) {
    for (let m = 1; m <= 12; m++) {
      const idx = getMonthlyIndex(y, m);
      if (!idx) continue;
      for (const e of idx.entries) fn(e.solar.year, e.solar.month, e.solar.day, i++);
    }
  }
  return i;
}

describe('1.2.0과 격자 견줌 (1900~2050)', () => {
  test('calculateSaju: 시 없음·시 있음, 옵션 11가지를 돌려 가며', () => {
    let diff = 0;
    const firstDiff: string[] = [];
    const n = eachDay((y, m, d, i) => {
      const h = (i * 5) % 24;
      const min = (i * 7) % 60;
      const opts = SAJU_OPTIONS[i % SAJU_OPTIONS.length];
      const off = OFF[i % OFF.length];
      const pairs: Array<[unknown, unknown]> = [
        [calculateSaju(y, m, d), OLD.calculateSaju(y, m, d)],
        [calculateSaju(y, m, d, h, min, opts), OLD.calculateSaju(y, m, d, h, min, opts)],
        [calculateSaju(y, m, d, h, min, { ...(opts ?? {}), ...off }), OLD.calculateSaju(y, m, d, h, min, opts)],
      ];
      for (const [a, b] of pairs) {
        if (!same(a, b)) {
          diff++;
          if (firstDiff.length < 5) firstDiff.push(`${y}-${m}-${d} ${h}:${min} ${JSON.stringify(opts)}`);
        }
      }
    });
    expect(n).toBe(55152);
    expect(firstDiff).toEqual([]);
    expect(diff).toBe(0);
  });

  test('getGapjaAt·solarToLunar·lunarToSolar', () => {
    const fails: string[] = [];
    eachDay((y, m, d, i) => {
      const h = (i * 11) % 24;
      const min = (i * 13) % 60;
      const clock = i % 3 === 0 ? undefined : i % 3 === 1 ? { clock: 'korea-legal' as const } : { clock: { utcOffsetMinutes: 600 } };
      const off = OFF_AT[i % OFF_AT.length];
      if (!same(getGapjaAt(y, m, d, h, min, clock), OLD.getGapjaAt(y, m, d, h, min, clock))) fails.push(`getGapjaAt ${y}-${m}-${d}`);
      if (!same(getGapjaAt(y, m, d, h, min, { ...(clock ?? {}), ...off }), OLD.getGapjaAt(y, m, d, h, min, clock))) fails.push(`getGapjaAt off ${y}-${m}-${d}`);
      if (i % 7 === 0) {
        const s = solarToLunar(y, m, d);
        if (!same(s, OLD.solarToLunar(y, m, d))) fails.push(`solarToLunar ${y}-${m}-${d}`);
        const l = s.lunar;
        if (!same(lunarToSolar(l.year, l.month, l.day, l.isLeapMonth), OLD.lunarToSolar(l.year, l.month, l.day, l.isLeapMonth))) {
          fails.push(`lunarToSolar ${l.year}-${l.month}-${l.day}`);
        }
      }
    });
    expect(fails.slice(0, 5)).toEqual([]);
  });
});
