/**
 * 양력 → 음력 변환 (2026년 설날 예시)
 *
 * 2026년 2월 17일은 음력 2026년 1월 1일 (설날)입니다.
 */

import { solarToLunar } from '../dist/index.mjs';

console.log('========================================');
console.log('양력 → 음력 변환 (2026년 설날)');
console.log('========================================\n');

const result = solarToLunar(2026, 2, 17);

console.log('양력:', result.solar.year, '년', result.solar.month, '월', result.solar.day, '일');
console.log('음력:', result.lunar.year, '년', result.lunar.month, '월', result.lunar.day, '일');
console.log('윤달:', result.lunar.isLeapMonth ? '예' : '아니오');
console.log('갑자:', result.gapja.yearPillar, '년', result.gapja.monthPillar, '월', result.gapja.dayPillar, '일');

console.log('\n--- 결과 ---');
console.log(`양력: ${result.solar.year}년 ${result.solar.month}월 ${result.solar.day}일`);
console.log(`음력: ${result.lunar.year}년 ${result.lunar.month}월 ${result.lunar.day}일`);
console.log(`갑자: ${result.gapja.yearPillarHanja}년 ${result.gapja.monthPillarHanja}월 ${result.gapja.dayPillarHanja}일`);
