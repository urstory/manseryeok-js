# @fullstackfamily/manseryeok

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
- ✅ **정확한 12지지 띠 정보** - 올바른 동물 매핑 (v1.0.4)

## 설치

```bash
npm install @fullstackfamily/manseryeok
```

## 예제 실행

`examples/` 폴더에 다양한 사용 예제가 포함되어 있습니다.

```bash
# 예제 실행 (빌드 후)
node examples/01-solar-to-lunar.mjs
node examples/06-saju-calculation.mjs
```

### 예제 목록

| 파일 | 설명 |
|------|------|
| `01-solar-to-lunar.mjs` | 양력 → 음력 변환 |
| `02-birthday-info.mjs` | 생일 정보 조회 |
| `03-lunar-to-solar.mjs` | 음력 → 양력 변환 |
| `04-leap-month.mjs` | 윤달 처리 |
| `05-gapja-calculation.mjs` | 60갑자 계산 |
| `06-saju-calculation.mjs` | 사주팔자 계산 (시간 보정 포함) |
| `07-calendar-print.mjs` | 달력 출력 |
| `08-batch-conversion.mjs` | 대량 날짜 변환 |
| `09-date-validation.mjs` | 날짜 유효성 검사 |
| `10-sixty-pillars.mjs` | 60갑자 데이터 조회 |
| `11-solar-terms-info.mjs` | 24절기 정보 조회 |
| `12-solar-terms-datetime.mjs` | 절기 시각 조회 |

## 사용법

### 양력 → 음력 변환 (2026년 설날 예시)

```ts
import { solarToLunar } from '@fullstackfamily/manseryeok';

const result = solarToLunar(2026, 2, 17);
console.log('양력:', result.solar.year, '년', result.solar.month, '월', result.solar.day, '일');
console.log('음력:', result.lunar.year, '년', result.lunar.month, '월', result.lunar.day, '일');
console.log('윤달:', result.lunar.isLeapMonth ? '예' : '아니오');
console.log('갑자:', result.gapja.yearPillar, '년', result.gapja.monthPillar, '월', result.gapja.dayPillar, '일');

// 출력:
// 양력: 2026 년 2 월 17 일
// 음력: 2026 년 1 월 1 일
// 윤달: 아니오
// 갑자: 병오 년 경인 월 임술 일
```

### 생일날 음력과 갑자 알아보기

```ts
import { solarToLunar } from '@fullstackfamily/manseryeok';

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
// 갑자: 庚午년 辛巳월 庚辰日

```

### 음력 → 양력 변환 (음력 생일을 양력으로 찾기)

```ts
import { lunarToSolar } from '@fullstackfamily/manseryeok';

const result = lunarToSolar(2024, 1, 1, false); // 2024년 정월 초하루
console.log('음력 2024년 1월 1일 = 양력', result.solar.year, '년', result.solar.month, '월', result.solar.day, '일');
// 음력 2024년 1월 1일 = 양력 2024 년 2 월 10 일
```

### 윤달 날짜 변환

```ts
import { lunarToSolar } from '@fullstackfamily/manseryeok';

// 윤달 4월 1일 (예: 1985년)
const leapMonthResult = lunarToSolar(1985, 4, 1, true); // isLeapMonth: true
console.log('윤4월 1일 → 양력:', leapMonthResult.solar.year, '년', leapMonthResult.solar.month, '월', leapMonthResult.solar.day, '일');

// 평달 4월 1일과 비교
const normalMonthResult = lunarToSolar(1985, 4, 1, false); // isLeapMonth: false
console.log('평4월 1일 → 양력:', normalMonthResult.solar.year, '년', normalMonthResult.solar.month, '월', normalMonthResult.solar.day, '일');
```

### 갑자(60갑자) 계산

```ts
import { getGapja } from '@fullstackfamily/manseryeok';

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

### 사주팔자 계산 (시주 포함)

```ts
import { calculateSaju } from '@fullstackfamily/manseryeok';

// 사주팔자 계산 (시간 보정 자동 적용)
const saju = calculateSaju(1990, 5, 15, 14, 30); // 1990년 5월 15일 14시 30분생

console.log('=== 사주팔자 ===');
console.log(`년주: ${saju.yearPillar} (${saju.yearPillarHanja})`);
console.log(`월주: ${saju.monthPillar} (${saju.monthPillarHanja})`);
console.log(`일주: ${saju.dayPillar} (${saju.dayPillarHanja})`);
console.log(`시주: ${saju.hourPillar} (${saju.hourPillarHanja})`);

