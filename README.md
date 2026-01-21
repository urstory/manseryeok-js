# @urstory/manseryeok

Korean Lunar Calendar (만세력) JavaScript Library

한국 음력(만세력) 데이터를 제공하는 순수 JavaScript/TypeScript 라이브러리입니다.

## 왜 이 라이브러리인가?

이 라이브러리는 **한국천문연구원(KASI)** 의 [음양력변환계산](https://astro.kasi.re.kr/life/pageView/8) 데이터를 기반으로 구축된 데이터베이스를 사용합니다.

기존에 중국에서 개발된 음력 라이브러리들을 사용할 수 있지만, **한국 음력과 중국 음력은 차이가 있습니다**:

- **윤달(閏月) 위치가 다릅니다**: 한국과 중국은 같은 음력 체계를 사용하지만, 윤달이 들어가는 위치가 서로 다른 경우가 많습니다.
- **시간대 차이**: 한국 표준시(KST)를 기준으로 계산합니다.
- **절기 계산 방식**: 한국천문연구원의 정확한 천문 계산법을 사용합니다.

따라서 정확한 한국 사주팔자/운세 계산을 위해서는 한국 음력 데이터를 사용하는 것이 필수적입니다.

이 라이브러리는 데이터베이스에 의존하지 않고 모든 데이터를 JavaScript 코드에 내장하여 **빠른 성능**과 **간편한 사용**을 제공합니다.

## 특징

- ✅ **1900년 ~ 2050년 지원** - 150년 이상의 한국 음력 데이터
- ✅ **DB 없는 순수 JavaScript** - 별도의 데이터베이스 설치 불필요
- ✅ **TypeScript 완전 지원** - 타입 안전성과 자동완성
- ✅ **빠른 조회 성능** - 월별 인덱싱으로 최적화된 조회
- ✅ **트리 쉐이킹 지원** - 필요한 기능만 가져가기 가능
- ✅ **KASI 데이터 기반** - 한국천문연구원 정확한 데이터

## 설치

```bash
npm install @urstory/manseryeok
```

## 사용법

### 양력 → 음력 변환 (2024년 설날 예시)

```ts
import { solarToLunar } from '@urstory/manseryeok';

const result = solarToLunar(2024, 2, 10);
console.log('양력:', result.solar.year, '년', result.solar.month, '월', result.solar.day, '일');
console.log('음력:', result.lunar.year, '년', result.lunar.month, '월', result.lunar.day, '일');
console.log('윤달:', result.lunar.isLeapMonth ? '예' : '아니오');
console.log('갑자:', result.gapja.yearPillar, '년', result.gapja.monthPillar, '월', result.gapja.dayPillar, '일');

// 출력:
// 양력: 2024 년 2 월 10 일
// 음력: 2024 년 1 월 1 일
// 윤달: 아니오
// 갑자: 갑진 년 병인 월 갑진 일
```

### 생일날 음력과 갑자 알아보기

```ts
import { solarToLunar } from '@urstory/manseryeok';

function formatBirthday(solarYear: number, solarMonth: number, solarDay: number) {
  const result = solarToLunar(solarYear, solarMonth, solarDay);

  console.log('=== 생일 정보 ===');
  console.log(`양력: ${result.solar.year}년 ${result.solar.month}월 ${result.solar.day}일`);
  console.log(`음력: ${result.lunar.year}년 ${result.lunar.month}월 ${result.lunar.day}일${result.lunar.isLeapMonth ? ' (윤달)' : ''}`);
  console.log(`갑자: ${result.gapja.yearPillarHanja}년 ${result.gapja.monthPillarHanja}월 ${result.gapja.dayPillarHanja}일`);
  console.log(`오행: 년=${result.gapja.yearPillar}, 월=${result.gapja.monthPillar}, 일=${result.gapja.dayPillar}`);
  return result;
}

// 예시: 1990년 5월 15일생
formatBirthday(1990, 5, 15);
// === 생일 정보 ===
// 양력: 1990년 5월 15일
// 음력: 1990년 4월 21일
// 갑자: 庚午년 辛巳월 丙辰日
```

### 음력 → 양력 변환 (음력 생일을 양력으로 찾기)

```ts
import { lunarToSolar } from '@urstory/manseryeok';

const result = lunarToSolar(2024, 1, 1, false); // 2024년 정월 초하루
console.log('음력 2024년 1월 1일 = 양력', result.solar.year, '년', result.solar.month, '월', result.solar.day, '일');
// 음력 2024년 1월 1일 = 양력 2024 년 2 월 10 일
```

### 윤달 날짜 변환

```ts
import { lunarToSolar } from '@urstory/manseryeok';

// 윤달 4월 1일 (예: 1985년)
const leapMonthResult = lunarToSolar(1985, 4, 1, true); // isLeapMonth: true
console.log('윤4월 1일 → 양력:', leapMonthResult.solar.year, '년', leapMonthResult.solar.month, '월', leapMonthResult.solar.day, '일');

// 평달 4월 1일과 비교
const normalMonthResult = lunarToSolar(1985, 4, 1, false); // isLeapMonth: false
console.log('평4월 1일 → 양력:', normalMonthResult.solar.year, '년', normalMonthResult.solar.month, '월', normalMonthResult.solar.day, '일');
```

### 갑자(60갑자) 계산

```ts
import { getGapja } from '@urstory/manseryeok';

// 1984년 갑자년 (입춘 이후)
const gapja1 = getGapja(1984, 2, 4);
console.log('1984년 2월 4일 (입춘):', gapja1.yearPillar, '년');
// 1984년 2월 4일 (입춘): 갑자 년

// 1984년 입춘 전 (아직 계해년)
const gapja2 = getGapja(1984, 2, 2);
console.log('1984년 2월 2일 (입춘 전):', gapja2.yearPillar, '년');
// 1984년 2월 2일 (입춘 전): 계해 년

// 참고: 한국 사주에서 년주는 입춘(2월 3-4일 경)에 변경됩니다
```

### 내 생일의 사주팔자 구하기

```ts
import { getGapja } from '@urstory/manseryeok';

function getMySaju(birthYear: number, birthMonth: number, birthDay: number, birthHour: number = 0) {
  const gapja = getGapja(birthYear, birthMonth, birthDay);

  console.log('=== 사주팔자 ===');
  console.log(`년주: ${gapja.yearPillar} (${gapja.yearPillarHanja})`);
  console.log(`월주: ${gapja.monthPillar} (${gapja.monthPillarHanja})`);
  console.log(`일주: ${gapja.dayPillar} (${gapja.dayPillarHanja})`);
  // 시주는 출생시간을 기준으로 별도 계산이 필요합니다

  return gapja;
}

// 예시: 1984년 2월 2일생
getMySaju(1984, 2, 2);
// === 사주팔자 ===
// 년주: 계해 (癸亥)
// 월주: 갑인 (甲寅)
// 일주: 갑인 (甲寅)
```

### 양력/음력 달력 만들기

```ts
import { solarToLunar } from '@urstory/manseryeok';

function printCalendar(year: number, month: number) {
  console.log(`\n=== ${year}년 ${month}월 ===`);
  console.log('양력\t음력\t\t갑자');
  console.log(''.padEnd(40, '-'));

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const result = solarToLunar(year, month, day);
    const lunarStr = `${result.lunar.month}/${result.lunar.day}${result.lunar.isLeapMonth ? ' 윤' : ''}`;
    const gapjaStr = `${result.gapja.yearPillar} ${result.gapja.dayPillar}`;
    console.log(`${month}/${day}\t${lunarStr}\t\t${gapjaStr}`);
  }
}

// 2024년 2월 달력
printCalendar(2024, 2);
```

### 대량 날짜 변환 (파일 처리 등)

```ts
import { solarToLunar } from '@urstory/manseryeok';

function batchConvert(dates: Array<{ year: number; month: number; day: number }>) {
  return dates.map(date => {
    const result = solarToLunar(date.year, date.month, date.day);
    return {
      solar: `${result.solar.year}-${String(result.solar.month).padStart(2, '0')}-${String(result.solar.day).padStart(2, '0')}`,
      lunar: `${result.lunar.year}-${String(result.lunar.month).padStart(2, '0')}-${String(result.lunar.day).padStart(2, '0')}${result.lunar.isLeapMonth ? '*' : ''}`,
      gapja: result.gapja.yearPillar,
    };
  });
}

const dates = [
  { year: 2024, month: 2, day: 10 },
  { year: 2024, month: 9, day: 17 },
  { year: 1984, month: 2, day: 2 },
];

const results = batchConvert(dates);
console.table(results);
```

### 날짜 유효성 검사

```ts
import { solarToLunar, OutOfRangeError, InvalidDateError } from '@urstory/manseryeok';

function isValidDate(year: number, month: number, day: number): boolean {
  try {
    solarToLunar(year, month, day);
    return true;
  } catch (error) {
    if (error instanceof OutOfRangeError) {
      console.log('지원 범위 밖 연도:', error.message);
    } else if (error instanceof InvalidDateError) {
      console.log('유효하지 않은 날짜:', error.message);
    }
    return false;
  }
}

console.log(isValidDate(2024, 2, 29));  // false (2024년 2월은 29일까지 있음)
console.log(isValidDate(2023, 2, 29));  // false (2023년은 평년)
console.log(isValidDate(1800, 1, 1));   // false (지원 범위 밖)
console.log(isValidDate(2024, 2, 10));  // true
```

### 60갑자 데이터 직접 조회

```ts
import { SIXTY_PILLARS, getPillarById, getPillarByHangul } from '@urstory/manseryeok';

// 전체 60갑자 목록
console.log('총 60갑자 개수:', SIXTY_PILLARS.length);

// ID로 조회 (0~59)
const pillar = getPillarById(0);
console.log('0번 갑자:', pillar.combined.hangul, '/', pillar.combined.hanja);
// 0번 갑자: 갑자 / 甲子

// 한글 이름으로 조회
const found = getPillarByHangul('갑자');
console.log('갑자의 ID:', found?.id); // 0
console.log('갑자의 오행:', found?.element); // 목
console.log('갑자의 음양:', found?.yinYang); // 양
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

## 지원 범위

| 항목 | 범위 |
|------|------|
| 연도 | 1900년 ~ 2050년 |
| 양력 | 1900-01-01 ~ 2050-12-31 |
| 음력 | 1900-01-01 ~ 2050-12-31 (윤달 포함) |

## 번들 크기

모든 만세력 데이터를 코드에 내장하고 있어 번들 크기가 큽니다:

| 포맷 | 크기 |
|------|------|
| ESM | ~16 MB |
| CJS | ~16 MB |
| Gzip | ~4 MB |

번들 크기가 큰 이유는 1900년~2050년의 모든 음력 데이터와 60갑자 정보를 포함하고 있기 때문입니다.

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
