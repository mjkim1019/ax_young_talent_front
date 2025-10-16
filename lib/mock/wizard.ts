export interface WizardQuestion {
  id: string;
  text: string;
}

export const wizardQuestions: WizardQuestion[] = [
  {
    id: "document-type",
    text: "이 프롬프트가 생성해야 하는 문서나 콘텐츠 유형은 무엇인가요?",
  },
  {
    id: "audience",
    text: "결과물을 사용할 대상은 누구인가요?",
  },
  {
    id: "tone",
    text: "원하는 톤은 무엇인가요? (격식체, 캐주얼, 설득 등)",
  },
  {
    id: "constraints",
    text: "알려야 할 특별한 요구 사항이나 제약이 있나요?",
  },
];

export interface PredefinedFormatOption {
  id: string;
  label: string;
}

export const predefinedFormats: PredefinedFormatOption[] = [
  { id: "email", label: "이메일" },
  { id: "report", label: "보고서" },
  { id: "summary", label: "요약" },
  { id: "presentation", label: "프레젠테이션" },
];

export interface DocumentStyleOption {
  id: string;
  label: string;
}

export const companyDocumentStyles: DocumentStyleOption[] = [
  { id: "professional", label: "전문 보고서" },
  { id: "technical", label: "기술 문서" },
  { id: "marketing", label: "마케팅 카피" },
  { id: "internal", label: "사내 메모" },
  { id: "executive", label: "임원용 요약" },
];

export const uploadAccepts = {
  mimeTypes: [
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
  ],
  extensions: [".txt", ".doc", ".docx", ".xlsx", ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"],
};
