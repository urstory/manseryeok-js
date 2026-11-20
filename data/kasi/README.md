# 한국천문연구원 음력 달 표

- 출처: 한국천문연구원(KASI) 음양력 정보제공 서비스 `LrsrCldInfoService/getLunCalInfo` — 공공데이터포털 https://www.data.go.kr/data/15012679/openapi.do (이용허락 제한 없음)
- 받은 날: 2026-11-20. 1391~2050년을 달 단위(7,920회)로 받아 241,017일을 정리했다.
- `lunar-months.tsv`: 음력 달마다 한 줄 — `start_jd`(그 달 1일의 율리우스 적일), `lun_year`, `lun_month`, `lun_leap`(1=윤달), `lun_nday`(날수), `partial`(범위 끝에서 잘린 달).
- 달 날수는 응답의 '월일수' 필드가 아니라 실제 날짜 흐름(다음 달 시작 − 이번 달 시작)으로 정했다. 1597년 음력 8·9월은 필드가 실제와 뒤바뀌어 있다.
- 양력 날짜 체계: 1582-10-15 이전은 율리우스력(응답에 섞여 오는 존재하지 않는 1582-10-05~14는 버림).
- 이 파일로 `npm run gen-lunar-table`이 `src/data/lunar-table.ts`를 만든다.
