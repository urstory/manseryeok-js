// @fullstackfamily/manseryeok README Examples Test
// Run with: node examples-test.js

import {
  solarToLunar,
  lunarToSolar,
  getGapja,
  OutOfRangeError,
  InvalidDateError,
  SIXTY_PILLARS,
  getPillarById,
  getPillarByHangul,
  getAllSolarTerms,
  getSolarTermInfoByName,
  getSolarTermsBySajuMonth,
  getSajuMonth,
  getSolarTermsByYear,
  getSolarTermForDate,
  getSolarTermsByMonth,
  getSupportedSolarTermYears,
  isSupportedYear,
  getSupportedRange,
} from './dist/index.mjs';

console.log('========================================');
console.log('@fullstackfamily/manseryeok Examples Test');
console.log('========================================\n');

// ============================================
// 1. 양력 → 음력 변환 (2024년 설날 예시)
// ============================================
console.log('1. 양력 → 음력 변환 (2024년 설날)');
console.log('---'.repeat(20));
const result = solarToLunar(2024, 2, 10);
console.log('양력:', result.solar.year, '년', result.solar.month, '월', result.solar.day, '일');
console.log('음력:', result.lunar.year, '년', result.lunar.month, '월', result.lunar.day, '일');
console.log('윤달:', result.lunar.isLeapMonth ? '예' : '아니오');
console.log('갑자:', result.gapja.yearPillar, '년', result.gapja.monthPillar, '월', result.gapja.dayPillar, '일');
console.log();

// ============================================
// 2. 생일날 음력과 갑자 알아보기
// ============================================
console.log('2. 생일날 음력과 갑자 알아보기');
console.log('---'.repeat(20));

function formatBirthday(solarYear, solarMonth, solarDay) {
  const result = solarToLunar(solarYear, solarMonth, solarDay);

  console.log('=== 생일 정보 ===');
  console.log(`양력: ${result.solar.year}년 ${result.solar.month}월 ${result.solar.day}일`);
  console.log(`음력: ${result.lunar.year}년 ${result.lunar.month}월 ${result.lunar.day}일${result.lunar.isLeapMonth ? ' (윤달)' : ''}`);
  console.log(`갑자: ${result.gapja.yearPillarHanja}년 ${result.gapja.monthPillarHanja}월 ${result.gapja.dayPillarHanja}일`);
  console.log(`오행: 년=${result.gapja.yearPillar}, 월=${result.gapja.monthPillar}, 일=${result.gapja.dayPillar}`);
  return result;
}

// 예시: 1990년 5월 15일생
formatBirthday(1990, 5, 15);
console.log();

// ============================================
// 3. 음력 → 양력 변환
// ============================================
console.log('3. 음력 → 양력 변환');
console.log('---'.repeat(20));
const lunarResult = lunarToSolar(2024, 1, 1, false);
console.log('음력 2024년 1월 1일 = 양력', lunarResult.solar.year, '년', lunarResult.solar.month, '월', lunarResult.solar.day, '일');
console.log();

// ============================================
// 4. 윤달 날짜 변환
// ============================================
console.log('4. 윤달 날짜 변환');
console.log('---'.repeat(20));

// 윤달 4월 1일 (예: 2020년)
const leapMonthResult = lunarToSolar(2020, 4, 1, true);
console.log('윤4월 1일 → 양력:', leapMonthResult.solar.year, '년', leapMonthResult.solar.month, '월', leapMonthResult.solar.day, '일');

// 평달 4월 1일과 비교
const normalMonthResult = lunarToSolar(2020, 4, 1, false);
console.log('평4월 1일 → 양력:', normalMonthResult.solar.year, '년', normalMonthResult.solar.month, '월', normalMonthResult.solar.day, '일');
console.log();

// ============================================
// 5. 갑자(60갑자) 계산
// ============================================
console.log('5. 갑자(60갑자) 계산');
console.log('---'.repeat(20));

// 1984년 갑자년 (입춘 이후)
const gapja1 = getGapja(1984, 2, 4);
console.log('1984년 2월 4일 (입춘):', gapja1.yearPillar, '년');

// 1984년 입춘 전 (아직 계해년)
const gapja2 = getGapja(1984, 2, 2);
console.log('1984년 2월 2일 (입춘 전):', gapja2.yearPillar, '년');
console.log();

// ============================================
// 6. 내 생일의 사주팔자 구하기
// ============================================
console.log('6. 내 생일의 사주팔자 구하기');
console.log('---'.repeat(20));

