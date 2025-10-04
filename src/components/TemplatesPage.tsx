import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Search, Users, Clock, Star, Filter } from "lucide-react";
import {
  templateCategories,
  templateSummaries,
} from "../../lib/mock/templates";
import { sortTemplates, TemplateSortKey } from "../../lib/sorting";
import { formatRelativeTimeFromNow } from "../../lib/formatting";

interface TemplatesPageProps {
  onNavigate: (view: string, data?: any) => void;
}

const categoryLabels: Record<string, string> = {
  all: "전체 카테고리",
  HR: "인사",
  Sales: "영업",
  Engineering: "엔지니어링",
  Marketing: "마케팅",
  Operations: "운영",
  Product: "프로덕트",
};

export function TemplatesPage({ onNavigate }: TemplatesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<TemplateSortKey>("popular");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTemplates = sortTemplates(
    templateSummaries.filter((template) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        template.title.toLowerCase().includes(normalizedSearch) ||
        template.description.toLowerCase().includes(normalizedSearch) ||
        template.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
    sortBy,
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> 홈으로 돌아가기
          </Button>
          <h1 className="text-2xl mb-2">템플릿 갤러리</h1>
          <p className="text-muted-foreground">
            팀과 조직이 공유한 템플릿을 탐색하고 활용하세요.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            <div>
              <h3 className="text-sm mb-3">검색</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="템플릿 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm mb-3">카테고리</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category] ?? category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm mb-3">정렬 기준</h3>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as TemplateSortKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">인기순</SelectItem>
                  <SelectItem value="recent">최근 업데이트</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                  <SelectItem value="alphabetical">가나다순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm mb-3">요약 통계</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>전체 템플릿</span>
                  <span>{templateSummaries.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span>내 팀 보유</span>
                  <span>12개</span>
                </div>
                <div className="flex justify-between">
                  <span>가장 자주 사용</span>
                  <span>회의 요약 양식</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {(() => {
              const selectedLabel = categoryLabels[selectedCategory] ?? selectedCategory;
              return (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    총 {filteredTemplates.length}개 템플릿 표시
                  </p>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">필터: {selectedCategory === "all" ? "전체" : selectedLabel}</span>
                  </div>
                </div>
              );
            })()}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                  onClick={() => onNavigate('template-detail', template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{template.usageCount}회 사용</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTimeFromNow(template.lastUpdatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          작성자 {template.creator} • {template.team}
                        </div>
                        <Button size="sm" variant="outline">
                          템플릿 사용
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">조건에 맞는 템플릿이 없습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
