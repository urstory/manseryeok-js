/**
 * 한국천문연구원(KASI) 음력 달 표 → src/data/lunar-table.ts 생성
 *
 * 입력: data/kasi/lunar-months.tsv (KASI 음양력 정보제공 서비스에서 받은 1391~2050년 음력 달 목록)
 *   start_jd  lun_year  lun_month  lun_leap  lun_nday  partial
 * 출력: 달마다 1바이트로 압축한 표
 *   bits 0-3: 음력 월 - 1 (0~11)
 *   bit  4  : 윤달
 *   bit  5  : 30일 달(아니면 29일)
 * 음력 연도는 저장하지 않는다(평달 1월이 시작될 때마다 1 증가). 생성 뒤 모든 달을 되살려 원본과 대조한다.
 *
 * 쓰는 법: node scripts/build-lunar-table.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = readFileSync(join(root, 'data/kasi/lunar-months.tsv'), 'utf8').trim().split('\n').slice(1);
const months = lines.map((l) => {
  const [startJd, year, month, leap, nday, partial] = l.split('\t').map(Number);
  return { startJd, year, month, leap: leap === 1, nday, partial: partial === 1 };
});

const bytes = new Uint8Array(months.length);
months.forEach((m, i) => {
  if (m.month < 1 || m.month > 12 || (m.nday !== 29 && m.nday !== 30)) throw new Error(`이상한 달 ${JSON.stringify(m)}`);
  bytes[i] = (m.month - 1) | (m.leap ? 16 : 0) | (m.nday === 30 ? 32 : 0);
});

// 되살려 대조: 시작 JD 연속성, 음력 연도 규칙
let jd = months[0].startJd, year = months[0].year;
for (let i = 0; i < months.length; i++) {
  const b = bytes[i], month = (b & 15) + 1, leap = (b & 16) !== 0, nday = b & 32 ? 30 : 29;
  if (i > 0 && month === 1 && !leap) year++;
  const m = months[i];
  if (m.startJd !== jd || m.year !== year || m.month !== month || m.leap !== leap || m.nday !== nday) {
    throw new Error(`대조 실패 ${i}: 원본 ${JSON.stringify(m)} / 되살림 ${JSON.stringify({ jd, year, month, leap, nday })}`);
  }
  jd += nday;
}
const endJd = jd - 1;

const b64 = Buffer.from(bytes).toString('base64');
const out = `/**
 * 음력 달 표 (자동 생성 — 직접 고치지 마세요. 생성: scripts/build-lunar-table.mjs)
 *
 * 출처: 한국천문연구원(KASI) 음양력 정보제공 서비스(공공데이터포털, 이용허락 제한 없음)
 * 범위: 음력 달 ${months.length}개, JD ${months[0].startJd} ~ ${endJd}
 * 달마다 1바이트: bits 0-3 월-1, bit 4 윤달, bit 5 30일 달
 */

/** 첫 달의 시작 율리우스 적일(JD) */
export const LUNAR_TABLE_START_JD = ${months[0].startJd};
/** 첫 달의 음력 연도 */
export const LUNAR_TABLE_START_YEAR = ${months[0].year};
/** 표가 덮는 마지막 JD */
export const LUNAR_TABLE_END_JD = ${endJd};
/** 달 개수 */
export const LUNAR_TABLE_MONTHS = ${months.length};

export const LUNAR_TABLE_B64 = '${b64}';
`;
writeFileSync(join(root, 'src/data/lunar-table.ts'), out);
console.log(`생성: 달 ${months.length}개, JD ${months[0].startJd}~${endJd}, ${bytes.length}바이트(base64 ${b64.length}자)`);
