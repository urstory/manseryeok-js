# @fullstackfamily/manseryeok

[한국어](README.md) | **English**

Korean lunar calendar (*manseryeok*, 만세력) library for JavaScript and TypeScript. It converts between solar and Korean lunar dates and gives the sexagenary (ganji) pillars used in Korean *saju* — year, month, day and hour — with real solar-term (*jeolgi*) boundaries, Korean historical clock handling and true solar time.

This is an English summary. The full documentation, including every option and the detailed change log, is the Korean [README.md](README.md).

**Scope.** The library provides calendar data only: lunar–solar conversion, ganji, solar terms and time handling. It does not interpret fortunes (no ten gods, great luck periods, void branches and so on).

**Why a Korean calendar?** Korean and Chinese lunar calendars share rules but differ in practice: leap months often fall in different places because Korea computes new moons on UTC+9. The data here comes from the Korea Astronomy and Space Science Institute (KASI) lunar calendar service for 1391–2050 (public data, no usage restrictions), and solar-term instants come from KASI announcements (1920–2028) and astronomical computation (other years).

- 1391–2050, no database, all data compressed into the bundle (gzip about 52 KB)
- Full TypeScript types, ESM and CommonJS builds, no runtime dependencies

## Install

```bash
npm install @fullstackfamily/manseryeok
```

## Usage

Pillar names are returned in Hangul (`yearPillar`) and in Chinese characters (`yearPillarHanja`).

### Solar ↔ lunar

```ts
import { solarToLunar, lunarToSolar } from '@fullstackfamily/manseryeok';

const r = solarToLunar(2026, 2, 17);
r.lunar;            // { year: 2026, month: 1, day: 1, isLeapMonth: false }  (Korean New Year)
r.gapja.yearPillar; // '병오' (丙午)

lunarToSolar(2024, 1, 1).solar;        // { year: 2024, month: 2, day: 10 }
lunarToSolar(2023, 2, 1, true).solar;  // { year: 2023, month: 3, day: 22 }  (leap 2nd month)
```

### Four pillars (saju)

```ts
import { calculateSaju } from '@fullstackfamily/manseryeok';

const saju = calculateSaju(1990, 5, 15, 14, 30); // 1990-05-15 14:30, Korean time
saju.yearPillar;    // '경오' 庚午
saju.monthPillar;   // '신사' 辛巳
saju.dayPillar;     // '경진' 庚辰
saju.hourPillar;    // '계미' 癸未
saju.correctedTime; // { hour: 13, minute: 58 } — longitude correction (default 127°E, Seoul)
```

Pass `undefined` as the hour when the birth time is unknown; then `hourPillar` is `null`.

### Solar-term boundaries (since 1.2.0)

The year and month pillars change at the exact instant of a *jeol* (the 12 odd solar terms such as Ipchun, 立春). In 2024 Ipchun fell at 17:27 KST on February 4.

```ts
import { solarToLunar, getGapjaAt } from '@fullstackfamily/manseryeok';

// Date only: the value at 12:00 KST that day, plus the boundary details
solarToLunar(2024, 2, 4).gapja.yearPillar;      // '계묘' (still the previous year at noon)
solarToLunar(2024, 2, 4).sajuBoundary?.at;      // { year: 2024, month: 2, day: 4, hour: 17, minute: 27 }

// With a time: compared with the boundary instant
getGapjaAt(2024, 2, 4, 17, 26).monthPillar;     // '을축'
getGapjaAt(2024, 2, 4, 17, 27).monthPillar;     // '병인' (nearBoundary: true — within the table's uncertainty)
```

Date-only functions take `{ boundaryRule }`: `'noon'` (default), `'day-end'`, `'day-start'` or `'legacy-fixed'` (the 1.1.0 fixed-date rule, kept only for migration).

### Korean clocks (`clock`, since 1.2.0)

Korea's legal clock was not always UTC+9 (UTC+8:30 in 1908–1911 and 1954–1961, daylight saving time in some summers, local mean time before 1908). Functions that take a time accept:

| `clock` | How the input time is read |
|---|---|
| `'kst-fixed'` (default) | Always UTC+9 |
| `'korea-legal'` | The legal clock of that time (IANA `Asia/Seoul`, including DST). Use `fold: 0 \| 1` for repeated times |
| `{ utcOffsetMinutes }` | A fixed offset you give (−720 to 840), e.g. births abroad. Longitude correction applies only when `longitude` is also given |

With the default clock, `clockNotice` tells you when the legal clock of that date was different.

### True solar time with the equation of time (since 1.3.0)

Longitude correction alone gives local mean time. `equationOfTime: true` also adds the equation of time (apparent minus mean solar time, up to about +16 min in early November and −14 min in mid-February).

```ts
import { calculateSaju, getEquationOfTime } from '@fullstackfamily/manseryeok';

calculateSaju(1990, 11, 3, 13, 20).correctedTime;  // { hour: 12, minute: 48 } — longitude only
const r = calculateSaju(1990, 11, 3, 13, 20, { equationOfTime: true });
r.correctedTime;          // { hour: 13, minute: 4 } — the hour pillar changes to 정미 丁未
r.equationOfTimeSeconds;  // 984.7

getEquationOfTime(2024, 11, 3); // 987 (seconds, at 12:00 of the given clock by default)
```

The equation of time is a daily table (12:00 UT, whole seconds, linear interpolation in between) for 1800-01-01 to 2050-12-31. Compared with JPL Horizons (DE441) it is within 1.4 seconds. Earlier dates with a time throw `RangeError` when the option is on.

