/**
 * 24절기 절입 시각 표 → src/data/terms-table.ts 생성
 *
 * 입력: data/terms/solar-terms.tsv  (year, k, utc_minute, source — 시간 차례)
 *       data/terms/uncertainty.tsv  (from_year, to_year, minutes)
 *       data/terms/kasi-24div.tsv   (한국천문연구원 발표값 — 대조용)
 * 출력: 절입 순간(UTC 분)을 차분으로 압축한 표
 *   - 첫 값과 처음 24개 간격은 숫자로 그대로 싣는다.
 *   - 그 뒤 간격 d[i]는 24개 앞의 같은 절기 간격 d[i-24]와의 차이(-13~+13분)를 글자 하나(문자 코드 64 + 차이)로 적는다.
 * 생성 뒤 모든 값을 되살려 원본과 대조하고, 표의 성질(간격 14~16.5일, 단조 증가, 절기 번호 차례)과
 * 1920~2028년 한국천문연구원 발표값 2,616개와의 일치를 확인한다. 하나라도 어긋나면 멈춘다.
 *
 * 쓰는 법: node scripts/build-terms-table.mjs [--check]
 *   --check  파일을 쓰지 않고, 지금 src/data/terms-table.ts가 새로 만든 것과 같은지만 본다
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8').replace(/\r/g, '').trim().split('\n');

// ── 원본 읽기 ──
const head = read('data/terms/solar-terms.tsv');
if (head[0] !== 'year\tk\tutc_minute\tsource') throw new Error(`머리줄이 다르다: ${head[0]}`);
const rows = head.slice(1).map((l) => {
  const [year, k, utc, source] = l.split('\t');
  return { year: +year, k: +k, utc: +utc, source };
});

const unc = read('data/terms/uncertainty.tsv');
if (unc[0] !== 'from_year\tto_year\tminutes') throw new Error(`머리줄이 다르다: ${unc[0]}`);
const uncertainty = unc.slice(1).map((l) => l.split('\t').map(Number));

// ── 성질 확인 ──
for (let i = 1; i < rows.length; i++) {
  const gap = rows[i].utc - rows[i - 1].utc;
  if (gap < 14 * 1440 || gap > 16.5 * 1440) throw new Error(`간격 이상 ${i}: ${gap}분`);
  if (rows[i].k !== (rows[i - 1].k + 1) % 24) throw new Error(`절기 번호 차례 이상 ${i}`);
}
for (const r of rows) {
  if (new Date(r.utc * 60000).getUTCFullYear() !== r.year) throw new Error(`해 칸 이상: ${JSON.stringify(r)}`);
  if (r.source !== 'kasi' && r.source !== 'calc') throw new Error(`출처 칸 이상: ${JSON.stringify(r)}`);
}
// uncertainty: 1391~2050을 빈틈없이 덮는가
{
  let y = 1391;
  for (const [from, to, min] of uncertainty) {
    if (from !== y || to < from || !(min >= 1)) throw new Error(`uncertainty.tsv 구간 이상: ${from}~${to}`);
    y = to + 1;
  }
  if (y !== 2051) throw new Error('uncertainty.tsv가 2050년까지 덮지 않는다');
}

// ── 한국천문연구원 발표값과 대조 ──
// 절기 이름 → 절기 번호 k(태양 황경 ÷ 15도)
const NAMES = ['춘분', '청명', '곡우', '입하', '소만', '망종', '하지', '소서', '대서', '입추', '처서', '백로',
  '추분', '한로', '상강', '입동', '소설', '대설', '동지', '소한', '대한', '입춘', '우수', '경칩'];
{
  const kasi = read('data/terms/kasi-24div.tsv');
  if (kasi[0] !== 'year\tname\tlocdate\tkst') throw new Error(`머리줄이 다르다: ${kasi[0]}`);
  const byKey = new Map(rows.map((r) => [`${r.year}-${r.k}`, r]));
  let n = 0;
  for (const l of kasi.slice(1)) {
    const [year, name, locdate, kst] = l.split('\t');
    const k = NAMES.indexOf(name);
    if (k < 0) throw new Error(`모르는 절기 이름 ${name}`);
    const y = +locdate.slice(0, 4), mo = +locdate.slice(4, 6), d = +locdate.slice(6, 8);
    const hh = +kst.slice(0, 2), mm = +kst.slice(2, 4); // 2400은 다음 날 00:00
    const utc = Date.UTC(y, mo - 1, d, hh, mm) / 60000 - 540;
    const r = byKey.get(`${year}-${k}`);
    if (!r || r.utc !== utc || r.source !== 'kasi') throw new Error(`발표값과 다르다: ${l} / ${JSON.stringify(r)}`);
    n++;
  }
  const kasiRows = rows.filter((r) => r.source === 'kasi').length;
  if (n !== 2616 || kasiRows !== 2616) throw new Error(`발표값 개수 이상: ${n}, 표의 kasi ${kasiRows}`);
}

// ── 압축 ──
const ZERO = 64;
const deltas = rows.slice(1).map((r, i) => r.utc - rows[i].utc);
const head24 = deltas.slice(0, 24);
let body = '';
for (let i = 24; i < deltas.length; i++) {
  const v = deltas[i] - deltas[i - 24];
  if (v < -13 || v > 13) throw new Error(`이차 차분이 범위 밖 ${i}: ${v}`);
  body += String.fromCharCode(ZERO + v);
}

// ── 되살려 대조 ──
{
  const d = head24.slice();
  for (let i = 0; i < body.length; i++) d.push(d[i] + body.charCodeAt(i) - ZERO);
  let t = rows[0].utc;
  if (d.length !== rows.length - 1) throw new Error('개수 이상');
  for (let i = 1; i < rows.length; i++) {
    t += d[i - 1];
    if (t !== rows[i].utc) throw new Error(`되살림 대조 실패 ${i}`);
  }
}

const kasiFirst = rows.find((r) => r.source === 'kasi');
const kasiLast = [...rows].reverse().find((r) => r.source === 'kasi');
const out = `/**
 * 24절기 절입 시각 표 (자동 생성 — 직접 고치지 마세요. 생성: scripts/build-terms-table.mjs)
 *
 * 원본: data/terms/solar-terms.tsv (출처·대조 숫자는 data/terms/README.md)
 * - ${kasiFirst.year}~${kasiLast.year}년: 한국천문연구원 24절기 발표값(고정 UTC+9 시계의 분 → UTC)
 * - 나머지: 천문 계산(태양 겉보기 황경이 15도의 배수에 이르는 순간)을 분으로 반올림
 * 범위: ${rows.length}개, ${rows[0].year}년 절기 번호 ${rows[0].k} ~ ${rows[rows.length - 1].year}년 절기 번호 ${rows[rows.length - 1].k}
 * 값: 절입 순간을 분으로 반올림한 절대 시각(1970-01-01T00:00Z부터 센 분)
 * 절기 번호 k = 태양 황경 ÷ 15도 (0 춘분, 21 입춘, 23 경칩 — 홀수가 절)
 * 압축: 처음 간격 24개는 숫자, 그 뒤는 24개 앞 간격과의 차이를 글자 하나(문자 코드 ${ZERO} + 차이)로
 */

