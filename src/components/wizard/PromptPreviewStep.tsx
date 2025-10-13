'use client';

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Check, Copy, Edit3 } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { usePromptWizardStore } from '../../../app/providers';
import { buildPromptFromStore } from '../../../lib/prompt/generatePrompt';

interface PromptPreviewStepProps {
  onBack: () => void;
  onProceed: () => void;
}

export const PromptPreviewStep = observer(function PromptPreviewStep({ onBack, onProceed }: PromptPreviewStepProps) {
  const wizardStore = usePromptWizardStore();
  const [draftPrompt, setDraftPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const prompt = wizardStore.generatedPrompt || buildPromptFromStore(wizardStore);
    if (!wizardStore.generatedPrompt) {
      wizardStore.setGeneratedPrompt(prompt);
    }
    setDraftPrompt(prompt);
  }, [wizardStore]);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSavePrompt = () => {
    wizardStore.setGeneratedPrompt(draftPrompt);
    setIsEditing(false);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(draftPrompt);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt', error);
    }
  };

  const handleProceed = () => {
    wizardStore.setGeneratedPrompt(draftPrompt);
    onProceed();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>생성된 프롬프트</CardTitle>
            <p className="text-sm text-muted-foreground">
              필요에 따라 프롬프트를 편집하고 복사할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToggleEdit}>
              <Edit3 className="h-4 w-4 mr-1" /> {isEditing ? '편집 취소' : '편집'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
              <Copy className="h-4 w-4 mr-1" /> {hasCopied ? '복사됨' : '복사'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={draftPrompt}
            onChange={(event) => setDraftPrompt(event.target.value)}
            readOnly={!isEditing}
            className="min-h-[280px]"
            aria-label="생성된 프롬프트"
          />
          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSavePrompt}>
                <Check className="h-4 w-4 mr-1" /> 수정 내용 저장
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={onBack}>
          이전 단계로 돌아가기
        </Button>
        <Button onClick={handleProceed}>템플릿 갤러리로 이동</Button>
      </footer>
    </div>
  );
});
