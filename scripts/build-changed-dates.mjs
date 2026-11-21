/**
 * 1.1.0과 연주·월주가 달라지는 날짜 목록 → docs/1.2.0-changed-dates.tsv(1900~2050),
 * docs/1.2.0-changed-dates-pre1900.tsv(1391~1899, npm 꾸러미에는 넣지 않음)
 *
 * 1.1.0 값은 npm에 올린 @fullstackfamily/manseryeok@1.1.0(개발 의존성 manseryeok-v110)을 실제로 돌려 얻는다.
 * 1.2.0 값은 이 저장소의 빌드(dist/)다. 먼저 `npm run build`.
 *
 * 줄: 날짜, 1.1.0 연주·월주, 1.2.0 연주·월주(날짜만 넣었을 때의 기본값 'noon' = 그날 정오의 값).
 * 그날 절이 들면 절 이름, 절입 시각(한국 시각 고정 UTC+9), 'day-end'·'day-start' 규칙의 값도 적는다.
 *
 * 쓰는 법: node scripts/build-changed-dates.mjs [--check]
 *   --check  파일을 쓰지 않고 지금 파일이 새로 만든 것과 같은지만 본다
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const NEW = await import(pathToFileURL(join(root, 'dist/index.mjs')).href);
const OLD = require('manseryeok-v110');
if (NEW.SOLAR_TERMS_DATA === undefined || OLD.getGapjaAt !== undefined) throw new Error('라이브러리 판이 이상하다');

const HEAD = ['date', 'v110_year', 'v110_month', 'v120_year', 'v120_month', 'term', 'term_kst', 'day_end_year', 'day_end_month', 'day_start_year', 'day_start_month'].join('\t');
const pad = (n) => String(n).padStart(2, '0');

const rows = { pre: [], main: [] };
const count = {
  julian: { days: 0, month: 0, year: 0 },
  gregPre1900: { days: 0, month: 0, year: 0 },
  modern: { days: 0, month: 0, year: 0 },
};

for (let y = 1391; y <= 2050; y++) {
  for (let m = 1; m <= 12; m++) {
    const idx = NEW.getMonthlyIndex(y, m);
    if (!idx) continue;
    for (const e of idx.entries) {
      const { year, month, day } = e.solar;
      const o = OLD.getGapja(year, month, day);
      const n = NEW.solarToLunar(year, month, day);
      const bucket = y >= 1900 ? count.modern : e.jd < 2299161 ? count.julian : count.gregPre1900;
      bucket.days++;
      const dm = o.monthPillar !== n.gapja.monthPillar;
      const dy = o.yearPillar !== n.gapja.yearPillar;
      if (dm) bucket.month++;
      if (dy) bucket.year++;
      if (!dm && !dy) continue;
      const b = n.sajuBoundary;
      let extra = ['', '', '', '', '', ''];
      if (b) {
        const end = NEW.getGapja(year, month, day, { boundaryRule: 'day-end' });
        const start = NEW.getGapja(year, month, day, { boundaryRule: 'day-start' });
        extra = [b.term.name, `${pad(b.at.hour)}:${pad(b.at.minute)}`, end.yearPillar, end.monthPillar, start.yearPillar, start.monthPillar];
      }
      const line = [`${year}-${pad(month)}-${pad(day)}`, o.yearPillar, o.monthPillar, n.gapja.yearPillar, n.gapja.monthPillar, ...extra].join('\t');
      (y >= 1900 ? rows.main : rows.pre).push(line);
    }
  }
}

const out = {
  'docs/1.2.0-changed-dates.tsv': [HEAD, ...rows.main].join('\n') + '\n',
  'docs/1.2.0-changed-dates-pre1900.tsv': [HEAD, ...rows.pre].join('\n') + '\n',
};

console.log(JSON.stringify(count));
const EXPECT = {
  modern: { days: 55152, month: 884, year: 107 },
  gregPre1900: { days: 115860, month: 1337, year: 124 },
  julian: { days: 70005, month: 20204, year: 1670 },
};
let ok = true;
for (const k of Object.keys(EXPECT)) {
  if (JSON.stringify(count[k]) !== JSON.stringify(EXPECT[k])) {
    console.error(`설계 숫자와 다르다 ${k}: ${JSON.stringify(count[k])} / 기대 ${JSON.stringify(EXPECT[k])}`);
    ok = false;
  }
}

if (process.argv.includes('--check')) {
  for (const [p, text] of Object.entries(out)) {
    let cur = '';
    try { cur = readFileSync(join(root, p), 'utf8').replace(/\r/g, ''); } catch { /* 없음 */ }
    if (cur !== text) { console.error(`${p}가 낡았다`); ok = false; }
  }
} else {
  for (const [p, text] of Object.entries(out)) writeFileSync(join(root, p), text);
  console.log(`생성: 1900~2050 ${rows.main.length}줄, 1391~1899 ${rows.pre.length}줄`);
}
if (!ok) process.exit(1);
