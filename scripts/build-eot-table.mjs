/**
 * 균시차 표 → src/data/eot-table.ts 생성
 *
 * 입력: data/eot/eot-*.tsv (jd, eot_sec — 날마다 12:00 UT, scripts/build-eot-source.mjs가 만든다)
 * 출력: 초 단위 정수로 고른 값을 차분으로 압축한 표
 *   - 값 고르기: 날마다 원본에서 ±0.75초 안의 정수 가운데, 이차 차분이 0인 날이 가장 많아지는 줄을 고른다
 *     (비터비 — 이차 차분 ±1은 1점, ±2는 2.5점, 합이 가장 작은 줄). 그냥 반올림(±0.5초)하면 반올림 잡음 때문에
 *     이차 차분이 고르게 흩어져 gzip이 약 16KB, 이렇게 고르면 약 12KB다(data/eot/README.md).
 *   - 처음 두 값은 숫자로 그대로 싣는다.
 *   - 그 뒤 값 v[i]는 이차 차분 v[i] − 2·v[i−1] + v[i−2](−2~+2초)를 글자 하나(문자 코드 64 + 차분)로 적는다.
 * 생성 뒤 모든 값을 되살려 대조하고, 모든 값이 원본에서 ±0.75초 안인지, JD가 하루씩 빈틈없이 이어지는지,
 * 값이 ±17분 안인지 본다.
 *
 * 쓰는 법: node scripts/build-eot-table.mjs [--check]
 *   --check  파일을 쓰지 않고, 지금 src/data/eot-table.ts가 새로 만든 것과 같은지만 본다
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'data/eot');

// ── 원본 읽기 ──
const rows = [];
for (const f of readdirSync(dir).filter((f) => /^eot-\d+xx\.tsv$/.test(f)).sort()) {
  const lines = readFileSync(join(dir, f), 'utf8').replace(/\r/g, '').trim().split('\n');
  if (lines[0] !== 'jd\teot_sec') throw new Error(`${f} 머리줄이 다르다: ${lines[0]}`);
  for (const l of lines.slice(1)) {
    const [jd, v] = l.split('\t');
    rows.push({ jd: +jd, v: +v });
  }
}
rows.sort((a, b) => a.jd - b.jd);
for (let i = 0; i < rows.length; i++) {
  if (!Number.isInteger(rows[i].jd) || (i && rows[i].jd !== rows[i - 1].jd + 1)) throw new Error(`JD가 이어지지 않는다: ${rows[i].jd}`);
  if (!Number.isFinite(rows[i].v) || Math.abs(rows[i].v) > 17 * 60) throw new Error(`값 이상: ${JSON.stringify(rows[i])}`);
}

// ── 값 고르기 ──
const TOL = 0.75;
/** 원본 v에서 ±TOL 안의 정수 줄 가운데 이차 차분 점수 합이 가장 작은 것 */
function chooseIntegers(v) {
  const cands = v.map((x) => {
    const a = [];
    for (let k = Math.ceil(x - TOL); k <= Math.floor(x + TOL); k++) a.push(k);
    return a;
  });
  // 상태 = (q[i−1], q[i])
  let states = new Map();
  for (const a of cands[0]) for (const b of cands[1]) states.set(`${a},${b}`, { cost: 0, back: null, a, b });
  for (let i = 2; i < v.length; i++) {
    const next = new Map();
    for (const st of states.values()) {
      for (const c of cands[i]) {
        const d = c - 2 * st.b + st.a;
        if (Math.abs(d) > 2) continue;
        const cost = st.cost + (d === 0 ? 0 : Math.abs(d) === 1 ? 1 : 2.5);
        const key = `${st.b},${c}`;
        const cur = next.get(key);
        if (!cur || cost < cur.cost) next.set(key, { cost, back: st, a: st.b, b: c });
      }
    }
    if (next.size === 0) throw new Error(`고를 수 있는 줄이 없다: ${i}`);
    states = next;
  }
  let best = null;
  for (const st of states.values()) if (!best || st.cost < best.cost) best = st;
  const out = [];
  let st = best;
  while (st.back) {
    out.push(st.b);
    st = st.back;
  }
  out.push(st.b, st.a);
  return out.reverse();
}
const q = chooseIntegers(rows.map((r) => r.v));
if (q.length !== rows.length) throw new Error('개수 이상');
for (let i = 0; i < q.length; i++) {
  if (Math.abs(q[i] - rows[i].v) > TOL + 1e-9) throw new Error(`원본과 ${TOL}초 넘게 다르다: ${rows[i].jd}`);
}

// ── 압축 ──
const ZERO = 64;
let body = '';
for (let i = 2; i < q.length; i++) {
  const d = q[i] - 2 * q[i - 1] + q[i - 2];
  if (d < -2 || d > 2) throw new Error(`이차 차분이 범위 밖 ${rows[i].jd}: ${d}`);
  body += String.fromCharCode(ZERO + d);
}

// ── 되살려 대조 ──
{
  const v = [q[0], q[1]];
  for (let i = 0; i < body.length; i++) v.push(2 * v[i + 1] - v[i] + body.charCodeAt(i) - ZERO);
  if (v.length !== q.length) throw new Error('개수 이상');
  for (let i = 0; i < q.length; i++) if (v[i] !== q[i]) throw new Error(`되살림 대조 실패 ${rows[i].jd}`);
}

const out = `/**
 * 균시차 표 (자동 생성 — 직접 고치지 마세요. 생성: scripts/build-eot-table.mjs)
 *
 * 원본: data/eot/eot-*.tsv (만든 법·대조 숫자는 data/eot/README.md)
 * 값: 날마다 12:00 UT의 균시차(시태양시 − 평균 태양시), 초 단위 정수. 원본에서 ±${TOL}초 안
 * 범위: JD ${rows[0].jd} ~ ${rows[rows.length - 1].jd} (${rows.length}일. 앞뒤 이틀씩은 UTC−12~+14 시계와 보간용)
 * 압축: 처음 두 값은 숫자, 그 뒤는 이차 차분(−2~+2초)을 글자 하나(문자 코드 ${ZERO} + 차분)로
 */

/** 첫 값의 JD(그날 12:00 UT) */
export const EOT_START_JD = ${rows[0].jd};
/** 값 개수 */
export const EOT_COUNT = ${rows.length};
/** 처음 두 값(초) */
export const EOT_HEAD: readonly [number, number] = [${q[0]}, ${q[1]}];
/** 글자 하나의 0 */
export const EOT_ZERO = ${ZERO};
/** 이차 차분 */
export const EOT_BODY = '${body}';
`;

const target = join(root, 'src/data/eot-table.ts');
if (process.argv.includes('--check')) {
  let cur = '';
  try { cur = readFileSync(target, 'utf8'); } catch { /* 없음 */ }
  if (cur.replace(/\r/g, '') !== out) {
    console.error('src/data/eot-table.ts가 원본과 다르다. node scripts/build-eot-table.mjs로 다시 만드세요.');
    process.exit(1);
  }
  console.log('eot-table.ts 최신');
} else {
  writeFileSync(target, out);
  console.log(`생성: 균시차 ${rows.length}일, 본문 ${body.length}자`);
}
