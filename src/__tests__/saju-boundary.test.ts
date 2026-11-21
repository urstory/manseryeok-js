/**
 * 1.2.0 절입 경계: sajuBoundary, boundaryRule, 시각을 받는 함수, clock, lunar-javascript 독립 대조
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { solarToLunar, lunarToSolar, getGapja } from '../core/solar-lunar-converter';
import { calculateSaju } from '../core/saju';
import {
  getGapjaAt,
  getSajuBoundary,
  getJeolAround,
  getSajuMonthAt,
} from '../core/saju-boundary';
import { getSolarTermsByYear, getSajuMonth, isBeforeLichun } from '../core/solar-term';
import { legalOffsetAt, readWallClock } from '../core/clock';
import { TZ_SEOUL_INITIAL_OFFSET, TZ_SEOUL_TRANSITIONS } from '../data/tz-seoul';
import { InvalidDateError, OutOfRangeError } from '../types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OLD = require('manseryeok-v110');

/** 한국 시각(고정 UTC+9) 날짜·시각에 분을 더한다(1900년 뒤 그레고리력만) */
function addMinutes(p: { year: number; month: number; day: number; hour: number; minute: number }, d: number) {
  const x = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) + d * 60000);
  return [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate(), x.getUTCHours(), x.getUTCMinutes()] as const;
}

describe('보기: 2024-02-04 입춘(17:27)', () => {
  test('날짜만 넣으면 아직 계묘년 을축월, sajuBoundary로 17:27부터 갑진년 병인월', () => {
    const r = solarToLunar(2024, 2, 4);
    expect(r.gapja.yearPillar).toBe('계묘');
    expect(r.gapja.monthPillar).toBe('을축');
    expect(r.sajuBoundary).toEqual({
      term: { name: '입춘', hanja: '立春', index: 0 },
      at: { year: 2024, month: 2, day: 4, hour: 17, minute: 27 },
      atUtc: '2024-02-04T08:27Z',
      before: { yearPillar: '계묘', yearPillarHanja: '癸卯', monthPillar: '을축', monthPillarHanja: '乙丑' },
      after: { yearPillar: '갑진', yearPillarHanja: '甲辰', monthPillar: '병인', monthPillarHanja: '丙寅' },
      yearChanges: true,
      chosen: 'before',
      uncertainMinutes: 1,
      atLegalClock: null,
    });
    expect(solarToLunar(2024, 2, 5).sajuBoundary).toBeNull();
    expect(lunarToSolar(2023, 12, 25).sajuBoundary).toEqual(r.sajuBoundary);
    expect(getSajuBoundary(2024, 2, 4)).toEqual(r.sajuBoundary);
  });

  test('시각을 주면 견준다', () => {
    expect(getGapjaAt(2024, 2, 4, 17, 26).yearPillar).toBe('계묘');
    const at = getGapjaAt(2024, 2, 4, 17, 27);
    expect([at.yearPillar, at.monthPillar]).toEqual(['갑진', '병인']);
    expect(at.sajuBoundary?.chosen).toBe('after');
    expect(at.nearBoundary).toBe(true);
    expect(getGapjaAt(2024, 2, 4, 17, 25).nearBoundary).toBe(false);
    const s = calculateSaju(2024, 2, 4, 18, 0);
    expect([s.yearPillar, s.monthPillar, s.dayPillar]).toEqual(['갑진', '병인', '무술']);
    expect(s.sajuBoundary?.chosen).toBe('after');
    expect(s.nearBoundary).toBe(false);
    expect(s.clockNotice).toBeNull();
    const s2 = calculateSaju(2024, 2, 4);
    expect([s2.yearPillar, s2.monthPillar, s2.hourPillar]).toEqual(['계묘', '을축', null]);
    expect(s2.sajuBoundary?.chosen).toBe('before');
    expect(s2.nearBoundary).toBe(false);
    expect(s2.clockNotice).toBeNull();
  });

  test('2024-03-05 경칩(11:23): 오후 생은 정묘월 (1.1.0은 병인월)', () => {
    expect(getGapja(2024, 3, 5).monthPillar).toBe('정묘');
    expect(OLD.getGapja(2024, 3, 5).monthPillar).toBe('병인');
    expect(getGapjaAt(2024, 3, 5, 11, 22).monthPillar).toBe('병인');
    expect(getGapjaAt(2024, 3, 5, 15, 0).monthPillar).toBe('정묘');
  });
});

