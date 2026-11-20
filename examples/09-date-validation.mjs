/**
 * 날짜 유효성 검사
 *
 * 지원 범위와 유효한 날짜인지 확인합니다.
 */

import { solarToLunar, OutOfRangeError, InvalidDateError } from '../dist/index.mjs';

console.log('========================================');
console.log('날짜 유효성 검사');
console.log('========================================\n');

function isValidDate(year, month, day) {
  try {
    solarToLunar(year, month, day);
    return true;
  } catch (error) {
    if (error instanceof OutOfRangeError) {
      console.log(`  ❌ ${year}/${month}/${day}: 지원 범위 밖 연도`);
    } else if (error instanceof InvalidDateError) {
      console.log(`  ❌ ${year}/${month}/${day}: 유효하지 않은 날짜`);
    }
    return false;
  }
}

console.log('--- 유효성 검사 ---');
console.log(`2024/2/29: ${isValidDate(2024, 2, 29) ? '✅ 유효함' : '❌ 유효하지 않음'} (2024년은 윤년)`);
console.log(`2023/2/29: ${isValidDate(2023, 2, 29) ? '✅ 유효함' : '❌ 유효하지 않음'} (2023년은 평년)`);
console.log(`1800/1/1: ${isValidDate(1800, 1, 1) ? '✅ 유효함' : '❌ 유효하지 않음'} (지원 범위 밖)`);
console.log(`2024/2/10: ${isValidDate(2024, 2, 10) ? '✅ 유효함' : '❌ 유효하지 않음'}`);

console.log('\n--- 지원 범위 ---');
import { isSupportedYear, getSupportedRange } from '../dist/index.mjs';

const range = getSupportedRange();
console.log(`지원 연도: ${range.min}년 ~ ${range.max}년`);
console.log(`1900년 지원: ${isSupportedYear(1900) ? '✅' : '❌'}`);
console.log(`2050년 지원: ${isSupportedYear(2050) ? '✅' : '❌'}`);
