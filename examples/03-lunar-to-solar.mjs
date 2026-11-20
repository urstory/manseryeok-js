/**
 * 음력 → 양력 변환
 *
 * 음력 생일을 양력으로 찾습니다.
 */

import { lunarToSolar } from '../dist/index.mjs';

console.log('========================================');
console.log('음력 → 양력 변환');
console.log('========================================\n');

// 2024년 정월 초하루
const result = lunarToSolar(2024, 1, 1, false);

console.log('음력 2024년 1월 1일 → 양력 변환');
console.log(`양력: ${result.solar.year}년 ${result.solar.month}월 ${result.solar.day}일`);
console.log(`갑자: ${result.gapja.yearPillarHanja}년 ${result.gapja.monthPillarHanja}월 ${result.gapja.dayPillarHanja}일`);

console.log('\n--- 결과 ---');
console.log(`음력 2024년 1월 1일 = 양력 ${result.solar.year}년 ${result.solar.month}월 ${result.solar.day}일`);