describe('boundaryRule 넷', () => {
  const cases: Array<[number, number, number, Record<string, [string, string]>]> = [
    // 입춘 17:27(오후) — noon은 앞 달
    [2024, 2, 4, { noon: ['계묘', '을축'], 'day-end': ['갑진', '병인'], 'day-start': ['계묘', '을축'], 'legacy-fixed': ['갑진', '병인'] }],
    // 경칩 11:23(오전) — noon은 새 달
    [2024, 3, 5, { noon: ['갑진', '정묘'], 'day-end': ['갑진', '정묘'], 'day-start': ['갑진', '병인'], 'legacy-fixed': ['갑진', '병인'] }],
    // 절입이 없는 날 — 셋은 같고, legacy는 고정일 규칙
    [2024, 2, 5, { noon: ['갑진', '병인'], 'day-end': ['갑진', '병인'], 'day-start': ['갑진', '병인'], 'legacy-fixed': ['갑진', '병인'] }],
  ];
  test.each(cases)('%i-%i-%i', (y, m, d, want) => {
    for (const [rule, [yp, mp]] of Object.entries(want)) {
      const r = solarToLunar(y, m, d, { boundaryRule: rule as never });
      expect([rule, r.gapja.yearPillar, r.gapja.monthPillar]).toEqual([rule, yp, mp]);
      const s = calculateSaju(y, m, d, undefined, 0, { boundaryRule: rule as never });
      expect([s.yearPillar, s.monthPillar]).toEqual([yp, mp]);
      if (r.sajuBoundary) {
        const side = r.sajuBoundary.chosen === 'after' ? r.sajuBoundary.after : r.sajuBoundary.before;
        expect([side.yearPillar, side.monthPillar]).toEqual([yp, mp]);
      }
    }
    expect(getSajuMonthAt(y, m, d)).toBe(getSajuMonthAt(y, m, d, undefined, 0, { boundaryRule: 'noon' }));
  });

  test('legacy-fixed는 시를 주어도 1.1.0과 같다', () => {
    const o = OLD.calculateSaju(2024, 2, 4, 9, 30);
    const n = calculateSaju(2024, 2, 4, 9, 30, { boundaryRule: 'legacy-fixed' });
    expect([n.yearPillar, n.monthPillar, n.dayPillar, n.hourPillar]).toEqual([o.yearPillar, o.monthPillar, o.dayPillar, o.hourPillar]);
  });

  test('모르는 규칙은 TypeError', () => {
    expect(() => solarToLunar(2024, 2, 4, { boundaryRule: 'x' as never })).toThrow(TypeError);
  });
});

describe('정오 직후 절입 사흘 (표의 분이 12:00)', () => {
  const cases: Array<[number, number, number, string, string, string, number]> = [
    [1587, 3, 6, '丁亥', '癸卯', '壬寅', 3],
    [1660, 4, 4, '庚子', '庚辰', '己卯', 1],
    [1809, 9, 8, '己巳', '癸酉', '壬申', 1],
  ];
  test.each(cases)('%i-%i-%i', (y, m, d, yp, mp, before, unc) => {
    const r = solarToLunar(y, m, d);
    expect([r.gapja.yearPillarHanja, r.gapja.monthPillarHanja]).toEqual([yp, mp]);
    const at = getGapjaAt(y, m, d, 12, 0);
    expect([at.yearPillarHanja, at.monthPillarHanja]).toEqual([yp, mp]);
    expect(r.sajuBoundary?.at).toMatchObject({ hour: 12, minute: 0 });
    expect(r.sajuBoundary?.chosen).toBe('after');
    expect(r.sajuBoundary?.before.monthPillarHanja).toBe(before);
    expect(r.sajuBoundary?.uncertainMinutes).toBe(unc);
    expect(getGapjaAt(y, m, d, 11, 59).monthPillarHanja).toBe(before);
    expect(at.nearBoundary).toBe(true);
  });
});

