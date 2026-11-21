/**
 * 한국 법정 시계(IANA tz database의 Asia/Seoul) → src/data/tz-seoul.ts 생성
 *
 * 입력: data/tz/asia-seoul.tzdata (tz database `asia` 파일의 Rule ROK·Zone Asia/Seoul 줄을 그대로 옮긴 것, 공개 도메인)
 * 출력: UTC 차이가 바뀌는 순간의 목록 [UTC 초, 바뀐 뒤 UTC 차이(초), 서머타임 여부]
 *
 * 이 파일에 나오는 꼴만 읽는다(zic의 일부): ON은 날짜 숫자·`Sun>=8` 꼴·`lastSun` 꼴, AT은 `H:MM`(접미사 없음 = 벽시계,
 * `s` = 표준시, `u` = UTC), UNTIL은 `해 [달 [날]]`. 모르는 꼴이면 멈춘다.
 * 플랫폼의 Intl 자료에 기대지 않으려고 상수로 싣는다(환경마다 tz 자료 판이 다르다).
 *
 * 쓰는 법: node scripts/build-tz-table.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'data/tz/asia-seoul.tzdata'), 'utf8').replace(/\r/g, '');
const lines = src.split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "8:27:52" → 초 */
function hms(s) {
  const neg = s.startsWith('-');
  const p = s.replace('-', '').split(':').map(Number);
  const v = (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
  return neg ? -v : v;
}
const monthOf = (s) => { const m = MONTHS.indexOf(s); if (m < 0) throw new Error(`모르는 달 ${s}`); return m; };

/** 해·달(0~11)·ON → 그날 0시의 UTC 초(벽시계 날짜를 그대로 UTC처럼 센 값) */
function dayStart(year, month, on) {
  let m;
  if (/^\d+$/.test(on)) return Date.UTC(year, month, +on) / 1000;
  if ((m = /^(\w{3})>=(\d+)$/.exec(on))) {
    const dow = DOW.indexOf(m[1]);
    if (dow < 0) throw new Error(`모르는 요일 ${on}`);
    let d = +m[2];
    while (new Date(Date.UTC(year, month, d)).getUTCDay() !== dow) d++;
    return Date.UTC(year, month, d) / 1000;
  }
  if ((m = /^last(\w{3})$/.exec(on))) {
    const dow = DOW.indexOf(m[1]);
    let d = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    while (new Date(Date.UTC(year, month, d)).getUTCDay() !== dow) d--;
    return Date.UTC(year, month, d) / 1000;
  }
  throw new Error(`모르는 ON 꼴 ${on}`);
}

/** AT → [초, 'w'|'s'|'u'] */
function atOf(s) {
  const m = /^(-?\d+(?::\d+){0,2})([wsugz]?)$/.exec(s);
  if (!m) throw new Error(`모르는 AT 꼴 ${s}`);
  const kind = m[2] === 'g' || m[2] === 'z' ? 'u' : m[2] || 'w';
  return [hms(m[1]), kind];
}

// ── Rule ──
const rules = {};
for (const f of lines.filter((l) => l[0] === 'Rule')) {
  const [, name, from, to, , inMonth, on, at, save] = f;
  const y0 = +from;
  const y1 = to === 'only' ? y0 : +to;
  for (let y = y0; y <= y1; y++) {
    const [atSec, kind] = atOf(at);
    (rules[name] ||= []).push({ local: dayStart(y, monthOf(inMonth), on) + atSec, kind, save: hms(save) });
  }
}

// ── Zone (첫 줄은 'Zone 이름 …', 이어지는 줄은 이름 없이) ──
const zoneLines = [];
let inZone = false;
for (const f of lines) {
  if (f[0] === 'Zone') { if (f[1] !== 'Asia/Seoul') throw new Error('Asia/Seoul만 다룬다'); inZone = true; zoneLines.push(f.slice(2)); }
  else if (f[0] === 'Rule') inZone = false;
  else if (inZone) zoneLines.push(f);
}
if (zoneLines.length === 0) throw new Error('Zone Asia/Seoul이 없다');

/** 규칙 사건의 UTC 순간(표준 차이 std, 그 직전의 save) */
const utcOfRule = (e, std, prevSave) => e.local - (e.kind === 'u' ? 0 : e.kind === 's' ? std : std + prevSave);

const periods = []; // { start: UTC 초(첫 줄은 -Infinity), offset, dst }
let lineStart = -Infinity;
let save = 0;
for (const z of zoneLines) {
  const [stdoffStr, ruleName, , ...until] = z;
  const std = hms(stdoffStr);
  const events = ruleName === '-' ? [] : rules[ruleName];
  if (ruleName !== '-' && !events) throw new Error(`없는 규칙 ${ruleName}`);
  // 이 줄이 시작할 때의 save: 시작 전 마지막 규칙 사건
  save = 0;
  if (events) {
    let prev = 0;
    for (const e of [...events].sort((a, b) => a.local - b.local)) {
      if (utcOfRule(e, std, prev) <= lineStart) { save = e.save; prev = e.save; }
    }
  }
  const push = (start, offset, dst) => {
    const last = periods[periods.length - 1];
    if (last && last.offset === offset && last.dst === dst) return;
    periods.push({ start, offset, dst });
  };
  push(lineStart, std + save, save !== 0);

  let untilUtc = Infinity;
  const untilLocal = until.length
    ? dayStart(+until[0], until[1] ? monthOf(until[1]) : 0, until[2] || '1') + (until[3] ? atOf(until[3])[0] : 0)
    : Infinity;

  if (events) {
    for (const e of [...events].sort((a, b) => a.local - b.local)) {
      const t = utcOfRule(e, std, save);
      if (t <= lineStart) continue;
      const uLimit = untilLocal - std - save;
      if (t >= uLimit) break;
      save = e.save;
      push(t, std + save, save !== 0);
    }
  }
  untilUtc = untilLocal - std - save;
  lineStart = untilUtc;
  if (untilUtc === Infinity) break;
}

const transitions = periods.slice(1).map((p) => [p.start, p.offset, p.dst ? 1 : 0]);
if (transitions.length !== 28) throw new Error(`전이 개수가 28이 아니다: ${transitions.length}`);
for (let i = 1; i < transitions.length; i++) if (transitions[i][0] <= transitions[i - 1][0]) throw new Error('전이 차례 이상');

const fmt = (sec) => new Date(sec * 1000).toISOString().slice(0, 16).replace('T', ' ') + 'Z';
const fmtOff = (o) => `UTC+${Math.floor(o / 3600)}:${String(Math.floor((o % 3600) / 60)).padStart(2, '0')}${o % 60 ? ':' + String(o % 60).padStart(2, '0') : ''}`;
const out = `/**
 * 한국 법정 시계의 UTC 차이 전이 (자동 생성 — 직접 고치지 마세요. 생성: scripts/build-tz-table.mjs)
 *
 * 원본: data/tz/asia-seoul.tzdata (IANA tz database 2026f \`asia\` 파일의 Rule ROK·Zone Asia/Seoul, 공개 도메인)
 * 처음 차이: ${fmtOff(periods[0].offset)}(지방 평균시). 그 뒤 전이 ${transitions.length}개.
 */

/** 첫 전이 전의 UTC 차이(초) */
export const TZ_SEOUL_INITIAL_OFFSET = ${periods[0].offset};

/** [전이 순간(UTC 초), 그 뒤 UTC 차이(초), 서머타임이면 1] */
export const TZ_SEOUL_TRANSITIONS: ReadonlyArray<readonly [number, number, number]> = [
${transitions.map(([t, o, d]) => `  [${t}, ${o}, ${d}], // ${fmt(t)} → ${fmtOff(o)}${d ? ' 서머타임' : ''}`).join('\n')}
];
`;

const target = join(root, 'src/data/tz-seoul.ts');
if (process.argv.includes('--check')) {
  let cur = '';
  try { cur = readFileSync(target, 'utf8'); } catch { /* 없음 */ }
  if (cur.replace(/\r/g, '') !== out) {
    console.error('src/data/tz-seoul.ts가 원본과 다르다. node scripts/build-tz-table.mjs로 다시 만드세요.');
    process.exit(1);
  }
  console.log('tz-seoul.ts 최신');
} else {
  writeFileSync(target, out);
  console.log(`생성: 전이 ${transitions.length}개`);
}