// 시간 보정 정보
if (saju.isTimeCorrected) {
  console.log(`시간 보정: ${saju.correctedTime!.hour}시 ${saju.correctedTime!.minute}분 (진태양시)`);
}

// 출력:
// === 사주팔자 ===
// 년주: 경오 (庚午)
// 월주: 신사 (辛巳)
// 일주: 경진 (庚辰)
// 시주: 계미 (癸未)
// 시간 보정: 13시 58분 (진태양시)
```

### 시간 보정 없이 간단 계산

```ts
import { calculateSajuSimple } from '@fullstackfamily/manseryeok';

// 시간 보정 없이 계산
const saju = calculateSajuSimple(1984, 2, 2, 2);

console.log(`사주: ${saju.yearPillar}년 ${saju.monthPillar}월 ${saju.dayPillar}일 ${saju.hourPillar}시`);
// 사주: 계해년 병인월 병인일 기축시
```

### 시간 보정 및 경도 설정

```ts
import { calculateSaju } from '@fullstackfamily/manseryeok';

// 부산 (경도 129도)에서 태어난 경우
const saju = calculateSaju(1990, 5, 15, 14, 0, {
  longitude: 129, // 부산 경도
  applyTimeCorrection: true,
});

// 시간 보정 자동 계산:
// - 표준 자오선: 135도 (UTC+9)
// - 부산 경도: 129도
// - 경도 차이: 6도 = 24분 보정
// - 14시 0분 → 13시 36분 (진태양시)
```

**시간 보정이 필요한 이유:**
사주의 시주(時柱)를 정확히 계산하기 위해서는 **진태양시(True Solar Time)**를 사용해야 합니다. 한국은 표준자오선(135도)을 기준으로 시간을 정하지만, 실제 태양의 위치는 지역의 경도에 따라 다릅니다.

- **서울 (127°)**: -32분 보정
- **부산 (129°)**: -24분 보정
- **강릉 (128°)**: -28분 보정

시간 보정을 하지 않으면 시주가 1시간 차이로 바뀔 수 있습니다.

### 양력/음력 달력 만들기

```ts
import { solarToLunar } from '@fullstackfamily/manseryeok';

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
import { solarToLunar } from '@fullstackfamily/manseryeok';

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
import { solarToLunar, OutOfRangeError, InvalidDateError } from '@fullstackfamily/manseryeok';

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

console.log(isValidDate(2024, 2, 29));  // true (2024년은 윤년, 2월 29일 유효)
console.log(isValidDate(2023, 2, 29));  // false (2023년은 평년)
console.log(isValidDate(1800, 1, 1));   // false (지원 범위 밖)
console.log(isValidDate(2024, 2, 10));  // true
```

### 60갑자 데이터 직접 조회

```ts
import { SIXTY_PILLARS, getPillarById, getPillarByHangul } from '@fullstackfamily/manseryeok';

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

// 로마자 표기 (romanization) 조회
console.log('천간 로마자:', pillar.tiangan.romanization); // Gap
console.log('지지 로마자:', pillar.dizhi.romanization); // Ja
console.log('합친 로마자:', pillar.combined.romanization); // Gapja
```

### 24절기 정보 조회

```ts
import { getAllSolarTerms, getSolarTermByName, getSolarTermsBySajuMonth } from '@fullstackfamily/manseryeok';

// 전체 24절기 목록
const allTerms = getAllSolarTerms();
console.log('24절기 개수:', allTerms.length);
// 24절기 개수: 24

// 절기 이름으로 조회
const ipchun = getSolarTermByName('입춘');
console.log('입춘:', ipchun?.nameHanja, '황경', ipchun?.longitude, '°');
// 입춘: 立春 황경 315 °

// 사주 월에 해당하는 절기 목록
const februaryTerms = getSolarTermsBySajuMonth(2);
console.log('2월(인월) 절기:', februaryTerms.map(t => t.name).join(', '));
// 2월(인월) 절기: 입춘, 우수
```

### 사주 월 계산 (절기 기준)

```ts
import { getSajuMonth } from '@fullstackfamily/manseryeok';

// 양력 날짜를 사주 월로 변환
// 사주에서 월은 절기를 기준으로 변경됩니다