describe('절입 앞뒤 1분 격자 (1900~2050년 12절)', () => {
  test('전수', () => {
    let n = 0;
    for (let y = 1900; y <= 2050; y++) {
      for (const t of getSolarTermsByYear(y)) {
        if (t.type !== 'jeolgi') continue;
        const b = getSajuBoundary(t.year, t.month, t.day)!;
        expect(b).not.toBeNull();
        expect(b.term.name).toBe(t.name);
        expect(b.at).toEqual({ year: t.year, month: t.month, day: t.day, hour: t.hour, minute: t.minute });
        const u = b.uncertainMinutes;
        expect(u).toBe(y >= 2043 ? 2 : 1);
        const at = getGapjaAt(t.year, t.month, t.day, t.hour, t.minute);
        const [py, pm, pd, ph, pmi] = addMinutes(t, -1);
        const before = getGapjaAt(py, pm, pd, ph, pmi);
        if (at.yearPillar !== b.after.yearPillar || at.monthPillar !== b.after.monthPillar) throw new Error(`뒤 다름 ${JSON.stringify(t)}`);
        if (before.yearPillar !== b.before.yearPillar || before.monthPillar !== b.before.monthPillar) throw new Error(`앞 다름 ${JSON.stringify(t)}`);
        expect(b.yearChanges).toBe(t.name === '입춘');
        // 가까움: 절입 분에서 u분 안이면 true, u+1분이면 false
        for (const [dm, want] of [[-u, true], [u, true], [-(u + 1), false], [u + 1, false]] as const) {
          const p = addMinutes(t, dm);
          if (getGapjaAt(...p).nearBoundary !== want) throw new Error(`nearBoundary ${dm} ${JSON.stringify(t)}`);
        }
        // 직전 절·다음 절
        const around = getJeolAround(t.year, t.month, t.day, t.hour, t.minute);
        expect(around.prev.name).toBe(t.name);
        expect(getJeolAround(py, pm, pd, ph, pmi).next.name).toBe(t.name);
        n++;
      }
    }
    expect(n).toBe(151 * 12);
  });
});

describe('lunar-javascript(MIT) 독립 대조 — 1900~2050 12절 ±1분, UTC+8', () => {
  test('3,624줄 모두 같다', () => {
    const rows = readFileSync(join(__dirname, 'fixtures', 'lunar-javascript-grid.tsv'), 'utf8')
      .replace(/\r/g, '').trim().split('\n').filter((l) => !l.startsWith('#')).slice(1);
    expect(rows.length).toBe(3624);
    for (const l of rows) {
      const [y, m, d, h, mi, yp, mp] = l.split('\t');
      const g = getGapjaAt(+y, +m, +d, +h, +mi, { clock: { utcOffsetMinutes: 480 } });
      if (g.yearPillarHanja !== yp || g.monthPillarHanja !== mp) throw new Error(`다름 ${l}: ${g.yearPillarHanja} ${g.monthPillarHanja}`);
    }
  });
});

