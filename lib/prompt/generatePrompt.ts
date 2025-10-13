import { companyDocumentStyles, predefinedFormats, wizardQuestions } from '../mock/wizard';
import type { OutputMethod, UploadedFileMeta, WizardAnswer } from '../stores/promptWizardStore';

interface PromptGenerationInput {
  purpose: string;
  outputMethod: OutputMethod;
  predefinedFormat: string;
  documentStyle: string;
  uploadedFile: UploadedFileMeta | null;
  qaResponses: WizardAnswer[];
}

function resolveOutputContext({
  outputMethod,
  predefinedFormat,
  documentStyle,
  uploadedFile
}: Pick<PromptGenerationInput, 'outputMethod' | 'predefinedFormat' | 'documentStyle' | 'uploadedFile'>): string {
  switch (outputMethod) {
    case 'upload':
      return uploadedFile ? `첨부한 샘플 파일 기준: ${uploadedFile.name}` : '';
    case 'predefined': {
      const formatLabel = predefinedFormats.find((option) => option.id === predefinedFormat)?.label ?? predefinedFormat;
      return formatLabel ? `출력 형식: ${formatLabel}` : '';
    }
    case 'company': {
      const styleLabel = companyDocumentStyles.find((style) => style.id === documentStyle)?.label ?? documentStyle;
      return styleLabel ? `문서 스타일: ${styleLabel}` : '';
    }
    default:
      return '';
  }
}

function formatQaResponses(responses: WizardAnswer[]): string {
  if (responses.length === 0) {
    return '추가 질문 응답: (응답 없음)';
  }

  const lines = responses.map((response) => {
    const question = wizardQuestions.find((item) => item.id === response.questionId)?.text ?? '';
    return question ? `${question}: ${response.answer}` : response.answer;
  });

  return ['추가 질문 응답:', ...lines].join('\n');
}

export function buildPromptFromInput(input: PromptGenerationInput): string {
  const trimmedPurpose = input.purpose.trim();
  const context = resolveOutputContext(input);
  const qaSection = formatQaResponses(input.qaResponses);

  const sections = [
    trimmedPurpose ? `요청 주제: ${trimmedPurpose}` : '요청 주제: (작성 필요)',
    context,
    qaSection,
    '위 정보에 맞춰 구조화되고 명확한 결과물을 작성하세요.'
  ].filter(Boolean);

  return sections.join('\n\n');
}

export function buildPromptFromStore(
  store: Pick<PromptGenerationInput, keyof PromptGenerationInput>
): string {
  return buildPromptFromInput({
    purpose: store.purpose,
    outputMethod: store.outputMethod,
    predefinedFormat: store.predefinedFormat,
    documentStyle: store.documentStyle,
    uploadedFile: store.uploadedFile,
    qaResponses: store.qaResponses
  });
}