### Lunar birth dates (since 1.3.0)

```ts
import { calculateSaju, getGapjaAt } from '@fullstackfamily/manseryeok';

const s = calculateSaju(2024, 1, 1, 10, 0, { lunar: true }); // lunar 2024-01-01 10:00
s.solarDate;  // { year: 2024, month: 2, day: 10 } — the rest equals calculateSaju(2024, 2, 10, 10, 0)

getGapjaAt(2023, 2, 1, 9, 30, { lunar: true, isLeapMonth: true }).solarDate; // { year: 2023, month: 3, day: 22 }
```

`lunar` is an option rather than a separate function so that the argument order stays the same and it combines with `clock`, `longitude` and `equationOfTime`.

## API

| Function | Description |
|---|---|
| `solarToLunar(y, m, d, options?)` | Solar → lunar date, ganji, day count of the lunar month, weekday, `sajuBoundary` |
| `lunarToSolar(y, m, d, isLeapMonth?, options?)` | Lunar → solar date and the same fields |
| `getGapja(y, m, d, options?)` | Year, month and day pillars of a date (value at noon) |
| `getGapjaAt(y, m, d, hour, minute?, options?)` | Year, month and day pillars at a time (`clock`, `fold`, `lunar`, `isLeapMonth`) |
| `calculateSaju(y, m, d, hour?, minute?, options?)` | Four pillars with time correction (`longitude`, `applyTimeCorrection`, `boundaryRule`, `clock`, `fold`, `equationOfTime`, `lunar`, `isLeapMonth`) |
| `calculateSajuSimple(y, m, d, hour?)` | Four pillars without time correction |
| `getEquationOfTime(y, m, d, hour?, minute?, options?)` | Equation of time in seconds (1800–2050) |
| `getSajuBoundary(y, m, d)` | The jeol boundary on that date, or `null` |
| `getJeolAround(y, m, d, hour, minute?, options?)` | Previous and next jeol around a moment |
| `getIpchun(year)` | Ipchun (start of spring) of a year |
| `getSajuMonthAt(y, m, d, hour?, minute?, options?)` | Saju month (1 = 寅 … 12 = 丑) |
| `getSolarTermsByYear(year)`, `getSolarTermForDate(y, m, d)`, `getSolarTermsByMonth(y, m)` | Solar-term instants (KST, minutes) |
| `getAllSolarTerms()`, `getSolarTermInfoByName(name)`, `getSolarTermInfoByIndex(i)`, `getSolarTermsBySajuMonth(n)` | Solar-term reference data |
| `isSupportedYear(year)`, `getSupportedRange()`, `getSupportedSolarTermYears()` | Supported range |
| `SIXTY_PILLARS`, `getPillarById(id)`, `getPillarByHangul(name)` | The sixty ganji |
| `getMonthlyIndex(y, m)`, `SOLAR_TO_LUNAR_INDEX` | Low-level monthly index |
| `getSajuMonth(m, d)`, `isBeforeLichun(m, d)`, `SOLAR_TERMS_DATA` | Deprecated (kept for compatibility) |

Errors: `OutOfRangeError` (year outside 1391–2050) and `InvalidDateError` (a date or time that does not exist). Invalid option values throw `TypeError`.

## Supported range

| Item | Range |
|---|---|
| Years | 1391–2050 |
| Solar dates | 1391-02-05 to 2050-12-31 |
| Lunar dates | 1391-01-01 to 2050-11-18 (with leap months) |
| Solar terms | 1391–2050 (minutes) |
| Equation of time | 1800-01-01 to 2050-12-31 |

Solar dates before 1582-10-15 are Julian calendar dates, as in the KASI data (1582-10-05 to 1582-10-14 do not exist).

## Known limitations

- The hour pillar keeps the 1.1.0 conventions: 23:00–23:59 uses the same day's day pillar (*yajasi*), and the default longitude correction is a simple minute subtraction.
- The default clock is fixed UTC+9. Use `clock: 'korea-legal'` for times written on the clock of that period.
- Solar-term instants are stored in minutes. Within `uncertainMinutes` (1 minute for 1600–2042, up to 4 minutes for older years) of a boundary, the side cannot be decided from the table; results carry `nearBoundary: true`.
- Absolute times after 2028 depend on predicted ΔT (Earth rotation) and may differ by a few seconds from other sources.
- The equation-of-time table covers 1800–2050 only, to keep the bundle small.

## Change log (summary)

- **1.3.0** (2026-11-22): `equationOfTime` option and `getEquationOfTime` (1800–2050); `lunar` / `isLeapMonth` options for `calculateSaju` and `getGapjaAt`; this English README. Results without the new options are identical to 1.2.0.
- **1.2.0** (2026-11-22): year and month pillars change at the real solar-term instants instead of fixed solar dates (884 month pillars and 107 year pillars change in 1900–2050); `getGapjaAt`, `getSajuBoundary`, `getJeolAround`, `getIpchun`, `getSajuMonthAt`; `clock` option for Korean historical clocks; solar-term functions cover 1391–2050.
- **1.1.0** (2026-11-20): range extended from 1900–2050 to 1391–2050 with KASI data; new fields `lunarMonthDays`, `weekday`, `lunarCalendarGanji`; much smaller bundle.
- **1.0.x**: first stable release (1900–2050) and fixes for zodiac animals, solar-term month mapping, branch elements, month pillars, CommonJS loading and lunar-to-solar lookups across the year end.

See the Korean [README.md](README.md#변경-이력) for details.

## License

MIT
