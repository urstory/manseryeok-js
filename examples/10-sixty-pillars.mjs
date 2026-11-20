/**
 * 60갑자 데이터 직접 조회
 *
 * 60갑자 데이터를 직접 조회하는 예제입니다.
 */

import { SIXTY_PILLARS, getPillarById, getPillarByHangul } from '../dist/index.mjs';

// 디버깅: SIXTY_PILLARS 구조 확인
// console.log('SIXTY_PILLARS[0]:', JSON.stringify(SIXTY_PILLARS[0], null, 2));

console.log('========================================');
console.log('60갑자 데이터 조회');
console.log('========================================\n');

// 전체 60갑자 목록
console.log('총 60갑자 개수:', SIXTY_PILLARS.length);

// ID로 조회 (0~59)
const pillar = getPillarById(0);
console.log('\n0번 갑자:');
console.log(`  이름: ${pillar.combined.hangul} / ${pillar.combined.hanja}`);
console.log(`  오행: ${pillar.element}`);
console.log(`  음양: ${pillar.yinYang}`);

// 한글 이름으로 조회
const found = getPillarByHangul('갑자');
console.log('\n"갑자" 검색 결과:');
console.log(`  ID: ${found?.id}`);
console.log(`  오행: ${found?.element}`);
console.log(`  음양: ${found?.yinYang}`);

// 일부 60갑자 목록 출력
console.log('\n--- 60갑자 일부 (처음 10개) ---');
SIXTY_PILLARS.slice(0, 10).forEach(p => {
  const stem = p.tiangan.hangul;
  const branch = p.dizhi.hangul;
  const combined = p.combined.hangul;
  const combinedHanja = p.combined.hanja;
  console.log(`  ${combined} (${combinedHanja}) - ${stem}${branch} (${p.element}, ${p.yinYang})`);
});
