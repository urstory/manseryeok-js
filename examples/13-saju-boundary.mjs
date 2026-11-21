/**
 * 절입일의 연주·월주 (1.2.0)
 *
 * 연주·월주는 절(입춘·경칩 …)이 드는 순간에 바뀝니다. 절이 든 날에 날짜만 넣으면 그날 정오의 값을 주고,
 * sajuBoundary로 "몇 시 몇 분에 바뀌는지, 앞이면 무엇·뒤면 무엇"을 함께 줍니다.
 */

import { solarToLunar, getGapjaAt, calculateSaju, getJeolAround } from '../dist/index.mjs';

console.log('========================================');
console.log('절입일의 연주·월주 (2024년 입춘)');
console.log('========================================\n');

// 1. 날짜만: 그날 정오의 값 + 경계 정보
const r = solarToLunar(2024, 2, 4);
console.log(`2024-02-04 날짜만: ${r.gapja.yearPillar}년 ${r.gapja.monthPillar}월`);
const b = r.sajuBoundary;
if (b) {
  const hhmm = `${b.at.hour}:${String(b.at.minute).padStart(2, '0')}`;
  console.log(`  ${b.term.name} ${hhmm}에 바뀝니다`);
  console.log(`  ${hhmm} 전: ${b.before.yearPillar}년 ${b.before.monthPillar}월`);
  console.log(`  ${hhmm}부터: ${b.after.yearPillar}년 ${b.after.monthPillar}월`);
  console.log(`  날짜만 넣은 값은 '${b.chosen}' 쪽입니다(앞뒤 ${b.uncertainMinutes}분은 정할 수 없음)`);
  console.log('  → 태어난 시각을 물어보세요');
}

// 2. 시각을 주면 절입 시각과 견줘 정확히
console.log('\n시각을 줌:');
for (const [h, m] of [[9, 0], [17, 26], [17, 27], [21, 0]]) {
  const g = getGapjaAt(2024, 2, 4, h, m);
  console.log(`  ${h}:${String(m).padStart(2, '0')} → ${g.yearPillar}년 ${g.monthPillar}월${g.nearBoundary ? ' (절입과 너무 가까워 앞뒤를 정할 수 없음)' : ''}`);
}

// 3. 달력처럼 절기가 든 날부터 새 달로 보여 주려면
const cal = solarToLunar(2024, 2, 4, { boundaryRule: 'day-end' });
console.log(`\n달력 표기(day-end): ${cal.gapja.yearPillar}년 ${cal.gapja.monthPillar}월`);

// 4. 1950년대 한국 시계(UTC+8:30·서머타임)
const s = calculateSaju(1960, 6, 1, 12, 0);
if (s.clockNotice) console.log(`\n1960-06-01 12:00 알림: ${s.clockNotice.message}`);
const legal = calculateSaju(1960, 6, 1, 12, 0, { clock: 'korea-legal' });
console.log(`  korea-legal로 셈한 시주: ${legal.hourPillar}`);

// 5. 직전 절·다음 절 (대운 계산 등)
const around = getJeolAround(1990, 5, 15, 14, 30);
console.log(`\n1990-05-15 14:30의 직전 절: ${around.prev.name} ${around.prev.month}/${around.prev.day} ${around.prev.hour}:${String(around.prev.minute).padStart(2, '0')}`);
console.log(`                다음 절: ${around.next.name} ${around.next.month}/${around.next.day} ${around.next.hour}:${String(around.next.minute).padStart(2, '0')}`);
