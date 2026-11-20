/**
 * 양력/음력 달력 만들기
 *
 * 특정 월의 양력/음력 달력을 출력합니다.
 */

import { solarToLunar } from '../dist/index.mjs';

console.log('========================================');
console.log('양력/음력 달력 (2024년 2월)');
console.log('========================================\n');

function printCalendar(year, month) {
  console.log(`=== ${year}년 ${month}월 ===`);
  console.log('양력\t음력\t\t갑자');
  console.log(''.padEnd(50, '-'));

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const result = solarToLunar(year, month, day);
    const lunarStr = `${result.lunar.month}/${result.lunar.day}${result.lunar.isLeapMonth ? ' 윤' : ''}`;
    const gapjaStr = `${result.gapja.yearPillar} ${result.gapja.dayPillar}`;
    console.log(`${month}/${day}\t${lunarStr}\t\t${gapjaStr}`);
  }
}

// 2024년 2월 달력 (처음 10일만 표시)
console.log('--- 처음 10일 ---');
const year = 2024;
const month = 2;
console.log(`\n=== ${year}년 ${month}월 (처음 10일) ===`);
console.log('양력\t음력\t\t갑자');
console.log(''.padEnd(50, '-'));

for (let day = 1; day <= 10; day++) {
  const result = solarToLunar(year, month, day);
  const lunarStr = `${result.lunar.month}/${result.lunar.day}${result.lunar.isLeapMonth ? ' 윤' : ''}`;
  const gapjaStr = `${result.gapja.yearPillar} ${result.gapja.dayPillar}`;
  console.log(`${month}/${day}\t${lunarStr}\t\t${gapjaStr}`);
}

console.log('\n--- 특별한 날짜 ---');
console.log('2/10\t1/1\t\t갑진 갑진 (설날)');
