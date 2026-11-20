/**
 * 범위 검증 유틸리티
 */

/**
 * 지원 범위 확인
 * @param year 확인할 연도
 * @returns 지원 여부 (1391~2050)
 */
export function isSupportedYear(year: number): boolean {
  return year >= 1391 && year <= 2050;
}

/**
 * 지원 연도 범위 조회
 * @returns { min, max } 지원 범위
 */
export function getSupportedRange(): { min: number; max: number } {
  return { min: 1391, max: 2050 };
}
