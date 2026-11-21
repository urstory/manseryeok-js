/**
 * 균시차 표를 독립 출처(JPL Horizons, DE441)와 대조한다
 *
 * Horizons에서 그리니치(경도 0, 위도 0, 높이 0, 대기 굴절 없음)에서 본 태양의 겉보기 시간각(LHA, 시)을 받아
 *   균시차 = LHA − (UT − 12시)   (±12시로 접음)
 * 로 셈한다. 시태양시 − 평균 태양시의 정의 그대로라 Meeus 식과 계산 경로가 겹치지 않는다.
 * Horizons의 UT는 1962년 전 UT1, 뒤는 UTC(UT1과 0.9초 안)다.
 *
 * 표본(고정 씨앗 난수, 표본은 data/eot/horizons-sample.tsv에 저장해 다시 받지 않는다):
 *   - 1900~2050년 날마다 12:00 UT(표의 마디) 300일
 *   - 1800~1899년 12:00 UT 40일
 *   - 1900~2050년 마디 사이 아무 시각 30개(보간 확인)
 *   - 1391·1600·1800년 12:00 UT 각 5일(Meeus 식만 — 표는 1800년부터)
 *
 * 쓰는 법: node scripts/check-eot-horizons.mjs [--fetch]
 *   --fetch  Horizons에 요청해 표본 파일을 새로 만든다(요청 5번, 사이에 2초 쉼)
 *   없으면  저장한 표본으로 대조만 한다
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { equationOfTime, yearOfJd } from './build-eot-source.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const samplePath = join(root, 'data/eot/horizons-sample.tsv');

// ── 표본 ──
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const JD_1391 = 2229063; // 1391-01-01 (율리우스력)
const JD_1600 = 2305448; // 1600-01-01
const JD_1800 = 2378497; // 1800-01-01
const JD_1900 = 2415021; // 1900-01-01
const JD_2051 = 2470173; // 2051-01-01
function samples() {
  const r = rng(20261122);
  const out = [];
  const pick = (n, a, b, kind, frac = false) => {
    for (let i = 0; i < n; i++) {
      const jd = a + Math.floor(r() * (b - a));
      out.push({ jd: frac ? jd + Math.round(r() * 1440) / 1440 - 0.5 : jd, kind });
    }
  };
  pick(300, JD_1900, JD_2051, 'node');
  pick(40, JD_1800, JD_1900, 'node');
  pick(30, JD_1900, JD_2051, 'between', true);
  pick(5, JD_1391, JD_1391 + 365, 'formula');
  pick(5, JD_1600, JD_1600 + 366, 'formula');
  pick(5, JD_1800, JD_1800 + 365, 'formula');
  return out;
}

async function fetchHorizons(list) {
  const base = 'https://ssd.jpl.nasa.gov/api/horizons.api';
  const params = {
    format: 'text', COMMAND: "'10'", OBJ_DATA: "'NO'", MAKE_EPHEM: "'YES'", EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'coord@399'", COORD_TYPE: "'GEODETIC'", SITE_COORD: "'0,0,0'", TIME_TYPE: "'UT'",
    CAL_FORMAT: "'JD'", QUANTITIES: "'42'", ANG_FORMAT: "'DEG'", EXTRA_PREC: "'YES'", CSV_FORMAT: "'YES'",
  };
  const out = new Map();
  for (let i = 0; i < list.length; i += 80) {
    const chunk = list.slice(i, i + 80);
    const all = { ...params, TLIST: chunk.map((s) => s.jd.toFixed(6)).join(' ') };
    const q = Object.entries(all).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const res = await fetch(`${base}?${q}`);
    const text = await res.text();
    const body = text.split('$$SOE')[1]?.split('$$EOE')[0];
    if (!body) throw new Error(`Horizons 응답 이상:\n${text.slice(0, 2000)}`);
    for (const line of body.trim().split('\n')) {
      const cells = line.split(',').map((c) => c.trim());
      const jd = Number(cells[0]);
      const lha = Number(cells[cells.length - 2] || cells[cells.length - 1]);
      if (!Number.isFinite(jd) || !Number.isFinite(lha)) throw new Error(`줄 이상: ${line}`);
      out.set(jd.toFixed(6), lha);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return out;
}

/** Horizons LHA(시)와 UT JD → 균시차(초) */
function eotFromLha(jd, lhaHours) {
  const ut = (jd + 0.5 - Math.floor(jd + 0.5)) * 24; // 0시부터 센 시
  let e = lhaHours - (ut - 12);
  e = ((e % 24) + 36) % 24 - 12;
  return e * 3600;
}

