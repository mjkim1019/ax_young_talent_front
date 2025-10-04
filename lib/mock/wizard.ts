export interface WizardQuestion {
  id: string;
  text: string;
}

export const wizardQuestions: WizardQuestion[] = [
  {
    id: "document-type",
    text: "What specific type of document or content should this prompt generate?",
  },
  {
    id: "audience",
    text: "Who is the target audience for the output?",
  },
  {
    id: "tone",
    text: "What tone should the output have? (formal, casual, persuasive, etc.)?",
  },
  {
    id: "constraints",
    text: "Are there any special requirements or constraints I should know about?",
  },
];

export interface PredefinedFormatOption {
  id: string;
  label: string;
}

export const predefinedFormats: PredefinedFormatOption[] = [
  { id: "email", label: "Email" },
  { id: "report", label: "Report" },
  { id: "summary", label: "Summary" },
  { id: "presentation", label: "Presentation" },
];

export interface DocumentStyleOption {
  id: string;
  label: string;
}

export const companyDocumentStyles: DocumentStyleOption[] = [
  { id: "professional", label: "Professional Report" },
  { id: "technical", label: "Technical Documentation" },
  { id: "marketing", label: "Marketing Copy" },
  { id: "internal", label: "Internal Memo" },
  { id: "executive", label: "Executive Summary" },
];

export const uploadAccepts = {
  mimeTypes: ["text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"],
  extensions: [".txt", ".doc", ".docx", ".pdf"],
};
