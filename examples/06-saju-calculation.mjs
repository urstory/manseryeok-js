/**
 * 사주팔자 계산 (시주 포함)
 *
 * 시간 보정을 포함한 사주팔자 계산 예제입니다.
 */

import { calculateSaju, calculateSajuSimple } from '../dist/index.mjs';

console.log('========================================');
console.log('사주팔자 계산 (시주 포함)');
console.log('========================================\n');

// 1. 시간 보정 적용
console.log('1. 시간 보정 적용 (1990년 5월 15일 14시 30분):');
const saju1 = calculateSaju(1990, 5, 15, 14, 30);
console.log(`  년주: ${saju1.yearPillar} (${saju1.yearPillarHanja})`);
console.log(`  월주: ${saju1.monthPillar} (${saju1.monthPillarHanja})`);
console.log(`  일주: ${saju1.dayPillar} (${saju1.dayPillarHanja})`);
console.log(`  시주: ${saju1.hourPillar} (${saju1.hourPillarHanja})`);
if (saju1.isTimeCorrected) {
  console.log(`  시간 보정: ${saju1.correctedTime.hour}시 ${saju1.correctedTime.minute}분 (진태양시)`);
}

// 2. 시간 보정 없이 간단 계산
console.log('\n2. 시간 보정 없이 간단 계산 (1984년 2월 2일 2시):');
const saju2 = calculateSajuSimple(1984, 2, 2, 2);
console.log(`  사주: ${saju2.yearPillar}년 ${saju2.monthPillar}월 ${saju2.dayPillar}일 ${saju2.hourPillar}시`);
console.log(`  시간 보정: ${saju2.isTimeCorrected ? '적용됨' : '미적용'}`);

// 3. 다른 경도 (부산)
console.log('\n3. 부산 경도 (129도) 적용:');
const saju3 = calculateSaju(1990, 5, 15, 14, 0, { longitude: 129 });
console.log(`  사주: ${saju3.yearPillar}년 ${saju3.monthPillar}월 ${saju3.dayPillar}일 ${saju3.hourPillar}시`);
if (saju3.isTimeCorrected) {
  console.log(`  보정된 시간: ${saju3.correctedTime.hour}시 ${saju3.correctedTime.minute}분`);
  console.log(`  경도 보정: 14시 0분 → ${saju3.correctedTime.hour}시 ${saju3.correctedTime.minute}분 (-24분)`);
}

console.log('\n--- 결과 ---');
console.log('시간 보정이 필요한 이유:');
console.log('사주의 시주(時柱)를 정확히 계산하기 위해 진태양시를 사용합니다.');
console.log('- 서울 (127°): -32분 보정');
console.log('- 부산 (129°): -24분 보정');
console.log('- 강릉 (128°): -28분 보정');
