/**
 * 독립 대조 벡터: lunar-javascript(MIT, https://github.com/6tail/lunar-javascript)로 구한 연주·월주
 * → src/__tests__/fixtures/lunar-javascript-grid.tsv
 *
 * 1900~2050년 12절마다 절입 분의 1분 앞과 1분 뒤를 UTC+8 벽시계로 옮겨 lunar-javascript의
 * getYearInGanZhiExact()·getMonthInGanZhiExact()(절입 순간 기준)를 적는다. 테스트는 같은 시각을
 * getGapjaAt(…, { clock: { utcOffsetMinutes: 480 } })으로 셈해 견준다.
 * (절입 분 그 자체는 lunar-javascript가 초 단위로 셈하므로 대조하지 않는다.)
 *
 * lunar-javascript는 개발 의존성으로만 쓰고 꾸러미에는 넣지 않는다. 먼저 `npm run build`.
 * 쓰는 법: node scripts/build-lunar-javascript-vectors.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { Solar } = require('lunar-javascript');
const version = JSON.parse(readFileSync(require.resolve('lunar-javascript/package.json'), 'utf8')).version;
const M = await import(pathToFileURL(join(root, 'dist/index.mjs')).href);

const lines = [
  `# lunar-javascript ${version} (MIT) getYearInGanZhiExact·getMonthInGanZhiExact — 1900~2050 12절 절입 분 ±1분, UTC+8 벽시계`,
  'year\tmonth\tday\thour\tminute\tyear_pillar\tmonth_pillar',
];
for (let y = 1900; y <= 2050; y++) {
  for (const t of M.getSolarTermsByYear(y)) {
    if (t.type !== 'jeolgi') continue;
    const T = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute) / 60000 - 540;
    for (const s of [-1, 1]) {
      const w = new Date((T + s + 480) * 60000);
      const p = [w.getUTCFullYear(), w.getUTCMonth() + 1, w.getUTCDate(), w.getUTCHours(), w.getUTCMinutes()];
      const L = Solar.fromYmdHms(p[0], p[1], p[2], p[3], p[4], 0).getLunar();
      lines.push([...p, L.getYearInGanZhiExact(), L.getMonthInGanZhiExact()].join('\t'));
    }
  }
}
mkdirSync(join(root, 'src/__tests__/fixtures'), { recursive: true });
writeFileSync(join(root, 'src/__tests__/fixtures/lunar-javascript-grid.tsv'), lines.join('\n') + '\n');
console.log(`생성: ${lines.length - 2}줄`);
