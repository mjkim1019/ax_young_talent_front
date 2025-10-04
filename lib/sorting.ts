import type { TemplateSummary } from "./mock/templates";

export type TemplateSortKey = 'popular' | 'recent' | 'rating' | 'alphabetical';

type SortableTemplate = Pick<TemplateSummary, 'usageCount' | 'rating' | 'title' | 'lastUpdatedAt'>;

export function sortTemplates<T extends SortableTemplate>(templates: T[], sortBy: TemplateSortKey): T[] {
  const sorted = [...templates];

  switch (sortBy) {
    case 'popular':
      sorted.sort((a, b) => b.usageCount - a.usageCount);
      break;
    case 'recent':
      sorted.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'alphabetical':
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
      break;
    default:
      break;
  }

  return sorted;
}