function getMySaju(birthYear, birthMonth, birthDay) {
  const gapja = getGapja(birthYear, birthMonth, birthDay);

  console.log('=== 사주팔자 ===');
  console.log(`년주: ${gapja.yearPillar} (${gapja.yearPillarHanja})`);
  console.log(`월주: ${gapja.monthPillar} (${gapja.monthPillarHanja})`);
  console.log(`일주: ${gapja.dayPillar} (${gapja.dayPillarHanja})`);

  return gapja;
}

// 예시: 1984년 2월 2일생
getMySaju(1984, 2, 2);
console.log();

// ============================================
// 7. 양력/음력 달력 만들기 (첫 10일만)
// ============================================
console.log('7. 양력/음력 달력 만들기 (2024년 2월, 처음 10일)');
console.log('---'.repeat(20));

function printCalendar(year, month) {
  console.log(`\n=== ${year}년 ${month}월 ===`);
  console.log('양력\t음력\t\t갑자');
  console.log(''.padEnd(40, '-'));

  const daysInMonth = new Date(year, month, 0).getDate();
  const maxDays = Math.min(daysInMonth, 10); // 처음 10일만

  for (let day = 1; day <= maxDays; day++) {
    const result = solarToLunar(year, month, day);
    const lunarStr = `${result.lunar.month}/${result.lunar.day}${result.lunar.isLeapMonth ? ' 윤' : ''}`;
    const gapjaStr = `${result.gapja.yearPillar} ${result.gapja.dayPillar}`;
    console.log(`${month}/${day}\t${lunarStr}\t\t${gapjaStr}`);
  }
}

printCalendar(2024, 2);
console.log();

// ============================================
// 8. 대량 날짜 변환
// ============================================
console.log('8. 대량 날짜 변환');
console.log('---'.repeat(20));

function batchConvert(dates) {
  return dates.map(date => {
    const result = solarToLunar(date.year, date.month, date.day);
    return {
      solar: `${result.solar.year}-${String(result.solar.month).padStart(2, '0')}-${String(result.solar.day).padStart(2, '0')}`,
      lunar: `${result.lunar.year}-${String(result.lunar.month).padStart(2, '0')}-${String(result.lunar.day).padStart(2, '0')}${result.lunar.isLeapMonth ? '*' : ''}`,
      gapja: result.gapja.yearPillar,
    };
  });
}

const dates = [
  { year: 2024, month: 2, day: 10 },
  { year: 2024, month: 9, day: 17 },
  { year: 1984, month: 2, day: 2 },
];

const batchResults = batchConvert(dates);
console.table(batchResults);
console.log();

// ============================================
// 9. 날짜 유효성 검사
// ============================================
console.log('9. 날짜 유효성 검사');
console.log('---'.repeat(20));

function isValidDate(year, month, day) {
  try {
    solarToLunar(year, month, day);
    return true;
  } catch (error) {
    if (error instanceof OutOfRangeError) {
      console.log('지원 범위 밖 연도:', error.message);
    } else if (error instanceof InvalidDateError) {
      console.log('유효하지 않은 날짜:', error.message);
    }
    return false;
  }
}

console.log('2024/2/29:', isValidDate(2024, 2, 29));  // true (2024년은 윤년)
console.log('2023/2/29:', isValidDate(2023, 2, 29));  // false (2023년은 평년)
console.log('1800/1/1:', isValidDate(1800, 1, 1));   // false (지원 범위 밖)
console.log('2024/2/10:', isValidDate(2024, 2, 10));  // true
console.log();

// ============================================
// 10. 60갑자 데이터 직접 조회
// ============================================
console.log('10. 60갑자 데이터 직접 조회');
console.log('---'.repeat(20));

// 전체 60갑자 목록
console.log('총 60갑자 개수:', SIXTY_PILLARS.length);

// ID로 조회 (0~59)
const pillar = getPillarById(0);
console.log('0번 갑자:', pillar.combined.hangul, '/', pillar.combined.hanja);

// 한글 이름으로 조회
const found = getPillarByHangul('갑자');
console.log('갑자의 ID:', found?.id);
console.log('갑자의 오행:', found?.element);
console.log('갑자의 음양:', found?.yinYang);
console.log();

// ============================================
// 11. 24절기 정보 조회
// ============================================
console.log('11. 24절기 정보 조회');
console.log('---'.repeat(20));

