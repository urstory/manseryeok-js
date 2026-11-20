/**
 * 갑자(60갑자) 계산
 *
 * 입춘을 기준으로 년주가 바뀌는 것을 확인합니다.
 */

import { getGapja } from '../dist/index.mjs';

console.log('========================================');
console.log('갑자(60갑자) 계산');
console.log('========================================\n');

// 1984년 갑자년 (입춘 이후)
const gapja1 = getGapja(1984, 2, 4);
console.log('1984년 2월 4일 (입춘):', gapja1.yearPillar, '년', gapja1.yearPillarHanja);

// 1984년 입춘 전 (아직 계해년)
const gapja2 = getGapja(1984, 2, 2);
console.log('1984년 2월 2일 (입춘 전):', gapja2.yearPillar, '년', gapja2.yearPillarHanja);

console.log('\n--- 결과 ---');
console.log('1984년 2월 4일 (입춘): 갑자년 (甲子年)');
console.log('1984년 2월 2일 (입춘 전): 계해년 (癸亥年)');
console.log('\n참고: 한국 사주에서 년주는 입춘(2월 3-4일 경)에 변경됩니다');
