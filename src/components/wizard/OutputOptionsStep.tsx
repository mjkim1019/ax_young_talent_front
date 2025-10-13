'use client';

import { ChangeEvent, DragEvent, useCallback, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Upload, FileText } from 'lucide-react';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { usePromptWizardStore } from '../../../app/providers';
import { parseFileToText } from '../../../lib/fileParsers';
import {
  companyDocumentStyles,
  predefinedFormats,
  uploadAccepts,
  wizardQuestions
} from '../../../lib/mock/wizard';
import type { OutputMethod } from '../../../lib/stores/promptWizardStore';

interface OutputOptionsStepProps {
  onProceed: () => void;
}

export const OutputOptionsStep = observer(function OutputOptionsStep({ onProceed }: OutputOptionsStepProps) {
  const wizardStore = usePromptWizardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const purposeHelper = useMemo(() => {
    if (!wizardStore.purpose.trim()) {
      return '프롬프트로 달성하려는 목표를 작성하세요.';
    }
    return '✓ 목적이 정의되었습니다. 다음 단계로 이동할 수 있습니다.';
  }, [wizardStore.purpose]);

  const handlePurposeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    wizardStore.setPurpose(event.target.value);
  };

  const handleOutputMethodChange = (value: string) => {
    wizardStore.setOutputMethod(value as OutputMethod);
  };

  const handlePredefinedFormatChange = (value: string) => {
    wizardStore.setPredefinedFormat(value);
  };

  const handleDocumentStyleChange = (value: string) => {
    wizardStore.setDocumentStyle(value);
  };

  const resetUploadState = useCallback(() => {
    wizardStore.setUploadedFile(null);
    setUploadError(null);
  }, [wizardStore]);

  const processFile = useCallback(async (file: File) => {
    setIsProcessingFile(true);
    setUploadError(null);

    try {
      const parsed = await parseFileToText(file);
      wizardStore.setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        content: parsed.text,
        format: parsed.type,
        warnings: parsed.warnings
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '파일을 처리하는 중 오류가 발생했습니다.';
      setUploadError(message);
      wizardStore.setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  }, [wizardStore]);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      void processFile(file);
      event.target.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadAccept = useMemo(() => {
    const extensions = uploadAccepts.extensions.join(',');
    const mimeTypes = uploadAccepts.mimeTypes.join(',');
    return `${extensions},${mimeTypes}`;
  }, []);

  const canProceed = wizardStore.isStepCompleted('purpose') && wizardStore.isStepCompleted('output-options');

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Label htmlFor="prompt-purpose">프롬프트의 목적은 무엇인가요?</Label>
        <Textarea
          id="prompt-purpose"
          placeholder="예: 고객 문의에 대한 전문적인 이메일 답장을 작성하세요..."
          value={wizardStore.purpose}
          onChange={handlePurposeChange}
          className="min-h-[120px]"
          aria-describedby="prompt-purpose-helper"
        />
        <p id="prompt-purpose-helper" className="text-sm text-muted-foreground">
          {purposeHelper}
        </p>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <Label className="block">출력 방식을 선택하세요</Label>
          <RadioGroup value={wizardStore.outputMethod} onValueChange={handleOutputMethodChange}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="output-upload" />
                <Label htmlFor="output-upload" className="flex items-center space-x-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>샘플 파일 업로드</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="predefined" id="output-predefined" />
                <Label htmlFor="output-predefined" className="cursor-pointer">
                  기본 옵션에서 선택
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="output-company" />
                <Label htmlFor="output-company" className="cursor-pointer">
                  회사 표준 문서 스타일 선택
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {wizardStore.outputMethod === 'upload' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              aria-label="샘플 파일 업로드"
              onChange={handleFileInputChange}
              accept={uploadAccept}
              className="hidden"
            />
            {!wizardStore.uploadedFile ? (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  샘플 파일을 끌어다 놓거나 클릭해서 업로드하세요.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  지원 형식: .txt, .doc, .docx, .pdf
                </p>
                {isProcessingFile && (
                  <p className="text-xs text-muted-foreground mt-3" aria-live="polite">
                    파일을 처리하는 중입니다...
                  </p>
                )}
                {uploadError && (
                  <p className="text-xs text-red-500 mt-3" role="alert">
                    {uploadError}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{wizardStore.uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(wizardStore.uploadedFile.size / 1024).toFixed(1)} KB · {wizardStore.uploadedFile.format.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetUploadState}>
                    다시 업로드
                  </Button>
                </div>
                {wizardStore.uploadedFile.warnings.length > 0 && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertTitle>주의가 필요합니다</AlertTitle>
                    <AlertDescription className="space-y-1 text-xs">
                      {wizardStore.uploadedFile.warnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {wizardStore.outputMethod === 'predefined' && (
          <div className="space-y-3">
            <Label htmlFor="predefined-format">기본 출력 형식을 선택하세요</Label>
            <Select value={wizardStore.predefinedFormat} onValueChange={handlePredefinedFormatChange}>
              <SelectTrigger id="predefined-format">
                <SelectValue placeholder="출력 형식을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {predefinedFormats.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {wizardStore.outputMethod === 'company' && (
          <div className="space-y-3">
            <Label htmlFor="company-style">회사 표준 문서 스타일을 선택하세요</Label>
            <Select value={wizardStore.documentStyle} onValueChange={handleDocumentStyleChange}>
              <SelectTrigger id="company-style">
                <SelectValue placeholder="문서 스타일을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {companyDocumentStyles.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </section>

      <footer className="flex items-center justify-between border-t pt-6">
        <div>
          <p className="text-sm text-muted-foreground">
            다음 단계에서 AI 확인 질문 {wizardQuestions.length}개에 답변하면 맞춤형 프롬프트가 생성됩니다.
          </p>
        </div>
        <Button onClick={onProceed} disabled={!canProceed}>
          다음 단계로 이동
        </Button>
      </footer>
    </div>
  );
});
