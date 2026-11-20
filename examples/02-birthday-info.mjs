/**
 * 생일날 음력과 갑자 알아보기
 *
 * 양력 생일을 음력으로 변환하고 갑자(년주, 월주, 일주)를 알아봅니다.
 */

import { solarToLunar } from '../dist/index.mjs';

console.log('========================================');
console.log('생일날 음력과 갑자 알아보기');
console.log('========================================\n');

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
console.log('1990년 5월 15일생:');
formatBirthday(1990, 5, 15);

console.log('\n--- 결과 ---');
console.log(`양력: 1990년 5월 15일`);
console.log(`음력: 1990년 4월 21일`);
console.log(`갑자: 庚午년 辛巳월 庚辰日`);