describe('clock', () => {
  test('법정 시계 전이 28개: 앞뒤 차이와 읽기', () => {
    expect(TZ_SEOUL_TRANSITIONS.length).toBe(28);
    let prev = TZ_SEOUL_INITIAL_OFFSET;
    for (const [t, o, dst] of TZ_SEOUL_TRANSITIONS) {
      expect(legalOffsetAt(t - 1).offset).toBe(prev);
      expect(legalOffsetAt(t)).toEqual({ offset: o, dst: dst === 1 });
      // 전이 1분 전(앞 시계)·1분 뒤(뒤 시계)의 벽시계 읽기
      expect(readWallClock(t - 60 + prev, 'korea-legal', 0).utcSec).toBe(t - 60);
      expect(readWallClock(t + 60 + o, 'korea-legal', 1).utcSec).toBe(t + 60);
      if (o > prev) {
        // 앞으로 당김: 건너뛴 시각은 전이 직전의 차이로 읽는다
        const r = readWallClock(t + prev + 60, 'korea-legal', 0);
        expect(r.utcSec).toBe(t + 60);
        expect(r.offsetSec).toBe(prev);
        expect(r.notice?.message).toContain('건너뛴');
      } else {
        // 뒤로 물림: 두 번 지나간 시각
        const L = t + o + 60;
        const r0 = readWallClock(L, 'korea-legal', 0);
        const r1 = readWallClock(L, 'korea-legal', 1);
        expect(r0.utcSec).toBe(L - prev);
        expect(r1.utcSec).toBe(L - o);
        expect(r0.notice?.message).toContain('두 번');
        expect(r1.notice?.message).toContain('fold: 1');
      }
      prev = o;
    }
  });

  test('kst-fixed(기본)는 법정 시계가 다르면 clockNotice를 단다', () => {
    expect(getGapjaAt(1960, 6, 1, 12, 0).clockNotice).toMatchObject({ legalOffsetMinutes: 570, dst: true });
    expect(getGapjaAt(1958, 1, 1, 12, 0).clockNotice).toMatchObject({ legalOffsetMinutes: 510, dst: false });
    expect(getGapjaAt(1900, 1, 1, 12, 0).clockNotice?.legalOffsetMinutes).toBeCloseTo(507 + 52 / 60, 10);
    expect(getGapjaAt(1987, 7, 1, 12, 0).clockNotice).toMatchObject({ legalOffsetMinutes: 600, dst: true });
    expect(getGapjaAt(2024, 7, 1, 12, 0).clockNotice).toBeNull();
    expect(getGapjaAt(1970, 1, 1, 12, 0).clockNotice).toBeNull();
    // 다른 시계를 고르면 알림이 없다(두 번·건너뛴 시각 빼고)
    expect(getGapjaAt(1960, 6, 1, 12, 0, { clock: 'korea-legal' }).clockNotice).toBeNull();
    expect(getGapjaAt(1960, 6, 1, 12, 0, { clock: { utcOffsetMinutes: 540 } }).clockNotice).toBeNull();
  });

  test('1954년 대설: 고정 UTC+9로는 12/8 00:29, 법정 시계(UTC+8:30)로는 12/7 23:59', () => {
    expect(solarToLunar(1954, 12, 7).sajuBoundary).toBeNull();
    const b = solarToLunar(1954, 12, 8).sajuBoundary!;
    expect(b.term.name).toBe('대설');
    expect(b.at).toEqual({ year: 1954, month: 12, day: 8, hour: 0, minute: 29 });
    expect(b.atLegalClock).toEqual({ year: 1954, month: 12, day: 7, hour: 23, minute: 59, offsetMinutes: 510 });
    // 법정 시계 12/7 23:59 = 고정 UTC+9 12/8 00:29 → 새 달
    const legal = getGapjaAt(1954, 12, 7, 23, 59, { clock: 'korea-legal' });
    expect(legal.monthPillar).toBe('병자');
    expect(legal.sajuBoundary?.chosen).toBe('after');
    expect(legal.nearBoundary).toBe(true);
    const fixed = getGapjaAt(1954, 12, 7, 23, 59);
    expect(fixed.monthPillar).toBe('을해');
    expect(fixed.clockNotice?.legalOffsetMinutes).toBe(510);
  });

  test('{ utcOffsetMinutes } 세 시계가 같은 순간을 같게 본다', () => {
    // 2024 입춘 = 2024-02-04T08:27Z
    expect(getGapjaAt(2024, 2, 4, 16, 27, { clock: { utcOffsetMinutes: 480 } }).monthPillar).toBe('병인');
    expect(getGapjaAt(2024, 2, 4, 16, 26, { clock: { utcOffsetMinutes: 480 } }).monthPillar).toBe('을축');
    expect(getGapjaAt(2024, 2, 4, 17, 27, { clock: 'korea-legal' }).monthPillar).toBe('병인');
    expect(getGapjaAt(2024, 2, 4, 8, 27, { clock: { utcOffsetMinutes: 0 } }).monthPillar).toBe('병인');
    expect(getGapjaAt(2024, 2, 4, 8, 26, { clock: { utcOffsetMinutes: 0 } }).monthPillar).toBe('을축');
  });

  test('1987-10-11 02:30 법정 시계: fold 0은 서머타임(UTC+10), fold 1은 UTC+9', () => {
    const a = calculateSaju(1987, 10, 11, 2, 30, { clock: 'korea-legal' });
    expect(a.clockNotice).toMatchObject({ legalOffsetMinutes: 600, dst: true });
    const b = calculateSaju(1987, 10, 11, 2, 30, { clock: 'korea-legal', fold: 1 });
    expect(b.clockNotice).toMatchObject({ legalOffsetMinutes: 540, dst: false });
  });

  test('korea-legal의 경도 보정은 그 시계의 자오선 기준', () => {
    // 1960-06-01 12:00 서머타임(UTC+9:30) → 자오선 142.5도, 서울 127도 → 62분 빼기 → 10:58 사시
    const s = calculateSaju(1960, 6, 1, 12, 0, { clock: 'korea-legal' });
    expect(s.correctedTime).toEqual({ hour: 10, minute: 58 });
    expect(s.hourPillar?.charAt(1)).toBe('사');
    // kst-fixed는 1.1.0과 같다
    const k = calculateSaju(1960, 6, 1, 12, 0);
    expect(k.correctedTime).toEqual({ hour: 11, minute: 28 });
  });

  test('모르는 시계는 TypeError', () => {
    expect(() => getGapjaAt(2024, 1, 1, 0, 0, { clock: 'x' as never })).toThrow(TypeError);
  });
});

