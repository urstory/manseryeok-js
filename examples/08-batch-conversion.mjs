/**
 * 대량 날짜 변환
 *
 * 여러 날짜를 한번에 변환하여 표로 출력합니다.
 */

import { solarToLunar } from '../dist/index.mjs';

console.log('========================================');
console.log('대량 날짜 변환');
console.log('========================================\n');

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
  { year: 2024, month: 2, day: 10 },  // 2024년 설날
  { year: 2024, month: 9, day: 17 },  // 추석
  { year: 1984, month: 2, day: 2 },   // 입춘 전
  { year: 1984, month: 2, day: 4 },   // 입춘
];

const results = batchConvert(dates);

console.table(results);

console.log('\n--- 결과 ---');
results.forEach((r, i) => {
  console.log(`${dates[i].year}/${dates[i].month}/${dates[i].day}:`);
  console.log(`  양력: ${r.solar}`);
  console.log(`  음력: ${r.lunar}`);
  console.log(`  갑자: ${r.gapja}`);
});
