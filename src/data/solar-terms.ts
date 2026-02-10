/**
 * 24절기 (二十四節氣) 데이터
 *
 * 한국천문연구원(KASI) 데이터 기반
 * 입춘(立春)을 시작으로 24절기를 제공합니다.
 *
 * 절기는 태양의 황경(longitude)을 기준으로 정해지며,
 * 매년 약간의 시간 차이가 있습니다.
 */

export interface SolarTermEntry {
  year: number;
  name: string;
  nameHanja: string;
  index: number;
  longitude: number;
  type: 'jeolgi' | 'junggi';
  sajuMonth: number;
}

/**
 * 한국 24절기 이름과 정보
 *
 * 황경 315°부터 시작하여 15°마다 하나씩, 총 24개
 */
export const SOLAR_TERM_NAMES: Array<{
  name: string;
  hanja: string;
  longitude: number;
  type: 'jeolgi' | 'junggi';
  sajuMonth: number;
}> = [
  { name: '입춘', hanja: '立春', longitude: 315, type: 'jeolgi', sajuMonth: 2 },   // 양력 2월 4일경
  { name: '우수', hanja: '雨水', longitude: 330, type: 'junggi', sajuMonth: 2 },    // 양력 2월 19일경
  { name: '경칩', hanja: '驚蟄', longitude: 345, type: 'jeolgi', sajuMonth: 3 },   // 양력 3월 6일경
  { name: '춘분', hanja: '春分', longitude: 0, type: 'junggi', sajuMonth: 3 },     // 양력 3월 21일경
  { name: '청명', hanja: '清明', longitude: 15, type: 'jeolgi', sajuMonth: 4 },    // 양력 4월 5일경
  { name: '곡우', hanja: '穀雨', longitude: 30, type: 'junggi', sajuMonth: 4 },     // 양력 4월 20일경

  // 여름 (夏)
  { name: '입하', hanja: '立夏', longitude: 45, type: 'jeolgi', sajuMonth: 5 },    // 양력 5월 6일경
  { name: '소만', hanja: '小滿', longitude: 60, type: 'junggi', sajuMonth: 5 },    // 양력 5월 21일경
  { name: '망종', hanja: '芒種', longitude: 75, type: 'jeolgi', sajuMonth: 6 },    // 양력 6월 6일경
  { name: '하지', hanja: '夏至', longitude: 90, type: 'junggi', sajuMonth: 6 },     // 양력 6월 21일경
  { name: '소서', hanja: '小暑', longitude: 105, type: 'jeolgi', sajuMonth: 7 },   // 양력 7월 7일경
  { name: '대서', hanja: '大暑', longitude: 120, type: 'junggi', sajuMonth: 7 },   // 양력 7월 23일경

  // 가을 (秋)
  { name: '입추', hanja: '立秋', longitude: 135, type: 'jeolgi', sajuMonth: 8 },   // 양력 8월 8일경
  { name: '처서', hanja: '處暑', longitude: 150, type: 'junggi', sajuMonth: 8 },   // 양력 8월 23일경
  { name: '백로', hanja: '白露', longitude: 165, type: 'jeolgi', sajuMonth: 9 },   // 양력 9월 8일경
  { name: '추분', hanja: '秋分', longitude: 180, type: 'junggi', sajuMonth: 9 },   // 양력 9월 23일경
  { name: '한로', hanja: '寒露', longitude: 195, type: 'jeolgi', sajuMonth: 10 },  // 양력 10월 8일경
  { name: '상강', hanja: '霜降', longitude: 210, type: 'junggi', sajuMonth: 10 },  // 양력 10월 23일경

  // 겨울 (冬)
  { name: '입동', hanja: '立冬', longitude: 225, type: 'jeolgi', sajuMonth: 11 },  // 양력 11월 7일경
  { name: '소설', hanja: '小雪', longitude: 240, type: 'junggi', sajuMonth: 11 },  // 양력 11월 22일경
  { name: '대설', hanja: '大雪', longitude: 255, type: 'jeolgi', sajuMonth: 12 },  // 양력 12월 7일경
  { name: '동지', hanja: '冬至', longitude: 270, type: 'junggi', sajuMonth: 12 },  // 양력 12월 22일경
  { name: '소한', hanja: '小寒', longitude: 285, type: 'jeolgi', sajuMonth: 1 },   // 양력 1월 6일경
  { name: '대한', hanja: '大寒', longitude: 300, type: 'junggi', sajuMonth: 1 },   // 양력 1월 20일경
];

/**
 * 절기 인덱스로 절기 정보 조회
 */
export function getSolarTermByIndex(index: number) {
  if (index < 0 || index >= 24) {
    throw new RangeError(`Solar term index must be 0~23, got ${index}`);
  }
  return SOLAR_TERM_NAMES[index];
}

/**
 * 절기 이름으로 절기 정보 조회
 */
export function getSolarTermByName(name: string) {
  return SOLAR_TERM_NAMES.find(term => term.name === name);
}
