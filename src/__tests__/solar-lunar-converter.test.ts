/**
 * solar-lunar-converter 테스트
 */

import { solarToLunar, lunarToSolar, getGapja } from '../core/solar-lunar-converter';
import { OutOfRangeError, InvalidDateError } from '../types';

describe('solarToLunar', () => {
  test('2024년 설날 (양력 2024-02-10 → 음력 2024-01-01)', () => {
    const result = solarToLunar(2024, 2, 10);

    expect(result.solar).toEqual({ year: 2024, month: 2, day: 10 });
    expect(result.lunar).toEqual({
      year: 2024,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
    expect(result.gapja.yearPillar).toBe('갑진');
    expect(result.gapja.yearPillarHanja).toBe('甲辰');
  });

  test('1984년 입춘 이후 (양력 1984-02-04 → 갑자년 시작)', () => {
    const result = solarToLunar(1984, 2, 4);

    expect(result.lunar).toEqual({
      year: 1984,
      month: 1,
      day: 3,
      isLeapMonth: false,
    });
    // 입춘 이후부터 갑자년으로 변경
    expect(result.gapja.yearPillar).toBe('갑자');
    expect(result.gapja.yearPillarHanja).toBe('甲子');
  });

  test('1984년 입춘 이전 (양력 1984-02-02 → 아직 계해년)', () => {
    const result = solarToLunar(1984, 2, 2);

    expect(result.lunar).toEqual({
      year: 1984,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
    // 입춘 전이라 아직 계해년
    expect(result.gapja.yearPillar).toBe('계해');
    expect(result.gapja.yearPillarHanja).toBe('癸亥');
  });

  test('2000년 밀레니엄 (양력 2000-01-01)', () => {
    const result = solarToLunar(2000, 1, 1);

    expect(result.solar).toEqual({ year: 2000, month: 1, day: 1 });
    expect(result.gapja.yearPillar).toBe('기묘');
    expect(result.gapja.yearPillarHanja).toBe('己卯');
  });

  test('지원 범위 밖 연도 (1390년)', () => {
    expect(() => solarToLunar(1390, 1, 1)).toThrow(OutOfRangeError);
  });

  test('지원 범위 밖 연도 (2051년)', () => {
    expect(() => solarToLunar(2051, 1, 1)).toThrow(OutOfRangeError);
  });

  test('유효하지 않은 날짜 (2024-02-30)', () => {
    expect(() => solarToLunar(2024, 2, 30)).toThrow(InvalidDateError);
  });

  test('지원 범위 경계 (1900년)', () => {
    const result = solarToLunar(1900, 1, 31);
    expect(result.solar.year).toBe(1900);
  });

  test('지원 범위 경계 (2050년)', () => {
    const result = solarToLunar(2050, 12, 31);
    expect(result.solar.year).toBe(2050);
  });
});

describe('lunarToSolar', () => {
  test('2024년 정월 초하루 (음력 2024-01-01 → 양력 2024-02-10)', () => {
    const result = lunarToSolar(2024, 1, 1, false);

    expect(result.lunar).toEqual({
      year: 2024,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
    expect(result.solar).toEqual({ year: 2024, month: 2, day: 10 });
  });

  test('1984년 정월 초하루 (입춘 전)', () => {
    const result = lunarToSolar(1984, 1, 1, false);

    expect(result.solar).toEqual({ year: 1984, month: 2, day: 2 });
    // 입춘 전이라 아직 계해년
    expect(result.gapja.yearPillar).toBe('계해');
  });

  test('지원 범위 밖 연도 (1390년)', () => {
    expect(() => lunarToSolar(1390, 1, 1)).toThrow(OutOfRangeError);
  });

  test('유효하지 않은 날짜 (음력 2024-13-01)', () => {
    expect(() => lunarToSolar(2024, 13, 1)).toThrow(InvalidDateError);
  });

  test('다음 해 양력으로 넘어가는 음력 12월 (음력 1988-12-18 → 양력 1989-01-25)', () => {
    const result = lunarToSolar(1988, 12, 18, false);

    expect(result.lunar).toEqual({
      year: 1988,
      month: 12,
      day: 18,
      isLeapMonth: false,
    });
    expect(result.solar).toEqual({ year: 1989, month: 1, day: 25 });
  });

  test('음력 11·12월 전체가 solarToLunar와 왕복 일치 (1901~2050)', () => {
    let checked = 0;
    for (let year = 1901; year <= 2050; year++) {
      for (let month = 1; month <= 3; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const { lunar } = solarToLunar(year, month, day);
          if (lunar.month < 11) continue;

          const result = lunarToSolar(lunar.year, lunar.month, lunar.day, lunar.isLeapMonth);
          expect(result.solar).toEqual({ year, month, day });
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(5000);
  });
});

describe('getGapja', () => {
  test('1984년 입춘 (갑자년 시작)', () => {
    const gapja = getGapja(1984, 2, 4);

    expect(gapja.yearPillar).toBe('갑자');
    expect(gapja.yearPillarHanja).toBe('甲子');
    expect(gapja.monthPillar).toBe('병인');
    expect(gapja.monthPillarHanja).toBe('丙寅');
  });

  test('1984년 입춘 전 (아직 계해년)', () => {
    const gapja = getGapja(1984, 2, 2);

    expect(gapja.yearPillar).toBe('계해');
    expect(gapja.yearPillarHanja).toBe('癸亥');
  });

  test('2024년 갑진년', () => {
    const gapja = getGapja(2024, 2, 10);

    expect(gapja.yearPillar).toBe('갑진');
    expect(gapja.yearPillarHanja).toBe('甲辰');
  });

  test('2000년 기묘년', () => {
    const gapja = getGapja(2000, 1, 1);

    expect(gapja.yearPillar).toBe('기묘');
    expect(gapja.yearPillarHanja).toBe('己卯');
  });
});

describe('월주 절기 기준 검증 (Issue #5)', () => {
  describe('1996년(丙子年) 전체 월 순환', () => {
    const cases = [
      { date: [1996, 2, 4], expected: '庚寅', desc: '인월 (입춘)' },
      { date: [1996, 3, 6], expected: '辛卯', desc: '묘월 (경칩)' },
      { date: [1996, 4, 5], expected: '壬辰', desc: '진월 (청명)' },
      { date: [1996, 5, 6], expected: '癸巳', desc: '사월 (입하)' },
      { date: [1996, 6, 6], expected: '甲午', desc: '오월 (망종)' },
      { date: [1996, 7, 7], expected: '乙未', desc: '미월 (소서)' },
      { date: [1996, 8, 8], expected: '丙申', desc: '신월 (입추)' },
      { date: [1996, 9, 8], expected: '丁酉', desc: '유월 (백로)' },
      { date: [1996, 10, 8], expected: '戊戌', desc: '술월 (한로)' },
      { date: [1996, 11, 8], expected: '己亥', desc: '해월 (입동)' },
      { date: [1996, 12, 7], expected: '庚子', desc: '자월 (대설)' },
    ];

    cases.forEach(({ date, expected, desc }) => {
      test(`${date.join('-')} → ${expected} (${desc})`, () => {
        const gapja = getGapja(date[0], date[1], date[2]);
        expect(gapja.monthPillarHanja).toBe(expected);
      });
    });
  });

  describe('절기 경계 검증', () => {
    test('소한 전 (1996-01-01) → 자월 戊子', () => {
      expect(getGapja(1996, 1, 1).monthPillarHanja).toBe('戊子');
    });

    test('소한 후 (1996-01-06) → 축월 己丑', () => {
      expect(getGapja(1996, 1, 6).monthPillarHanja).toBe('己丑');
    });

    test('입춘 전 (1996-02-03) → 축월 己丑', () => {
      expect(getGapja(1996, 2, 3).monthPillarHanja).toBe('己丑');
    });

    test('입춘 당일 (1996-02-04) → 인월 庚寅', () => {
      expect(getGapja(1996, 2, 4).monthPillarHanja).toBe('庚寅');
    });

    test('청명 전 (1996-04-04) → 묘월 辛卯', () => {
      expect(getGapja(1996, 4, 4).monthPillarHanja).toBe('辛卯');
    });

    test('청명 당일 (1996-04-05) → 진월 壬辰', () => {
      expect(getGapja(1996, 4, 5).monthPillarHanja).toBe('壬辰');
    });
  });

  describe('오호둔법 연간별 검증', () => {
    // 갑/기년 → 병인(丙寅) 시작
    test('2024 갑진년 인월 → 丙寅', () => {
      expect(getGapja(2024, 2, 4).monthPillarHanja).toBe('丙寅');
    });

    // 을/경년 → 무인(戊寅) 시작
    test('2025 을사년 인월 → 戊寅', () => {
      expect(getGapja(2025, 2, 4).monthPillarHanja).toBe('戊寅');
    });

    // 병/신년 → 경인(庚寅) 시작
    test('1996 병자년 인월 → 庚寅', () => {
      expect(getGapja(1996, 2, 4).monthPillarHanja).toBe('庚寅');
    });

    // 정/임년 → 임인(壬寅) 시작
    test('1997 정축년 인월 → 壬寅', () => {
      expect(getGapja(1997, 2, 4).monthPillarHanja).toBe('壬寅');
    });

    // 무/계년 → 갑인(甲寅) 시작
    test('1998 무인년 인월 → 甲寅', () => {
      expect(getGapja(1998, 2, 4).monthPillarHanja).toBe('甲寅');
    });
  });

  describe('경계 연도 검증', () => {
    // 데이터 범위 시작 연도 (1900 庚子年)
    test('1900-02-05 경자년 인월 → 戊寅', () => {
      expect(getGapja(1900, 2, 5).monthPillarHanja).toBe('戊寅');
    });

    test('1900-01-01 기해년 자월 → 丙子', () => {
      expect(getGapja(1900, 1, 1).monthPillarHanja).toBe('丙子');
    });

    // 데이터 범위 끝 연도 (2050 庚午年)
    test('2050-02-04 경오년 인월 → 戊寅', () => {
      expect(getGapja(2050, 2, 4).monthPillarHanja).toBe('戊寅');
    });

    test('2050-12-07 경오년 자월 → 戊子', () => {
      expect(getGapja(2050, 12, 7).monthPillarHanja).toBe('戊子');
    });
  });
});

describe('데이터 연속성 (Issue #11)', () => {
  test('양력 1956-12-31 ↔ 음력 1956-11-30, 일주 임신', () => {
    const s = solarToLunar(1956, 12, 31);
    expect(s.lunar).toEqual({ year: 1956, month: 11, day: 30, isLeapMonth: false });
    expect(s.gapja.dayPillar).toBe('임신');
    expect(s.gapja.dayPillarHanja).toBe('壬申');
    expect(lunarToSolar(1956, 11, 30).solar).toEqual({ year: 1956, month: 12, day: 31 });
  });

  test('1900-01-01 ~ 2050-12-31 모든 날짜가 빠짐없이 이어진다', () => {
    const start = Date.UTC(1900, 0, 1);
    const end = Date.UTC(2050, 11, 31);
    let prevJd: number | null = null;
    let count = 0;
    for (let t = start; t <= end; t += 86400000) {
      const d = new Date(t);
      const r = solarToLunar(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      if (prevJd !== null) expect(r.julianDay).toBe(prevJd + 1);
      prevJd = r.julianDay;
      count++;
    }
    expect(count).toBe(55152);
  });
});
