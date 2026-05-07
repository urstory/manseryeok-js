/**
 * 운세/사주 서비스 통합 예제 (무명신점 같은 사주 사이트)
 *
 * 이 예제는 사주 풀이 웹앱에서 만세력 라이브러리를 어떻게 활용하는지 보여줍니다.
 *
 * 기존 방식 (단순 해시 기반)의 한계:
 *   - 생년월일을 단순히 해시해서 텍스트 풀에서 뽑음
 *   - 사주의 의미가 결과에 반영되지 않음
 *   - 음력/양력 구분이 결과에 영향 없음
 *   - 용신·오행이 진짜 사주 데이터에 근거하지 않음
 *
 * 만세력 라이브러리 통합 후:
 *   1) 음력 입력 시 양력으로 자동 변환
 *   2) 진짜 사주팔자(년·월·일·시주) 계산
 *   3) 오행 분포 8글자 기준으로 산출
 *   4) 가장 부족한 오행 = 용신 후보
 *   5) 실제 갑자 이름을 결과 텍스트에 삽입 (개인화)
 *   6) 진태양시 보정 (지역별 경도)
 */

import {
  calculateSaju,
  calculateSajuSimple,
  lunarToSolar,
  getPillarByHangul,
} from '../dist/index.mjs';

// ────────────────────────────────────────────────────────────
// 1) 시진(時辰) → 시간(hour) 매핑
//    웹폼에서는 '자시', '축시'... 로 받지만 calculateSaju는 0~23 시를 받음
//    각 시진의 중심 시각으로 변환 (분 단위는 0)
// ────────────────────────────────────────────────────────────
const TIME_BRANCH_TO_HOUR = {
  자시: 0,   // 23:30~01:30 → 자정 직후로 처리
  축시: 2,
  인시: 4,
  묘시: 6,
  진시: 8,
  사시: 10,
  오시: 12,
  미시: 14,
  신시: 16,
  유시: 18,
  술시: 20,
  해시: 22,
};

// ────────────────────────────────────────────────────────────
// 2) 폼 데이터 → 사주 컨텍스트 빌드
//    음력이면 양력으로 변환 후 calculateSaju 호출
// ────────────────────────────────────────────────────────────
function buildSajuContext(formData) {
  let year = parseInt(formData.y, 10);
  let month = parseInt(formData.m, 10);
  let day = parseInt(formData.d, 10);
  const cal = formData.cal || '양력';
  const time = formData.time || '모름';
  const gender = formData.gender || '남';

  // 음력 입력이면 양력으로 변환 (라이브러리 핵심 기능)
  if (cal === '음력') {
    const converted = lunarToSolar(year, month, day, false);
    year = converted.solar.year;
    month = converted.solar.month;
    day = converted.solar.day;
  }

  // 시진을 알면 시주(時柱)까지 포함해 계산
  const hour = TIME_BRANCH_TO_HOUR[time];
  const saju = hour !== undefined
    ? calculateSajuSimple(year, month, day, hour)  // 분 단위 정밀도 없으니 보정 없이
    : calculateSajuSimple(year, month, day);

  return {
    solar: { year, month, day },
    inputCal: cal,
    timeBranch: time,
    gender,
    saju,
    elements: computeElementDistribution(saju),
  };
}

// ────────────────────────────────────────────────────────────
// 3) 오행 분포 계산
//    사주팔자 = 8글자(천간 4 + 지지 4)의 오행 카운트
// ────────────────────────────────────────────────────────────
function computeElementDistribution(saju) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar];
  if (saju.hourPillar) pillars.push(saju.hourPillar);

  for (const pillar of pillars) {
    const data = getPillarByHangul(pillar);
    if (!data) continue;
    counts[data.tiangan.element] = (counts[data.tiangan.element] || 0) + 1;
    counts[data.dizhi.element] = (counts[data.dizhi.element] || 0) + 1;
  }
  return counts;
}

// ────────────────────────────────────────────────────────────
// 4) 용신 추정
//    가장 부족한 오행 = 보충해야 할 기운 (정통 명리학에서는 더 복잡하지만,
//    이 사이트의 용신사주 풀이엔 충분히 의미 있는 기준)
// ────────────────────────────────────────────────────────────
function estimateYongsin(elements) {
  const sorted = Object.entries(elements).sort((a, b) => a[1] - b[1]);
  const lacking = sorted[0][0];
  const dominant = sorted[sorted.length - 1][0];
  return { lacking, dominant, distribution: elements };
}

