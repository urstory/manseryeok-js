/**
 * 1.1.0: 한국천문연구원(KASI) 자료로 넓힌 범위(1391~2050)와 새 필드 테스트
 * 정답 값은 KASI 음양력 정보제공 서비스 getLunCalInfo 응답에서 그대로 옮겼다.
 */

import { solarToLunar, lunarToSolar, getGapja } from '../core/solar-lunar-converter';
import { isSupportedYear, getSupportedRange } from '../utils/range';
import { getMonthlyIndex } from '../data/date-index';
import { InvalidDateError, OutOfRangeError } from '../types';

const WEEK = '일월화수목금토';

// [양력, JD, 음력 연, 월, 윤달, 일, 달 날수, 일진, 월건, 세차, 요일] — KASI 응답 그대로
const KASI: Array<[string, number, number, number, boolean, number, number, string, string | null, string, string]> = [
  ['1391-02-05', 2229156, 1391, 1, false, 1, 29, '기축', '경인', '신미', '일'],
  ['1392-08-05', 2229703, 1392, 7, false, 17, 30, '병신', '무신', '임신', '월'],
  ['1500-06-15', 2269099, 1500, 5, false, 19, 29, '임신', '임오', '경신', '월'],
  ['1582-10-04', 2299160, 1582, 9, false, 18, 29, '계유', '경술', '임오', '목'],
  ['1582-10-15', 2299161, 1582, 9, false, 19, 29, '갑술', '경술', '임오', '금'],
  ['1700-03-01', 2342032, 1700, 1, false, 11, 30, '을사', '무인', '경진', '월'],
  ['1800-01-01', 2378497, 1799, 12, false, 7, 30, '경인', '정축', '기미', '수'],
  ['1800-05-24', 2378640, 1800, 4, true, 1, 29, '계축', null, '경신', '토'],
  ['1899-12-31', 2415020, 1899, 11, false, 29, 29, '계유', '병자', '기해', '일'],
  ['2024-03-05', 2460375, 2024, 1, false, 25, 29, '무진', '병인', '갑진', '화'],
  ['2050-12-31', 2470172, 2050, 11, false, 18, 30, '을유', '무자', '경오', '토'],
];

describe('지원 범위 1391~2050', () => {
  test('isSupportedYear / getSupportedRange', () => {
    expect(getSupportedRange()).toEqual({ min: 1391, max: 2050 });
    expect(isSupportedYear(1391)).toBe(true);
    expect(isSupportedYear(1390)).toBe(false);
    expect(isSupportedYear(1899)).toBe(true);
    expect(isSupportedYear(2051)).toBe(false);
  });

  test('자료는 양력 1391-02-05(음력 1391-01-01)부터', () => {
    expect(solarToLunar(1391, 2, 5).lunar).toEqual({ year: 1391, month: 1, day: 1, isLeapMonth: false });
    expect(() => solarToLunar(1391, 2, 4)).toThrow(InvalidDateError);
    expect(() => solarToLunar(1391, 1, 1)).toThrow(InvalidDateError);
    expect(lunarToSolar(1391, 1, 1).solar).toEqual({ year: 1391, month: 2, day: 5 });
  });

  test('2051년은 범위 밖', () => {
    expect(() => solarToLunar(2051, 1, 1)).toThrow(OutOfRangeError);
  });
});

describe('KASI 응답과 일치', () => {
  test.each(KASI)('%s', (date, jd, ly, lm, leap, ld, nday, iljin, wolgeon, secha, week) => {
    const [y, m, d] = date.split('-').map(Number);
    const r = solarToLunar(y, m, d);
    expect(r.julianDay).toBe(jd);
    expect(r.lunar).toEqual({ year: ly, month: lm, day: ld, isLeapMonth: leap });
    expect(r.lunarMonthDays).toBe(nday);
    expect(r.gapja.dayPillar).toBe(iljin);
    expect(r.lunarCalendarGanji.year).toBe(secha);
    expect(r.lunarCalendarGanji.month).toBe(wolgeon);
    expect(WEEK[r.weekday]).toBe(week);

    const back = lunarToSolar(ly, lm, ld, leap);
    expect(back.solar).toEqual({ year: y, month: m, day: d });
    expect(back.julianDay).toBe(jd);
  });
});

