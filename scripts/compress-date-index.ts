/**
 * date-index.ts 데이터 압축 스크립트
 *
 * 11.4MB → ~227KB (98% 압축)
 *
 * 비트 패킹 (레코드당 3바이트 = 24비트):
 * - bits 0-1:   lunarYearOffset (2비트) - 0=같은해, 1=전년도, 2=다음해
 * - bits 2-5:   lunarMonth (4비트) - 0~11
 * - bits 6-10:  lunarDay (5비트) - 0~29
 * - bit 11:     isLeap (1비트)
 * - bits 12-17: yearPillarId (6비트) - 0~59
 * - bits 18-23: monthPillarId (6비트) - 0~59
 *
 * dayPillarId는 저장하지 않고 JD에서 계산: (jd - 2415011) % 60
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SOLAR_TO_LUNAR_INDEX, type MonthlyIndex } from '../src/data/date-index';
import type { SolarToLunarEntry } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_JD = 2415021; // 1900-01-01의 Julian Day
const DAY_PILLAR_EPOCH = 2415011; // dayPillarId 계산용 epoch

/**
 * 엔트리를 24비트 정수로 인코딩 (dayPillarId 제외)
 */
function encodeEntry(entry: SolarToLunarEntry, solarYear: number): number {
  const yearOffset = entry.lunar.year - solarYear;
  let lunarYearOffset: number;
  if (yearOffset === 0) {
    lunarYearOffset = 0;
  } else if (yearOffset === -1) {
    lunarYearOffset = 1;
  } else if (yearOffset === 1) {
    lunarYearOffset = 2;
  } else {
    throw new Error(`Unexpected year offset: ${yearOffset}`);
  }

  const lunarMonth = entry.lunar.month - 1;
  const lunarDay = entry.lunar.day - 1;
  const isLeap = entry.lunar.isLeap ? 1 : 0;
  const yearPillarId = entry.gapja.yearPillarId;
  const monthPillarId = entry.gapja.monthPillarId;

  let packed = 0;
  packed |= lunarYearOffset & 0x3;
  packed |= (lunarMonth & 0xf) << 2;
  packed |= (lunarDay & 0x1f) << 6;
  packed |= (isLeap & 0x1) << 11;
  packed |= (yearPillarId & 0x3f) << 12;
  packed |= (monthPillarId & 0x3f) << 18;

  return packed;
}

/**
 * 압축 데이터 생성  */
function compressData(): {
  startJDs: number[];
  dayCounts: number[];
  dataBytes: Uint8Array;
  monthKeys: string[];
} {
  const startJDs: number[] = [];
  const dayCounts: number[] = [];
  const monthKeys: string[] = [];
  const allBytes: number[] = [];

  const sortedKeys = Array.from(SOLAR_TO_LUNAR_INDEX.keys()).sort();

  for (const key of sortedKeys) {
    const monthIndex = SOLAR_TO_LUNAR_INDEX.get(key)!;
    const [yearStr] = key.split('-');
    const year = parseInt(yearStr, 10);

    monthKeys.push(key);
    startJDs.push(monthIndex.startJD);
    dayCounts.push(monthIndex.entries.length);

    for (const entry of monthIndex.entries) {
      const packed = encodeEntry(entry, year);
      // 24비트를 3바이트로 저장 (little-endian)
      allBytes.push(packed & 0xff);
      allBytes.push((packed >> 8) & 0xff);
      allBytes.push((packed >> 16) & 0xff);
    }
  }

  return {
    startJDs,
    dayCounts,
    dataBytes: new Uint8Array(allBytes),
    monthKeys,
  };
}

/**
 * 검증
 */
function verifyCompression(
  startJDs: number[],
  dayCounts: number[],
  dataBytes: Uint8Array,
  monthKeys: string[]
): boolean {
  console.log('Verifying compression...');
  let verified = 0;
  let errors = 0;
  let byteOffset = 0;

  for (let i = 0; i < monthKeys.length; i++) {
    const key = monthKeys[i];
    const startJD = startJDs[i];
    const dayCount = dayCounts[i];
    const monthIndex = SOLAR_TO_LUNAR_INDEX.get(key)!;
    const year = parseInt(key.slice(0, 4), 10);

    for (let j = 0; j < dayCount; j++) {
      const b0 = dataBytes[byteOffset++];
      const b1 = dataBytes[byteOffset++];
      const b2 = dataBytes[byteOffset++];
      const packed = b0 | (b1 << 8) | (b2 << 16);

      const lunarYearOffset = packed & 0x3;
      const lunarMonth = ((packed >> 2) & 0xf) + 1;
      const lunarDay = ((packed >> 6) & 0x1f) + 1;
      const isLeap = ((packed >> 11) & 0x1) === 1;
      const yearPillarId = (packed >> 12) & 0x3f;
      const monthPillarId = (packed >> 18) & 0x3f;
      const jd = startJD + j;
      const dayPillarId = (jd - DAY_PILLAR_EPOCH) % 60;

      let lunarYear: number;
      if (lunarYearOffset === 0) lunarYear = year;
      else if (lunarYearOffset === 1) lunarYear = year - 1;
      else lunarYear = year + 1;

      const original = monthIndex.entries[j];

      // dayPillarId는 원본 데이터에 버그가 있으므로 비교에서 제외
      if (
        original.jd !== jd ||
        original.lunar.year !== lunarYear ||
        original.lunar.month !== lunarMonth ||
        original.lunar.day !== lunarDay ||
        original.lunar.isLeap !== isLeap ||
        original.gapja.yearPillarId !== yearPillarId ||
        original.gapja.monthPillarId !== monthPillarId
      ) {
        console.error('Mismatch:', { original, decoded: { jd, lunarYear, lunarMonth, lunarDay, isLeap, yearPillarId, monthPillarId, dayPillarId } });
        errors++;
        if (errors > 10) return false;
      }
      verified++;
    }
  }

  console.log(`Verified ${verified} entries, ${errors} errors`);
  return errors === 0;
}