// 전체 24절기 목록
const allTerms = getAllSolarTerms();
console.log('24절기 개수:', allTerms.length);

// 절기 이름으로 조회
const ipchun = getSolarTermInfoByName('입춘');
console.log('입춘:', ipchun?.hanja, '황경', ipchun?.longitude, '°');

// 사주 월에 해당하는 절기 목록
const februaryTerms = getSolarTermsBySajuMonth(2);
console.log('2월(인월) 절기:', februaryTerms.map(t => t.name).join(', '));
console.log();

// ============================================
// 12. 사주 월 계산 (절기 기준)
// ============================================
console.log('12. 사주 월 계산 (절기 기준)');
console.log('---'.repeat(20));

console.log('2월 1일:', getSajuMonth(2, 1));  // 1 (소한, 아직 1월)
console.log('2월 5일:', getSajuMonth(2, 5));  // 1 (입춘 전)
console.log('2월 6일:', getSajuMonth(2, 6));  // 2 (입춘 후, 2월 시작!)
console.log('3월 5일:', getSajuMonth(3, 5));  // 2 (경칩 전)
console.log('3월 7일:', getSajuMonth(3, 7));  // 3 (경칩 후, 3월 시작!)
console.log();

// ============================================
// 13. 24절기 한눈에 보기
// ============================================
console.log('13. 24절기 한눈에 보기');
console.log('---'.repeat(20));

function printSolarTerms() {
  const terms = getAllSolarTerms();

  console.log('\n=== 한국 24절기 ===');
  console.log('계절\t절기\t\t한자\t\t황경\t사주월');
  console.log(''.padEnd(60, '-'));

  const seasons = ['봄', '봄', '봄', '봄', '봄', '봄',
                   '여름', '여름', '여름', '여름', '여름', '여름',
                   '가을', '가을', '가을', '가을', '가을', '가을',
                   '겨울', '겨울', '겨울', '겨울', '겨울', '겨울'];

  terms.forEach((term, i) => {
    const season = seasons[i];
    const typeStr = term.type === 'jeolgi' ? '절기' : '중기';
    console.log(`${season}\t${term.name}\t\t${term.hanja}\t\t${term.longitude}°\t${term.sajuMonth}월`);
  });
}

printSolarTerms();
console.log();

// ============================================
// 14. 특정 연도의 절기 시각 조회
// ============================================
console.log('14. 2024년 절기 시각 조회 (처음 5개)');
console.log('---'.repeat(20));

const terms2024 = getSolarTermsByYear(2024);
terms2024.slice(0, 5).forEach(term => {
  console.log(`${term.name} (${term.nameHanja}): ${term.month}월 ${term.day}일 ${term.hour}시 ${term.minute}분`);
});

// 특정 날짜의 절기 확인
const term = getSolarTermForDate(2024, 2, 4);
if (term) {
  console.log('\n2024년 2월 4일은', term.name, '입니다');
  console.log('절기 시각:', term.month, '월', term.day, ' 일', term.hour, ' 시', term.minute, '분');
}
console.log();

// ============================================
// 15. 특정 월의 절기 목록
// ============================================
console.log('15. 2024년 2월의 절기');
console.log('---'.repeat(20));

const febTerms = getSolarTermsByMonth(2024, 2);
febTerms.forEach(t => {
  console.log(`${t.month}/${t.day} ${t.hour}:${String(t.minute).padStart(2, '0')} - ${t.name} (${t.nameHanja})`);
});
console.log();

// ============================================
// 16. 지원되는 절기 연도 확인
// ============================================
console.log('16. 지원되는 절기 연도 확인');
console.log('---'.repeat(20));

const supportedYears = getSupportedSolarTermYears();
console.log('절기 데이터 지원 연도:', supportedYears.join(', '));
console.log();

// ============================================
// 17. 지원 범위 확인
// ============================================
console.log('17. 지원 범위 확인');
console.log('---'.repeat(20));

const range = getSupportedRange();
console.log('지원 연도 범위:', range.min, '~', range.max);
console.log('1900년 지원?:', isSupportedYear(1900));
console.log('2050년 지원?:', isSupportedYear(2050));
console.log('1800년 지원?:', isSupportedYear(1800));
console.log('2100년 지원?:', isSupportedYear(2100));
console.log();

console.log('========================================');
console.log('All examples completed successfully!');
console.log('========================================');
