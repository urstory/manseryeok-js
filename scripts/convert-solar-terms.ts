/**
 * 절기 데이터를 TypeScript 코드로 변환하는 스크립트
 */

import * as fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 입력/출력 경로
const INPUT_JSON = path.join(__dirname, '../../backend/src/calendar/data/solar-terms.json');
const OUTPUT_TS = path.join(__dirname, '../src/data/solar-terms-data.ts');

interface SolarTermData {
  name: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

type SolarTermsByYear = Record<number, SolarTermData[]>;

/**
 * 절기 데이터를 TypeScript 코드로 변환
 */
function convertSolarTermsToTS() {
  console.log('절기 데이터 변환 시작...');

  // JSON 파일 읽기
  const jsonContent = fs.readFileSync(INPUT_JSON, 'utf8');
  const solarTermsData = JSON.parse(jsonContent) as SolarTermsByYear;

  // 연도별로 정렬
  const years = Object.keys(solarTermsData).map(Number).sort((a, b) => a - b);

  console.log(`총 ${years.length}년 데이터 확인`);

  // TypeScript 코드 생성
  let tsContent = `/**
 * 연도별 절기(절기시각) 데이터
 *
 * 한국천문연구원(KASI) 데이터 기반
 * 각 연도의 24절기 정확한 시각을 포함합니다.
 *
 * @source backend/src/calendar/data/solar-terms.json
 */

import type { SolarTermDateTime } from '../types';

export interface SolarTermDateTime {
  name: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export const SOLAR_TERMS_DATA: Record<number, SolarTermDateTime[]> = {
`;

  years.forEach(year => {
    const terms = solarTermsData[year];
    tsContent += `  ${year}: [\n`;
    terms.forEach(term => {
      tsContent += `    { name: '${term.name}', month: ${term.month}, day: ${term.day}, hour: ${term.hour}, minute: ${term.minute} },\n`;
    });
    tsContent += `  ],\n`;
  });

  tsContent += `};

export const SUPPORTED_YEARS = [${years.join(', ')}] as const;

export type SupportedYear = typeof SUPPORTED_YEARS[number];
`;

  // 파일 쓰기
  fs.writeFileSync(OUTPUT_TS, tsContent, 'utf8');

  console.log(`✅ 절기 데이터 변환 완료`);
  console.log(`   입력: ${INPUT_JSON}`);
  console.log(`   출력: ${OUTPUT_TS}`);
  console.log(`   연도 범위: ${years[0]} ~ ${years[years.length - 1]}`);
  console.log(`   총 레코드 수: ${Object.values(solarTermsData).flat().length}`);
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  convertSolarTermsToTS();
}

export { convertSolarTermsToTS };
