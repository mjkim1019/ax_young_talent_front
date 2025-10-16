import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ArrowLeft, User, Calendar, TrendingUp, Star, ChevronDown, Copy, Play } from "lucide-react";
import { useState } from "react";
import {
  TemplateExampleOutput,
  templateExampleOutputs,
  templateSamplePrompt,
  performanceAnalysisPrompt, // Added this
  TemplateSummary,
} from "../../lib/mock/templates";
import { formatRelativeTimeFromNow, formatAbsoluteDate } from "../../lib/formatting";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface TemplateDetailPageProps {
  template?: TemplateSummary;
  onNavigate: (view: string, data?: any) => void;
}

export function TemplateDetailPage({ template, onNavigate }: TemplateDetailPageProps) {
  const [expandedOutput, setExpandedOutput] = useState<number | null>(null);

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>템플릿을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Determine the correct prompt to use based on the template ID
  const promptForTemplate = template.id === 7 
    ? performanceAnalysisPrompt 
    : templateSamplePrompt;

  const lastUpdatedRelative = formatRelativeTimeFromNow(template.lastUpdatedAt);
  const lastUpdatedAbsolute = formatAbsoluteDate(template.lastUpdatedAt, 'ko', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('templates')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> 템플릿 목록으로
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl mb-2">{template.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{template.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {template.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>프롬프트 템플릿</CardTitle>
                <CardDescription>
                  이 템플릿으로 콘텐츠를 생성할 전체 프롬프트입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {promptForTemplate}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    프롬프트 복사
                  </Button>
                  <Button size="sm" onClick={() => onNavigate('feedback', { prompt: promptForTemplate, template })}>
                    <Play className="h-4 w-4 mr-2" />
                    이 템플릿 사용
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>예시 출력</CardTitle>
                <CardDescription>
                  이 템플릿으로 생성 가능한 결과를 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templateExampleOutputs.map((output: TemplateExampleOutput) => (
                  <Collapsible key={output.id}>
                    <CollapsibleTrigger
                      className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedOutput(expandedOutput === output.id ? null : output.id)}
                    >
                      <span className="text-sm font-medium">{output.title}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedOutput === output.id ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="bg-muted rounded-lg p-4 text-sm max-h-64 overflow-y-auto">
                        <MarkdownRenderer content={output.preview} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">템플릿 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{template.creator}</p>
                    <p className="text-muted-foreground">{template.team}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">최종 수정 {lastUpdatedRelative}</p>
                    <p className="text-xs text-muted-foreground">({lastUpdatedAbsolute})</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">총 {template.usageCount}회 사용</p>
                    <p className="text-muted-foreground">조직 전체 사용 기록</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="text-sm">
                    <p className="font-medium">평점 {template.rating}/5.0</p>
                    <p className="text-muted-foreground">리뷰 24건 기준</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">빠른 실행</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => onNavigate('feedback', { prompt: promptForTemplate, template })}>
                  <Play className="h-4 w-4 mr-2" />
                  이 템플릿 사용
                </Button>
                <Button variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  내 템플릿으로 복사
                </Button>
                <Button variant="outline" className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  즐겨찾기에 추가
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">사용 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이번 주</span>
                    <span className="font-medium">8회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이번 달</span>
                    <span className="font-medium">24회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">누적</span>
                    <span className="font-medium">{template.usageCount}회</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최다 사용자</span>
                    <span className="font-medium">Mike R.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">연관 템플릿</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">성과 목표 템플릿</p>
                    <p className="text-muted-foreground text-xs">작성자 Sarah Chen</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">1:1 미팅 노트</p>
                    <p className="text-muted-foreground text-xs">작성자 David Wilson</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">연간 리뷰 요약</p>
                    <p className="text-muted-foreground text-xs">작성자 Lisa Park</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
