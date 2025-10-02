# PromptMate Frontend – AGENTS Playbook

## TL;DR
- **제품**: PromptMate – 프롬프트 생성 도구의 UX 데모.
- **스택**: Next.js 14(App Router) + TypeScript + **MUI v3 + Emotion(`css={{}}`) + MobX(`useLocalStore`)**. 기존 `src/components`는 재사용하되 궁극적으로 `app/` 구조로 이전합니다.
- **데이터**: 전부 클라이언트 mock. 외부 API 호출을 추가하지 않습니다.
- **가장 중요한 것**: PRD 사용자 여정을 Next.js 라우트 흐름으로 정확히 재현하고, 템플릿 정렬/파일 업로드 로직을 PRD와 일치시키는 것입니다.

## 프로젝트 컨텍스트
- 홈(작업 목적 입력) → 옵션/파일 업로드 → AI Q&A → 프롬프트 검토 → 공유 템플릿 갤러리 → 최종 결과의 여정을 유지합니다.
- 현재 레거시는 Vite + `src/App.tsx` 라우팅이지만, 신규 작업은 Next.js 구조를 기준으로 설계합니다. 레거시 컴포넌트는 새 라우트로 옮기되 기능은 깨지지 않도록 수동 QA를 병행하세요.

## 작업 시 우선순위
1. **라우팅 마이그레이션**: `app/(wizard)/`와 같은 세그먼트로 각 단계를 분리하고, `layout.tsx`로 공통 UI를 구성합니다.
2. **상태 공유**: 기존 `onNavigate(view, data)` 패턴을 `useContext` 또는 `app/providers.tsx`의 전역 store로 치환합니다. URL 파라미터를 활용해 재방문 시 상태를 복원할 수 있도록 고려하세요.
3. **Mock 데이터 관리**: 시나리오, 템플릿, FAQ 등은 `lib/mock/`에 순수 객체로 저장합니다. 서버 컴포넌트에서도 가져올 수 있게 비동기 호출을 피합니다.
4. **UI/UX 합의**: MUI v3 컴포넌트를 우선 사용하고, 커스텀 스타일은 Emotion의 `css={{}}` 속성과 디자인 토큰(`DynamicStyles.tsx`)으로만 구성합니다. 접근성 속성(`aria-*`, `role`) 누락 여부를 리뷰 체크리스트에 포함하세요.

## 코드 가이드라인
- **파일 구조**: `app/` 디렉터리를 신설할 때 `layout.tsx`, `page.tsx`, `loading.tsx` 등 Next.js 파일명을 준수합니다. 범용 로직은 `lib/`, 폼 상태는 `hooks/`로 이동합니다.
- **형식**: TypeScript strict 모드를 유지합니다. Props와 state는 명시적 타입을 선언하고, `any`를 사용할 경우 주석으로 이유를 남깁니다.
- **상태 관리**: 공유 상태는 MobX + `useLocalStore` 패턴으로 캡슐화하고, context/provider는 얇게 유지합니다.
- **스타일**: 하드코딩 색상은 금지합니다. 모든 색상·타이포·간격은 `DynamicStyles.tsx`의 디자인 토큰을 Emotion `css={{}}`에 매핑해 사용하세요.
- **컴포넌트 구성**: 가능한 작은 단위 컴포넌트를 선호하고, 이미 존재하는 컴포넌트(예: MUI 버튼)를 대신 사용할 수 있는 `div`는 추가하지 않습니다.
- **접근성**: 버튼, 링크, 입력 요소는 시맨틱 태그를 지키고, 레이블과 설명을 `aria-describedby`로 연결합니다.

## 시각화 & 외부 라이브러리 지침
- **차트**: 통계/지표 표시가 필요하면 ApexCharts를 사용합니다. 커스텀 HTML 기반 차트를 만들지 마세요.
- **Radix 사용 시**: 기존 `components/ui/*` 래퍼와 함께 쓰되, 스타일은 Emotion + 토큰으로 오버라이드합니다.
- **추가 의존성**: 무거운 신규 패키지는 도입 전에 합의가 필요합니다.

## 기존 코드와의 정합성 유지
- **템플릿 정렬**: `TemplatesPage.tsx`에 ISO 타임스탬프 필드(예: `lastUpdatedAt`)를 추가하고, 정렬 유틸(`lib/sorting.ts`)을 만들어 "Recently Updated" 옵션이 실제 최신순으로 동작하게 합니다. 표시용 문자열은 별도 포맷터에서 생성합니다.
- **파일 업로드**: `CreatePromptWizard.tsx`는 `FileReader.readAsText`만 사용합니다. 텍스트만 지원한다면 `accept=".txt"`와 안내 문구를 맞추고, `.doc/.pdf`도 필요하다면 ArrayBuffer 처리 및 파싱 로직을 추가한 뒤 QA를 진행하세요.
- **라우트 정의**: PRD 기준 페이지(`/`, `/output-options`, `/qa`, `/prompt-preview`, `/shared-gallery`, `/final`)를 Next.js App Router 세그먼트로 구성합니다. 각 페이지 컴포넌트는 필요한 mock 데이터를 직접 임포트합니다.

## 협업 및 커뮤니케이션 노트
- PR에서 해결한 사용자 스토리를 명확히 적고, 영향을 받는 페이지를 체크리스트로 나열합니다.
- PRD와 상충하는 요구 사항이 생기면 코멘트로 근거를 남긴 뒤 결정 기록을 `docs/decisions/`에 추가합니다.
- 디자인 시안이 업데이트되면 `DynamicStyles.tsx` 토큰과 MUI 테마 구성을 우선 검토한 뒤 반영하세요.

## 테스트 & 검증
- 자동화 테스트 스위트는 없음 → 변경 시 `npm run dev`로 수동 QA: 생성 플로우, 템플릿 정렬, 파일 업로드를 확인하세요.
- MobX 스토어는 최소한의 단위 테스트(가능 시 Vitest)로 파생 상태 계산을 검증하세요. 테스트 파일은 `*.test.ts(x)` 명명 규칙을 따릅니다.
- 접근성/반응형 검증을 위해 최소한의 뷰포트(모바일/데스크탑) 확인을 권장합니다.

## 리뷰 체크리스트
- [ ] Next.js 파일 구조 및 라우트 명세 준수
- [ ] Mock 데이터와 UI가 PRD 사용자 여정과 일치
- [ ] 템플릿 정렬 및 파일 업로드 시나리오 수동 검증
- [ ] MUI/Emotion 스타일 가이드 및 접근성 준수
- [ ] 타입 안정성 및 린트 경고 없음