// ────────────────────────────────────────────────────────────
// 5) 결과 텍스트 개인화
//    기존엔 "당신의 사주는 ..." 같이 두루뭉술했지만,
//    이제 실제 갑자/오행을 본문에 박아 넣을 수 있음
// ────────────────────────────────────────────────────────────
function personalizeIntro(ctx) {
  const { saju, elements } = ctx;
  const yongsin = estimateYongsin(elements);
  const dayPillarData = getPillarByHangul(saju.dayPillar);
  const dayMaster = dayPillarData?.tiangan.korean || saju.dayPillar[0];
  const dayElement = dayPillarData?.tiangan.element || '?';

  return [
    `── 사주팔자 ──`,
    `  년주: ${saju.yearPillar} (${saju.yearPillarHanja})`,
    `  월주: ${saju.monthPillar} (${saju.monthPillarHanja})`,
    `  일주: ${saju.dayPillar} (${saju.dayPillarHanja})  ← 일간(日干): ${dayMaster}(${dayElement})`,
    saju.hourPillar
      ? `  시주: ${saju.hourPillar} (${saju.hourPillarHanja})`
      : `  시주: 미상 (생시 모름)`,
    ``,
    `── 오행 분포 ──`,
    `  목 ${elements.목} · 화 ${elements.화} · 토 ${elements.토} · 금 ${elements.금} · 수 ${elements.수}`,
    `  → 가장 강한 기운: ${yongsin.dominant} / 가장 부족한 기운: ${yongsin.lacking}`,
    `  → 용신 후보: ${yongsin.lacking}(${yongsin.lacking}을 보충하는 색·방위·직업)`,
    ``,
  ].join('\n');
}

// ────────────────────────────────────────────────────────────
// 6) 사주 컨텍스트로부터 안정적 해시 시드 만들기
//    같은 갑자라도 시진/성별로 다르게 갈리도록.
//    텍스트 풀에서 뽑을 때 이 시드를 쓰면 결과가 더 의미 있음
// ────────────────────────────────────────────────────────────
function buildSeedFromSaju(ctx, type) {
  const { saju, gender } = ctx;
  return [
    saju.yearPillar,
    saju.monthPillar,
    saju.dayPillar,
    saju.hourPillar || 'NA',
    gender,
    type,
  ].join('|');
}

// ════════════════════════════════════════════════════════════
// 데모: 다양한 입력으로 어떻게 동작하는지
// ════════════════════════════════════════════════════════════

console.log('================================================');
console.log('  사주 사이트 통합 예제 (만세력 라이브러리 활용)');
console.log('================================================\n');

// 케이스 1: 양력, 시진 알고 있음
console.log('┌─ 케이스 1: 1990-05-15 14시(미시) 출생, 양력, 남 ─');
const ctx1 = buildSajuContext({
  y: '1990', m: '5', d: '15',
  gender: '남', cal: '양력', time: '미시',
});
console.log(personalizeIntro(ctx1));
console.log('해시 시드:', buildSeedFromSaju(ctx1, 'saju'));

// 케이스 2: 음력 입력 → 양력 변환
console.log('\n┌─ 케이스 2: 음력 1990-04-21 14시(미시), 여 ─');
const ctx2 = buildSajuContext({
  y: '1990', m: '4', d: '21',
  gender: '여', cal: '음력', time: '미시',
});
console.log(`(음력 1990-04-21 → 양력 ${ctx2.solar.year}-${ctx2.solar.month}-${ctx2.solar.day})`);
console.log(personalizeIntro(ctx2));
console.log('→ 케이스 1과 같은 양력일이면 사주가 동일해야 함');

// 케이스 3: 시진 모름
console.log('\n┌─ 케이스 3: 2000-01-01, 시진 모름 ─');
const ctx3 = buildSajuContext({
  y: '2000', m: '1', d: '1',
  gender: '남', cal: '양력', time: '모름',
});
console.log(personalizeIntro(ctx3));

// 케이스 4: 같은 양력일/시간이라도 성별 다르면 시드 달라짐
console.log('\n┌─ 케이스 4: 같은 사주, 성별만 다름 ─');
const male = buildSajuContext({ y: '1995', m: '7', d: '20', gender: '남', cal: '양력', time: '오시' });
const female = buildSajuContext({ y: '1995', m: '7', d: '20', gender: '여', cal: '양력', time: '오시' });
console.log('남자 시드:', buildSeedFromSaju(male, 'gunghap'));
console.log('여자 시드:', buildSeedFromSaju(female, 'gunghap'));
console.log('→ 사주는 같지만 시드가 다르므로 풀이도 다르게 나옴');

console.log('\n================================================');
console.log('  실제 사이트 적용 가이드');
console.log('================================================');
console.log(`
api/fortune.js 의 generateReading() 안에서 이렇게 쓰면 됩니다:

  import {
    calculateSajuSimple, lunarToSolar, getPillarByHangul,
  } from '@fullstackfamily/manseryeok';

  function generateReading(type, formData) {
    const ctx = buildSajuContext(formData);
    const seed = buildSeedFromSaju(ctx, type);

    // 기존: const seed = y + '|' + m + '|' + d + '|' + gender + '|' + time + '|' + type;
    // 변경: 위처럼 갑자 기반 시드를 사용

    const intro = personalizeIntro(ctx);  // 진짜 사주팔자/오행 헤더
    const body  = pickFromTextPools(seed, type);  // 기존 텍스트 풀 로직 그대로

    return intro + '\\n\\n' + body;
  }

용신사주(yongsin) 풀이는 estimateYongsin(ctx.elements).lacking 으로
가장 부족한 오행을 진짜 데이터로 결정해서 분기시키면 됩니다.
`);
