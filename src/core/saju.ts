/**
 * 사주팔자 계산 모듈
 *
 * 사주팔자(년주, 월주, 일주, 시주)를 계산합니다.
 */

import { solarToLunar } from './solar-lunar-converter';
import { formatGapjaByIds } from './gapja-calculator';
import { checkBoundaryRule, momentPillars, normalizeOptions, requireJd } from './saju-boundary';
import { getPillarById } from '../data/sixty-pillars';
import { InvalidDateError } from '../types';
import type { BoundaryRule, ClockNotice, ClockOption, GapjaResult, SajuBoundary } from '../types';

const DAY_PILLAR_EPOCH = 2415011;

/**
 * 사주팔자 타입
 */
export interface SajuResult {
  /** 년주 (년柱) */
  yearPillar: string;
  /** 년주 한자 */
  yearPillarHanja: string;
  /** 월주 (월柱) */
  monthPillar: string;
  /** 월주 한자 */
  monthPillarHanja: string;
  /** 일주 (일柱) */
  dayPillar: string;
  /** 일주 한자 */
  dayPillarHanja: string;
  /** 시주 (시柱) - 시간 미입력 시 null */
  hourPillar: string | null;
  /** 시주 한자 */
  hourPillarHanja: string | null;
  /** 원본 갑자 정보 */
  gapja: GapjaResult;
  /** 시간 보정이 적용되었는지 여부 */
  isTimeCorrected: boolean;
  /** 보정된 시간 (분 단위) */
  correctedTime?: { hour: number; minute: number };
  /**
   * 1.2.0: 그날 드는 절(12절)의 경계 정보. 없으면 null.
   * 시각을 주면 chosen은 시각으로 정한 쪽, 주지 않으면 boundaryRule대로 실린 쪽이다.
   */
  sajuBoundary: SajuBoundary | null;
  /** 1.2.0: 입력 시각이 절입에서 uncertainMinutes 안이면 true(값은 그래도 견준 대로). 시각을 주지 않으면 false */
  nearBoundary: boolean;
  /** 1.2.0: 시계 알림(기본 'kst-fixed'로 셈했는데 그때 한국 법정 시계가 UTC+9가 아니었던 경우 등). 시각을 주지 않으면 null */
  clockNotice: ClockNotice | null;
}

/**
 * 사주 계산 옵션
 */
export interface SajuOptions {
  /** 경도 (기본값: 127 - 서울). clock이 { utcOffsetMinutes }이면 longitude를 함께 줄 때만 경도 보정을 한다(1.2.0) */
  longitude?: number;
  /** 시간 보정 적용 여부 (기본값: true) */
  applyTimeCorrection?: boolean;
  /**
   * 1.2.0: 시를 주지 않았을 때 절입일의 연주·월주를 어느 쪽으로 낼지(기본 'noon').
   * 시를 주면 절입 시각과 견주므로 쓰지 않는다. 단 'legacy-fixed'는 시를 주어도 1.1.0과 같게 고정 날짜로 낸다.
   */
  boundaryRule?: BoundaryRule;
  /** 1.2.0: 입력 시각을 읽는 시계(기본 'kst-fixed' = 언제나 UTC+9) */
  clock?: ClockOption;
  /** 1.2.0: 서머타임이 끝나며 두 번 지나간 시각에서 0 = 앞의 것(기본), 1 = 뒤의 것 */
  fold?: 0 | 1;
}

/**
 * 사주팔자 계산
 *
 * @param solarYear 양력 년
 * @param solarMonth 양력 월 (1~12)
 * @param solarDay 양력 일 (1~31)
 * @param solarHour 양력 시 (0~23). 시를 모르면 undefined를 넘긴다(null은 1.1.0처럼 0시로 읽힌다).
 *   범위는 검사하지 않는다(1.1.0과 같음). 유한한 수가 아니면(NaN 등) InvalidDateError
 * @param solarMinute 양력 분 (0~59, 기본값: 0)
 * @param options 사주 계산 옵션
 * @returns 사주팔자 정보
 */
