/**
 * 24절기 및 사주월 관련 테스트
 */

import {
  getAllSolarTerms,
  getSolarTermInfoByName,
  getSolarTermInfoByIndex,
  getSolarTermsBySajuMonth,
  getSajuMonth,
} from '../core/solar-term';
import { SOLAR_TERM_NAMES } from '../data/solar-terms';

describe('SOLAR_TERM_NAMES sajuMonth 매핑', () => {
  test('24절기 전체 개수', () => {
    expect(SOLAR_TERM_NAMES).toHaveLength(24);
  });

  test('모든 sajuMonth(1~12)에 절기가 2개씩 존재', () => {
    for (let month = 1; month <= 12; month++) {
      const terms = SOLAR_TERM_NAMES.filter(t => t.sajuMonth === month);
      expect(terms).toHaveLength(2);
    }
  });

  test('각 sajuMonth에 절기(jeolgi)와 중기(junggi)가 하나씩 존재', () => {
    for (let month = 1; month <= 12; month++) {
      const terms = SOLAR_TERM_NAMES.filter(t => t.sajuMonth === month);
      const types = terms.map(t => t.type).sort();
      expect(types).toEqual(['jeolgi', 'junggi']);
    }
  });

  test('한로(寒露)는 술월(sajuMonth=10)', () => {
    const hanro = SOLAR_TERM_NAMES.find(t => t.name === '한로');
    expect(hanro?.sajuMonth).toBe(10);
  });

  test('입동(立冬)은 해월(sajuMonth=11)', () => {
    const ipdong = SOLAR_TERM_NAMES.find(t => t.name === '입동');
    expect(ipdong?.sajuMonth).toBe(11);
  });

  test('대설(大雪)은 자월(sajuMonth=12)', () => {
    const daeseol = SOLAR_TERM_NAMES.find(t => t.name === '대설');
    expect(daeseol?.sajuMonth).toBe(12);
  });

  test('소한(小寒)은 축월(sajuMonth=1)', () => {
    const sohan = SOLAR_TERM_NAMES.find(t => t.name === '소한');
    expect(sohan?.sajuMonth).toBe(1);
  });

  test('대한(大寒)은 축월(sajuMonth=1)', () => {
    const daehan = SOLAR_TERM_NAMES.find(t => t.name === '대한');
    expect(daehan?.sajuMonth).toBe(1);
  });

  test('절기-월 매핑 전체 검증', () => {
    const expected: Record<string, number> = {
      '소한': 1, '대한': 1,
      '입춘': 2, '우수': 2,
      '경칩': 3, '춘분': 3,
      '청명': 4, '곡우': 4,
      '입하': 5, '소만': 5,
      '망종': 6, '하지': 6,
      '소서': 7, '대서': 7,
      '입추': 8, '처서': 8,
      '백로': 9, '추분': 9,
      '한로': 10, '상강': 10,
      '입동': 11, '소설': 11,
      '대설': 12, '동지': 12,
    };

    for (const term of SOLAR_TERM_NAMES) {
      expect(term.sajuMonth).toBe(expected[term.name]);
    }
  });
});

describe('getAllSolarTerms', () => {
  test('24절기 배열 반환', () => {
    const terms = getAllSolarTerms();
    expect(terms).toHaveLength(24);
    expect(terms[0].name).toBe('입춘');
  });
});

describe('getSolarTermInfoByName', () => {
  test('입춘 조회', () => {
    const ipchun = getSolarTermInfoByName('입춘');
    expect(ipchun).toBeDefined();
    expect(ipchun?.hanja).toBe('立春');
    expect(ipchun?.longitude).toBe(315);
    expect(ipchun?.sajuMonth).toBe(2);
  });

  test('존재하지 않는 절기', () => {
    const result = getSolarTermInfoByName('없는절기');
    expect(result).toBeUndefined();
  });
});

describe('getSolarTermInfoByIndex', () => {
  test('인덱스 0은 입춘', () => {
    const term = getSolarTermInfoByIndex(0);
    expect(term.name).toBe('입춘');
  });

  test('인덱스 23은 대한', () => {
    const term = getSolarTermInfoByIndex(23);
    expect(term.name).toBe('대한');
  });

  test('범위 밖 인덱스 (24)', () => {
    expect(() => getSolarTermInfoByIndex(24)).toThrow(RangeError);
  });

  test('범위 밖 인덱스 (-1)', () => {
    expect(() => getSolarTermInfoByIndex(-1)).toThrow(RangeError);
  });
});

describe('getSolarTermsBySajuMonth', () => {
  test('sajuMonth=1 → 소한, 대한', () => {
    const terms = getSolarTermsBySajuMonth(1);
    expect(terms.map(t => t.name)).toEqual(['소한', '대한']);
  });

  test('sajuMonth=2 → 입춘, 우수', () => {
    const terms = getSolarTermsBySajuMonth(2);
    expect(terms.map(t => t.name)).toEqual(['입춘', '우수']);
  });

  test('sajuMonth=10 → 한로, 상강', () => {
    const terms = getSolarTermsBySajuMonth(10);
    expect(terms.map(t => t.name)).toEqual(['한로', '상강']);
  });

  test('sajuMonth=11 → 입동, 소설', () => {
    const terms = getSolarTermsBySajuMonth(11);
    expect(terms.map(t => t.name)).toEqual(['입동', '소설']);
  });

  test('sajuMonth=12 → 대설, 동지', () => {
    const terms = getSolarTermsBySajuMonth(12);
    expect(terms.map(t => t.name)).toEqual(['대설', '동지']);
  });

  test('범위 밖 (0)', () => {
    expect(() => getSolarTermsBySajuMonth(0)).toThrow(RangeError);
  });

  test('범위 밖 (13)', () => {
    expect(() => getSolarTermsBySajuMonth(13)).toThrow(RangeError);
  });
});

describe('getSajuMonth', () => {
  test('1월 1일 → 소한 이전, 축월(12)', () => {
    expect(getSajuMonth(1, 1)).toBe(12);
  });

  test('1월 6일 → 소한 이후, 축월(12)', () => {
    expect(getSajuMonth(1, 6)).toBe(12);
  });

  test('2월 3일 → 입춘 전, 축월(12)', () => {
    expect(getSajuMonth(2, 3)).toBe(12);
  });

  test('2월 4일 → 입춘 당일, 인월(1)', () => {
    expect(getSajuMonth(2, 4)).toBe(1);
  });

  test('2월 5일 → 입춘 이후, 인월(1)', () => {
    expect(getSajuMonth(2, 5)).toBe(1);
  });

  test('3월 5일 → 경칩 전, 인월(1)', () => {
    expect(getSajuMonth(3, 5)).toBe(1);
  });

  test('3월 6일 → 경칩 당일, 묘월(2)', () => {
    expect(getSajuMonth(3, 6)).toBe(2);
  });

  test('10월 7일 → 한로 전, 유월(8)', () => {
    expect(getSajuMonth(10, 7)).toBe(8);
  });

  test('10월 8일 → 한로 당일, 술월(9)', () => {
    expect(getSajuMonth(10, 8)).toBe(9);
  });

  test('12월 7일 → 대설 당일, 자월(11)', () => {
    expect(getSajuMonth(12, 7)).toBe(11);
  });
});
