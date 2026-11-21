/**
 * 1.1.0과의 전수 견줌 (1391-02-05 ~ 2050-12-31, 241,017일)
 *
 * 1.1.0 값은 npm에 올린 @fullstackfamily/manseryeok@1.1.0(개발 의존성 manseryeok-v110)을 실제로 돌려 얻는다.
 * - 음력·일주·요일·julianDay·lunarCalendarGanji·음력 달 날수는 모두 같다
 * - boundaryRule: 'legacy-fixed'는 1.1.0의 gapja를 그대로 되살린다
 * - 연주·월주가 달라진 날 = docs/1.2.0-changed-dates*.tsv
 * - 날짜만 넣은 값 = getGapjaAt(…, 12, 0), sajuBoundary의 before·after = 앞날·뒷날의 값
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { solarToLunar, lunarToSolar } from '../core/solar-lunar-converter';
import { getGapjaAt } from '../core/saju-boundary';
import { getMonthlyIndex } from '../data/date-index';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OLD = require('manseryeok-v110');

const root = join(__dirname, '..', '..');
const pad = (n: number) => String(n).padStart(2, '0');

function changedSet(file: string): Set<string> {
  const rows = readFileSync(join(root, file), 'utf8').replace(/\r/g, '').trim().split('\n').slice(1);
  return new Set(rows.map((l) => l.split('\t').slice(0, 5).join('\t')));
}

describe('1.1.0과 전수 견줌', () => {
  test('241,017일', () => {
    const changedMain = changedSet('docs/1.2.0-changed-dates.tsv');
    const changedPre = changedSet('docs/1.2.0-changed-dates-pre1900.tsv');
    const seenMain = new Set<string>();
    const seenPre = new Set<string>();
    const count = {
      julian: { days: 0, month: 0, year: 0 },
      gregPre1900: { days: 0, month: 0, year: 0 },
      modern: { days: 0, month: 0, year: 0 },
    };
    let total = 0;
    let prevNoon: { yearPillar: string; monthPillar: string } | null = null;
    let pendingAfter: { date: string; yearPillar: string; monthPillar: string } | null = null;
    let boundaries = 0;
    const fail = (msg: string) => {
      throw new Error(msg);
    };

    for (let y = 1391; y <= 2050; y++) {
      for (let m = 1; m <= 12; m++) {
        const idx = getMonthlyIndex(y, m);
        if (!idx) continue;
        for (const e of idx.entries) {
          const { year, month, day } = e.solar;
          const date = `${year}-${pad(month)}-${pad(day)}`;
          const n = solarToLunar(year, month, day);
          const o = OLD.solarToLunar(year, month, day);
          total++;

          // 바뀌지 않는 것
          if (
            n.julianDay !== o.julianDay ||
            n.weekday !== o.weekday ||
            n.lunarMonthDays !== o.lunarMonthDays ||
            JSON.stringify(n.lunar) !== JSON.stringify(o.lunar) ||
            JSON.stringify(n.solar) !== JSON.stringify(o.solar) ||
            JSON.stringify(n.lunarCalendarGanji) !== JSON.stringify(o.lunarCalendarGanji) ||
            n.gapja.dayPillar !== o.gapja.dayPillar ||
            n.gapja.dayPillarHanja !== o.gapja.dayPillarHanja
          ) fail(`불변 값이 다름 ${date}`);

          // legacy-fixed = 1.1.0
          const legacy = solarToLunar(year, month, day, { boundaryRule: 'legacy-fixed' });
          if (JSON.stringify(legacy.gapja) !== JSON.stringify(o.gapja)) fail(`legacy-fixed가 1.1.0과 다름 ${date}`);

          // 음력 → 양력도 같다
          const back = lunarToSolar(n.lunar.year, n.lunar.month, n.lunar.day, n.lunar.isLeapMonth);
          if (back.julianDay !== n.julianDay || JSON.stringify(back.gapja) !== JSON.stringify(n.gapja)) fail(`lunarToSolar 다름 ${date}`);

          // 날짜만 = 정오
          const at = getGapjaAt(year, month, day, 12, 0);
          if (at.yearPillar !== n.gapja.yearPillar || at.monthPillar !== n.gapja.monthPillar || at.dayPillar !== n.gapja.dayPillar) {
            fail(`날짜만 ≠ 정오 ${date}`);
          }

          // 절입일이 아닌 날은 앞날과 같다(앞날이 절입일이면 그날의 after와 같다 — 아래에서 확인)
          if (!n.sajuBoundary && !pendingAfter && prevNoon &&
            (prevNoon.yearPillar !== n.gapja.yearPillar || prevNoon.monthPillar !== n.gapja.monthPillar)) {
            fail(`절입일이 아닌데 값이 바뀜 ${date}`);
          }

          // sajuBoundary의 before = 앞날, after = 뒷날
          if (pendingAfter) {
            if (pendingAfter.yearPillar !== n.gapja.yearPillar || pendingAfter.monthPillar !== n.gapja.monthPillar) {
              fail(`after ≠ 뒷날 ${pendingAfter.date}`);
            }
            pendingAfter = null;
          }
          const b = n.sajuBoundary;
          if (b) {
            boundaries++;
            if (prevNoon && (b.before.yearPillar !== prevNoon.yearPillar || b.before.monthPillar !== prevNoon.monthPillar)) {
              fail(`before ≠ 앞날 ${date}`);
            }
            const mine = b.chosen === 'after' ? b.after : b.before;
            if (mine.yearPillar !== n.gapja.yearPillar || mine.monthPillar !== n.gapja.monthPillar) fail(`chosen 이상 ${date}`);
            pendingAfter = { date, yearPillar: b.after.yearPillar, monthPillar: b.after.monthPillar };
          }
          prevNoon = { yearPillar: n.gapja.yearPillar, monthPillar: n.gapja.monthPillar };

          // 달라진 날
          const bucket = year >= 1900 ? count.modern : n.julianDay < 2299161 ? count.julian : count.gregPre1900;
          bucket.days++;
          const dm = o.gapja.monthPillar !== n.gapja.monthPillar;
          const dy = o.gapja.yearPillar !== n.gapja.yearPillar;
          if (dm) bucket.month++;
          if (dy) bucket.year++;
          if (dm || dy) {
            const key = [date, o.gapja.yearPillar, o.gapja.monthPillar, n.gapja.yearPillar, n.gapja.monthPillar].join('\t');
            (year >= 1900 ? seenMain : seenPre).add(key);
          }
        }
      }
    }

    expect(total).toBe(241017);
    expect(count).toEqual({
      julian: { days: 70005, month: 20204, year: 1670 },
      gregPre1900: { days: 115860, month: 1337, year: 124 },
      modern: { days: 55152, month: 884, year: 107 },
    });
    expect([...seenMain].sort()).toEqual([...changedMain].sort());
    expect([...seenPre].sort()).toEqual([...changedPre].sort());
    // 절(12절)은 한 해에 12개
    expect(boundaries).toBeGreaterThan(7900);
  });
});
