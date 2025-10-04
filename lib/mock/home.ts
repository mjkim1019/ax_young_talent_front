import type { TemplateSummary } from "./templates";

export interface RecentPrompt {
  id: number;
  title: string;
  category: string;
  lastUsed: string;
}

export const recentPrompts: RecentPrompt[] = [
  { id: 1, title: "Email Response Template", category: "Communication", lastUsed: "2 hours ago" },
  { id: 2, title: "Project Status Report", category: "Reports", lastUsed: "1 day ago" },
  { id: 3, title: "Meeting Summary", category: "Documentation", lastUsed: "3 days ago" },
  { id: 4, title: "Customer Feedback Analysis", category: "Analysis", lastUsed: "1 week ago" },
];

export interface TeamTemplateHighlight {
  template: TemplateSummary;
  uses: number;
  highlightTags: string[];
}

export const teamTemplateHighlights = (templates: TemplateSummary[]): TeamTemplateHighlight[] => {
  const templateMap = new Map(templates.map((template) => [template.id, template]));
  const highlights: Array<{ id: number; uses: number; highlightTags: string[] }> = [
    { id: 1, uses: 42, highlightTags: ["Reports", "Performance"] },
    { id: 2, uses: 28, highlightTags: ["Process", "Communication"] },
    { id: 3, uses: 35, highlightTags: ["Technical", "Analysis"] },
    { id: 4, uses: 19, highlightTags: ["Marketing", "Content"] },
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
