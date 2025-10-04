# PromptMate – PRD (데모용 / 바이브코딩 최적화)

## 목적
AI 기반 프롬프트 생성 도구의 UX 데모를 빠르게 검증한다.  
- 내부 시연 및 이해관계자 설득용  
- 모든 데이터는 로컬 Mock  
- 인증·DB·외부 API 호출 없음

---

## 현재 기술 스택
- **Framework**: Vite + React 18 (단일 페이지, `src/main.tsx` 진입)
- **언어**: TypeScript (strict)
- **스타일**: Tailwind CSS 4.1 빌드 아웃(`src/index.css`), 유틸 클래스 기반 레이아웃
- **UI 컴포넌트**: Radix + shadcn 래퍼 (`src/components/ui/*`)
- **상태 관리**: 지역 `useState` + `onNavigate(view, data)` 패턴 (`src/App.tsx`)
- **아이콘**: `lucide-react`
- **배포**: 로컬 실행(`npm run dev`), 정적 빌드(`npm run build`)

> ⚠️ 향후 Next.js(App Router) + MobX + Emotion 도입이 목표이지만, 현 시점 프론트는 Vite 구조를 유지합니다.

---

## 파일 구조 스냅샷
```
src/
 ├─ App.tsx                 // 뷰 전환 스위치
 ├─ main.tsx                // Vite 엔트리
 ├─ components/
 │   ├─ HomePage.tsx        // 작업 목적 입력
 │   ├─ CreatePromptWizard.tsx // 옵션 + Q&A + 프롬프트 생성
 │   ├─ TemplatesPage.tsx   // 공유 템플릿 갤러리
 │   ├─ TemplateDetailPage.tsx
 │   ├─ FeedbackPage.tsx
 │   └─ ui/                 // Radix 기반 공용 UI 래퍼
 └─ styles/
     └─ globals.css         // 추가 전역 스타일 (선택 적용)
```

---

## 기능 플로우 (시나리오 기반)

### 시나리오 1 – 인수인계 자료 생성
1. **작업 입력**: HomePage에서 목적과 설명 작성
2. **파일/옵션 선택**: CreatePromptWizard Step 2에서 `lib/fileParsers.ts`로 `.txt/.doc/.docx/.pdf` 텍스트 추출 후 선호 포맷 선택
3. **AI 질문**: Step 3에서 고정 `aiQuestions` 배열에 따라 질의 → 사용자가 답변 입력
4. **프롬프트 생성**: Step 4에서 목적/옵션/질문 응답을 조합해 최종 프롬프트 문자열 생성 및 편집
5. **결과 전달**: 사용자 복사 후 FeedbackPage로 이동하여 개선 의견 남김

### 시나리오 2 – 공장 타당성 보고서 + 공유 템플릿
1. **작업 입력**: “2차전지 공장 신설 타당성 보고서 작성”
2. **공유 템플릿 탐색**: TemplatesPage에서 카드 정렬 및 상세 뷰 진입
3. **AI 질문**: CreatePromptWizard의 질의응답 단계 재사용
4. **프롬프트 개선**: TemplateDetailPage에서 템플릿 슬롯을 수정하고 마법사로 전달
5. **완성/공유**: 결과 복사 및 FeedbackPage 기록

---

## 원본 시나리오 (시연용 레퍼런스)

### 시나리오 1 – 인수인계 자료 생성

1. **작업 입력**: "OO시스템 인수인계 자료 작성"
2. **AI 질문** (Mock): 시스템 주요 특징, 주요 업무, 최근 변경 이력, 고정 일정, 연관 시스템/부서를 순차로 확인
3. **프롬프트 생성**: 입력 정보를 템플릿에 반영해 초안 생성
4. **사용자 개선**: 담당자가 현장 노하우를 추가로 입력
5. **완성**: 결과를 복사해 인수인계 문서 초안에 적용

### 시나리오 2 – 공장 타당성 보고서 + 공유 기능

1. **작업 입력**: “2차전지 공장 신설 타당성 보고서 작성”
2. **공유 템플릿 검색**: “제조”, “보고서” 키워드로 유사 사례 탐색
3. **AI 질문** (Mock): 공장 위치, 투자 금액, 생산 품목, 수요 예측 데이터를 수집
4. **프롬프트 개선**: 비용 산정식과 재무 데이터를 템플릿에 추가
5. **완성**: 결과를 복사해 보고서 작성에 활용

