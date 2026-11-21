# @fullstackfamily/manseryeok

**한국어** | [English](README.en.md)

Korean Lunar Calendar (만세력) JavaScript Library

한국 음력(만세력) 데이터를 제공하는 순수 JavaScript/TypeScript 라이브러리입니다.

> **1.3.0**: 시주 보정에 균시차를 더하는 `equationOfTime` 옵션(1800~2050)과 `getEquationOfTime`, 음력 날짜로 바로 사주를 내는 `lunar` 옵션을 더했습니다. 새 옵션을 주지 않으면 결과는 1.2.0과 같습니다. 자세한 내용은 [변경 이력](#v130-2026-11-22)을 보세요.
>
> 1.2.0부터 연주·월주의 경계는 실제 절입 시각입니다(1.1.0의 양력 고정 날짜 2/4·3/6 …에서 바뀜, [v1.2.0](#v120-2026-11-22)).

## 왜 이 라이브러리인가?

이 라이브러리는 **한국천문연구원(KASI)** 의 음양력 자료를 사용합니다. v1.1.0부터는 한국천문연구원 [음양력 정보제공 서비스](https://www.data.go.kr/data/15012679/openapi.do)(공공데이터포털, 이용허락 제한 없음)에서 1391~2050년 전체를 받아 음력 달 표로 만들어 넣었습니다.

기존에 중국에서 개발된 음력 라이브러리들을 사용할 수 있지만, **한국 음력과 중국 음력은 차이가 있습니다**:

- **윤달(閏月) 위치가 다릅니다**: 한국과 중국은 같은 음력 체계를 사용하지만, 윤달이 들어가는 위치가 서로 다른 경우가 많습니다.
- **시간대 차이**: 한국 표준시(KST)를 기준으로 계산합니다.
- **절기**: 사주 연주·월주는 절(입춘·경칩 …)이 드는 순간에 바뀝니다. 1.2.0부터 1391~2050년의 실제 절입 시각(한국천문연구원 발표값과 천문 계산, 분 단위)으로 정합니다.

따라서 정확한 한국 사주팔자/운세 계산을 위해서는 한국 음력 데이터를 사용하는 것이 필수적입니다.

이 라이브러리는 데이터베이스에 의존하지 않고 모든 데이터를 JavaScript 코드에 내장하여 **빠른 성능**과 **간편한 사용**을 제공합니다.

## 특징

- ✅ **1391년 ~ 2050년 지원** - 660년의 한국 음력 데이터 (v1.1.0, 한국천문연구원 자료)
- ✅ **DB 없는 순수 JavaScript** - 별도의 데이터베이스 설치 불필요
- ✅ **TypeScript 완전 지원** - 타입 안전성과 자동완성
- ✅ **빠른 조회 성능** - 월별 인덱싱으로 최적화된 조회
- ✅ **트리 쉐이킹 지원** - 필요한 기능만 가져가기 가능
- ✅ **KASI 데이터 기반** - 한국천문연구원 정확한 데이터
- ✅ **정확한 12지지 띠 정보** - 올바른 동물 매핑 (v1.0.4)
- ✅ **정확한 24절기 사주월 매핑** - 한로~대한 오류 수정 (v1.0.5)
- ✅ **정확한 60갑자 지지 오행** - 진·오·술 오행 오류 수정 (v1.0.6)
- ✅ **정확한 월주 절기 기준 계산** - 월주를 절기(節氣) 기준으로 재계산 (v1.0.7)
- ✅ **음력 달 날수·요일·세차·월건** - 변환 결과에 함께 제공 (v1.1.0)
- ✅ **작은 번들** - 날짜마다 데이터를 싣지 않고 음력 달 표·절입 시각 표·균시차 표만 압축해 넣음 (gzip 약 52KB, v1.3.0 — 자세한 숫자는 [번들 크기](#번들-크기))
- ✅ **실제 절입 시각으로 연주·월주** - 1391~2050년 24절기 표(분 단위), 절입일에는 `sajuBoundary`로 바뀌는 시각과 앞뒤 값 (v1.2.0)
- ✅ **시각을 받는 함수와 한국 법정 시계** - `getGapjaAt`·`getJeolAround`·`getIpchun`·`getSajuMonthAt`, 옵션 `clock`(1954~1961 UTC+8:30·서머타임) (v1.2.0)
- ✅ **균시차까지 더한 진태양시** - 옵션 `equationOfTime`, `getEquationOfTime` (1800~2050, JPL Horizons와 최대 1.4초) (v1.3.0)
- ✅ **음력 생일로 바로 사주** - `calculateSaju`·`getGapjaAt`의 옵션 `lunar`·`isLeapMonth` (v1.3.0)

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
| `13-saju-boundary.mjs` | 절입일의 연주·월주, 시각 견줌, `boundaryRule`·`clock` (v1.2.0) |

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

// 1984년 갑자년 (1984년 입춘은 2월 5일 00:19)
const gapja1 = getGapja(1984, 2, 5);
console.log('1984년 2월 5일 (입춘):', gapja1.yearPillar, '년');
// 1984년 2월 5일 (입춘): 갑자 년

// 1984년 입춘 전 (아직 계해년)
const gapja2 = getGapja(1984, 2, 4);
console.log('1984년 2월 4일 (입춘 전날):', gapja2.yearPillar, '년');
// 1984년 2월 4일 (입춘 전날): 계해 년 — 1.1.0은 2/4 고정이라 갑자년을 주었다

// 참고: 한국 사주에서 연주는 입춘(2월 3~5일)이 드는 순간에 바뀝니다
```

### 절입일의 연주·월주 (v1.2.0)

절(입춘·경칩 …)이 든 날은 하루 안에서 연주·월주가 바뀝니다. 2024년 입춘은 2월 4일 **17시 27분**이라, 그날의 대부분(0:00~17:26)은 아직 계묘년 을축월입니다.

```ts
import { solarToLunar, getGapjaAt, calculateSaju } from '@fullstackfamily/manseryeok';

// 날짜만: 그날 정오의 값 + 바뀌는 시각
const r = solarToLunar(2024, 2, 4);
r.gapja.yearPillar;   // '계묘' — 1.1.0은 '갑진'(2/4 고정)
r.gapja.monthPillar;  // '을축'
r.sajuBoundary;
// { term: { name: '입춘', hanja: '立春', index: 0 },
//   at: { year: 2024, month: 2, day: 4, hour: 17, minute: 27 },   // 한국 시각(고정 UTC+9), 이 분부터 뒤
//   atUtc: '2024-02-04T08:27Z',
//   before: { yearPillar: '계묘', yearPillarHanja: '癸卯', monthPillar: '을축', monthPillarHanja: '乙丑' },
//   after:  { yearPillar: '갑진', yearPillarHanja: '甲辰', monthPillar: '병인', monthPillarHanja: '丙寅' },
//   yearChanges: true, chosen: 'before', uncertainMinutes: 1, atLegalClock: null }
solarToLunar(2024, 2, 5).sajuBoundary;  // null — 절이 들지 않은 날

// 시각을 주면 절입 시각과 견줘 정확히
getGapjaAt(2024, 2, 4, 17, 26).monthPillar;  // '을축'
getGapjaAt(2024, 2, 4, 17, 27).monthPillar;  // '병인' (nearBoundary: true — 앞뒤 1분은 표로 정할 수 없음)
calculateSaju(2024, 2, 4, 21, 0).yearPillar; // '갑진'
```

**태어난 날을 받는 화면은 기본값 그대로 쓰고 `sajuBoundary`가 있으면 태어난 시각을 물으세요.** 달력·책력처럼 절기가 든 날부터 새 달로 보여 주려면 `boundaryRule: 'day-end'`를 쓰세요.

```ts
// 날짜만 받는 함수(solarToLunar·lunarToSolar·getGapja·calculateSaju(시 없이))의 마지막 선택 인자
solarToLunar(2024, 2, 4, { boundaryRule: 'noon' });         // 기본: 그날 정오의 값(절입 분이 12:00 이하면 새 달)
solarToLunar(2024, 2, 4, { boundaryRule: 'day-end' });      // 절입일은 하루 전체를 새 달로(책력 표기) → 갑진년 병인월
solarToLunar(2024, 2, 4, { boundaryRule: 'day-start' });    // 절입일은 하루 전체를 앞 달로 → 계묘년 을축월
solarToLunar(2024, 2, 4, { boundaryRule: 'legacy-fixed' }); // 1.1.0의 고정 날짜 규칙(옮겨 가는 동안만, 2.0에서 없앰)
lunarToSolar(2023, 12, 25, false, { boundaryRule: 'day-end' });
calculateSaju(2024, 2, 4, undefined, 0, { boundaryRule: 'day-end' });
```

### 한국 표준시와 서머타임 (`clock`, v1.2.0)

한국의 법정 시계는 늘 UTC+9가 아니었습니다(1908~1911·1954~1961년 UTC+8:30, 1948~1951·1955~1960·1987~1988년 여름 서머타임). 시각을 받는 함수(`calculateSaju`·`getGapjaAt`·`getJeolAround`·`getSajuMonthAt`)의 옵션 `clock`으로 입력 시각을 읽는 법을 고릅니다.

| 값 | 입력 시각을 읽는 법 |
|---|---|
| `'kst-fixed'`(기본) | 언제나 UTC+9 (1.1.0까지와 같음) |
| `'korea-legal'` | 그때의 한국 법정 시계(IANA tz database `Asia/Seoul`, 서머타임 포함). 시주의 경도 보정도 그 시계의 자오선(UTC 차이 ÷ 4분) 기준이라, 서머타임이면 표준시보다 1시간 더 빠집니다. 서머타임 0시대(벽시계 0:00~0:59)는 표준시로 아직 전날이므로 일주도 하루 전 날의 일진입니다 |
| `{ utcOffsetMinutes: n }` | 호출자가 준 고정 차이(−720~840, 해외 출생 등). 출생지가 한국이 아닐 수 있으므로 **`longitude`를 함께 줄 때만** 경도 보정을 합니다(주지 않으면 보정 없음). 일주는 입력 날짜 그대로 |

```ts
// 기본(kst-fixed)으로 셈했는데 그때 법정 시계가 UTC+9가 아니었으면 알림을 단다
calculateSaju(1960, 6, 1, 12, 0).clockNotice;
// { legalOffsetMinutes: 570, dst: true, message: '이때 한국의 법정 시계는 UTC+9:30(서머타임)이라 …' }

// 그때 시계로 적은 시각이면
calculateSaju(1960, 6, 1, 12, 0, { clock: 'korea-legal' });

// 서머타임이 끝나며 두 번 지나간 시각(1987-10-11 02:00~02:59): fold 0 = 앞의 것(기본), 1 = 뒤의 것
calculateSaju(1987, 10, 11, 2, 30, { clock: 'korea-legal', fold: 1 });

// 해외 출생(예: 베이징 UTC+8)
getGapjaAt(2024, 2, 4, 16, 27, { clock: { utcOffsetMinutes: 480 } }).monthPillar; // '병인'

// 뉴욕(UTC−5) 정오: longitude를 주지 않으면 경도 보정 없이 오시, 주면 그 경도로 보정
calculateSaju(2000, 1, 1, 12, 0, { clock: { utcOffsetMinutes: -300 } }).hourPillar;                 // '무오'
calculateSaju(2000, 1, 1, 12, 0, { clock: { utcOffsetMinutes: -300 }, longitude: -74 }).correctedTime; // { hour: 12, minute: 4 }

// 1988년 서머타임(UTC+10) 7월 1일 0시 10분: 표준시로는 6월 30일 23시 10분이라 일주는 6월 30일
calculateSaju(1988, 7, 1, 0, 10, { clock: 'korea-legal' }); // 무진년 무오월 병진일 기해시
```

1.x의 기본값은 `'kst-fixed'` 그대로입니다(바꾸면 그 기간에 태어난 사람의 값이 달라지므로 2.0에서 정합니다). 날짜만 받는 함수는 언제나 고정 UTC+9의 날짜·정오를 쓰고, 법정 시계가 달랐던 때의 절입일에는 `sajuBoundary.atLegalClock`에 그 시계로 본 시각을 함께 줍니다(예: 1954년 대설은 고정 UTC+9로 12월 8일 00:29, 법정 시계로 12월 7일 23:59).

### 직전 절·다음 절, 입춘, 사주 월 (v1.2.0)

```ts
import { getJeolAround, getIpchun, getSajuMonthAt, getSajuBoundary } from '@fullstackfamily/manseryeok';

getJeolAround(1990, 5, 15, 14, 30);
// { prev: { name: '입하', month: 5, day: 6, hour: 3, minute: 35, … },
//   next: { name: '망종', month: 6, day: 6, hour: 7, minute: 46, … } }   — 대운 계산 등에

getIpchun(2024);                         // { name: '입춘', year: 2024, month: 2, day: 4, hour: 17, minute: 27, … }
getSajuMonthAt(2024, 2, 4);              // 12 (축월, 정오의 값)
getSajuMonthAt(2024, 2, 4, 17, 27);      // 1 (인월)
getSajuBoundary(2024, 2, 4)?.at;         // { year: 2024, month: 2, day: 4, hour: 17, minute: 27 }
```

> **사주 월 번호가 두 가지입니다.** `getJeolAround(…).prev.sajuMonth`·`getIpchun(…).sajuMonth` 등 `SolarTermWithDate.sajuMonth`는 `SOLAR_TERM_NAMES`와 같은 번호라 입춘이 **2**입니다(소한 1 … 대설 12). `getSajuMonthAt`·`getSajuMonth`는 입춘 뒤가 **1**(인월)입니다. `getSajuMonthAt = SolarTermWithDate.sajuMonth − 1`(0이면 12)입니다. 1.x 호환 때문에 둘 다 그대로 둡니다.

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

### 음력 생일로 바로 사주 (`lunar`, v1.3.0)

`calculateSaju`·`getGapjaAt`에 `lunar: true`를 주면 연·월·일 인자를 음력으로 읽습니다. 윤달이면 `isLeapMonth: true`도 줍니다. 안에서는 `lunarToSolar`로 양력 날짜를 구한 뒤 양력으로 넣은 것과 똑같이 셈하고, 셈에 쓴 양력 날짜를 `solarDate`로 붙입니다.

```ts
import { calculateSaju, getGapjaAt } from '@fullstackfamily/manseryeok';

const saju = calculateSaju(2024, 1, 1, 10, 0, { lunar: true }); // 음력 2024년 정월 초하루 10시
saju.solarDate;   // { year: 2024, month: 2, day: 10 }
// 나머지는 calculateSaju(2024, 2, 10, 10, 0)과 같다

getGapjaAt(2023, 2, 1, 9, 30, { lunar: true, isLeapMonth: true }).solarDate; // { year: 2023, month: 3, day: 22 } (윤2월)
```

- 그 해에 없는 윤달, 작은달의 30일 등 없는 음력 날짜는 `InvalidDateError`, 범위 밖 해는 `OutOfRangeError`(`lunarToSolar`와 같음). 음력 범위는 1391-01-01 ~ 2050-11-18입니다.
- `lunar` 없이 `isLeapMonth: true`만 주면 실수로 보고 `TypeError`를 던집니다.
- 새 함수(`calculateSajuFromLunar` 등)를 만들지 않고 옵션으로 둔 까닭: 인자 차례(연·월·일·시·분·옵션)가 양력과 같아 화면에서 양력·음력 선택만 옵션으로 넘기면 되고, `clock`·`longitude`·`equationOfTime` 같은 다른 옵션과 그대로 섞어 쓸 수 있으며, 1.2.0의 인자 꼴은 하나도 바뀌지 않기 때문입니다. 옵션을 주지 않으면 결과는 1.2.0과 같습니다(`solarDate`도 붙지 않음).

### 시간 보정 없이 간단 계산

```ts
import { calculateSajuSimple } from '@fullstackfamily/manseryeok';

// 시간 보정 없이 계산
const saju = calculateSajuSimple(1984, 2, 2, 2);

console.log(`사주: ${saju.yearPillar}년 ${saju.monthPillar}월 ${saju.dayPillar}일 ${saju.hourPillar}시`);
// 사주: 계해년 을축월 병인일 기축시
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

### 균시차까지 더한 진태양시 (`equationOfTime`, v1.3.0)

경도만 보정한 시각은 엄밀히는 **지방 평균시**입니다. 실제 해의 남중(시태양시)은 한 해 동안 평균 태양시보다 최대 약 16분 빠르거나(11월 초) 14분 늦습니다(2월 중순). 이 차이가 **균시차**(equation of time)입니다. `equationOfTime: true`를 주면 경도 보정에 균시차를 더해 시주를 정합니다. 기본은 꺼져 있고, 끄면 결과가 1.2.0과 똑같습니다.

```ts
import { calculateSaju, getEquationOfTime } from '@fullstackfamily/manseryeok';

// 1990-11-03 13:20 서울(경도 127)
calculateSaju(1990, 11, 3, 13, 20).correctedTime;                          // { hour: 12, minute: 48 } — 경도만: 오시
const r = calculateSaju(1990, 11, 3, 13, 20, { equationOfTime: true });
r.correctedTime;          // { hour: 13, minute: 4 } — 경도 −32분, 균시차 +16.4분 → 16분을 빼서 미시
r.equationOfTimeSeconds;  // 984.7 (보정에 쓴 균시차, 초)

// 균시차만 보기(초, + = 해시계가 빠름). 시각을 주지 않으면 그날 12:00(입력 시계)
getEquationOfTime(2024, 11, 3);   // 987 (16분 27초)
getEquationOfTime(2024, 2, 11);   // -851.6 (−14분 12초)
```

- 보정하는 경우에만 씁니다: `applyTimeCorrection: false`이거나, `clock: { utcOffsetMinutes }`인데 `longitude`가 없으면 경도 보정과 함께 균시차도 쓰지 않습니다(`equationOfTimeSeconds`도 붙지 않음).
- 보정량은 `(자오선 − 경도) × 4분 − 균시차`를 분으로 반올림한 하나의 값입니다. 자오선은 `kst-fixed`면 135도, `korea-legal`·`{ utcOffsetMinutes }`면 그 시계의 UTC 차이 ÷ 4분입니다.
- **범위는 1800-01-01 ~ 2050-12-31입니다.** 그 전 날짜에 시를 주고 `equationOfTime: true`면 `RangeError`입니다(시를 주지 않으면 보정 자체가 없으므로 오류 없음).
- 값은 날마다 12:00 UT의 균시차를 초 단위로 실은 표를 선형 보간합니다. JPL Horizons(DE441)로 구한 값과 표본 370개에서 최대 1.4초 차이입니다(만든 법과 대조는 [`data/eot/README.md`](data/eot/README.md)).

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
import { getAllSolarTerms, getSolarTermInfoByName, getSolarTermsBySajuMonth } from '@fullstackfamily/manseryeok';

// 전체 24절기 목록
const allTerms = getAllSolarTerms();
console.log('24절기 개수:', allTerms.length);
// 24절기 개수: 24

// 절기 이름으로 조회
const ipchun = getSolarTermInfoByName('입춘');
console.log('입춘:', ipchun?.hanja, '황경', ipchun?.longitude, '°');
// 입춘: 立春 황경 315 °

// 사주 월에 해당하는 절기 목록
const februaryTerms = getSolarTermsBySajuMonth(2);
console.log('2월(인월) 절기:', februaryTerms.map(t => t.name).join(', '));
// 2월(인월) 절기: 입춘, 우수
```

### 사주 월 계산 (절기 기준)

> `getSajuMonth(month, day)`는 해를 받지 않아 양력 고정 날짜로 셈하는 **대략값**입니다(1.2.0에서 `@deprecated`, 값은 1.1.0 그대로). 실제 절입 시각으로 셈하려면 `getSajuMonthAt(year, month, day, hour?, minute?)`을 쓰세요.

```ts
import { getSajuMonth } from '@fullstackfamily/manseryeok';

// 양력 날짜를 사주 월로 변환
// 사주에서 월은 절기를 기준으로 변경됩니다

// 돌려주는 번호: 1 = 인월(입춘부터) … 11 = 자월(대설부터), 12 = 축월(소한부터)
console.log('2월 1일:', getSajuMonth(2, 1));  // 12 (축월, 고정 입춘일 2/4 전)
console.log('2월 5일:', getSajuMonth(2, 5));  // 1 (인월)
console.log('2월 6일:', getSajuMonth(2, 6));  // 1 (인월)
console.log('3월 5일:', getSajuMonth(3, 5));  // 1 (인월, 고정 경칩일 3/6 전)
console.log('3월 7일:', getSajuMonth(3, 7));  // 2 (묘월)
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

// 2024년 모든 절기 시각 조회 (한국 시각 고정 UTC+9, 1.2.0부터 실제 값)
const terms2024 = getSolarTermsByYear(2024);
terms2024.forEach(term => {
  console.log(`${term.name} (${term.nameHanja}): ${term.month}월 ${term.day}일 ${term.hour}시 ${term.minute}분`);
});
// 소한 (小寒): 1월 6일 5시 49분
// 대한 (大寒): 1월 20일 23시 7분
// 입춘 (立春): 2월 4일 17시 27분
// 우수 (雨水): 2월 19일 13시 13분
// ...

// 특정 날짜의 절기 확인
const term = getSolarTermForDate(2024, 2, 4);
if (term) {
  console.log('2024년 2월 4일은', term.name, '입니다');
  console.log('절기 시각:', term.month, '월', term.day, '일', term.hour, '시', term.minute, '분');
}
// 2024년 2월 4일은 입춘 입니다
// 절기 시각: 2 월 4 일 17 시 27 분
```

### 특정 월의 절기 목록

```ts
import { getSolarTermsByMonth } from '@fullstackfamily/manseryeok';

// 2024년 2월의 절기
const februaryTerms = getSolarTermsByMonth(2024, 2);
februaryTerms.forEach(term => {
  console.log(`${term.month}/${term.day} ${term.hour}:${String(term.minute).padStart(2, '0')} - ${term.name} (${term.nameHanja})`);
});
// 2/4 17:27 - 입춘 (立春)
// 2/19 13:13 - 우수 (雨水)
```

### 지원되는 절기 연도 확인

```ts
import { getSupportedSolarTermYears } from '@fullstackfamily/manseryeok';

const supportedYears = getSupportedSolarTermYears();
console.log('절기 데이터 지원 연도:', supportedYears[0], '~', supportedYears[supportedYears.length - 1]);
// 절기 데이터 지원 연도: 1391 ~ 2050   (1.1.0까지는 2020~2030)
```

해는 절입 순간을 라이브러리 날짜(한국 시각)로 옮긴 해로 묶습니다. 그래서 1391~1581년(율리우스력)은 해마다 대한부터 다음 소한까지 24개, 1582년은 10월 5~14일이 없어 23개입니다.

## API 문서

### `solarToLunar(solarYear, solarMonth, solarDay, options?)`

양력을 음력으로 변환합니다.

**매개변수:**
- `solarYear`: 양력 년 (1391~2050, 1582-10-15 이전은 율리우스력 날짜)
- `solarMonth`: 양력 월 (1~12)
- `solarDay`: 양력 일 (1~31)
- `options.boundaryRule` (v1.2.0): 절입일의 연주·월주를 어느 쪽으로 낼지 — `'noon'`(기본, 그날 정오의 값)·`'day-end'`·`'day-start'`·`'legacy-fixed'`

**반환값:** `SolarToLunarResult`

```ts
const r = solarToLunar(2024, 3, 5);
r.lunar;              // { year: 2024, month: 1, day: 25, isLeapMonth: false }
r.gapja.dayPillar;    // '무진' (일진)
r.julianDay;          // 2460375
r.lunarMonthDays;     // 29  (그 음력 달의 날수, v1.1.0)
r.weekday;            // 2   (0=일 … 6=토, v1.1.0)
r.lunarCalendarGanji; // { year: '갑진', yearHanja: '甲辰', month: '병인', monthHanja: '丙寅' } (v1.1.0)
r.gapja.monthPillar;  // '정묘' (경칩 11:23이 든 날, 정오의 값 — v1.2.0)
r.sajuBoundary;       // { term: { name: '경칩', … }, at: { …, hour: 11, minute: 23 }, chosen: 'after', … } (v1.2.0)
```

`sajuBoundary`(v1.2.0)는 그날 절(12절)이 들면 바뀌는 시각과 앞뒤의 연주·월주를 담고, 없으면 `null`입니다. 필드: `term`(절 이름·한자·`SOLAR_TERM_NAMES` 번호), `at`(한국 시각 고정 UTC+9, 분 — 이 분부터 뒤), `atUtc`(ISO 8601 UTC, 분), `before`·`after`(연주·월주와 한자), `yearChanges`(입춘이면 `true`), `chosen`(`gapja`에 실린 쪽), `uncertainMinutes`(앞뒤 몇 분은 정할 수 없는지), `atLegalClock`(그때 법정 시계가 UTC+9가 아니었으면 그 시계로 본 시각과 `offsetMinutes`, 같으면 `null`). 날짜는 라이브러리 날짜(1582-10-04까지 율리우스력)이고, `atUtc`만 ISO 8601대로 그레고리력입니다.

`lunarCalendarGanji`는 한국천문연구원의 '세차'·'월건'과 같은 **음력 기준** 간지입니다. 사주 연주·월주(절기 기준, `gapja.yearPillar`·`gapja.monthPillar`)와는 다릅니다. 윤달에는 월건이 없어 `month`·`monthHanja`가 `null`입니다.

**예외:**
- `OutOfRangeError`: 지원 범위 밖 연도
- `InvalidDateError`: 유효하지 않은 날짜

### `lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth?, options?)`

음력을 양력으로 변환합니다.

**매개변수:**
- `lunarYear`: 음력 년 (1391~2050)
- `lunarMonth`: 음력 월 (1~12)
- `lunarDay`: 음력 일 (1~30)
- `isLeapMonth`: 윤달 여부 (기본값: false)
- `options.boundaryRule` (v1.2.0): `solarToLunar`와 같음

**반환값:** `LunarToSolarResult` (v1.1.0부터 `julianDay`·`lunarMonthDays`·`weekday`·`lunarCalendarGanji`, v1.2.0부터 `sajuBoundary`도 함께 줍니다)

### `getGapja(solarYear, solarMonth, solarDay, options?)`

특정 날짜의 60갑자를 계산합니다. 연주·월주는 기본으로 그날 정오의 값입니다(시각까지 보려면 `getGapjaAt`).

**매개변수:**
- `solarYear`: 양력 년
- `solarMonth`: 양력 월
- `solarDay`: 양력 일
- `options.boundaryRule` (v1.2.0): `solarToLunar`와 같음

**반환값:** `GapjaResult`

### `getGapjaAt(year, month, day, hour, minute?, options?)` (v1.2.0)

시각까지 주고 연주·월주·일주를 구합니다(시주 없음). 입력 시각을 절대 시각으로 바꿔 절입 시각과 견줍니다(절입 분부터 뒤). 일주는 입력 날짜의 일진입니다(다만 `korea-legal`의 서머타임 0시대는 하루 전).

- `hour`: 0~23, `minute`: 0~59(기본 0) — 범위 밖이면 `InvalidDateError`(새 함수는 시·분을 검사합니다)
- `options.clock`: `'kst-fixed'`(기본)·`'korea-legal'`·`{ utcOffsetMinutes }`(−720~840), `options.fold`: `0 | 1` — 그 밖의 값이면 `TypeError`
- `options.lunar`·`options.isLeapMonth` (v1.3.0): `lunar: true`면 연·월·일을 음력으로 읽고 결과에 `solarDate`를 붙인다

**반환값:** `GapjaResult & { sajuBoundary, nearBoundary, clockNotice }`
- `sajuBoundary`: 입력 날짜(고정 UTC+9 달력 또는 입력 시계의 달력)나 그 순간의 한국 시각 날짜에 드는 절 가운데 입력 시각에 가까운 것의 경계, `chosen`은 시각으로 정한 쪽
- `nearBoundary`: 입력 시각이 절입에서 `uncertainMinutes` 안이면 `true`(값은 그래도 견준 대로)
- `clockNotice`: `{ legalOffsetMinutes, dst, message }` 또는 `null`

### `getSajuBoundary(year, month, day)` (v1.2.0)

그 날짜(한국 시각 고정 UTC+9)에 드는 절의 경계 정보(`SajuBoundary`). 없으면 `null`. `chosen`은 기본값(정오)이 실린 쪽입니다.

### `getJeolAround(year, month, day, hour, minute?, options?)` (v1.2.0)

그 순간의 직전 절(`prev`, 절입 분이 입력 시각 이하인 마지막 절)과 다음 절(`next`)을 `SolarTermWithDate`로 줍니다(한국 시각 고정 UTC+9). 대운 계산 등에 씁니다. `options`는 `getGapjaAt`과 같습니다. 결과의 `sajuMonth`는 입춘이 2인 번호입니다(`getSajuMonthAt`과 1 다름 — 위 "사주 월 번호가 두 가지입니다").

### `getIpchun(year)` (v1.2.0)

그 해(1391~2050)의 입춘을 `SolarTermWithDate`로 줍니다. 범위 밖이면 `OutOfRangeError`.

### `getSajuMonthAt(year, month, day, hour?, minute?, options?)` (v1.2.0)

연도까지 받아 사주 월(1 = 인월 … 11 = 자월, 12 = 축월)을 구합니다. `SolarTermWithDate.sajuMonth`(입춘이 2)와 번호가 다릅니다: `getSajuMonthAt = sajuMonth − 1`(0이면 12). 시를 주면 절입 시각과 견주고, 주지 않으면 `options.boundaryRule`(기본 `'noon'`)대로 냅니다. `options`에는 `clock`·`fold`도 줄 수 있습니다.

### `calculateSaju(solarYear, solarMonth, solarDay, solarHour?, solarMinute?, options?)`

사주팔자(년주, 월주, 일주, 시주)를 계산합니다. 시간 보정을 자동으로 적용합니다.

**매개변수:**
- `solarYear`: 양력 년
- `solarMonth`: 양력 월 (1~12)
- `solarDay`: 양력 일 (1~31)
- `solarHour`: 양력 시 (0~23, 선택사항). 시를 모르면 `undefined`를 넘기세요(`null`은 1.1.0처럼 0시로 읽힙니다)
- `solarMinute`: 양력 분 (0~59, 기본값: 0)
- `calculateSaju`는 시·분의 범위를 검사하지 않습니다(1.1.0과 같음). 다만 유한한 수가 아니면(`NaN` 등) `InvalidDateError`를 던집니다(v1.2.0). 새 함수(`getGapjaAt` 등)는 범위까지 검사합니다
- `options`: 사주 계산 옵션
  - `longitude`: 경도 (기본값: 127 - 서울). `clock: { utcOffsetMinutes }`에서는 `longitude`를 함께 줄 때만 경도 보정을 합니다(v1.2.0)
  - `applyTimeCorrection`: 시간 보정 적용 여부 (기본값: true)
  - `boundaryRule` (v1.2.0): 시를 주지 않았을 때 절입일의 연주·월주(기본 `'noon'`). 시를 주면 절입 시각과 견주므로 쓰지 않습니다. 단 `'legacy-fixed'`는 시를 주어도 1.1.0처럼 고정 날짜로 냅니다
  - `clock`·`fold` (v1.2.0): 입력 시각을 읽는 시계([한국 표준시와 서머타임](#한국-표준시와-서머타임-clock-v120))
  - `lunar`·`isLeapMonth` (v1.3.0): `lunar: true`면 연·월·일을 음력으로 읽는다([음력 생일로 바로 사주](#음력-생일로-바로-사주-lunar-v130)). 결과에 `solarDate`가 붙는다
  - `equationOfTime` (v1.3.0): `true`면 경도 보정에 균시차를 더한다(기본 `false`, [균시차까지 더한 진태양시](#균시차까지-더한-진태양시-equationoftime-v130)). 1800년 전 날짜에 시를 주면 `RangeError`

**반환값:** `SajuResult` (v1.2.0부터 `sajuBoundary`·`nearBoundary`·`clockNotice`도 줍니다. 시를 주지 않으면 `nearBoundary`는 `false`, `clockNotice`는 `null`. v1.3.0: `equationOfTime: true`로 보정했으면 `equationOfTimeSeconds`도 줍니다)

시를 주면 연주·월주를 절입 시각과 견줘 정합니다(v1.2.0). 시주·일주·경도 보정의 셈은 1.1.0 그대로입니다.

**예시:**
```ts
const saju = calculateSaju(1990, 5, 15, 14, 30);
console.log(saju.yearPillar); // '경오'
console.log(saju.hourPillar); // '계미'
console.log(saju.isTimeCorrected); // true
console.log(saju.correctedTime); // { hour: 13, minute: 58 }
```

### `getEquationOfTime(year, month, day, hour?, minute?, options?)` (v1.3.0)

그 날짜·시각의 균시차(시태양시 − 평균 태양시, 초, 소수 첫째 자리)를 줍니다. 양수면 해시계가 평균 태양시보다 빠릅니다.

- `hour`: 0~23(기본 12), `minute`: 0~59(기본 0) — 범위 밖이면 `InvalidDateError`
- `options.clock`·`options.fold`: `getGapjaAt`과 같음
- 1800-01-01 전이면 `RangeError`, 2050년 뒤면 `OutOfRangeError`

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

### `getSolarTermInfoByName(name)`

절기 이름으로 절기 정보를 조회합니다.

**매개변수:**
- `name`: 절기 이름 (예: '입춘', '경칩', '동지')

**반환값:** 절기 정보 또는 undefined

### `getSolarTermInfoByIndex(index)`

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

### `getSajuMonth(month, day)` (deprecated)

양력 날짜를 사주 월로 변환합니다. 해를 받지 않아 고정 날짜로 셈하는 대략값입니다 — `getSajuMonthAt`을 쓰세요. `isBeforeLichun(month, day)`도 같은 이유로 deprecated입니다(`getIpchun`을 쓰세요). 두 함수의 값은 1.1.0 그대로입니다.

사주에서 월주는 절기(節氣)를 기준으로 계산합니다.
입춘(立春, 2월 4일경)부터 2월, 경칩(驚蟄, 3월 6일경)부터 3월, ...

**매개변수:**
- `month`: 양력 월 (1~12)
- `day`: 양력 일 (1~31)

**반환값:** `number` (1~12)

## 지원 범위

| 항목 | 범위 |
|------|------|
| 연도 | 1391년 ~ 2050년 |
| 양력 | 1391-02-05 ~ 2050-12-31 |
| 음력 | 1391-01-01 ~ 2050-11-18 (윤달 포함) |

- **양력 날짜 체계**: 1582-10-15 이전은 **율리우스력**, 그 뒤는 그레고리력입니다(한국천문연구원 자료와 같음). 1582-10-04 다음 날이 1582-10-15이고, 1582-10-05~14는 `InvalidDateError`입니다.
- 한국천문연구원 자료가 음력 1391년 1월 1일(양력 1391-02-05)부터라, 양력 1391-01-01~02-04는 `InvalidDateError`입니다.

## 알려진 제한

- **시주의 23시대 처리와 경도 보정은 1.1.0 그대로입니다.** 23시는 그날 일주에 자시를 붙이고(야자시), 경도 보정은 분만 빼는 간단한 셈입니다. 절입과 무관한 사람들의 시주가 바뀌지 않도록 1.2.0에서 고치지 않았습니다. 1.3.0의 `equationOfTime: true`를 주면 균시차까지 더한 진태양시로 셈합니다(이때는 자정을 넘는 보정도 바르게 접습니다).
- **균시차는 1800-01-01 ~ 2050-12-31만 있습니다.** 그 전 날짜에 시를 주고 `equationOfTime: true`면 `RangeError`입니다. 값은 날마다 12:00 UT의 정수 초를 선형 보간한 것이라 JPL Horizons와 최대 약 1.4초 다르고, 보정량은 분으로 반올림합니다.
- **시각을 받는 함수의 기본 시계는 고정 UTC+9(`clock: 'kst-fixed'`)입니다.** 1908~1911·1954~1961년(UTC+8:30)과 서머타임 기간에는 `clockNotice`로 알립니다. 1908년 4월 전 날짜는 서울 지방 평균시(UTC+8:27:52)와 견주므로, 시각을 주면 언제나 알림이 붙습니다. 그때의 시계로 적은 시각이면 `clock: 'korea-legal'`을 쓰세요.
- **절입 앞뒤 `uncertainMinutes`분 안은 앞인지 뒤인지 정할 수 없습니다.** 절기 시각이 분 단위이고 옛날일수록 지구 자전 보정값(ΔT)이 불확실하기 때문입니다. 이런 입력에는 `nearBoundary: true`를 답니다.

  | 해 | `uncertainMinutes` |
  |---|---|
  | 1391~1499 | 4 |
  | 1500~1599 | 3 |
  | 1600~2042 | 1 |
  | 2043~2050 | 2 (ΔT 예측이 해마다 벌어짐) |
- 절기 시각은 분 단위입니다. 절입이 정오 직후 30초 안에 든 날은 표의 시각이 12:00이 되어, 날짜만 넣으면 새 달로 나옵니다. 1391~2050년에 사흘(1587-03-06, 1660-04-04, 1809-09-08)이고 1900년 뒤에는 없습니다. 이런 날에도 `sajuBoundary`가 함께 나옵니다.
- "그날"은 한국 시각(고정 UTC+9)의 날짜입니다(한국천문연구원 발표 날짜와 같은 기준). 1908년 뒤로 법정 시계로는 절기의 날짜가 다른 때가 여덟 번 있습니다(1954 곡우·대설, 1955 동지, 1956 춘분, 1959 대서, 1960 우수, 1987 소만, 1988 대서). 이 가운데 사주 경계인 절은 1954년 대설 하나이고(고정 UTC+9로 12월 8일 00:29, 법정 시계로 12월 7일 23:59), `sajuBoundary.atLegalClock`에 그 시계의 시각이 나옵니다.

## 번들 크기

v1.1.0부터는 날짜마다 데이터를 싣지 않고, **음력 달마다 1바이트**(월·윤달·대소)만 넣은 표(8,162달, 약 11KB)와 율리우스 적일 계산으로 날짜를 만듭니다. 범위는 4배 넓어졌지만 크기는 줄었습니다.

v1.2.0은 24절기 절입 시각 15,845개를 넣었습니다. 이웃한 절기 간격이 24개 앞(한 해 전) 같은 절기의 간격과 ±13분 안에서만 달라서, 그 차이를 글자 하나로 적어 약 16KB(gzip 약 8KB)에 담았습니다. 표는 처음 쓸 때 한 번 풀어 메모리에 둡니다.

v1.3.0은 1800~2050년 날마다의 균시차 91,680개를 넣었습니다. 정수 초로 적되 이차 차분(−2~+2초)이 0인 날이 가장 많아지게 값을 골라(원본에서 ±0.75초 안) 글자 하나씩으로 적었습니다. 균시차 표가 약 97KB(gzip 약 19KB)를 차지합니다. 1391년부터 실으면 gzip으로 40KB 넘게 늘어 1800년부터만 넣었습니다(자세히는 [`data/eot/README.md`](data/eot/README.md)).

| 포맷 | v1.0.9 (1900~2050) | v1.1.0 (1391~2050) | v1.2.0 (1391~2050, 절입 시각 표 포함) | v1.3.0 (균시차 표 포함) |
|------|------|------|------|------|
| ESM | ~304 KB | ~95 KB | ~126 KB | ~225 KB |
| CJS | ~304 KB | ~96 KB | ~127 KB | ~226 KB |
| Gzip | ~103 KB | ~14 KB | ~33 KB | ~52 KB |

## 성능

| 작업 | 시간 |
|------|------|
| 양력→음력 변환 | < 0.1ms |
| 음력→양력 변환 | < 0.1ms |
| 갑자 계산 | < 0.1ms |
| 절기 조회 (연도) | 첫 호출 약 2ms(표 풀기), 그 뒤 < 0.1ms |
| 시각을 받는 연주·월주 (`getGapjaAt`) | < 0.1ms |

## 변경 이력

### v1.3.0 (2026-11-22)

새 옵션을 주지 않으면 모든 함수의 결과가 1.2.0과 같습니다(1900~2050년 날마다, npm의 1.2.0을 개발 의존성 `manseryeok-v120`으로 실제로 돌려 JSON 문자열까지 견주는 테스트로 고정). 함수 이름·인자 차례·기존 필드는 그대로이고, 결과 필드는 새 옵션을 줄 때만 붙습니다.

#### 균시차 보정 `equationOfTime`

- `calculateSaju`의 옵션 `equationOfTime: true`: 경도 보정에 균시차를 더해 진태양시로 시주를 정합니다. 보정량 = `(자오선 − 경도) × 4분 − 균시차`를 분으로 반올림. 결과에 `equationOfTimeSeconds`(쓴 균시차, 초)를 붙입니다. 기본은 꺼짐.
- 새 함수 `getEquationOfTime(year, month, day, hour?, minute?, options?)`: 그 순간의 균시차(초).
- 표: Meeus 『Astronomical Algorithms』 28장 식(VSOP87 줄인 급수로 구한 태양 겉보기 적경, 장동, 광행차)으로 1800~2050년 날마다 12:00 UT 값을 만들고(`data/eot/`, `npm run gen-eot-source`), 정수 초·이차 차분 글자로 압축해 싣습니다(`npm run gen-eot-table`). 라이브러리 안에서는 천문 계산을 하지 않고 날 사이를 선형 보간합니다.
- 검증: JPL Horizons(DE441)의 태양 시간각으로 구한 균시차와 표본 370개(1800~2050)에서 최대 1.36초, 평균 약 0.34초 차이(목표 5초). 식 자체는 1391년에도 약 1초(`data/eot/README.md`).
- 범위를 1800년부터로 줄인 까닭: 1391~2050 전체를 실으면 번들이 gzip으로 40KB 넘게 늘어납니다.

#### 음력 입력 `lunar`·`isLeapMonth`

- `calculateSaju`·`getGapjaAt`의 옵션 `{ lunar: true, isLeapMonth? }`: 연·월·일을 음력으로 읽어 `lunarToSolar`와 같은 규칙으로 양력 날짜를 구한 뒤 같은 길로 셈하고, 결과에 `solarDate`를 붙입니다.
- 새 함수(`calculateSajuFromLunar`) 대신 옵션으로 둔 까닭: 인자 차례가 양력과 같아 양력·음력 선택을 옵션 하나로 넘길 수 있고, `clock`·`longitude`·`equationOfTime`과 그대로 섞어 쓸 수 있으며, 기존 인자 꼴이 바뀌지 않습니다.
- 없는 음력 날짜는 `InvalidDateError`, `lunar` 없이 `isLeapMonth: true`만 주면 `TypeError`.

#### 그 밖

- 영어 안내 [`README.en.md`](README.en.md)를 더했습니다.
- 새 타입: `LunarInputOptions`, `SolarDate`. `SajuOptions`가 `LunarInputOptions`를 넓히고 `equationOfTime`을, `SajuResult`·`GapjaAtResult`가 선택 필드 `equationOfTimeSeconds`·`solarDate`를 얻었습니다(모두 선택 필드라 기존 코드는 그대로 컴파일됩니다).
- 번들: gzip 약 33KB → 52KB(균시차 표).
- 개발 의존성 추가(꾸러미에는 들어가지 않음): `manseryeok-v120`(이 패키지 1.2.0의 별칭, MIT).

### v1.2.0 (2026-11-22)

> 1.2.0-rc.1(`next` 꼬리표)과 같은 내용을 정식판으로 냈습니다. 옛 값이 필요하면 `boundaryRule: 'legacy-fixed'`를 쓰세요.

**가장 큰 변화: 연주·월주의 경계를 실제 절입 시각으로 바꿉니다.** 1.1.0은 2/4·3/6 같은 양력 고정 날짜로 연주·월주를 바꿔서, 절입일 앞뒤에 태어난 사람의 월주(입춘 앞뒤는 띠까지)가 틀릴 수 있었습니다. 1900~2050년 55,152일 가운데 **월주 884일, 연주 107일**이 실제와 달랐습니다(1.6%).

#### 절입 시각 표 (2026-11-22 완성)

- 1390년 대설부터 2051년 입춘까지 24절기 **15,845개**를 분 단위 절대 시각(UTC)으로 담은 표를 만들었습니다. 저장소에는 사람이 읽는 꼴(`data/terms/solar-terms.tsv` — 해, 절기 번호, UTC 분, 출처)로 두고, 라이브러리에는 이 표에서 만든 압축 데이터만 넣습니다. 라이브러리 안에서 천문 계산을 하지 않습니다.
- **1920~2028년(2,616개)**: 한국천문연구원 특일 정보(공공데이터포털 15012690)의 24절기 발표값을 그대로 씁니다. 발표값은 고정 UTC+9 시계에서 분으로 반올림한 값이라(2,616개를 견줘 반올림 가설 2,517개 일치, 버림 가설 1,406개) 9시간만 빼서 UTC로 옮겼습니다. 1950년 대한의 `2400`은 다음 날 00:00으로 읽습니다.
- **1391~1919년, 2029~2050년(13,229개)**: 태양 겉보기 황경이 15도의 배수에 이르는 순간을 천문 계산으로 구해 분으로 반올림했습니다.
- **검증**
  - 1900~2100년: JPL Horizons(DE441)로 구한 절기 순간과 태양 위치 기준 최대 3.4초 차이. 다만 2029년 뒤의 절대 시각은 앞으로의 지구 자전(ΔT) 예측에 달려 있어, Horizons의 예측과 몇 초(평균 약 6초) 다를 수 있습니다. 그래서 2029년 뒤 일부 절기는 분 값이 1분 갈릴 수 있고, 이 폭은 `uncertainMinutes`에 넣었습니다.
  - 1391~1899년: JPL Horizons(DE441) 절기 순간 12,216개를 새로 받아 견줬습니다. 태양 위치 차이는 1700~1899년 최대 1.9초, 1391~1699년 최대 5.9초(1799년 전은 Horizons의 세차 모형이 다릅니다), 절대 시각 차이는 최대 2.6초입니다.
  - 겹치는 구간: 1920~2028년의 계산값을 한국천문연구원 발표값과 견주면 날짜 2,615/2,616 일치(다른 하나가 1950년 대한 `2400`), 분 2,517 일치, 나머지 99개는 반올림 경계에서 5초 안의 1분 차이입니다. 그래서 1919→1920, 2028→2029의 이음매에서 값의 성질이 바뀌지 않습니다.
  - 1391-02-05~2050-12-31 모든 날짜에서 표로 셈한 정오의 연주·월주를 독립 계산과 견줬습니다(아래 "정오 직후 절입" 사흘만 다름).
- **ΔT(지구 자전 보정)**: 1900년 전은 Morrison·Stephenson·Hohenkerk·Zawilski (2021)의 표(Stephenson 외 2016의 갱신판)를 씁니다. JPL Horizons도 같은 모형입니다. 처음에는 2004년 판을 맞춘 다항식을 썼는데, 1391년에 Horizons와 163초까지 벌어져 바꿨습니다. 1900년 이후 값은 이 변경으로 바뀌지 않습니다.

#### 앞뒤를 정할 수 없는 폭 `uncertainMinutes`

표는 분 단위이고, 옛날일수록 ΔT가 불확실합니다. 그래서 절입 시각 앞뒤 몇 분 안에 태어난 경우는 앞인지 뒤인지 이 표로 정할 수 없다고 알려 줍니다(값은 그래도 견준 대로 냅니다). 폭은 `max(1, ceil((u + 30) / 60))`분이고, u는 그 해 절기 시각의 불확도(초), 30초는 분 반올림의 폭입니다.

| 해 | `uncertainMinutes` |
|---|---|
| 1391~1499 | 4 |
| 1500~1599 | 3 |
| 1600~2042 | 1 |
| 2043~2050 | 2 (ΔT 예측이 해마다 벌어짐) |

표와 함께 `data/terms/uncertainty.tsv`로 싣습니다.

#### 날짜만 넣었을 때: 그날 정오의 값 + `sajuBoundary`

- `solarToLunar`·`lunarToSolar`·`getGapja`·`calculateSaju`(시 없이)의 연주·월주는 **그날 한국 시각(고정 UTC+9) 12:00의 값**입니다. 절입이 없는 날(한 해 353일쯤)은 하루 종일 같아 모호함이 없습니다. 절입이 든 날은 표의 절입 분이 12:00 이하면 새 달, 12:01부터면 앞 달 — 그날 가운데 더 긴 쪽이라 시각을 모를 때 틀릴 일이 가장 적습니다.
- 마지막 선택 인자 `{ boundaryRule }`로 바꿀 수 있습니다: `'noon'`(기본), `'day-end'`(절입일은 하루 전체를 새 달 — 책력 표기), `'day-start'`(하루 전체를 앞 달), `'legacy-fixed'`(1.1.0 그대로 — 옮겨 가는 동안만, 2.0에서 없앰).
- 새 필드 **`sajuBoundary`**: 그날 12절이 들면 "몇 시 몇 분에 바뀌는지, 앞이면 무엇·뒤면 무엇"을 담습니다(절, 한국 시각, UTC 시각, `before`·`after`의 연주·월주, 연주도 바뀌는지, 실린 쪽 `chosen`, `uncertainMinutes`, 법정 시계가 달랐던 때의 시각 `atLegalClock`). 절입이 없는 날은 `null`입니다.

```ts
solarToLunar(2024, 2, 4).sajuBoundary
// { term: { name: '입춘', … }, at: { …, hour: 17, minute: 27 },
//   before: { yearPillar: '계묘', monthPillar: '을축', … },
//   after:  { yearPillar: '갑진', monthPillar: '병인', … },
//   yearChanges: true, chosen: 'before', uncertainMinutes: 1, atLegalClock: null }
solarToLunar(2024, 2, 4).gapja.yearPillar   // '계묘' — 1.1.0은 '갑진'(2/4 고정)
```

#### 시각을 넣었을 때

- `calculateSaju`에 시·분을 주면 연주·월주를 절입 시각과 견줘 정확히 냅니다. 결과에 `sajuBoundary`, `nearBoundary`(입력이 절입에서 `uncertainMinutes` 안이면 `true`), `clockNotice`를 더합니다. 시주·일주·경도 보정의 셈은 1.1.0 그대로입니다.
- 새 함수: `getGapjaAt`(시각까지 주고 연·월·일주), `getSajuBoundary`(그날의 경계 정보), `getJeolAround`(직전 절·다음 절), `getIpchun`(그 해 입춘), `getSajuMonthAt`(연도까지 받는 사주 월). 사용법은 위 [절입일의 연주·월주](#절입일의-연주월주-v120)와 API 문서.
- 옵션 `clock`: `'kst-fixed'`(1.x 기본, 언제나 UTC+9), `'korea-legal'`(그때의 법정 시계 — 1908년 전 지방 평균시 UTC+8:27:52, 1908~1911·1954~1961 UTC+8:30, 서머타임 1948~1951·1955~1960·1987~1988), `{ utcOffsetMinutes }`. 기본값은 1.x에서 바꾸지 않고, 법정 시계가 달랐던 때면 `clockNotice`로 알립니다. 서머타임이 끝나며 두 번 지나간 시각은 `fold: 0 | 1`(기본 0 = 앞의 것), 건너뛴 시각은 전이 직전의 차이로 읽고 `clockNotice.message`에 적습니다.
- 법정 시계의 전이 28개는 IANA tz database(2026f, 공개 도메인)의 `Asia/Seoul` 줄(`data/tz/asia-seoul.tzdata`)에서 만든 상수입니다. 플랫폼의 `Intl` 자료에 기대지 않습니다.
- `korea-legal`·`{ utcOffsetMinutes }`의 경도 보정은 입력을 읽은 시계의 자오선(UTC 차이 ÷ 4분)을 기준으로 합니다(서머타임이면 1시간 더 빠짐). `{ utcOffsetMinutes }`는 `longitude`를 함께 줄 때만 보정합니다. `korea-legal`의 서머타임 0시대는 표준시로 전날이라 일주(와 시간을 정하는 일간)도 하루 전 날의 일진입니다. 기본 `kst-fixed`의 셈은 1.1.0 그대로입니다.
- 옵션 검사: `fold`가 0·1이 아니거나 `utcOffsetMinutes`가 −720~840 밖이면 `TypeError`. 선택 인자에 `null`을 넘기면 주지 않은 것과 같습니다.

#### 절기 조회 함수

`getSolarTermsByYear`·`getSolarTermForDate`·`getSolarTermsByMonth`는 반환 꼴 그대로, 값을 표에서 냅니다(한국 시각 고정 UTC+9의 월·일·시·분). 지원 해가 2020~2030 → **1391~2050**으로 넓어지고, 2020~2030년의 값도 바뀝니다(1.1.0의 값은 해마다 같은 틀린 값 — 예: 2024년 입춘 5시 2분 → 17시 27분). 해 기준으로 묶을 때는 절입 순간을 라이브러리 날짜로 옮긴 해로 묶습니다. 그래서 1391~1581년(율리우스력)은 해마다 대한부터 다음 소한까지 24개, **1582년은 10월 5~14일이 없어 23개**입니다.

- `getSupportedSolarTermYears()`·`SUPPORTED_SOLAR_TERM_YEARS`: 1391~2050. `SUPPORTED_SOLAR_TERM_YEARS`의 타입은 `readonly number[]`로 넓어졌습니다(1.1.0은 2020~2030의 리터럴 튜플). 같은 이유로 `SupportedSolarTermYear` 타입도 2020~2030 리터럴의 합집합에서 `number`가 되었습니다.
- `SOLAR_TERMS_DATA`: 없애지 않고 같은 꼴(`{ [year]: SolarTermDateTime[] }`)을 표에서 만들어 줍니다(처음 읽을 때 그 해만). `@deprecated` — `getSolarTermsByYear`를 쓰세요.
- `getSajuMonth(month, day)`·`isBeforeLichun(month, day)`: 해를 받지 않아 고칠 수 없으므로 값은 1.1.0 그대로 두고 `@deprecated`를 달았습니다(`getSajuMonthAt`·`getIpchun`을 쓰세요).
- 지원 해 밖에서 `getSolarTermsByYear`가 던지는 오류의 문구가 `Supported years: 1391~2050`으로 바뀌었습니다.

#### 값이 달라지는 날

| 구간 | 날 수 | 월주 다름 | 연주 다름 |
|---|---|---|---|
| 1900~2050 | 55,152 | 884 | 107 |
| 1582-10-15~1899-12-31 (그레고리력) | 115,860 | 1,337 | 124 |
| 1391-02-05~1582-10-04 (율리우스력) | 70,005 | 20,204 | 1,670 |

- 율리우스력 구간은 1.1.0이 그레고리력 기준의 고정일(2/4·3/6…)을 그대로 대어 경계가 통째로 열흘쯤 어긋나 있었습니다.
- 달라지는 날짜의 전체 목록은 `docs/1.2.0-changed-dates.tsv`(1900~2050, 884줄 — npm 꾸러미에도 들어 있음)와 `docs/1.2.0-changed-dates-pre1900.tsv`(1391~1899, 21,541줄 — 저장소에만)로 둡니다. 저장해 둔 사주를 고칠 때 쓰세요. 칸: `date`, `v110_year`·`v110_month`(1.1.0 값), `v120_year`·`v120_month`(1.2.0 기본값 = 정오), 절입일이면 `term`·`term_kst`(절과 절입 시각)와 `day_end_*`·`day_start_*`(다른 두 규칙의 값). 목록은 npm의 1.1.0을 실제로 돌려 만들었습니다(`npm run gen-changed-dates`).
- 옛 값이 필요하면 `boundaryRule: 'legacy-fixed'`(1.1.0을 그대로 되살림 — 율리우스력 날짜에도 2/4·3/6… 그대로).
- 음력 변환·일주·요일·`julianDay`·`lunarCalendarGanji`는 바뀌지 않습니다(241,017일 전수를 1.1.0과 같게 테스트로 고정). 함수 이름·인자·기존 필드도 그대로이고 더하기만 합니다.
- **타입에서는 순수한 더하기가 아닙니다.** `SolarToLunarResult`·`LunarToSolarResult`에 `sajuBoundary`, `SajuResult`에 `sajuBoundary`·`nearBoundary`·`clockNotice`가 필수 필드로 늘었습니다. 이 타입의 객체를 직접 만드는 TypeScript 코드(테스트 목 등)는 이 필드를 넣어야 컴파일됩니다. 라이브러리가 돌려준 값을 읽기만 하는 코드는 그대로입니다.

#### 정오 직후 절입 (알려진 제한으로 남김)

절입이 정오 직후 30초 안(12:00:01~12:00:29)인 날은 표의 분이 12:00이 되어, 날짜만 넣으면 새 달로 나옵니다. 초 단위로 보면 정오에는 아직 앞 달입니다. 1391~2050년에 사흘(1587-03-06, 1660-04-04, 1809-09-08)이고 1900년 뒤에는 없습니다. 날짜만 넣은 결과와 `getGapjaAt(…, 12, 0)`의 결과가 언제나 같게 하려고 표 쪽을 정답으로 두었고, 이런 날에도 `sajuBoundary`가 함께 나옵니다.

#### 테스트

- 1.1.0과 전수 견줌(241,017일, npm의 1.1.0을 개발 의존성으로 실제로 돌림): 음력·일주·요일·`julianDay`·`lunarCalendarGanji`·음력 달 날수가 모두 같고, `legacy-fixed`가 1.1.0의 연주·월주를 그대로 되살리며, 달라진 날이 목록 파일과 같고 숫자가 위 표와 같음.
- 모든 날짜에서 날짜만 넣은 값 = `getGapjaAt(…, 12, 0)`, `sajuBoundary`의 `before`·`after` = 앞날·뒷날의 값, 절입일이 아닌 날은 앞날과 같음.
- 절입 시각 표: 원본 TSV와 전부 같음, 한국천문연구원 발표값 2,616개와 같음, 간격 14~16.5일·단조 증가, 해 기준 조회의 개수(1582년 23개).
- 절입 앞뒤 1분 격자(1900~2050년 12절 × 151해 = 1,812개): 절입 분은 `after`, 1분 앞은 `before`, `nearBoundary`는 `uncertainMinutes` 안에서만 `true`.
- `boundaryRule` 넷, `clock` 셋(법정 시계 전이 28개 앞뒤, 두 번·건너뛴 시각), 정오 직후 절입 사흘, 1954년 대설의 `atLegalClock`.
- 독립 대조: [lunar-javascript](https://github.com/6tail/lunar-javascript)(MIT) 1.7.8의 절입 순간 기준 연주·월주와 1900~2050년 12절 ±1분 3,624개를 UTC+8 벽시계로 견줘 모두 같음(`src/__tests__/fixtures/lunar-javascript-grid.tsv`, `npm run gen-lunar-javascript-vectors`로 다시 만듦).
- 개발 의존성 추가(꾸러미에는 들어가지 않음): `lunar-javascript`(MIT), `manseryeok-v110`(이 패키지 1.1.0의 별칭, MIT).

#### 남은 일

앱용 Dart 사본 갱신.

### v1.1.0 (2026-11-20)

- **지원 범위 확장**: 1900~2050년 → **1391~2050년**. 한국천문연구원 음양력 정보제공 서비스에서 1391~2050년 전체(241,017일, 음력 달 8,162개)를 받아 음력 달 표로 만들었습니다. 1582-10-15 이전 양력은 율리우스력입니다.
- **새 필드**: `solarToLunar()`·`lunarToSolar()` 결과에 `lunarMonthDays`(음력 달 날수), `weekday`(요일), `lunarCalendarGanji`(세차·월건, 음력 기준)를 더했습니다. `lunarToSolar()`도 `julianDay`를 줍니다. 기존 필드는 그대로입니다.
- **크기**: 날짜별 데이터 대신 음력 달 표(달마다 1바이트)를 써서 번들이 약 304KB → 96KB(gzip 103KB → 14KB)로 줄었습니다.
- **버그 수정**: 1908·1912·1948~1951·1955·1957~1961년의 12월 31일 하루만 연주·월주가 앞뒤 날과 다르게 나오던 문제 수정(예: 1908-12-31 임신년 임자월 → 무신년 갑자월).
- **호환성**: 1900~2050년 55,152일 전수 대조에서 위 12일을 빼고 v1.0.9와 결과가 같습니다(`solarToLunar`·`getGapja`·`lunarToSolar`·`getMonthlyIndex`). 241,017일 전부를 한국천문연구원 응답(음력 날짜·윤달·율리우스 적일·일진·요일·세차)과 대조해 일치함을 확인했습니다.
  - `isSupportedYear()`·`getSupportedRange()`가 1391년부터 `true`/`{ min: 1391 }`을 돌려줍니다. 1900년 이전이면 `OutOfRangeError`가 난다는 데 기대던 코드는 확인이 필요합니다.
- **한국천문연구원 자료의 불일치(참고)**: 1597년 음력 8·9월의 '월일수' 필드가 실제 날짜 흐름과 뒤바뀌어 있어 날짜 흐름을 따랐고, 같은 음력 달 안에서 월건이 바뀌는 날 17일은 달 단위 규칙을 따랐습니다.
- **개발**: 예제·`examples-test.js`가 1.0.8에서 바뀐 ESM 파일 이름(`dist/index.mjs`)을 가리키게 고쳤습니다. 데이터 생성은 `npm run gen-lunar-table`(입력 `data/kasi/lunar-months.tsv`).

### v1.0.9 (2026-11-20)

- **버그 수정**: `lunarToSolar()`가 다음 해 양력 1~2월에 해당하는 음력 11·12월 날짜를 찾지 못하던 문제 수정 (Issue [#9](https://github.com/urstory/manseryeok-js/issues/9), PR [#10](https://github.com/urstory/manseryeok-js/pull/10) by [@westkite1201](https://github.com/westkite1201))
  - 예: 음력 1988-12-18 → 양력 1989-01-25가 `InvalidDateError`를 던지던 문제
- **버그 수정**: 만세력 데이터에서 빠져 있던 양력 1956-12-31(음력 1956-11-30, 임신일) 추가 (Issue [#11](https://github.com/urstory/manseryeok-js/issues/11), 제보 [@westkite1201](https://github.com/westkite1201))
  - 1900-01-01 ~ 2050-12-31 전체 날짜가 빠짐없이 이어지는지 검사하는 테스트 추가
- **개발**: `npm test` 전에 압축 데이터를 자동 생성하도록 `pretest` 스크립트 추가

### v1.0.8 (2026-03-28)

- **버그 수정**: `"type": "module"` 제거로 CJS 호환성 수정 (PR [#6](https://github.com/urstory/manseryeok-js/pull/6) by [@Magiof](https://github.com/Magiof))
  - `"type": "module"`이 설정되어 있어 CJS 출력(`dist/index.js`)을 Node.js가 ESM으로 해석하려는 문제 수정
  - ESM 출력 파일을 `.mjs` 확장자로 변경하여 명시적 모듈 포맷 구분
  - `rollup.config.js` → `rollup.config.mjs` 변경

### v1.0.7 (2026-02-24)

- **버그 수정**: 월주(monthPillarId)가 음력 월초 기준으로 계산되던 문제를 절기(節氣) 기준으로 수정 ([#5](https://github.com/urstory/manseryeok-js/issues/5))
  - 사주에서 월주는 절기를 기준으로 변경되어야 하나, 원본 데이터가 음력 월초 기준으로 되어 있어 전체 날짜의 약 18%가 잘못된 월주를 반환
  - 年上起月法(오호둔법)으로 월주를 재계산하여 압축 데이터 재생성
  - `getSajuMonth()` 기본값 버그 수정: 1월 소한 이전 구간이 축월(12) 대신 자월(11)을 반환하도록 수정
- **테스트 추가**: 월주 절기 기준 검증 테스트 (26개)
  - 1996년 전체 월 순환 (11개), 절기 경계 전후 (6개), 오호둔법 연간별 (5개), 경계 연도 1900/2050 (4개)

### v1.0.6 (2026-02-20)

- **버그 수정**: 60갑자 데이터의 지지(地支) 오행 매핑 오류 수정 (PR [#4](https://github.com/urstory/manseryeok-js/pull/4) by [@9ine-won](https://github.com/9ine-won))
  - 진(辰, 용): 화 → 토 (5곳)
  - 오(午, 말): 토 → 화 (5곳)
  - 술(戌, 개): 금 → 토 (5곳)
  - 올바른 12지지 오행: 子수, 丑토, 寅목, 卯목, 辰토, 巳화, 午화, 未토, 申금, 酉금, 戌토, 亥수

### v1.0.5 (2026-02-11)

- **버그 수정**: 24절기 sajuMonth 매핑 오류 수정 (PR [#2](https://github.com/urstory/manseryeok-js/pull/2) by [@Youshin](https://github.com/Youshin))
  - 한로~대한(7개 절기)의 sajuMonth가 1씩 밀려있던 off-by-one 오류 수정
  - 수정 전: sajuMonth=9에 절기 3개, sajuMonth=1에 절기 0개 (비정상)
  - 수정 후: 모든 sajuMonth(1~12)에 절기 2개(절기+중기)씩 정상 매핑
- **테스트 추가**: 24절기 sajuMonth 매핑 및 사주월 계산 회귀 테스트 (33개)
- **문서 수정**: README 예시 결과값을 실제 라이브러리 출력과 일치하도록 수정
  - 사주 계산 결과 오류, 윤년 판별 오류, 지원 범위 표기, 오타 등

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

## 기여

이 프로젝트에 기여하고 싶으시다면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해 주세요.