console.log('2월 1일:', getSajuMonth(2, 1));  // 1 (소우, 아직 1월)
console.log('2월 5일:', getSajuMonth(2, 5));  // 1 (입춘 전)
console.log('2월 6일:', getSajuMonth(2, 6));  // 2 (입추 후, 2월 시작!)
// 입춘(2월 4일경) 이후부터 2월로 계산

console.log('3월 5일:', getSajuMonth(3, 5));  // 2 (경칩 전)
console.log('3월 7일:', getSajuMonth(3, 7));  // 3 (경칩 후, 3월 시작!)
```

### 24절기 한눈에 보기

```ts
import { getAllSolarTerms } from '@fullstackfamily/manseryeok';

function printSolarTerms() {
  const terms = getAllSolarTerms();

  console.log('\n=== 한국 24절기 ===');
  console.log('계절\t절기\t\t한자\t\t황경\t사주월');
  console.log(''.padEnd(60, '-'));

  const seasons = ['봄', '봄', '봄', '봄', '봄', '봄',
                   '여름', '여름', '여름', '여름', '여름', '여름',
                   '가을', '가을', '가을', '가을', '가을', '가을',
                   '겨울', '겨울', '겨울', '겨울', '겨울', '겨울'];

  terms.forEach((term, i) => {
    const season = seasons[i];
    const typeStr = term.type === 'jeolgi' ? '절기' : '중기';
    console.log(`${season}\t${term.name}\t\t${term.hanja}\t\t${term.longitude}°\t${term.sajuMonth}월`);
  });
}

printSolarTerms();
```

### 특정 연도의 절기 시각 조회

```ts
import { getSolarTermsByYear, getSolarTermForDate } from '@fullstackfamily/manseryeok';

// 2024년 모든 절기 시각 조회
const terms2024 = getSolarTermsByYear(2024);
terms2024.forEach(term => {
  console.log(`${term.name} (${term.nameHanja}): ${term.month}월 ${term.day}일 ${term.hour}시 ${term.minute}분`);
});
// 입춘 (立春): 2월 4일 5시 2분
// 우수 (雨水): 2월 19일 0시 51분
// ...

// 특정 날짜의 절기 확인
const term = getSolarTermForDate(2024, 2, 4);
if (term) {
  console.log('2024년 2월 4일은', term.name, '입니다');
  console.log('절기 시각:', term.month, '월', term.day, '일', term.hour, '시', term.minute, '분');
}
// 2024년 2월 4일은 입춘 입니다
// 절기 시각: 2 월 4 일 5 시 2 분
```

### 특정 월의 절기 목록

```ts
import { getSolarTermsByMonth } from '@fullstackfamily/manseryeok';

// 2024년 2월의 절기
const februaryTerms = getSolarTermsByMonth(2024, 2);
februaryTerms.forEach(term => {
  console.log(`${term.month}/${term.day} ${term.hour}:${String(term.minute).padStart(2, '0')} - ${term.name} (${term.nameHanja})`);
});
// 2/4 5:02 - 입춘 (立春)
// 2/19 1:23 - 우수 (雨水)
```

### 지원되는 절기 연도 확인

```ts
import { getSupportedSolarTermYears } from '@fullstackfamily/manseryeok';

const supportedYears = getSupportedSolarTermYears();
console.log('절기 데이터 지원 연도:', supportedYears.join(', '));
// 절기 데이터 지원 연도: 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030

