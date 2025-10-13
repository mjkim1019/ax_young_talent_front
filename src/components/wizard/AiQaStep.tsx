'use client';

import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Bot, MessageCircle, User } from 'lucide-react';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { usePromptWizardStore } from '../../../app/providers';
import { wizardQuestions } from '../../../lib/mock/wizard';

interface AiQaStepProps {
  onProceed: () => void;
  onStepBack: () => void;
}

export const AiQaStep = observer(function AiQaStep({ onProceed, onStepBack }: AiQaStepProps) {
  const wizardStore = usePromptWizardStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const answeredCount = wizardStore.qaResponses.length;
    return Math.min(answeredCount, wizardQuestions.length - 1);
  });
  const [userResponse, setUserResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = wizardQuestions[currentQuestionIndex];
  const answeredResponses = wizardStore.qaResponses;

  const canProceed = useMemo(() => {
    return answeredResponses.length >= wizardQuestions.length;
  }, [answeredResponses.length]);

  const handleSubmitResponse = () => {
    if (!currentQuestion) {
      return;
    }

    if (!userResponse.trim()) {
      setError('응답을 입력해 주세요.');
      return;
    }

    wizardStore.upsertQaResponse({
      questionId: currentQuestion.id,
      answer: userResponse.trim()
    });
    setUserResponse('');
    setError(null);

    if (currentQuestionIndex < wizardQuestions.length - 1) {
      setCurrentQuestionIndex((index) => Math.min(index + 1, wizardQuestions.length - 1));
      return;
    }

    onProceed();
  };

  const handleEditResponse = (questionId: string) => {
    const index = wizardQuestions.findIndex((question) => question.id === questionId);
    if (index === -1) {
      return;
    }

    const existing = wizardStore.qaResponses.find((entry) => entry.questionId === questionId);
    if (!existing) {
      return;
    }

    setCurrentQuestionIndex(index);
    setUserResponse(existing.answer);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="rounded-xl border bg-card">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bot className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-lg">AI 확인 질문</CardTitle>
              <p className="text-sm text-muted-foreground">
                추가 정보를 입력하면 프롬프트 품질이 향상됩니다.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
              <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden />
              <div>
                <p className="font-medium">{currentQuestion?.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  질문 {currentQuestionIndex + 1} / {wizardQuestions.length}
                </p>
              </div>
            </div>

            <Textarea
              value={userResponse}
              onChange={(event) => setUserResponse(event.target.value)}
              placeholder="AI에게 제공할 정보를 입력하세요"
              className="min-h-[140px]"
              aria-describedby={error ? 'qa-response-error' : undefined}
            />
            {error && (
              <p id="qa-response-error" className="text-xs text-red-500">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onStepBack}>
                이전 단계로 돌아가기
              </Button>
              <Button onClick={handleSubmitResponse}>
                {currentQuestionIndex < wizardQuestions.length - 1 ? '다음 질문으로' : '프롬프트 생성으로 이동'}
              </Button>
            </div>
          </CardContent>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">입력한 내용</h2>
        <div className="space-y-3">
          {wizardQuestions.map((question) => {
            const answer = wizardStore.qaResponses.find((entry) => entry.questionId === question.id);
            const isActive = question.id === currentQuestion?.id;

            return (
              <div
                key={question.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isActive ? 'border-primary/40 bg-primary/5' : 'border-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bot className="h-4 w-4" aria-hidden />
                      <span>{question.text}</span>
                    </div>
                    {answer ? (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-primary mt-1" aria-hidden />
                        <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        아직 응답하지 않았습니다.
                      </p>
                    )}
                  </div>
                  {answer && (
                    <Button variant="ghost" size="sm" onClick={() => handleEditResponse(question.id)}>
                      수정
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {canProceed && (
          <div className="flex justify-end">
            <Button onClick={onProceed}>프롬프트 검토로 이동</Button>
          </div>
        )}
      </section>
    </div>
  );
});