export function calculateSaju(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  solarHour?: number,
  solarMinute: number = 0,
  options: SajuOptions = {}
): SajuResult {
  options = normalizeOptions(options);
  const {
    longitude = 127,
    applyTimeCorrection = true,
  } = options;
  const rule = checkBoundaryRule(options.boundaryRule);
  const clock = options.clock ?? 'kst-fixed';
  if (solarHour !== undefined && (!Number.isFinite(Number(solarHour)) || !Number.isFinite(Number(solarMinute)))) {
    throw new InvalidDateError(`Invalid time: ${solarHour}:${solarMinute}`);
  }

  // 갑자 계산 (년주, 월주, 일주)
  // 시를 주지 않으면 날짜만 받는 함수와 같다(boundaryRule대로). 시를 주면 절입 시각과 견준다.
  const day = solarToLunar(solarYear, solarMonth, solarDay, { boundaryRule: rule });
  let gapja: GapjaResult = day.gapja;
  let sajuBoundary: SajuBoundary | null = day.sajuBoundary;
  let nearBoundary = false;
  let clockNotice: ClockNotice | null = null;
  let offsetMinutes = 540;
  if (solarHour !== undefined) {
    const jd = requireJd(solarYear, solarMonth, solarDay);
    const m = momentPillars(jd, solarHour, solarMinute, { clock, fold: options.fold }, rule === 'legacy-fixed');
    const ids = formatGapjaByIds(m.yearPillarId, m.monthPillarId, 0);
    gapja = {
      ...day.gapja,
      yearPillar: ids.yearPillar,
      yearPillarHanja: ids.yearPillarHanja,
      monthPillar: ids.monthPillar,
      monthPillarHanja: ids.monthPillarHanja,
    };
    if (m.dayJd !== jd) {
      // korea-legal 서머타임: 일주는 1시간 뺀 표준시의 날짜(0시대는 하루 전)
      const d = getPillarById((((m.dayJd - DAY_PILLAR_EPOCH) % 60) + 60) % 60);
      gapja.dayPillar = d.combined.hangul;
      gapja.dayPillarHanja = d.combined.hanja;
    }
    sajuBoundary = m.sajuBoundary;
    nearBoundary = m.nearBoundary;
    clockNotice = m.clockNotice;
    offsetMinutes = m.offsetSec / 60;
  }

  // 시주 계산
  let hourPillar: string | null = null;
  let hourPillarHanja: string | null = null;
  let isTimeCorrected = false;
  let correctedTime: { hour: number; minute: number } | undefined;

  if (solarHour !== undefined) {
    let calcHour = solarHour;
    let calcMinute = solarMinute;

    // 시간 보정 (진태양시)
    if (applyTimeCorrection && clock === 'kst-fixed') {
      // 1.1.0과 같은 셈(바꾸지 않는다)
      const standardMeridian = 135; // 한국 표준시 자오선 (UTC+9)
      const degreesDiff = standardMeridian - longitude;
      const longitudeCorrection = Math.round(degreesDiff * 4); // 1도 = 4분

      calcMinute = solarMinute - longitudeCorrection;
      calcHour = solarHour;

      if (calcMinute < 0) {
        calcMinute += 60;
        calcHour -= 1;
      }
      if (calcHour < 0) {
        calcHour += 24;
      }

      if (longitudeCorrection !== 0) {
        isTimeCorrected = true;
        correctedTime = { hour: calcHour, minute: calcMinute };
      }
    } else if (applyTimeCorrection && (clock === 'korea-legal' || options.longitude !== undefined)) {
      // 1.2.0: 'korea-legal'·{ utcOffsetMinutes }는 입력을 읽은 시계의 자오선(UTC 차이 ÷ 4분)을 기준으로 한다.
      // 서머타임이면 그 시계의 자오선이 15도 동쪽에 있는 셈이라 1시간 더 빠진다.
      // { utcOffsetMinutes }는 출생지가 한국이 아닐 수 있으므로 longitude를 함께 줄 때만 보정한다.
      const longitudeCorrection = Math.round((offsetMinutes / 4 - longitude) * 4);
      const total = (((solarHour * 60 + solarMinute - longitudeCorrection) % 1440) + 1440) % 1440;
      calcHour = Math.floor(total / 60);
      calcMinute = total % 60;
      if (longitudeCorrection !== 0) {
        isTimeCorrected = true;
        correctedTime = { hour: calcHour, minute: calcMinute };
      }
    }

    // 시지 결정 (백엔드와 동일한 로직)
    let hourBranchId: number;
    if (calcHour === 23 || calcHour === 0) {
      hourBranchId = 0; // 자시
    } else {
      hourBranchId = Math.floor((calcHour + 1) / 2);
    }

    // 오자시두법으로 시천간 결정
    const dayStem = gapja.dayPillar.charAt(0);
    const hourStemStart = getHourStemStart(dayStem);
    const hourStemId = (hourStemStart + hourBranchId) % 10;

    const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const stemChars = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const branchChars = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    hourPillar = stems[hourStemId] + branches[hourBranchId];
    hourPillarHanja = stemChars[hourStemId] + branchChars[hourBranchId];
  }

  return {
    yearPillar: gapja.yearPillar,
    yearPillarHanja: gapja.yearPillarHanja,
    monthPillar: gapja.monthPillar,
    monthPillarHanja: gapja.monthPillarHanja,
    dayPillar: gapja.dayPillar,
    dayPillarHanja: gapja.dayPillarHanja,
    hourPillar,
    hourPillarHanja,
    gapja,
    isTimeCorrected,
    correctedTime,
    sajuBoundary,
    nearBoundary,
    clockNotice,
  };
}

/**
 * 오자시두법에 따른 자시 천간 시작점
 *
 * 일간에 따라 자시의 천간이 다릅니다:
 * - 갑/기일: 자시부터 갑자, 을축, 병인, ...
 * - 을/경일: 자시부터 병자, 정축, 무인, ...
 * - 병/신일: 자시부터 무자, 기축, 경인, ...
 * - 정/임일: 자시부터 경자, 신축, 임인, ...
 * - 무/계일: 자시부터 임자, 계축, 갑인, ...
 */
function getHourStemStart(dayStem: string): number {
  const stemMap: { [key: string]: number } = {
    갑: 0,
    기: 0,  // 갑/기 → 자시부터 갑자 (갑=0)
    을: 2,
    경: 2,  // 을/경 → 자시부터 병자 (병=2)
    병: 4,
    신: 4,  // 병/신 → 자시부터 무자 (무=4)
    정: 6,
    임: 6,  // 정/임 → 자시부터 경자 (경=6)
    무: 8,
    계: 8,  // 무/계 → 자시부터 임자 (임=8)
  };

  return stemMap[dayStem] ?? 0;
}

/**
 * 간단한 사주 계산 (시간 보정 없음)
 *
 * @param solarYear 양력 년
 * @param solarMonth 양력 월 (1~12)
 * @param solarDay 양력 일 (1~31)
 * @param solarHour 양력 시 (0~23, 선택사항)
 * @returns 사주팔자 정보
 */
export function calculateSajuSimple(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  solarHour?: number
): SajuResult {
  return calculateSaju(solarYear, solarMonth, solarDay, solarHour, 0, {
    applyTimeCorrection: false,
  });
}
