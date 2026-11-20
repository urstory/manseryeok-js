/**
 * 윤달 날짜 변환
 *
 * 윤달과 평달의 날짜를 각각 양력으로 변환하여 비교합니다.
 */

import { lunarToSolar } from '../dist/index.mjs';

console.log('========================================');
console.log('윤달 날짜 변환');
console.log('========================================\n');

// 2020년 윤4월 1일
const leapMonthResult = lunarToSolar(2020, 4, 1, true); // isLeapMonth: true
console.log('윤4월 1일 → 양력:', leapMonthResult.solar.year, '년', leapMonthResult.solar.month, '월', leapMonthResult.solar.day, '일');

// 평4월 1일과 비교
const normalMonthResult = lunarToSolar(2020, 4, 1, false); // isLeapMonth: false
console.log('평4월 1일 → 양력:', normalMonthResult.solar.year, '년', normalMonthResult.solar.month, '월', normalMonthResult.solar.day, '일');

console.log('\n--- 결과 ---');
console.log(`윤4월 1일 → 양력: ${leapMonthResult.solar.year}년 ${leapMonthResult.solar.month}월 ${leapMonthResult.solar.day}일`);
console.log(`평4월 1일 → 양력: ${normalMonthResult.solar.year}년 ${normalMonthResult.solar.month}월 ${normalMonthResult.solar.day}일`);
console.log(`차이: ${leapMonthResult.solar.month - normalMonthResult.solar.month}개월`);
