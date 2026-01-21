# @urstory/manseryeok

Korean Lunar Calendar (만세력) JavaScript Library

한국 음력(만세력) 데이터를 제공하는 순수 JavaScript/TypeScript 라이브러리입니다.

## 특징

- ✅ **1000년 ~ 2050년 지원** - 1000년 이상의 한국 음력 데이터
- ✅ **DB 없는 순수 JavaScript** - 별도의 데이터베이스 설치 불필요
- ✅ **TypeScript 완전 지원** - 타입 안전성과 자동완성
- ✅ **빠른 조회 성능** - 바이너리 서치로 최적화된 인덱싱
- ✅ **트리 쉐이킹 지원** - 필요한 기능만 가져가기 가능
- ✅ **KASI 데이터 기반** - 한국천문연구원 정확한 데이터

## 설치

```bash
npm install @urstory/manseryeok
```

## 사용법

### 양력 → 음력 변환

```ts
import { solarToLunar } from '@urstory/manseryeok';

const result = solarToLunar(2024, 2, 10);
console.log(result);
// {
//   solar: { year: 2024, month: 2, day: 10 },
//   lunar: { year: 2024, month: 1, day: 1, isLeapMonth: false },
//   gapja: {
//     yearPillar: '갑진',
//     yearPillarHanja: '甲辰',
//     monthPillar: '병인',
//     monthPillarHanja: '丙寅',
//     dayPillar: '갑진',
//     dayPillarHanja: '甲辰'
//   },
//   julianDay: 2460310
// }
```

### 음력 → 양력 변환

```ts
import { lunarToSolar } from '@urstory/manseryeok';

const result = lunarToSolar(2024, 1, 1, false);
console.log(result.solar);
// { year: 2024, month: 2, day: 10 }
```

### 갑자 계산

```ts
import { getGapja } from '@urstory/manseryeok';

const gapja = getGapja(1984, 2, 2);
console.log(gapja.yearPillar);      // '갑자'
console.log(gapja.yearPillarHanja); // '甲子'
```

### 절기 조회

```ts
import { getSolarTerms } from '@urstory/manseryeok';

const terms = getSolarTerms(2024);
console.log(terms[0]);
// {
//   name: '입춘',
//   index: 0,
//   longitude: 315,
//   type: 'jeolgi',
//   sajuMonth: 2,
//   datetime: 2024-02-04T16:27:00.000Z
// }
```

### 사주 월 계산

```ts
import { getSajuMonth } from '@urstory/manseryeok';

const sajuMonth = getSajuMonth(2024, 2, 10);
console.log(sajuMonth); // 2 (인월)
```

## API 문서

### `solarToLunar(solarYear, solarMonth, solarDay)`

양력을 음력으로 변환합니다.

**매개변수:**
- `solarYear`: 양력 년 (1000~2050)
- `solarMonth`: 양력 월 (1~12)
- `solarDay`: 양력 일 (1~31)

**반환값:** `SolarToLunarResult`

**예외:**
- `OutOfRangeError`: 지원 범위 밖 연도
- `InvalidDateError`: 유효하지 않은 날짜

### `lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth?)`

음력을 양력으로 변환합니다.

**매개변수:**
- `lunarYear`: 음력 년 (1000~2050)
- `lunarMonth`: 음력 월 (1~12)
- `lunarDay`: 음력 일 (1~30)
- `isLeapMonth`: 윤달 여부 (기본값: false)

**반환값:** `LunarToSolarResult`

### `getGapja(solarYear, solarMonth, solarDay)`

특정 날짜의 60갑자를 계산합니다.

**매개변수:**
- `solarYear`: 양력 년
- `solarMonth`: 양력 월
- `solarDay`: 양력 일

**반환값:** `GapjaResult`

### `getSolarTerms(year)`

특정 연도의 24절기를 조회합니다.

**매개변수:**
- `year`: 양력 년

**반환값:** `SolarTermInfo[]` (24개 절기)

### `getSajuMonth(solarYear, solarMonth, solarDay)`

절기 기준 사주 월을 계산합니다.

**매개변수:**
- `solarYear`: 양력 년
- `solarMonth`: 양력 월
- `solarDay`: 양력 일

**반환값:** `number` (1~12)

## 지원 범위

| 항목 | 범위 |
|------|------|
| 연도 | 1000년 ~ 2050년 |
| 양력 | 1000-01-01 ~ 2050-12-31 |
| 음력 | 1000-01-01 ~ 2050-12-31 (윤달 포함) |

## 번들 크기

| 포맷 | 크기 |
|------|------|
| ESM | ~1 MB |
| CJS | ~1 MB |
| Gzip | ~250 KB |

## 성능

| 작업 | 시간 |
|------|------|
| 양력→음력 변환 | < 0.1ms |
| 음력→양력 변환 | < 0.1ms |
| 갑자 계산 | < 0.1ms |
| 절기 조회 (연도) | < 1ms |

## 라이선스

MIT © [urstory](https://github.com/urstory)

## 관련 프로젝트

- [즐거운 사주](https://www.enjoysaju.com) - 한국 사주/운세 서비스

## 기여

이 프로젝트에 기여하고 싶으시다면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해 주세요.