/** 첫 절입 순간(UTC 분) */
export const TERMS_START_UTC_MINUTE = ${rows[0].utc};
/** 첫 절기의 번호 k */
export const TERMS_START_K = ${rows[0].k};
/** 절기 개수 */
export const TERMS_COUNT = ${rows.length};
/** 처음 24개 간격(분) */
export const TERMS_HEAD_GAPS = [${head24.join(', ')}];
/** 글자 하나의 0 */
export const TERMS_ZERO = ${ZERO};
/** 24개 앞 간격과의 차이 */
export const TERMS_BODY = '${body}';
/** 앞뒤를 정할 수 없는 폭(분): [시작 해, 끝 해, 분] — data/terms/uncertainty.tsv */
export const TERMS_UNCERTAINTY: ReadonlyArray<readonly [number, number, number]> = [
${uncertainty.map(([a, b, c]) => `  [${a}, ${b}, ${c}],`).join('\n')}
];
`;

const target = join(root, 'src/data/terms-table.ts');
if (process.argv.includes('--check')) {
  let cur = '';
  try { cur = readFileSync(target, 'utf8'); } catch { /* 없음 */ }
  if (cur.replace(/\r/g, '') !== out) {
    console.error('src/data/terms-table.ts가 원본과 다르다. node scripts/build-terms-table.mjs로 다시 만드세요.');
    process.exit(1);
  }
  console.log('terms-table.ts 최신');
} else {
  writeFileSync(target, out);
  console.log(`생성: 절기 ${rows.length}개, 본문 ${body.length}자, 발표값 2,616개 일치`);
}
