/**
 * 1.2.0 절입 시각 표: 한국천문연구원 발표값과의 일치, 표의 성질, 절기 조회 함수
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { allTerms, kOfIndex } from '../core/terms';
import {
  getSolarTermsByYear,
  getSolarTermForDate,
  getSolarTermsByMonth,
  getSupportedSolarTermYears,
} from '../core/solar-term';
import { getIpchun } from '../core/saju-boundary';
import { SOLAR_TERMS_DATA, SUPPORTED_SOLAR_TERM_YEARS } from '../data/solar-terms-data';
import { OutOfRangeError } from '../types';

const root = join(__dirname, '..', '..');

describe('표의 성질', () => {
  const t = allTerms();

  test('15,845개, 1390년 대설부터 2051년 입춘까지', () => {
    expect(t.length).toBe(15845);
    expect(kOfIndex(0)).toBe(17); // 대설
    expect(kOfIndex(t.length - 1)).toBe(21); // 입춘
    expect(new Date(t[0] * 60000).getUTCFullYear()).toBe(1390);
    expect(new Date(t[t.length - 1] * 60000).getUTCFullYear()).toBe(2051);
  });

  test('이웃 간격 14~16.5일, 단조 증가', () => {
    for (let i = 1; i < t.length; i++) {
      const gap = t[i] - t[i - 1];
      if (gap < 14 * 1440 || gap > 16.5 * 1440) throw new Error(`간격 이상 ${i}: ${gap}`);
    }
  });

  test('원본 data/terms/solar-terms.tsv와 전부 같다', () => {
    const rows = readFileSync(join(root, 'data/terms/solar-terms.tsv'), 'utf8').replace(/\r/g, '').trim().split('\n').slice(1);
    expect(rows.length).toBe(t.length);
    rows.forEach((l, i) => {
      const [, k, utc] = l.split('\t').map(Number);
      if (t[i] !== utc || kOfIndex(i) !== k) throw new Error(`다름 ${i}: ${l}`);
    });
  });

  test('해 기준 조회: 해마다 24개, 1582년은 23개, 1391~1581년은 대한부터 다음 소한까지', () => {
    for (let y = 1391; y <= 2050; y++) {
      const list = getSolarTermsByYear(y);
      expect(list.length).toBe(y === 1582 ? 23 : 24);
      list.forEach((x) => expect(x.year).toBe(y));
      if (y <= 1581) {
        expect(list[0].name).toBe('대한');
        expect(list[23].name).toBe('소한');
      } else if (y >= 1583) {
        expect(list[0].name).toBe('소한');
        expect(list[23].name).toBe('동지');
      }
    }
    const y1582 = getSolarTermsByYear(1582);
    expect(y1582[0].name).toBe('대한');
    expect(y1582[22].name).toBe('동지');
  });
});

describe('한국천문연구원 발표값 1920~2028년 2,616개와 같다', () => {
  test('전수', () => {
    const rows = readFileSync(join(root, 'data/terms/kasi-24div.tsv'), 'utf8').replace(/\r/g, '').trim().split('\n').slice(1);
    expect(rows.length).toBe(2616);
    let n = 0;
    for (const l of rows) {
      const [year, name, locdate, kst] = l.split('\t');
      const ms = Date.UTC(+locdate.slice(0, 4), +locdate.slice(4, 6) - 1, +locdate.slice(6, 8), +kst.slice(0, 2), +kst.slice(2, 4));
      const d = new Date(ms); // 2400은 다음 날 00:00
      const term = getSolarTermsByYear(d.getUTCFullYear()).find((x) => x.name === name && x.month === d.getUTCMonth() + 1);
      if (!term) throw new Error(`없음 ${l}`);
      const got = [term.year, term.month, term.day, term.hour, term.minute];
      const want = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()];
      if (got.join() !== want.join()) throw new Error(`다름 ${l}: ${got}`);
      expect(+year).toBeGreaterThanOrEqual(1920);
      n++;
    }
    expect(n).toBe(2616);
  });

  test('1950년 대한 2400은 1950-01-21 00:00', () => {
    const t = getSolarTermsByYear(1950).find((x) => x.name === '대한')!;
    expect([t.month, t.day, t.hour, t.minute]).toEqual([1, 21, 0, 0]);
  });
});

describe('절기 조회 함수 (1.2.0: 1391~2050, 실제 값)', () => {
  test('2024년 입춘은 2월 4일 17시 27분 (1.1.0은 5시 2분)', () => {
    const t = getSolarTermsByYear(2024).find((x) => x.name === '입춘')!;
    expect(t).toMatchObject({ year: 2024, month: 2, day: 4, hour: 17, minute: 27, index: 0, nameHanja: '立春', sajuMonth: 2 });
  });

  test('지원 해 1391~2050', () => {
    const years = getSupportedSolarTermYears();
    expect(years.length).toBe(660);
    expect(years[0]).toBe(1391);
    expect(years[659]).toBe(2050);
    expect(SUPPORTED_SOLAR_TERM_YEARS.length).toBe(660);
    expect(() => getSolarTermsByYear(1390)).toThrow();
    expect(() => getSolarTermsByYear(2051)).toThrow();
  });

  test('getSolarTermForDate·getSolarTermsByMonth', () => {
    expect(getSolarTermForDate(2024, 3, 5)?.name).toBe('경칩');
    expect(getSolarTermForDate(2024, 3, 12)).toBeNull();
    expect(getSolarTermForDate(1390, 1, 1)).toBeNull();
    expect(getSolarTermsByMonth(2024, 2).map((x) => x.name)).toEqual(['입춘', '우수']);
    expect(getSolarTermsByMonth(2051, 2)).toEqual([]);
  });

  test('SOLAR_TERMS_DATA(deprecated)는 같은 꼴로 표에서 만든다', () => {
    expect(SOLAR_TERMS_DATA[2024][2]).toEqual({ name: '입춘', month: 2, day: 4, hour: 17, minute: 27 });
    expect(SOLAR_TERMS_DATA[1391].length).toBe(24);
    expect(SOLAR_TERMS_DATA[2051]).toBeUndefined();
    expect(2024 in SOLAR_TERMS_DATA).toBe(true);
    expect(Object.keys(SOLAR_TERMS_DATA).length).toBe(660);
    getSolarTermsByYear(2024).forEach((t, i) => {
      expect(SOLAR_TERMS_DATA[2024][i]).toEqual({ name: t.name, month: t.month, day: t.day, hour: t.hour, minute: t.minute });
    });
  });

  test('getIpchun', () => {
    expect(getIpchun(2024)).toMatchObject({ name: '입춘', year: 2024, month: 2, day: 4, hour: 17, minute: 27 });
    expect(getIpchun(1984)).toMatchObject({ month: 2, day: 5, hour: 0, minute: 19 });
    for (let y = 1391; y <= 2050; y++) {
      const t = getIpchun(y);
      expect(t.name).toBe('입춘');
      expect(t.year).toBe(y);
    }
    expect(() => getIpchun(1390)).toThrow(OutOfRangeError);
    expect(() => getIpchun(2051)).toThrow(OutOfRangeError);
  });
});
