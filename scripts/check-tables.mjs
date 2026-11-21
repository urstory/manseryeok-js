/**
 * 생성 파일이 원본(data/)과 같은지 본다: terms-table.ts, tz-seoul.ts, eot-table.ts
 * 쓰는 법: node scripts/check-tables.mjs
 */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
for (const s of ['build-terms-table.mjs', 'build-tz-table.mjs', 'build-eot-table.mjs']) {
  execFileSync(process.execPath, [join(here, s), '--check'], { stdio: 'inherit' });
}
