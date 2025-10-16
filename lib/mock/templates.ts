export interface TemplateSummary {
  id: number;
  title: string;
  description: string;
  creator: string;
  team: string;
  tags: string[];
  usageCount: number;
  rating: number;
  lastUpdatedAt: string;
  category: string;
  prompt: string;
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
    lastUpdatedAt: "2024-09-30T03:00:00Z",
    category: "HR",
    prompt: `당신은 분기별 성과 리뷰 전문가입니다. 아래 템플릿을 참고해 직원의 분기 리뷰를 작성하세요.

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

읽기 쉬운 제목과 목록 형식을 유지하며 리뷰를 작성하세요.`,
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
    lastUpdatedAt: "2024-09-24T09:30:00Z",
    category: "Sales",
    prompt: "고객 온보딩을 위한 프롬프트입니다.",
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
    lastUpdatedAt: "2024-09-29T15:45:00Z",
    category: "Engineering",
    prompt: "버그 리포트 분석을 위한 프롬프트입니다.",
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
    lastUpdatedAt: "2024-09-27T22:15:00Z",
    category: "Marketing",
    prompt: "마케팅 카피 생성을 위한 프롬프트입니다.",
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
    lastUpdatedAt: "2024-10-01T07:20:00Z",
    category: "Operations",
    prompt: "회의 요약 양식을 위한 프롬프트입니다.",
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
    lastUpdatedAt: "2024-09-28T11:10:00Z",
    category: "Product",
    prompt: "고객 피드백 분석을 위한 프롬프트입니다.",
  },
  {
    id: 7,
    title: "성과 목표 설정",
    description: "개인의 업무 내용과 성과를 바탕으로 체계적인 성과 목표(KPI)를 설정하는 템플릿입니다.",
    creator: "이수진",
    team: "인사팀",
    tags: ["목표설정", "KPI", "성과관리"],
    usageCount: 15,
    rating: 4.9,
    lastUpdatedAt: "2024-10-16T10:00:00Z",
    category: "HR",
    prompt: `당신은 성과 관리 전문가입니다. 주어진 직무 기술서나 성과 요약문을 바탕으로, 실행 가능하고 측정 가능한 목표(KPI)를 포함한 성과 목표를 구조화된 형식으로 생성하는 역할을 합니다.

**입력:** 개인의 역할과 성과에 대한 서술적 요약문.
**출력:** 다음 구조를 따르는 명확하고 구체적인 성과 목표 목록:
- 주요 성과 영역 (예: 재무 목표 달성, DT 및 Delivery 경쟁력 강화)과 가중치(%)
- 각 영역 내의 구체적인 목표 (예: 수익성 강화, 원가 효율화)
- 각 목표를 측정하기 위한 구체적인 KPI (예: 영업이익률 3%p 향상, 비용 5% 절감)

이제 아래 업무 내용을 바탕으로 성과 목표를 생성해주세요:
[여기에 업무 내용 입력]
`,
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
  {
    id: 3,
    title: "재무팀 성과 목표 예시",
    preview:
      "1.재무 목표 달성 (40%)\\n* 수익성 강화\\n• 전년 대비 영업이익률 3%p 이상 향상\\n• 불필요한 비용 항목 5% 절감 (예: 외주, 운영비)\\n* 원가 효율화\\n• 프로젝트별 원가분석 체계 구축 및 관리\\n• Under Run 비율 1% 이상 달성\\n* 투자 효율성 제고\\n• ROI(Return on Investment) 목표 10% 이상 달성\\n• 자본투입 대비 비용절감 효과 분석 및 보고체계 정착\\n\\n2.DT 및 Delivery 경쟁력 강화 (50%)\\n* 재무 데이터 기반 의사결정 고도화\\n• 재무 데이터를 활용한 AI 분석 자동화 구축\\n• Tableau/Power BI 등 대시보드 구축으로 리포팅 효율 30% 향상\\n* AI 및 자동화를 통한 생산성 향상\\n• 정산/결산 업무 중 30% 이상을 자동화\\n• RPA를 활용한 재무 데이터 처리시간 50% 단축\\n* 디지털 회계/재무 역량 강화\\n• 내부 회계관리 시스템 개선 프로젝트 성공적 수행\\n• 회계정확도 제고 (오류율 0.5% 이하)\\n\\n3.안정적인 서비스 품질 (10%)\\n* 정확한 회계 결산\\n• 월 결산 마감지연 Zero\\n• 외부감사 지적사항 Zero 유지\\n* 고객 및 내부 만족도 개선\\n• 사업부 재무지원 만족도 90% 이상 달성\\n• 신속한 이슈 대응(1일 내 피드백율 95% 이상)\\n* 전문가 역량 강화\\n• 재무/세무 관련 자격증 취득 또는 심화 교육 이수\\n• AI 및 데이터 분석 관련 사내 교육 참여"
  },
];
