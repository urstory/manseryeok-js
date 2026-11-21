/**
 * 1.3.0 균시차: 표 되살림, JPL Horizons 표본 대조, getEquationOfTime, calculateSaju의 equationOfTime 옵션
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { equationOfTimeAtUtcMinute, getEquationOfTime } from '../core/eot';
import { calculateSaju } from '../core/saju';
import { InvalidDateError, OutOfRangeError } from '../types';

const root = join(__dirname, '..', '..');
const UNIX_EPOCH_JD = 2440587.5;
const minuteOfJd = (jd: number) => (jd - UNIX_EPOCH_JD) * 1440;
const readTsv = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r/g, '').trim().split('\n').slice(1);

describe('균시차 표', () => {
  test('모든 마디가 정수 초이고 원본(data/eot)에서 0.75초 안', () => {
    let n = 0;
    let max = 0;
    for (const f of readdirSync(join(root, 'data/eot')).filter((f) => /^eot-\d+xx\.tsv$/.test(f))) {
      for (const l of readTsv(`data/eot/${f}`)) {
        const [jd, v] = l.split('\t').map(Number);
        const t = equationOfTimeAtUtcMinute(minuteOfJd(jd));
        if (!Number.isInteger(t)) throw new Error(`정수가 아님: ${l}`);
        max = Math.max(max, Math.abs(t - v));
        n++;
      }
    }
    expect(n).toBe(91680);
    expect(max).toBeLessThanOrEqual(0.75 + 1e-9);
  });

  test('날 사이는 선형 보간', () => {
    const jd = 2460000;
    const a = equationOfTimeAtUtcMinute(minuteOfJd(jd));
    const b = equationOfTimeAtUtcMinute(minuteOfJd(jd + 1));
    expect(equationOfTimeAtUtcMinute(minuteOfJd(jd + 0.25))).toBeCloseTo(a + (b - a) * 0.25, 10);
  });

  test('JPL Horizons(DE441) 표본과 5초 안 (data/eot/horizons-sample.tsv)', () => {
    let n = 0;
    let max = 0;
    for (const l of readTsv('data/eot/horizons-sample.tsv')) {
      const [jd, kind, , eot] = l.split('\t');
      if (kind === 'formula') continue;
      max = Math.max(max, Math.abs(equationOfTimeAtUtcMinute(minuteOfJd(+jd)) - +eot));
      n++;
    }
    expect(n).toBe(370);
    expect(max).toBeLessThan(5);
    expect(max).toBeLessThan(1.5); // 지금 표의 실제 최대 1.36초
  });
});

describe('getEquationOfTime', () => {
  test('잘 알려진 값: 11월 초 약 +16분 26초, 2월 중순 약 −14분 13초', () => {
    // 2024-11-03 12:00 KST
    expect(getEquationOfTime(2024, 11, 3)).toBeGreaterThan(16 * 60 + 20);
    expect(getEquationOfTime(2024, 11, 3)).toBeLessThan(16 * 60 + 30);
    expect(getEquationOfTime(2024, 2, 11)).toBeLessThan(-(14 * 60 + 5));
    expect(getEquationOfTime(2024, 2, 11)).toBeGreaterThan(-(14 * 60 + 20));
  });

  test('기본 시각은 12:00, 시계 옵션을 따른다', () => {
    expect(getEquationOfTime(2000, 1, 1)).toBe(getEquationOfTime(2000, 1, 1, 12, 0));
    // UTC+0 시계의 12:00 = KST 21:00
    expect(getEquationOfTime(2000, 1, 1, 12, 0, { clock: { utcOffsetMinutes: 0 } })).toBe(getEquationOfTime(2000, 1, 1, 21, 0));
    // 2000-01-01 12:00 UT, Horizons 약 −196.8초
    expect(Math.abs(getEquationOfTime(2000, 1, 1, 21, 0) + 196.8)).toBeLessThan(1);
  });

  test('범위: 1800-01-01 ~ 2050-12-31, 시계 끝까지', () => {
    expect(() => getEquationOfTime(1800, 1, 1, 0, 0, { clock: { utcOffsetMinutes: 840 } })).not.toThrow();
    expect(() => getEquationOfTime(2050, 12, 31, 23, 59, { clock: { utcOffsetMinutes: -720 } })).not.toThrow();
    expect(() => getEquationOfTime(1799, 12, 31)).toThrow(RangeError);
    expect(() => getEquationOfTime(1600, 1, 1)).toThrow(RangeError);
    expect(() => getEquationOfTime(2051, 1, 1)).toThrow(OutOfRangeError);
    expect(() => getEquationOfTime(2024, 2, 30)).toThrow(InvalidDateError);
    expect(() => getEquationOfTime(2024, 2, 1, 24, 0)).toThrow(InvalidDateError);
  });
});

describe('calculateSaju equationOfTime', () => {
  test('11월 초 13:20 서울: 경도만이면 12:48(오시), 균시차를 더하면 13:04(미시)', () => {
    const plain = calculateSaju(1990, 11, 3, 13, 20, { longitude: 127 });
    expect(plain.correctedTime).toEqual({ hour: 12, minute: 48 });
    expect(plain.hourPillar?.charAt(1)).toBe('오');
    expect(plain.equationOfTimeSeconds).toBeUndefined();

    const eot = calculateSaju(1990, 11, 3, 13, 20, { longitude: 127, equationOfTime: true });
    expect(eot.equationOfTimeSeconds).toBeGreaterThan(16 * 60);
    expect(eot.correctedTime).toEqual({ hour: 13, minute: 4 });
    expect(eot.hourPillar?.charAt(1)).toBe('미');
    expect(eot.isTimeCorrected).toBe(true);
    // 연주·월주·일주는 그대로
    expect([eot.yearPillar, eot.monthPillar, eot.dayPillar]).toEqual([plain.yearPillar, plain.monthPillar, plain.dayPillar]);
  });

  test('2월 중순은 반대로 늦어진다', () => {
    const r = calculateSaju(2024, 2, 11, 12, 0, { equationOfTime: true }); // 경도 기본 127
    // 12:00 − 32분 − 14.2분 → 11:14
    expect(r.correctedTime).toEqual({ hour: 11, minute: 14 });
    expect(r.equationOfTimeSeconds).toBeLessThan(-14 * 60);
  });

  test('자정 넘김과 경도 135도 동쪽', () => {
    const r = calculateSaju(2024, 2, 11, 0, 10, { equationOfTime: true });
    expect(r.correctedTime).toEqual({ hour: 23, minute: 24 });
    const east = calculateSaju(2024, 11, 3, 23, 50, { longitude: 140, equationOfTime: true });
    // 23:50 + 20분 + 16.4분 → 00:26
    expect(east.correctedTime).toEqual({ hour: 0, minute: 26 });
  });

  test("clock 'korea-legal'·{ utcOffsetMinutes } + longitude는 그 시계의 자오선 기준", () => {
    // 1955년은 UTC+8:30(자오선 127.5도)
    const r = calculateSaju(1955, 11, 3, 12, 0, { clock: 'korea-legal', longitude: 127.5, equationOfTime: true });
    const e = r.equationOfTimeSeconds as number;
    const t = 12 * 60 + Math.round(e / 60);
    expect(r.correctedTime).toEqual({ hour: Math.floor(t / 60), minute: t % 60 });
    const u = calculateSaju(2000, 2, 11, 12, 0, { clock: { utcOffsetMinutes: 480 }, longitude: 120, equationOfTime: true });
    expect(u.correctedTime).toEqual({ hour: 11, minute: 46 });
  });

  test('보정하지 않는 경우에는 쓰지 않는다', () => {
    const off = calculateSaju(2024, 11, 3, 13, 0, { applyTimeCorrection: false, equationOfTime: true });
    expect(off).toEqual(calculateSaju(2024, 11, 3, 13, 0, { applyTimeCorrection: false }));
    const noLon = calculateSaju(2024, 11, 3, 13, 0, { clock: { utcOffsetMinutes: 480 }, equationOfTime: true });
    expect(noLon).toEqual(calculateSaju(2024, 11, 3, 13, 0, { clock: { utcOffsetMinutes: 480 } }));
    // 시를 주지 않으면 보정 자체가 없다
    expect(calculateSaju(1700, 5, 5, undefined, 0, { equationOfTime: true })).toEqual(calculateSaju(1700, 5, 5));
  });

  test('1800년 전에 시를 주면 RangeError, 옵션 값 검사', () => {
    expect(() => calculateSaju(1799, 12, 31, 12, 0, { equationOfTime: true })).toThrow(RangeError);
    expect(() => calculateSaju(1800, 1, 1, 0, 0, { equationOfTime: true })).not.toThrow();
    expect(() => calculateSaju(2000, 1, 1, 12, 0, { equationOfTime: 'yes' as unknown as boolean })).toThrow(TypeError);
  });
});
