/**
 * 24절기 정보 조회
 *
 * 한국 24절기의 기본 정보를 조회합니다.
 */

import {
  getAllSolarTerms,
  getSolarTermInfoByName,
  getSolarTermsBySajuMonth
} from '../dist/index.mjs';

console.log('========================================');
console.log('24절기 정보 조회');
console.log('========================================\n');

// 전체 24절기 목록
const allTerms = getAllSolarTerms();
console.log('24절기 개수:', allTerms.length);

// 절기 이름으로 조회
const ipchun = getSolarTermInfoByName('입춘');
console.log('\n입춘 정보:');
console.log(`  한자: ${ipchun.hanja}`);
console.log(`  황경: ${ipchun.longitude}°`);
console.log(`  사주월: ${ipchun.sajuMonth}월`);

// 사주 월에 해당하는 절기 목록
const februaryTerms = getSolarTermsBySajuMonth(2);
console.log('\n2월(인월) 절기:');
februaryTerms.forEach(t => {
  console.log(`  - ${t.name} (${t.hanja}): 황경 ${t.longitude}°`);
});

// 24절기 전체 목록 출력
console.log('\n--- 24절기 전체 목록 ---');
const seasons = ['봄 ', '봄 ', '봄 ', '봄 ', '봄 ', '봄 ',
                 '여름', '여름', '여름', '여름', '여름', '여름',
                 '가을', '가을', '가을', '가을', '가을', '가을',
                 '겨울', '겨울', '겨울', '겨울', '겨울', '겨울'];

allTerms.forEach((term, i) => {
  const season = seasons[i];
  const type = term.type === 'jeolgi' ? '절기' : '중기';
  console.log(`${season} ${term.name} (${term.hanja}): ${term.longitude}°, ${type}, ${term.sajuMonth}월`);
});