// 참고: 향후 1900~2050년 전체 데이터로 확장 예정
```

## API 문서

### `solarToLunar(solarYear, solarMonth, solarDay)`

양력을 음력으로 변환합니다.

**매개변수:**
- `solarYear`: 양력 년 (1900~2050)
- `solarMonth`: 양력 월 (1~12)
- `solarDay`: 양력 일 (1~31)

**반환값:** `SolarToLunarResult`

**예외:**
- `OutOfRangeError`: 지원 범위 밖 연도
- `InvalidDateError`: 유효하지 않은 날짜

### `lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth?)`

음력을 양력으로 변환합니다.

**매개변수:**
- `lunarYear`: 음력 년 (1900~2050)
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

### `calculateSaju(solarYear, solarMonth, solarDay, solarHour?, solarMinute?, options?)`

사주팔자(년주, 월주, 일주, 시주)를 계산합니다. 시간 보정을 자동으로 적용합니다.

**매개변수:**
- `solarYear`: 양력 년
- `solarMonth`: 양력 월 (1~12)
- `solarDay`: 양력 일 (1~31)
- `solarHour`: 양력 시 (0~23, 선택사항)
- `solarMinute`: 양력 분 (0~59, 기본값: 0)
- `options`: 사주 계산 옵션
  - `longitude`: 경도 (기본값: 127 - 서울)
  - `applyTimeCorrection`: 시간 보정 적용 여부 (기본값: true)

**반환값:** `SajuResult`

**예시:**
```ts
const saju = calculateSaju(1990, 5, 15, 14, 30);
console.log(saju.yearPillar); // '경오'
console.log(saju.hourPillar); // '계미'
console.log(saju.isTimeCorrected); // true
console.log(saju.correctedTime); // { hour: 13, minute: 58 }
```

### `calculateSajuSimple(solarYear, solarMonth, solarDay, solarHour?)`

시간 보정 없이 사주팔자를 계산합니다.

**매개변수:**
- `solarYear`: 양력 년
- `solarMonth`: 양력 월 (1~12)
- `solarDay`: 양력 일 (1~31)
- `solarHour`: 양력 시 (0~23, 선택사항)

**반환값:** `SajuResult`

### `getAllSolarTerms()`

전체 24절기 정보를 조회합니다.

**반환값:** 24절기 정보 배열

### `getSolarTermByName(name)`

절기 이름으로 절기 정보를 조회합니다.

**매개변수:**
- `name`: 절기 이름 (예: '입춘', '경칩', '동지')

**반환값:** 절기 정보 또는 undefined

### `getSolarTermByIndex(index)`

절기 인덱스로 절기 정보를 조회합니다.

**매개변수:**
- `index`: 절기 인덱스 (0~23)

**반환값:** 절기 정보

**예외:**
- `RangeError`: 유효하지 않은 인덱스

### `getSolarTermsBySajuMonth(sajuMonth)`

사주 월에 해당하는 절기 목록을 조회합니다.

**매개변수:**
- `sajuMonth`: 사주 월 (1~12)

**반환값:** 해당 월의 절기 배열

### `getSajuMonth(month, day)`

양력 날짜를 사주 월로 변환합니다.

사주에서 월주는 절기(節氣)를 기준으로 계산합니다.
입춘(立春, 2월 4일경)부터 2월, 경칩(驚蟄, 3월 6일경)부터 3월, ...

**매개변수:**
- `month`: 양력 월 (1~12)
- `day`: 양력 일 (1~31)

**반환값:** `number` (1~12)

## 지원 범위

| 항목 | 범위 |
|------|------|
| 연도 | 1900년 ~ 2050년 |
| 양력 | 1900-01-01 ~ 2050-12-31 |
| 음력 | 1900-01-01 ~ 2050-12-31 (윤달 포함) |

## 번들 크기

비트 패킹 압축으로 1900년~2050년 전체 데이터를 경량화했습니다:

| 포맷 | 크기 |
|------|------|
| ESM | ~290 KB |
| CJS | ~290 KB |
| Gzip | ~95 KB |

데이터 압축 최적화로 원본 11.4MB → 225KB (98% 감소)를 달성했습니다.

## 성능

| 작업 | 시간 |
|------|------|
| 양력→음력 변환 | < 0.1ms |
| 음력→양력 변환 | < 0.1ms |
| 갑자 계산 | < 0.1ms |
| 절기 조회 (연도) | < 1ms |

## 변경 이력

### v1.0.4 (2026-02-02)

- **버그 수정**: 12지지(地支) 동물(띠) 매핑 오류 수정
  - 인(寅): `호끼` → `호랑이` (오타 수정)
  - 유(酉): `원숭이` → `닭` (잘못된 매핑 수정)
  - 술(戌): `닭` → `개` (잘못된 매핑 수정)
- 60갑자 데이터의 모든 동물 매핑이 올바르게 수정되었습니다

### v1.0.3 (2025-01-15)

- 초기 안정 버전
- 1900~2050년 음력/양력 변환 지원
- 사주팔자 계산 (시간 보정 포함)
- 24절기 정보 조회

## 라이선스

MIT © [urstory](https://github.com/urstory)

## 관련 프로젝트

- [즐거운 사주](https://www.enjoysaju.com) - 한국 사주/운세 서비스

## 기여

이 프로젝트에 기여하고 싶으시다면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해 주세요.