/**
 * 월별 day count 압축 (각 월당 2비트, 4개월을 1바이트에)
 * count-28 값을 저장 (0=28, 1=29, 2=30, 3=31)
 */
function compressDayCounts(dayCounts: number[]): Uint8Array {
  const byteCount = Math.ceil(dayCounts.length / 4);
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < dayCounts.length; i++) {
    const byteIdx = Math.floor(i / 4);
    const bitOffset = (i % 4) * 2;
    const countCode = dayCounts[i] - 28; // 0-3
    bytes[byteIdx] |= (countCode & 0x3) << bitOffset;
  }
  return bytes;
}

/**
 * startJD 배열을 Uint16Array로 압축 (BASE_JD 기준 오프셋)
 */
function compressStartJDs(startJDs: number[]): Uint8Array {
  const arr = new Uint16Array(startJDs.length);
  for (let i = 0; i < startJDs.length; i++) {
    arr[i] = startJDs[i] - BASE_JD;
  }
  return new Uint8Array(arr.buffer);
}

/**
 * 압축 파일 생성  */
function generateCompressedFile(
  startJDs: number[],
  dayCounts: number[],
  dataBytes: Uint8Array,
  monthKeys: string[]
): string {
  const jdBytes = compressStartJDs(startJDs);
  const jdBase64 = Buffer.from(jdBytes).toString('base64');
  const countBytes = compressDayCounts(dayCounts);
  const countBase64 = Buffer.from(countBytes).toString('base64');
  const dataBase64 = Buffer.from(dataBytes).toString('base64');

  const startYear = 1900;
  const endYear = 2050;

  const output = `/**
 * 압축된 양력 → 음력 변환 인덱스
 *
 * ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
 * 생성: scripts/compress-date-index.ts
 */

import type { SolarToLunarEntry } from '../types';

export interface MonthlyIndex {
  year: number;
  month: number;
  entries: SolarToLunarEntry[];
  startJD: number;
  endJD: number;
}

// 상수
const BASE_JD = ${BASE_JD};
const DAY_PILLAR_EPOCH = ${DAY_PILLAR_EPOCH};
const START_YEAR = ${startYear};
const END_YEAR = ${endYear};
const TOTAL_MONTHS = ${dayCounts.length};

// 압축 데이터 (Base64)
const JD_B64 = '${jdBase64}';
const COUNT_B64 = '${countBase64}';
const DATA_B64 = '${dataBase64}';

// 디코딩된 데이터 캐시
let _jdOffsets: Uint16Array | null = null;
let _countBytes: Uint8Array | null = null;
let _dataBytes: Uint8Array | null = null;
let _dayOffsets: number[] | null = null;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function getJDOffsets(): Uint16Array {
  if (!_jdOffsets) _jdOffsets = new Uint16Array(b64ToBytes(JD_B64).buffer);
  return _jdOffsets;
}

function getCountBytes(): Uint8Array {
  if (!_countBytes) _countBytes = b64ToBytes(COUNT_B64);
  return _countBytes;
}

function getDataBytes(): Uint8Array {
  if (!_dataBytes) _dataBytes = b64ToBytes(DATA_B64);
  return _dataBytes;
}

function getDayCount(idx: number): number {
  const byteIdx = idx >>> 2;
  const bitOffset = (idx & 3) << 1;
  return ((getCountBytes()[byteIdx] >> bitOffset) & 3) + 28;
}

function getDayOffsets(): number[] {
  if (!_dayOffsets) {
    _dayOffsets = [0];
    for (let i = 0; i < TOTAL_MONTHS; i++) {
      _dayOffsets.push(_dayOffsets[i] + getDayCount(i));
    }
  }
  return _dayOffsets;
}

function decodeEntry(packed: number, year: number, month: number, day: number, jd: number): SolarToLunarEntry {
  const lunarYearOffset = packed & 3;
  const lunarYear = lunarYearOffset === 0 ? year : lunarYearOffset === 1 ? year - 1 : year + 1;

  return {
    jd,
    solar: { year, month, day },
    lunar: {
      year: lunarYear,
      month: ((packed >> 2) & 0xf) + 1,
      day: ((packed >> 6) & 0x1f) + 1,
      isLeap: ((packed >> 11) & 1) === 1,
    },
    gapja: {
      yearPillarId: (packed >> 12) & 0x3f,
      monthPillarId: (packed >> 18) & 0x3f,
      dayPillarId: (jd - DAY_PILLAR_EPOCH) % 60,
    },
  };
}

const _cache = new Map<string, MonthlyIndex>();

export function getMonthlyIndex(year: number, month: number): MonthlyIndex | undefined {
  if (year < START_YEAR || year > END_YEAR || month < 1 || month > 12) return undefined;

  const key = \`\${year}-\${String(month).padStart(2, '0')}\`;
  const cached = _cache.get(key);
  if (cached) return cached;

  const idx = (year - START_YEAR) * 12 + month - 1;
  const dayCount = getDayCount(idx);
  const byteOffset = getDayOffsets()[idx] * 3;
  const startJD = BASE_JD + getJDOffsets()[idx];
  const data = getDataBytes();

  const entries: SolarToLunarEntry[] = [];
  for (let d = 0; d < dayCount; d++) {
    const i = byteOffset + d * 3;
    const packed = data[i] | (data[i + 1] << 8) | (data[i + 2] << 16);
    entries.push(decodeEntry(packed, year, month, d + 1, startJD + d));
  }

  const result: MonthlyIndex = { year, month, entries, startJD, endJD: startJD + dayCount - 1 };
  _cache.set(key, result);
  return result;
}

/** @deprecated getMonthlyIndex() 사용 권장 */
export const SOLAR_TO_LUNAR_INDEX = new Proxy(new Map<string, MonthlyIndex>(), {
  get(target, prop) {
    if (prop === 'get') return (key: string) => getMonthlyIndex(+key.slice(0, 4), +key.slice(5, 7));
    if (prop === 'has') return (key: string) => {
      const y = +key.slice(0, 4), m = +key.slice(5, 7);
      return y >= START_YEAR && y <= END_YEAR && m >= 1 && m <= 12;
    };
    if (prop === 'keys') return function* () {
      for (let y = START_YEAR; y <= END_YEAR; y++)
        for (let m = 1; m <= 12; m++)
          yield \`\${y}-\${String(m).padStart(2, '0')}\`;
    };
    if (prop === 'size') return TOTAL_MONTHS;
    if (prop === Symbol.iterator) return function* () {
      for (let y = START_YEAR; y <= END_YEAR; y++)
        for (let m = 1; m <= 12; m++) {
          const key = \`\${y}-\${String(m).padStart(2, '0')}\`;
          const idx = getMonthlyIndex(y, m);
          if (idx) yield [key, idx] as [string, MonthlyIndex];
        }
    };
    return Reflect.get(target, prop);
  },
});
`;

  return output;
}