/** 라이브러리와 같은 값: src/data/eot-table.ts를 되살려 마디 사이를 선형 보간 */
function loadTable() {
  const ts = readFileSync(join(root, 'src/data/eot-table.ts'), 'utf8');
  const num = (name) => Number(ts.match(new RegExp(`export const ${name} = (-?\\d+);`))[1]);
  const start = num('EOT_START_JD');
  const count = num('EOT_COUNT');
  const zero = num('EOT_ZERO');
  const head = ts.match(/EOT_HEAD: readonly \[number, number\] = \[(-?\d+), (-?\d+)\]/).slice(1).map(Number);
  const body = ts.match(/EOT_BODY = '([^']*)'/)[1];
  const v = [head[0], head[1]];
  for (let i = 0; i < body.length; i++) v.push(2 * v[i + 1] - v[i] + body.charCodeAt(i) - zero);
  if (v.length !== count) throw new Error('eot-table.ts 개수 이상');
  return (jd) => {
    const a = Math.floor(jd);
    const f = jd - a;
    const va = v[a - start];
    const vb = v[a + 1 - start];
    if (va === undefined || vb === undefined) return undefined;
    return va + (vb - va) * f;
  };
}

async function main() {
  const list = samples();
  if (process.argv.includes('--fetch')) {
    const got = await fetchHorizons(list);
    const lines = ['jd_ut\tkind\tlha_hours\teot_sec'];
    for (const s of list) {
      const lha = got.get(s.jd.toFixed(6));
      if (lha === undefined) throw new Error(`응답에 없음: ${s.jd}`);
      lines.push(`${s.jd.toFixed(6)}\t${s.kind}\t${lha}\t${eotFromLha(s.jd, lha).toFixed(3)}`);
    }
    writeFileSync(samplePath, lines.join('\n') + '\n');
    console.log(`표본 ${list.length}개 저장`);
  }
  const rows = readFileSync(samplePath, 'utf8').replace(/\r/g, '').trim().split('\n').slice(1).map((l) => {
    const [jd, kind, , eot] = l.split('\t');
    return { jd: +jd, kind, h: +eot };
  });
  const table = loadTable();
  const stat = {};
  const add = (key, d) => {
    const s = (stat[key] ??= { n: 0, max: 0, sum: 0 });
    s.n++;
    s.sum += Math.abs(d);
    s.max = Math.max(s.max, Math.abs(d));
  };
  for (const r of rows) {
    const y = yearOfJd(Math.floor(r.jd + 0.5));
    const band = r.kind === 'formula' ? `${y < 1500 ? 1391 : y < 1700 ? 1600 : 1800}년` : y < 1900 ? '1800~1899' : '1900~2050';
    add(`식 ${band}${r.kind === 'between' ? ' (마디 사이)' : ''}`, equationOfTime(r.jd) - r.h);
    if (r.kind !== 'formula') {
      const t = table(r.jd);
      if (t === undefined) throw new Error(`표 밖: ${r.jd}`);
      add(`표 ${band}${r.kind === 'between' ? ' (마디 사이)' : ''}`, t - r.h);
    }
  }
  let worstTable = 0;
  console.log('구분\t개수\t평균|차|(초)\t최대|차|(초)');
  for (const [k, s] of Object.entries(stat)) {
    console.log(`${k}\t${s.n}\t${(s.sum / s.n).toFixed(2)}\t${s.max.toFixed(2)}`);
    if (k.startsWith('표')) worstTable = Math.max(worstTable, s.max);
  }
  if (worstTable > 5) {
    console.error(`표와 Horizons 차이가 5초를 넘는다: ${worstTable.toFixed(2)}초`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