describe('시각을 받는 새 함수', () => {
  test('getSajuMonthAt', () => {
    expect(getSajuMonthAt(2024, 2, 4)).toBe(12);
    expect(getSajuMonthAt(2024, 2, 4, 17, 27)).toBe(1);
    expect(getSajuMonthAt(2024, 2, 4, undefined, 0, { boundaryRule: 'day-end' })).toBe(1);
    expect(getSajuMonthAt(2024, 12, 31)).toBe(11);
    expect(getSajuMonthAt(2025, 1, 5, 12, 0)).toBe(12); // 소한 2025-01-05 11:33
  });

  test('getJeolAround', () => {
    const r = getJeolAround(2024, 3, 5, 12, 0);
    expect(r.prev).toMatchObject({ name: '경칩', month: 3, day: 5, hour: 11, minute: 23 });
    expect(r.next).toMatchObject({ name: '청명', month: 4, day: 4, hour: 16, minute: 2 });
    const end = getJeolAround(2050, 12, 31, 23, 59);
    expect(end.next.name).toBe('소한');
    expect(end.next.year).toBe(2051);
    const start = getJeolAround(1391, 2, 5, 0, 0);
    expect(start.prev.name).toBe('입춘'); // 1391-02-05(율리우스력)는 그레고리력 2월 13일쯤
  });

  test('입력 검사', () => {
    expect(() => getGapjaAt(2051, 1, 1, 0, 0)).toThrow(OutOfRangeError);
    expect(() => getGapjaAt(2024, 2, 30, 0, 0)).toThrow(InvalidDateError);
    expect(() => getGapjaAt(2024, 2, 1, 24, 0)).toThrow(InvalidDateError);
    expect(() => getGapjaAt(2024, 2, 1, 1, 60)).toThrow(InvalidDateError);
    expect(() => getSajuBoundary(1391, 2, 4)).toThrow(InvalidDateError);
  });

  test('율리우스력 구간도 동작한다(1500년)', () => {
    const b = getSajuBoundary(1500, 1, 25) ?? getSajuBoundary(1500, 1, 24) ?? getSajuBoundary(1500, 1, 26);
    expect(b?.term.name).toBe('입춘');
    expect(b?.uncertainMinutes).toBe(3);
    expect(b?.atLegalClock?.offsetMinutes).toBeCloseTo(507 + 52 / 60, 10);
  });
});

describe('1.1.0과 같게 남는 것', () => {
  test('getSajuMonth·isBeforeLichun(deprecated)은 1.1.0 값 그대로', () => {
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= 31; d++) {
      expect(getSajuMonth(m, d)).toBe(OLD.getSajuMonth(m, d));
      expect(isBeforeLichun(m, d)).toBe(OLD.isBeforeLichun(m, d));
    }
  });

  test('절입일이 아닌 날의 calculateSaju(시각 포함)는 1.1.0과 같다', () => {
    for (const [y, m, d] of [[1990, 5, 15], [2000, 1, 1], [1955, 7, 20], [1850, 3, 20], [2030, 11, 30]]) {
      for (let h = 0; h < 24; h++) {
        for (const opt of [{}, { longitude: 129 }, { applyTimeCorrection: false }]) {
          const o = OLD.calculateSaju(y, m, d, h, 15, opt);
          const n = calculateSaju(y, m, d, h, 15, opt);
          expect([n.yearPillar, n.monthPillar, n.dayPillar, n.hourPillar, n.isTimeCorrected, n.correctedTime])
            .toEqual([o.yearPillar, o.monthPillar, o.dayPillar, o.hourPillar, o.isTimeCorrected, o.correctedTime]);
        }
      }
    }
  });
});