describe('1582년 그레고리력 개력', () => {
  test('1582-10-04(율리우스력) 다음 날은 1582-10-15(그레고리력)', () => {
    expect(solarToLunar(1582, 10, 15).julianDay - solarToLunar(1582, 10, 4).julianDay).toBe(1);
  });

  test('1582-10-05 ~ 10-14는 존재하지 않는 날짜', () => {
    for (let d = 5; d <= 14; d++) expect(() => solarToLunar(1582, 10, d)).toThrow(InvalidDateError);
  });

  test('1582년 10월 인덱스는 21일', () => {
    const idx = getMonthlyIndex(1582, 10)!;
    expect(idx.entries.length).toBe(21);
    expect(idx.endJD - idx.startJD).toBe(20);
  });

  test('율리우스력 윤년: 1500-02-29는 있다(그레고리력에는 없음)', () => {
    expect(solarToLunar(1500, 2, 29).julianDay + 1).toBe(solarToLunar(1500, 3, 1).julianDay);
    expect(() => solarToLunar(1700, 2, 29)).toThrow(InvalidDateError);
  });
});

describe('1.0.x 오류 수정: 12월 31일 연주·월주', () => {
  test.each([
    [1908, '무신', '갑자'],
    [1912, '임자', '임자'],
    [1960, '경자', '무자'],
  ])('%i-12-31', (year, yearPillar, monthPillar) => {
    const g = getGapja(year as number, 12, 31);
    expect(g.yearPillar).toBe(yearPillar);
    expect(g.monthPillar).toBe(monthPillar);
    // 앞날과 같은 연주·월주
    const prev = getGapja(year as number, 12, 30);
    expect(g.yearPillar).toBe(prev.yearPillar);
    expect(g.monthPillar).toBe(prev.monthPillar);
  });
});

describe('윤달', () => {
  test('윤달의 월건은 null', () => {
    const r = solarToLunar(1800, 5, 24);
    expect(r.lunar.isLeapMonth).toBe(true);
    expect(r.lunarCalendarGanji.month).toBeNull();
    expect(r.lunarCalendarGanji.monthHanja).toBeNull();
  });

  test('없는 윤달은 InvalidDateError', () => {
    expect(() => lunarToSolar(1800, 5, 1, true)).toThrow(InvalidDateError);
  });
});

describe('음력 연말 → 다음 해 양력 (1.0.9 #9 유지)', () => {
  test('음력 1799-12-07은 양력 1800-01-01 (KASI)', () => {
    expect(lunarToSolar(1799, 12, 7).solar).toEqual({ year: 1800, month: 1, day: 1 });
  });
});

describe('일진·요일은 1391~2050 전체에서 JD와 맞물린다', () => {
  test('매달 1일 표본', () => {
    let prev: { jd: number; dayId: number; weekday: number } | null = null;
    const stems = '갑을병정무기경신임계', branches = '자축인묘진사오미신유술해';
    const id = (p: string) => { for (let i = 0; i < 60; i++) if (stems[i % 10] + branches[i % 12] === p) return i; return -1; };
    for (let y = 1392; y <= 2050; y += 7) for (let m = 1; m <= 12; m++) {
      if (y === 1582 && m === 10) continue;
      const r = solarToLunar(y, m, 1);
      const cur = { jd: r.julianDay, dayId: id(r.gapja.dayPillar), weekday: r.weekday };
      if (prev) {
        const gap = cur.jd - prev.jd;
        expect(cur.dayId).toBe((prev.dayId + gap) % 60);
        expect(cur.weekday).toBe((prev.weekday + gap) % 7);
      }
      prev = cur;
    }
  });
});
