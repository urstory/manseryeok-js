/**
 * 연도별 절기(절기시각) 데이터 — 1.2.0부터 절입 시각 표에서 만든다
 *
 * 1.1.0까지는 2020~2030년만 있었고 해마다 같은(틀린) 값이었다.
 * 지금은 1391~2050년, 한국 시각(고정 UTC+9)의 월·일·시·분이다(출처는 data/terms/README.md).
 */

import type { SolarTermDateTime } from '../types';
import { termsOfYear } from '../core/solar-term';

const FIRST = 1391;
const LAST = 2050;

function yearOfKey(prop: string | symbol): number | undefined {
  if (typeof prop !== 'string' || !/^\d{4}$/.test(prop)) return undefined;
  const y = Number(prop);
  return y >= FIRST && y <= LAST ? y : undefined;
}

const _cache = new Map<number, SolarTermDateTime[]>();

function dataOfYear(year: number): SolarTermDateTime[] {
  let v = _cache.get(year);
  if (!v) {
    v = (termsOfYear(year) ?? []).map((t) => ({ name: t.name, month: t.month, day: t.day, hour: t.hour, minute: t.minute }));
    _cache.set(year, v);
  }
  return v;
}

/**
 * 연도별 절기 시각 (1391~2050). 처음 읽을 때 그 해만 만든다.
 *
 * @deprecated `getSolarTermsByYear(year)`를 쓰세요. 이 객체는 1.x 동안 같은 꼴로 남겨 둡니다.
 */
export const SOLAR_TERMS_DATA: Record<number, SolarTermDateTime[]> = new Proxy({} as Record<number, SolarTermDateTime[]>, {
  get(target, prop) {
    const y = yearOfKey(prop);
    if (y !== undefined) return dataOfYear(y);
    return Reflect.get(target, prop);
  },
  has(target, prop) {
    return yearOfKey(prop) !== undefined || Reflect.has(target, prop);
  },
  ownKeys() {
    const keys: string[] = [];
    for (let y = FIRST; y <= LAST; y++) keys.push(String(y));
    return keys;
  },
  getOwnPropertyDescriptor(target, prop) {
    const y = yearOfKey(prop);
    if (y !== undefined) return { value: dataOfYear(y), enumerable: true, configurable: true, writable: false };
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
});

/** 절기 시각을 지원하는 연도(1391~2050) */
export const SUPPORTED_SOLAR_TERM_YEARS: readonly number[] = Object.freeze(
  Array.from({ length: LAST - FIRST + 1 }, (_, i) => FIRST + i)
);

/** 절기 시각을 지원하는 연도의 타입(1.2.0부터 number) */
export type SupportedSolarTermYear = number;
