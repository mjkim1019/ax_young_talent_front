# PromptMate Frontend – Claude.md

## 프로젝트 개요
- **제품**: PromptMate – AI 기반 프롬프트 생성 도구의 UX 데모
- **목적**: 내부 시연 및 이해관계자 설득용 프로토타입
- **현재 스택**: Vite + React 18 + TypeScript + Tailwind CSS + Radix UI
- **AI 연결 목표**: OpenAI GPT-4o 통합

## 현재 상태 분석

### ✅ 기존 구조 (Vite 기반)
- **Framework**: Vite 6.3.5 + React 18
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **상태 관리**: 로컬 useState + onNavigate 패턴
- **Mock 데이터**: 완전 클라이언트 사이드 시뮬레이션
- **파일 구조**: `src/` 기반 전통적 React 앱

### 🔄 혼재된 Next.js 구조
- **app/** 디렉터리: Next.js App Router 스타일 존재
- **MobX 통합**: app/_stores/promptWizardStore.ts
- **Provider 설정**: app/providers.tsx
- **하이브리드 상태**: Vite 실행 + Next.js 구조

## AI 연결 목표

### OpenAI GPT-4o 통합 계획
1. **환경 설정**: .env.local에 API 키 설정
2. **클라이언트 라이브러리**: openai npm 패키지 설치
3. **API 통합**: 프롬프트 생성 및 질문 생성 자동화
4. **현재 Mock 교체**: wizardQuestions → 동적 AI 질문

### 핵심 교체 지점
```typescript
// 현재 Mock (lib/mock/wizard.ts)
export const wizardQuestions: WizardQuestion[] = [
  { id: "document-type", text: "이 프롬프트가 생성해야 하는 문서나 콘텐츠 유형은 무엇인가요?" },
  // ... 고정 질문들
];

// AI 연결 후 목표
const aiQuestions = await generateContextualQuestions(purpose, outputMethod);
```

## 구현 로드맵

### 1단계: 환경 설정 및 의존성
```bash
npm install openai
```

```env
# .env.local
VITE_OPENAI_API_KEY=your_api_key_here
VITE_AI_MODEL=gpt-4o
VITE_ENABLE_AI=true
```

### 2단계: AI 클라이언트 구현
```typescript
// lib/ai/openai-client.ts
import OpenAI from 'openai';

export class PromptMateAI {
  async generateQuestions(purpose: string, outputMethod: string): Promise<string[]>
  async generatePrompt(context: PromptContext): Promise<string>
  async improvePrompt(prompt: string, feedback: string): Promise<string>
}
```

### 3단계: 컴포넌트 수정
- `CreatePromptWizard.tsx`: Mock → AI 호출로 변경
- 로딩 상태 및 에러 처리 UI 추가
- 실시간 질문 생성 구현

### 4단계: 상태 관리 업그레이드
- MobX store에 AI 호출 상태 추가
- 캐싱 및 재시도 로직 구현
- 오프라인 fallback (Mock 데이터)

## 기술적 고려사항

### Vite vs Next.js 결정
**현재 권장: Vite 유지**
- 기존 코드베이스가 Vite 기반으로 안정적
- app/ 디렉터리는 구조적 참고용으로 활용
- API 호출은 클라이언트 사이드에서 직접 처리

### 보안
- API 키는 환경변수로 관리
- 프로덕션에서는 백엔드 프록시 고려
- 사용량 제한 및 모니터링 필요

### 사용자 경험
- AI 응답 대기 시간 동안 로딩 애니메이션
- 네트워크 오류 시 Mock 데이터로 graceful fallback
- 프롬프트 생성 진행 상황 표시

## 현재 Mock 데이터 위치
- `lib/mock/wizard.ts`: 질문 및 옵션 정의
- `src/components/CreatePromptWizard.tsx`: generatePrompt() 함수
- `lib/fileParsers.ts`: 파일 업로드 처리

## AI 연결 후 개선점
1. **개인화된 질문**: 목적과 컨텍스트에 따른 동적 질문 생성
2. **지능형 프롬프트**: AI가 최적화한 구조화된 프롬프트
3. **반복 개선**: 사용자 피드백 기반 프롬프트 자동 개선
4. **다국어 지원**: AI 기반 자동 번역 및 현지화

## 다음 단계
1. ✅ Claude.md 파일 생성
2. 🔄 OpenAI API 키 설정
3. 🔄 openai 패키지 설치 및 클라이언트 구현
4. 🔄 CreatePromptWizard 컴포넌트 AI 연동
5. 🔄 테스트 및 오류 처리 구현