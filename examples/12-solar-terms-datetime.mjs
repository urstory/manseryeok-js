/**
 * 특정 연도의 절기 시각 조회
 *
 * 2024년 모든 절기의 정확한 시각을 조회합니다.
 */

import {
  getSolarTermsByYear,
  getSolarTermForDate,
  getSolarTermsByMonth
} from '../dist/index.mjs';

console.log('========================================');
console.log('2024년 절기 시각 조회');
console.log('========================================\n');

// 2024년 모든 절기 시각 조회
const terms2024 = getSolarTermsByYear(2024);

console.log('--- 2024년 24절기 시각 ---');
terms2024.forEach(term => {
  const timeStr = `${term.month}월 ${term.day}일 ${term.hour}시 ${term.minute}분`;
  console.log(`${term.name} (${term.nameHanja}): ${timeStr}`);
});

// 특정 날짜의 절기 확인
console.log('\n--- 특정 날짜의 절기 확인 ---');
const testDate = { year: 2024, month: 2, day: 4 };
const term = getSolarTermForDate(testDate.year, testDate.month, testDate.day);
if (term) {
  console.log(`2024년 ${testDate.month}월 ${testDate.day}일은 ${term.name} (${term.nameHanja})입니다`);
  console.log(`절기 시각: ${term.month}월 ${term.day}일 ${term.hour}시 ${term.minute}분`);
} else {
  console.log(`2024년 ${testDate.month}월 ${testDate.day}일은 절기가 아닙니다`);
}

// 2월의 절기 목록
console.log('\n--- 2024년 2월의 절기 ---');
const febTerms = getSolarTermsByMonth(2024, 2);
febTerms.forEach(t => {
  const timeStr = `${t.month}/${t.day} ${t.hour}:${String(t.minute).padStart(2, '0')}`;
  console.log(`${timeStr} - ${t.name} (${t.nameHanja})`);
});

console.log('\n--- 참고 ---');
console.log('절기 데이터 지원 연도: 2020 ~ 2030년');
