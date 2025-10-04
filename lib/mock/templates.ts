export interface TemplateSummary {
  id: number;
  title: string;
  description: string;
  creator: string;
  team: string;
  tags: string[];
  usageCount: number;
  rating: number;
  lastUpdated: string;
  category: string;
}

export const templateSummaries: TemplateSummary[] = [
  {
    id: 1,
    title: "분기별 리뷰 템플릿",
    description: "분기 성과 리뷰와 목표 설정을 위한 종합 템플릿입니다.",
    creator: "Sarah Chen",
    team: "인사팀",
    tags: ["보고서", "성과", "관리"],
    usageCount: 42,
    rating: 4.8,
    lastUpdated: "2일 전",
    category: "HR",
  },
  {
    id: 2,
    title: "고객 온보딩 프로세스",
    description: "신규 고객 온보딩에 필요한 문서와 절차를 단계별로 안내합니다.",
    creator: "Mike Rodriguez",
    team: "영업팀",
    tags: ["프로세스", "커뮤니케이션", "세일즈"],
    usageCount: 28,
    rating: 4.6,
    lastUpdated: "1주 전",
    category: "Sales",
  },
  {
    id: 3,
    title: "버그 리포트 분석",
    description: "버그를 분류하고 우선순위를 정하기 위한 기술 분석 템플릿입니다.",
    creator: "Alex Kim",
    team: "엔지니어링팀",
    tags: ["기술", "분석", "QA"],
    usageCount: 35,
    rating: 4.9,
    lastUpdated: "3일 전",
    category: "Engineering",
  },
  {
    id: 4,
    title: "마케팅 카피 생성기",
    description: "다양한 채널과 캠페인에 활용할 매력적인 마케팅 카피를 빠르게 작성합니다.",
    creator: "Emma Johnson",
    team: "마케팅팀",
    tags: ["마케팅", "콘텐츠", "카피"],
    usageCount: 19,
    rating: 4.7,
    lastUpdated: "5일 전",
    category: "Marketing",
  },
  {
    id: 5,
    title: "회의 요약 양식",
    description: "액션 아이템과 후속 조치를 포함한 표준 회의 요약 양식입니다.",
    creator: "David Wilson",
    team: "운영팀",
    tags: ["문서", "회의", "프로세스"],
    usageCount: 56,
    rating: 4.5,
    lastUpdated: "1일 전",
    category: "Operations",
  },
  {
    id: 6,
    title: "고객 피드백 분석",
    description: "고객 의견을 분석해 실행 가능한 인사이트를 도출합니다.",
    creator: "Lisa Park",
    team: "프로덕트팀",
    tags: ["분석", "고객", "제품"],
    usageCount: 31,
    rating: 4.8,
    lastUpdated: "4일 전",
    category: "Product",
  },
];

export const templateCategories: string[] = [
  "all",
  "HR",
  "Sales",
  "Engineering",
  "Marketing",
  "Operations",
  "Product",
];

export interface TemplateExampleOutput {
  id: number;
  title: string;
  preview: string;
}

export const templateExampleOutputs: TemplateExampleOutput[] = [
  {
    id: 1,
    title: "소프트웨어 엔지니어 리뷰",
    preview:
      "**직원 정보:**\n- 이름: Alex Thompson\n- 직무: 시니어 소프트웨어 엔지니어\n- 조직: 엔지니어링팀\n- 평가 기간: 2024년 3분기\n\n**성과 영역:**\n\n1. **목표 달성**\n   - 레거시 인증 시스템 마이그레이션을 2주 앞당겨 완료\n   - 주요 기능 3개를 일정 전에 릴리스...",
  },
  {
    id: 2,
    title: "마케팅 매니저 리뷰",
    preview:
      "**직원 정보:**\n- 이름: Sarah Martinez\n- 직무: 마케팅 매니저\n- 조직: 마케팅팀\n- 평가 기간: 2024년 3분기\n\n**성과 영역:**\n\n1. **목표 달성**\n   - 리드 생성 목표를 25% 초과 달성\n   - 40% 참여율의 성공적인 제품 캠페인 진행...",
  },
];

export const templateSamplePrompt = `당신은 분기별 성과 리뷰 전문가입니다. 아래 템플릿을 참고해 직원의 분기 리뷰를 작성하세요.

**직원 정보:**
- 이름: [직원 이름]
- 직무: [직책]
- 조직: [소속 부서]
- 평가 기간: [분기와 연도]

**평가해야 할 영역:**

1. **목표 달성**
   - 분기 목표 달성 현황을 정리하세요.
   - 산출물의 완료율과 품질을 평가하세요.
   - 기대를 초과했거나 주의가 필요한 부분을 기록하세요.

2. **핵심 역량**
   - 직무와 관련된 기술 역량을 평가하세요.
   - 커뮤니케이션과 협업 역량을 정리하세요.
   - 문제 해결 능력과 주도성을 설명하세요.
   - (해당 시) 리더십 발휘 사례를 적어주세요.

3. **성장과 개발**
   - 이번 분기에 개발한 역량을 요약하세요.
   - 완료했거나 진행 중인 교육/훈련을 기록하세요.
   - 향후 개발이 필요한 영역을 제안하세요.

4. **피드백 반영**
   - 이전 피드백을 얼마나 잘 반영했는지 설명하세요.
   - 자기 인식과 적응력 수준을 평가하세요.

**형식 요구 사항:**
- 전문적이고 건설적인 톤을 유지하세요.
- 가능하면 구체적인 사례를 포함하세요.
- 실행 가능한 개선 제안을 제시하세요.
- 다음 분기의 명확한 목표로 마무리하세요.

읽기 쉬운 제목과 목록 형식을 유지하며 리뷰를 작성하세요.`;
