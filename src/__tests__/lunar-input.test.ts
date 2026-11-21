/**
 * 1.3.0 음력 입력: calculateSaju·getGapjaAt의 { lunar: true, isLeapMonth }
 * 음력으로 넣은 결과 = lunarToSolar로 구한 양력 날짜를 넣은 결과 + solarDate
 */

import { calculateSaju } from '../core/saju';
import { getGapjaAt } from '../core/saju-boundary';
import { lunarToSolar, solarToLunar } from '../core/solar-lunar-converter';
import { getMonthlyIndex } from '../data/date-index';
import { InvalidDateError, OutOfRangeError } from '../types';

describe('음력 입력', () => {
  test('2024년 음력 1월 1일 = 양력 2024-02-10', () => {
    const r = calculateSaju(2024, 1, 1, 10, 0, { lunar: true });
    expect(r.solarDate).toEqual({ year: 2024, month: 2, day: 10 });
    expect(r).toEqual({ ...calculateSaju(2024, 2, 10, 10, 0), solarDate: { year: 2024, month: 2, day: 10 } });
    // 양력으로 넣으면 solarDate가 없다
    expect('solarDate' in calculateSaju(2024, 2, 10, 10, 0)).toBe(false);
  });

  test('윤달: 2023년 윤2월 1일 = 양력 2023-03-22', () => {
    const r = getGapjaAt(2023, 2, 1, 9, 30, { lunar: true, isLeapMonth: true });
    expect(r.solarDate).toEqual({ year: 2023, month: 3, day: 22 });
    expect(r).toEqual({ ...getGapjaAt(2023, 3, 22, 9, 30), solarDate: { year: 2023, month: 3, day: 22 } });
    // 평달 2월 1일은 다른 날
    expect(getGapjaAt(2023, 2, 1, 9, 30, { lunar: true }).solarDate).toEqual({ year: 2023, month: 2, day: 20 });
  });

  test('1391~2050 표본 날짜(율리우스력 구간·윤달 포함)에서 양력으로 넣은 것과 같다', () => {
    let n = 0;
    let leap = 0;
    const opts = [{}, { clock: 'korea-legal' as const }, { longitude: 129 }, { boundaryRule: 'day-end' as const }];
    for (let y = 1391; y <= 2050; y++) {
      for (let m = 1; m <= 12; m++) {
        const idx = getMonthlyIndex(y, m);
        if (!idx) continue;
        for (const e of idx.entries) {
          const { year, month, day } = e.solar;
          const l = solarToLunar(year, month, day).lunar;
          if ((year * 31 + month * 7 + day) % 97 !== 0 && !(l.isLeapMonth && day % 9 === 0)) continue;
          const o = opts[n % opts.length];
          const h = n % 24;
          const solarDate = { year, month, day };
          const lunarOpts = { ...o, lunar: true, isLeapMonth: l.isLeapMonth };
          expect(lunarToSolar(l.year, l.month, l.day, l.isLeapMonth).solar).toEqual(solarDate);
          expect(calculateSaju(l.year, l.month, l.day, h, 15, lunarOpts)).toEqual({ ...calculateSaju(year, month, day, h, 15, o), solarDate });
          expect(calculateSaju(l.year, l.month, l.day, undefined, 0, lunarOpts)).toEqual({ ...calculateSaju(year, month, day, undefined, 0, o), solarDate });
          const clock = 'clock' in o ? { clock: o.clock } : {};
          expect(getGapjaAt(l.year, l.month, l.day, h, 15, { ...clock, lunar: true, isLeapMonth: l.isLeapMonth })).toEqual({
            ...getGapjaAt(year, month, day, h, 15, clock),
            solarDate,
          });
          n++;
          if (l.isLeapMonth) leap++;
        }
      }
    }
    expect(n).toBeGreaterThan(2500);
    expect(leap).toBeGreaterThan(100);
  });

  test('균시차와 함께', () => {
    // 음력 1990-09-16 = 양력 1990-11-03
    const r = calculateSaju(1990, 9, 16, 13, 20, { lunar: true, equationOfTime: true });
    expect(r.solarDate).toEqual({ year: 1990, month: 11, day: 3 });
    expect(r.correctedTime).toEqual({ hour: 13, minute: 4 });
  });

  test('없는 음력 날짜·범위 밖·옵션 값', () => {
    // 2024년에는 윤달이 없다
    expect(() => calculateSaju(2024, 2, 1, 12, 0, { lunar: true, isLeapMonth: true })).toThrow(InvalidDateError);
    expect(() => getGapjaAt(2024, 2, 1, 12, 0, { lunar: true, isLeapMonth: true })).toThrow(InvalidDateError);
    // 2024년의 작은달(29일) 하나를 찾아 없는 30일을 넣는다
    const small = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((m) => {
      try {
        lunarToSolar(2024, m, 30);
        return false;
      } catch {
        return true;
      }
    }) as number;
    expect(() => calculateSaju(2024, small, 30, 12, 0, { lunar: true })).toThrow(InvalidDateError);
    expect(() => calculateSaju(2051, 1, 1, 12, 0, { lunar: true })).toThrow(OutOfRangeError);
    expect(() => calculateSaju(1390, 12, 1, 12, 0, { lunar: true })).toThrow(OutOfRangeError);
    // 음력 마지막 날 2050-11-18 뒤
    expect(() => calculateSaju(2050, 11, 18, 12, 0, { lunar: true })).not.toThrow();
    expect(() => calculateSaju(2050, 11, 19, 12, 0, { lunar: true })).toThrow(InvalidDateError);
    // isLeapMonth만 주면 실수로 본다
    expect(() => calculateSaju(2023, 2, 1, 12, 0, { isLeapMonth: true })).toThrow(TypeError);
    expect(() => getGapjaAt(2023, 2, 1, 12, 0, { isLeapMonth: true })).toThrow(TypeError);
    expect(() => calculateSaju(2023, 2, 1, 12, 0, { lunar: 'yes' as unknown as boolean })).toThrow(TypeError);
    expect(() => calculateSaju(2023, 2, 1, 12, 0, { lunar: true, isLeapMonth: 1 as unknown as boolean })).toThrow(TypeError);
    // 끄는 값은 양력 그대로
    expect(calculateSaju(2023, 2, 1, 12, 0, { lunar: false, isLeapMonth: false })).toEqual(calculateSaju(2023, 2, 1, 12, 0));
  });
});
