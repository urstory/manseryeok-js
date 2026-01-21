# Contributing to @urstory/manseryeok

기여해 주셔서 감사합니다! 이 프로젝트에 기여하는 방법을 안내해 드립니다.

## 이슈 보고

버그를 발견하거나 기능 요청이 있으시다면 [GitHub Issues](https://github.com/urstory/manseryeok-js/issues)를 생성해 주세요.

이슈를 생성할 때 다음 정보를 포함해 주시면 도움이 됩니다:

- 버전 정보 (`@urstory/manseryeok` 버전)
- 사용 중인 Node.js 버전
- 재현 가능한 코드 예시
- 기대 동작과 실제 동작
- 운영체제

## 개발 환경 설정

### 1. 레포지토리 복제

```bash
git clone https://github.com/urstory/manseryeok-js.git
cd manseryeok-js
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발용 스크립트

```bash
# 빌드
npm run build

# 테스트 실행
npm test

# 타입 체크
npm run typecheck

# 테스트 감시 모드
npm run test:watch

# 테스트 커버리지 확인
npm run test:coverage
```

## 코드 스타일

- TypeScript를 사용합니다
- 2 스페이스 들여쓰기를 사용합니다
- 함수와 클래스에는 JSDoc 주석을 작성합니다
- Korean Lunar Calendar 관련 용어는 한글/한자를 함께 표기합니다

### 예시

```ts
/**
 * 양력을 음력으로 변환합니다.
 * @param solarYear 양력 년 (1900~2050)
 * @param solarMonth 양력 월 (1~12)
 * @param solarDay 양력 일 (1~31)
 * @returns 음력 날짜와 갑자 정보
 */
export function solarToLunar(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): SolarToLunarResult {
  // 구현
}
```

## 풀 리퀘스트 보내기

1. Fork 레포지토리
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다:

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (로직에 영향 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/도구 변경

### PR 검토 항목

- 모든 테스트가 통과해야 합니다 (`npm test`)
- 타입 체크가 통과해야 합니다 (`npm run typecheck`)
- 새로운 기능은 테스트가 포함되어야 합니다
- 문서가 업데이트되어야 합니다 (필요한 경우)

## 테스트

테스트는 Jest를 사용하며, `src/__tests__` 디렉토리에 위치합니다.

```ts
import { solarToLunar } from '../core/solar-lunar-converter';

describe('solarToLunar', () => {
  test('2024년 설날 변환', () => {
    const result = solarToLunar(2024, 2, 10);
    expect(result.lunar.month).toBe(1);
    expect(result.lunar.day).toBe(1);
  });
});
```

## 데이터 추가

데이터 범위를 확장하거나 수정해야 하는 경우:

1. 데이터 추출 스크립트: `scripts/dump-mysql-data.ts`
2. 데이터 변환 스크립트: `scripts/convert-to-js-data.ts`
3. 변환된 데이터 파일: `src/data/`

## 라이선스

기여하신 코드는 프로젝트의 [MIT 라이선스](LICENSE)에 따라 배포됩니다.

## 질문?

질문이 있으시다면 [GitHub Discussions](https://github.com/urstory/manseryeok-js/discussions)을 이용해 주세요.

---

다시 한번 기여해 주셔서 감사합니다! 🙏
