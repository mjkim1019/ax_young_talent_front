import type { TemplateSummary } from "./templates";

export interface RecentPrompt {
  id: number;
  title: string;
  category: string;
  lastUsed: string;
}

export const recentPrompts: RecentPrompt[] = [
  { id: 1, title: "이메일 응답 템플릿", category: "커뮤니케이션", lastUsed: "2시간 전" },
  { id: 2, title: "프로젝트 현황 보고", category: "보고서", lastUsed: "1일 전" },
  { id: 3, title: "회의 요약", category: "문서화", lastUsed: "3일 전" },
  { id: 4, title: "고객 피드백 분석", category: "분석", lastUsed: "1주 전" },
];

export interface TeamTemplateHighlight {
  template: TemplateSummary;
  uses: number;
  highlightTags: string[];
}

export const teamTemplateHighlights = (templates: TemplateSummary[]): TeamTemplateHighlight[] => {
  const templateMap = new Map(templates.map((template) => [template.id, template]));
  const highlights: Array<{ id: number; uses: number; highlightTags: string[] }> = [
    { id: 1, uses: 42, highlightTags: ["보고서", "성과"] },
    { id: 2, uses: 28, highlightTags: ["프로세스", "커뮤니케이션"] },
    { id: 3, uses: 35, highlightTags: ["기술", "분석"] },
    { id: 4, uses: 19, highlightTags: ["마케팅", "콘텐츠"] },
  ];

  return highlights
    .map(({ id, uses, highlightTags }) => {
      const template = templateMap.get(id);
      if (!template) {
        return null;
      }
      return {
        template,
        uses,
        highlightTags,
      };
    })
    .filter((value): value is TeamTemplateHighlight => value !== null);
};
