# PromptMate Frontend – Working Agreement

## 프로젝트 개요
- **제품명**: PromptMate (프롬프트 생성 도구 데모).
- **구성**: Next.js 14(App Router) 기반의 SPA형 UX. `app/` 디렉터리에서 라우트/레이아웃을 정의하고, 기존 `src/components`에 있는 프레젠테이션 컴포넌트를 재사용합니다.
- **데이터 소스**: 서버 연동 없이 클라이언트 상태와 mock 데이터로 UX 흐름을 시뮬레이션합니다.

## 핵심 사용자 여정 (PRD 기반)
1. **작업 목적 입력** → 홈 화면(`HomePage`)에서 시나리오 선택 및 입력.
2. **옵션 및 파일 업로드** → 생성 위저드(`CreatePromptWizard`) 단계에서 파일 첨부와 세부 옵션 설정.
3. **AI Q&A 진행** → 위저드 내 채팅 UI를 통해 mock 질문을 노출.
4. **프롬프트 초안 생성/수정** → 템플릿 적용 후 사용자가 추가 메모를 입력.
5. **공유 템플릿 탐색** → 템플릿 갤러리(`TemplatesPage`, `TemplateDetailPage`)에서 키워드 검색 및 비교.
6. **결과 활용** → 최종 화면(`FeedbackPage`)에서 복사/다운로드 UX 제공.

## 구현 가이드
- **라우팅 마이그레이션**: Next.js App Router로 화면을 분리합니다. `src/App.tsx`에 있는 뷰 전환 로직은 `app/(wizard)/` 등의 중첩 라우트로 이관하고, 전역 상태는 `app/providers.tsx`나 컨텍스트로 공급합니다.
- **상태 전달**: 화면 간 데이터 전달은 URL search params 또는 `useContext` 기반의 전역 스토어(예: React context)로 치환합니다. 기존 `onNavigate(view, data)` 패턴은 페이지 간 이동 시 `router.push`와 shared store로 대체하세요.
- **Mock 데이터**: PRD의 시나리오/템플릿 예시는 `app/(data)/mock/` 또는 `lib/mock/` 디렉터리로 이동하고, 서버 컴포넌트에서 직접 임포트 가능한 순수 객체로 유지합니다. 실제 API 호출을 추가하지 않습니다.
- **UI 규칙**: Tailwind 클래스를 기반으로 하며, Radix UI 컴포넌트 사용 시 `components/ui` 래퍼를 우선 활용합니다. 인라인 스타일은 지양합니다.
- **접근성**: 버튼/링크는 의미에 맞는 HTML 요소를 사용하고, 필요한 경우 `aria-` 속성을 추가합니다.

## 기존 코드와의 정합성
- **템플릿 정렬**: `TemplatesPage.tsx`의 "Recently Updated" 정렬은 ISO 타임스탬프(예: `lastUpdatedAt`)를 기준으로 동작해야 합니다. 사람이 읽는 문자열은 별도 필드로 보관하고, 정렬 시 날짜 객체로 변환 가능한 값을 사용하세요. Next.js로 마이그레이션할 때도 동일한 정렬 유틸리티를 분리(`lib/sorting.ts`)하여 페이지와 공유합니다.
- **파일 업로드 안내**: `CreatePromptWizard.tsx`는 현재 `FileReader.readAsText`를 사용합니다. 텍스트 파일만 지원할 경우 수락 확장자 및 안내 문구를 `.txt` 등과 일치시키고, 문서 포맷을 유지하려면 바이너리 처리로직을 도입합니다. 이 로직은 클라이언트 컴포넌트로 유지하세요.
- **페이지 명세**: PRD에 정의된 주요 경로(`/`, `/output-options`, `/qa`, `/prompt-preview`, `/shared-gallery`, `/final`)는 Next.js App Router의 세그먼트로 구현하고, 레이아웃/서버 컴포넌트 구조가 이 흐름을 명확히 반영하도록 유지/개선합니다.

## 테스트
- 공식적인 자동 테스트 스위트는 없습니다. 기능 수정 시 수동으로 주요 시나리오(작업 생성, 템플릿 검색, 결과 확인)를 검증하세요.
