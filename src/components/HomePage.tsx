import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Plus, Clock, Users, ChevronRight, Zap, FileText } from "lucide-react";
import { recentPrompts, teamTemplateHighlights } from "../../lib/mock/home";
import { templateSummaries } from "../../lib/mock/templates";

interface HomePageProps {
  onNavigate: (view: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const teamTemplates = teamTemplateHighlights(templateSummaries);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2">안녕하세요, Alex님</h1>
              <p className="text-muted-foreground text-lg">
                AI와 함께 강력한 프롬프트를 만들거나 팀 템플릿을 살펴보세요.
              </p>
            </div>
            <div className="w-48 h-32 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1650171457588-dc7baef3ed22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHJvYm90JTIwYXNzaXN0YW50fGVufDF8fHx8MTc1ODEyNjYwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="AI 도우미"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20" onClick={() => onNavigate('create')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">프롬프트 생성</CardTitle>
                    <CardDescription>
                      AI 확인 질문과 함께 단계별 마법사를 이용하세요.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>AI 기반 가이드</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20" onClick={() => onNavigate('templates')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">템플릿 둘러보기</CardTitle>
                    <CardDescription>
                      팀과 조직에서 공유한 템플릿을 확인하세요.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{teamTemplates.length}개의 팀 템플릿을 사용할 수 있어요</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Prompts */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">최근 프롬프트</h2>
              <Button variant="ghost" size="sm">
                전체 보기 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentPrompts.map((prompt) => (
                <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm">{prompt.title}</p>
                          <p className="text-xs text-muted-foreground">{prompt.category}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{prompt.lastUsed}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team's Shared Templates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">팀 공유 템플릿</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('templates')}>
                전체 보기 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {teamTemplates.map(({ template, uses, highlightTags }) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('template-detail', template)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{template.title}</p>
                        <span className="text-xs text-muted-foreground">{uses}회 사용</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">작성자 {template.creator}</p>
                        <div className="flex space-x-1">
                          {highlightTags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