---

## 주요 화면 매핑
| View ID (`App.tsx`) | 역할 | 향후 Next.js 경로 |
|--------------------|------|-------------------|
| `home` | 작업 목적 입력 | `/`
| `create` | 옵션/파일 업로드 + Q&A + 프롬프트 생성 | `/output-options`, `/qa`, `/prompt-preview` 세분화 예정 |
| `templates` | 공유 템플릿 갤러리 | `/shared-gallery`
| `template-detail` | 템플릿 상세/편집 | `/shared-gallery/[templateId]`
| `feedback` | 결과 검토 + 피드백 수집 | `/final`

---

## Mock 데이터 & 정렬 규칙
- 현재 Mock은 각 컴포넌트 내부 상수(`aiQuestions`, 템플릿 배열 등)로 선언되어 있음.
- 파일 업로드는 `lib/fileParsers.ts`에서 텍스트, DOC/DOCX, PDF를 ArrayBuffer 기반으로 파싱합니다.
- 템플릿 정렬 옵션은 존재하지만 ISO 타임스탬프 필드/유틸이 미구현 → `lib/sorting.ts` 도입 필요.

### Mock Data 예시 (현 구조 기반)
현재는 `src/components/CreatePromptWizard.tsx`와 `TemplatesPage.tsx`에 상수로 정의되어 있으며, 아래 형태로 `lib/mock/` 디렉터리로 분리 예정입니다.

```ts
export const mockScenarios = {
  onboarding: {
    questions: [
      "시스템의 주요 특징은?",
      "주요 업무 목록을 알려주세요.",
      "최근 변경 이력은 무엇인가요?",
      "고정적으로 반복되는 일정이 있나요?",
      "연관된 시스템/부서는 어디인가요?",
    ],
    template: (
      "다음 항목을 중심으로 인수인계 문서를 작성하는 프롬프트를 생성하세요: {answers}"
    ),
  },
  factoryReport: {
    galleryTemplates: [
      {
        id: "battery-feasibility",
        title: "공장 설립 타당성 보고서 프롬프트",
        requiredInputs: ["공장 위치", "투자금", "주요 품목", "수요 예측 데이터"],
        template: "위 데이터를 바탕으로 타당성 검토 보고서 작성을 위한 프롬프트 생성",
        lastUpdatedAt: "2024-03-12T10:00:00Z",
      },
    ],
  },
};
```

---

## 구현 범위 체크
| 기능 | 현 상태 | 비고 |
|------|---------|------|
| 작업 목적 입력 | O | HomePage에서 입력 후 `onNavigate` |
| 옵션/파일 업로드 | O | `.txt/.doc/.docx/.pdf` 파싱 + Select UI |
| AI 질의응답 | O | 기본 배열 기반, 브랜칭 없음 |
| 프롬프트 생성/편집 | O | Step 4에서 문자열 조합 + 편집 모드 |
| 공유 템플릿 갤러리 | O | TemplatesPage → 상세 → 마법사 연동 |
| 피드백 수집 | △ | FeedbackPage 단일 폼, 저장 로직 없음 |

---

## 다음 단계 로드맵
1. **라우팅 전환**: Next.js `app/` 구조 도입, 현재 View ID를 페이지 세그먼트로 매핑
2. **상태 관리 개선**: `onNavigate` 패턴을 Context + MobX store로 대체, URL 파라미터 복원 고려
3. **Mock 정리**: 시나리오/템플릿/FAQ를 `lib/mock/`에 타입과 함께 분리
4. **정렬 유틸**: `lib/sorting.ts`와 `lib/formatting.ts`를 추가해 템플릿 정렬/표시 문자열 일원화
5. **파일 처리 고도화**: ArrayBuffer 기반 파서로 PDF/Docx 대응 여부 검토 후 QA 체크리스트 반영
6. **UI 가이드 반영**: Tailwind 기반 요소를 MUI + Emotion 토큰체계로 단계적 교체, 접근성 속성 점검

본 문서는 현재 코드베이스와 맞춰 작성되었으며, Next.js 마이그레이션 진행 시 단계별로 갱신해야 합니다.
