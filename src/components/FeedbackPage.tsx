import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, MessageSquare, Edit3, Check, X, Plus } from "lucide-react";
import { feedbackSampleOutput } from "../../lib/mock/feedback";
import type { TemplateSummary } from "../../lib/mock/templates";

interface FeedbackPageProps {
  data: {
    prompt: string;
    template?: TemplateSummary;
    aiResult?: string;
    aiImageUrl?: string;
    uploadedFile?: {
      name: string;
      size: number;
      type: string;
      content: string;
      format: string;
      warnings: string[];
      imageData?: string;
      structuredData?: any; // WBS data for Excel files
    };
  };
  onNavigate: (view: string, data?: any) => void;
}

interface Comment {
  id: string;
  text: string;
  position: { start: number; end: number };
  type: 'prompt' | 'output';
}

export function FeedbackPage({ data, onNavigate }: FeedbackPageProps) {
  const [editablePrompt, setEditablePrompt] = useState(data.prompt);
  const [comments, setComments] = useState<Comment[]>([]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; type: 'prompt' | 'output' } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Use actual AI result if available, otherwise fall back to sample
  const aiOutput = data.aiResult || feedbackSampleOutput;

  const handleTextSelection = (type: 'prompt' | 'output') => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.parentElement;
      
      if (container && container.getAttribute('data-content') === type) {
        const start = range.startOffset;
        const end = range.endOffset;
        setSelectedText({ start, end, type });
        setShowCommentForm(true);
      }
    }
  };

  const addComment = () => {
    if (selectedText && newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        position: { start: selectedText.start, end: selectedText.end },
        type: selectedText.type
      };
      setComments([...comments, comment]);
      setNewComment("");
      setShowCommentForm(false);
      setSelectedText(null);
    }
  };

  const renderTextWithComments = (text: string, type: 'prompt' | 'output') => {
    const typeComments = comments.filter(c => c.type === type);
    if (typeComments.length === 0) {
      return (
        <div
          data-content={type}
          onMouseUp={() => handleTextSelection(type)}
          className="whitespace-pre-wrap"
        >
          {text}
        </div>
      );
    }

    // Sort comments by position to handle overlapping ranges
    const sortedComments = [...typeComments].sort((a, b) => a.position.start - b.position.start);
    
    let result: JSX.Element[] = [];
    let currentIndex = 0;

    sortedComments.forEach((comment, i) => {
      // Add text before comment
      if (currentIndex < comment.position.start) {
        result.push(
          <span key={`text-${i}-before`}>
            {text.slice(currentIndex, comment.position.start)}
          </span>
        );
      }

      // Add highlighted comment text
      result.push(
        <span
          key={`comment-${comment.id}`}
          className="bg-yellow-200 dark:bg-yellow-800 relative cursor-pointer group"
          title={comment.text}
        >
          {text.slice(comment.position.start, comment.position.end)}
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-lg p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-64">
            {comment.text}
          </div>
        </span>
      );

      currentIndex = Math.max(currentIndex, comment.position.end);
    });

    // Add remaining text
    if (currentIndex < text.length) {
      result.push(
        <span key="text-final">
          {text.slice(currentIndex)}
        </span>
      );
    }

    return (
      <div
        data-content={type}
        onMouseUp={() => handleTextSelection(type)}
        className="whitespace-pre-wrap"
      >
        {result}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> 홈으로 돌아가기
          </Button>
          <h1 className="text-2xl mb-2">프롬프트 테스트 및 피드백</h1>
          <p className="text-muted-foreground">
            생성된 프롬프트와 출력물을 검토하고 개선을 위한 의견을 남겨주세요.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Prompt */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>프롬프트</CardTitle>
                  <Button size="sm" variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                </div>
                <CardDescription>
                  주석을 추가하려면 텍스트를 드래그해 선택하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm max-h-96 overflow-y-auto">
                  {renderTextWithComments(editablePrompt, 'prompt')}
                </div>
                
                {/* Prompt Comments */}
                {comments.filter(c => c.type === 'prompt').length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm text-muted-foreground">프롬프트 주석</h4>
                    {comments.filter(c => c.type === 'prompt').map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2 bg-background border rounded-lg p-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-muted-foreground">
                            "{editablePrompt.slice(comment.position.start, comment.position.end)}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {data.uploadedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">업로드된 파일</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">파일명</span>
                      <span className="text-sm font-medium">{data.uploadedFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">크기</span>
                      <span className="text-sm">{Math.round(data.uploadedFile.size / 1024)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">형식</span>
                      <Badge variant="secondary" className="text-xs">{data.uploadedFile.format}</Badge>
                    </div>
                    {data.uploadedFile.warnings.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">경고:</span>
                        {data.uploadedFile.warnings.map((warning, index) => (
                          <p key={index} className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            {warning}
                          </p>
                        ))}
                      </div>
                    )}
                    {data.uploadedFile.imageData && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">이미지 미리보기:</span>
                        <img
                          src={data.uploadedFile.imageData}
                          alt="업로드된 이미지"
                          className="mt-2 max-w-full max-h-32 object-contain rounded border"
                        />
                      </div>
                    )}
                    {data.uploadedFile.structuredData && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">구조화된 데이터:</span>
                        <div className="mt-1 p-2 bg-muted rounded text-xs">
                          <div>시트명: {data.uploadedFile.structuredData.metadata?.sheetName}</div>
                          <div>행 수: {data.uploadedFile.structuredData.metadata?.totalRows}</div>
                          <div>열 수: {data.uploadedFile.structuredData.metadata?.totalColumns}</div>
                          {data.uploadedFile.structuredData.headers && (
                            <div className="mt-1">
                              헤더: {data.uploadedFile.structuredData.headers.slice(0, 3).join(", ")}
                              {data.uploadedFile.structuredData.headers.length > 3 && "..."}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.template && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">템플릿 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">템플릿명</span>
                      <span className="text-sm font-medium">{data.template.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">작성자</span>
                      <span className="text-sm">{data.template.creator}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {data.template.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI 생성 결과</CardTitle>
                  <div className="flex gap-2">
                    {data.aiResult && (
                      <Badge variant="default" className="text-xs">
                        실시간 AI 응답
                      </Badge>
                    )}
                    {!data.aiResult && (
                      <Badge variant="secondary" className="text-xs">
                        샘플 데이터
                      </Badge>
                    )}
                    {data.aiImageUrl && (
                      <Badge variant="outline" className="text-xs">
                        이미지 생성됨
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  피드백을 남기려면 텍스트를 선택하세요.
                  {data.aiImageUrl && " 생성된 이미지도 확인해보세요."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm max-h-96 overflow-y-auto">
                  {renderTextWithComments(aiOutput, 'output')}
                </div>

                {/* AI Generated Image */}
                {data.aiImageUrl && (
                  <div className="mt-4">
                    <h4 className="text-sm text-muted-foreground mb-2">생성된 이미지</h4>
                    <div className="border rounded-lg p-2 bg-background">
                      <img
                        src={data.aiImageUrl}
                        alt="AI 생성 이미지"
                        className="w-full max-w-md mx-auto rounded"
                        onError={(e) => {
                          console.error('Failed to load AI generated image');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="mt-2 text-xs text-muted-foreground text-center">
                        DALL-E 3로 생성된 이미지
                      </div>
                    </div>
                  </div>
                )}

                {/* Output Comments */}
                {comments.filter(c => c.type === 'output').length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm text-muted-foreground">출력 주석</h4>
                    {comments.filter(c => c.type === 'output').map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2 bg-background border rounded-lg p-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-muted-foreground">
                            "{aiOutput.slice(comment.position.start, comment.position.end)}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>전체 피드백</CardTitle>
                <CardDescription>
                  프롬프트와 출력 품질에 대한 전반적인 의견을 남겨주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="좋았던 점, 개선이 필요한 점, 프롬프트/출력 형식에 대한 제안을 작성하세요."
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>주석 {comments.length}개</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => onNavigate('home')}>
                      임시 저장
                    </Button>
                    <Button onClick={() => onNavigate('home')}>
                      프롬프트 실행
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comment Form Modal */}
        {showCommentForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>주석 추가</CardTitle>
                <CardDescription>
                  선택한 텍스트에 대한 피드백을 작성하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="내용을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment("");
                      setSelectedText(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    주석 추가
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