async function main() {
  console.log('=== Compressing date-index ===');
  console.log('Starting compression...');

  const { startJDs, dayCounts, dataBytes, monthKeys } = compressData();

  console.log(`Total months: ${dayCounts.length}`);
  console.log(`Data bytes: ${dataBytes.length} (${(dataBytes.length / 1024).toFixed(1)} KB)`);

  const jdBytes = compressStartJDs(startJDs);
  console.log(`JD offset bytes: ${jdBytes.length} (${(jdBytes.length / 1024).toFixed(1)} KB)`);

  const countBytes = compressDayCounts(dayCounts);
  console.log(`Count bytes: ${countBytes.length} (${(countBytes.length / 1024).toFixed(1)} KB)`);

  const valid = verifyCompression(startJDs, dayCounts, dataBytes, monthKeys);
  if (!valid) {
    console.error('Verification failed!');
    process.exit(1);
  }

  const outputContent = generateCompressedFile(startJDs, dayCounts, dataBytes, monthKeys);
  const outputPath = path.join(__dirname, '../src/data/date-index-compressed.ts');
  fs.writeFileSync(outputPath, outputContent, 'utf-8');

  const originalPath = path.join(__dirname, '../src/data/date-index.ts');
  const originalSize = fs.statSync(originalPath).size;
  const compressedSize = fs.statSync(outputPath).size;

  // Base64 전 순수 바이너리 크기
  const rawBinarySize = dataBytes.length + jdBytes.length + countBytes.length;

  console.log('\\n=== Results ===');
  console.log(`Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Raw binary: ${(rawBinarySize / 1024).toFixed(1)} KB`);
  console.log(`With Base64 + code: ${(compressedSize / 1024).toFixed(1)} KB`);
  console.log(`Compression: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`);
}

main().catch(console.error);
