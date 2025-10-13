import { makeAutoObservable, runInAction } from 'mobx';

import type { SupportedUploadType } from '../fileParsers';
import type { TemplateSummary } from '../mock/templates';

export const WIZARD_STEP_SEQUENCE = [
  'purpose',
  'output-options',
  'qa',
  'prompt-preview',
  'shared-gallery',
  'final'
] as const;

export type WizardStepId = typeof WIZARD_STEP_SEQUENCE[number];

export type OutputMethod = 'upload' | 'predefined' | 'company' | '';

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  content: string;
  format: SupportedUploadType;
  warnings: string[];
}

export interface WizardAnswer {
  questionId: string;
  answer: string;
}

export interface PromptWizardSnapshot {
  purpose: string;
  outputMethod: OutputMethod;
  predefinedFormat: string;
  documentStyle: string;
  uploadedFile: UploadedFileMeta | null;
  qaResponses: WizardAnswer[];
  generatedPrompt: string;
  completedSteps: WizardStepId[];
  lastVisitedStep: WizardStepId;
  selectedTemplate: TemplateSummary | null;
}

export interface PromptWizardQueryState {
  purpose?: string;
  output?: OutputMethod;
  format?: string;
  style?: string;
  qa?: string;
  step?: WizardStepId;
}

const SERIALIZE_KEYS: Array<keyof PromptWizardQueryState> = [
  'purpose',
  'output',
  'format',
  'style',
  'qa',
  'step'
];

function encodeState(value: unknown): string {
  try {
    const json = JSON.stringify(value);
    return typeof window === 'undefined'
      ? Buffer.from(json, 'utf-8').toString('base64')
      : window.btoa(unescape(encodeURIComponent(json)));
  } catch (error) {
    console.error('Failed to encode wizard state', error);
    return '';
  }
}

function decodeState<T>(encoded: string): T | null {
  try {
    const json = typeof window === 'undefined'
      ? Buffer.from(encoded, 'base64').toString('utf-8')
      : decodeURIComponent(escape(window.atob(encoded)));
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to decode wizard state', error);
    return null;
  }
}

function sanitizeStep(step: WizardStepId | string | undefined): WizardStepId {
  if (!step) {
    return 'purpose';
  }

  return (WIZARD_STEP_SEQUENCE.includes(step as WizardStepId)
    ? (step as WizardStepId)
    : 'purpose');
}

export class PromptWizardStore {
  purpose = '';

  outputMethod: OutputMethod = '';

  predefinedFormat = '';

  documentStyle = '';

  uploadedFile: UploadedFileMeta | null = null;

  qaResponses: WizardAnswer[] = [];

  generatedPrompt = '';

  lastVisitedStep: WizardStepId = 'purpose';

  selectedTemplate: TemplateSummary | null = null;

  private readonly completedStepsInternal = new Set<WizardStepId>();

  constructor(initialState?: Partial<PromptWizardSnapshot>) {
    makeAutoObservable(this, {
      completedStepsInternal: false,
      toSnapshot: false,
      serializeForQuery: false,
      hydrateFromSnapshot: false,
      applyQueryState: false,
      reset: false
    });

    if (initialState) {
      this.hydrateFromSnapshot(initialState);
    }
  }

  get completedSteps(): WizardStepId[] {
    return Array.from(this.completedStepsInternal.values());
  }

  get progress(): number {
    const totalSteps = WIZARD_STEP_SEQUENCE.length;
    if (totalSteps === 0) {
      return 0;
    }

    return Math.round((this.completedStepsInternal.size / totalSteps) * 100);
  }

  setPurpose(value: string) {
    this.purpose = value;
    if (value.trim()) {
      this.markStepCompleted('purpose');
    } else {
      this.completedStepsInternal.delete('purpose');
    }
  }

  setOutputMethod(method: OutputMethod) {
    this.outputMethod = method;
    if (!method) {
      this.completedStepsInternal.delete('output-options');
      return;
    }

    if (method === 'predefined' && !this.predefinedFormat) {
      this.completedStepsInternal.delete('output-options');
      return;
    }

    if (method === 'company' && !this.documentStyle) {
      this.completedStepsInternal.delete('output-options');
      return;
    }

    if (method === 'upload' && !this.uploadedFile) {
      this.completedStepsInternal.delete('output-options');
      return;
    }

    this.markStepCompleted('output-options');
  }

  setPredefinedFormat(format: string) {
    this.predefinedFormat = format;
    if (this.outputMethod === 'predefined' && format) {
      this.markStepCompleted('output-options');
    }
  }

  setDocumentStyle(style: string) {
    this.documentStyle = style;
    if (this.outputMethod === 'company' && style) {
      this.markStepCompleted('output-options');
    }
  }

  setUploadedFile(file: UploadedFileMeta | null) {
    this.uploadedFile = file;

    if (file && this.outputMethod === 'upload') {
      this.markStepCompleted('output-options');
    }

    if (!file && this.outputMethod === 'upload') {
      this.completedStepsInternal.delete('output-options');
    }
  }

  upsertQaResponse(response: WizardAnswer) {
    const index = this.qaResponses.findIndex((entry) => entry.questionId === response.questionId);

    if (index >= 0) {
      this.qaResponses.splice(index, 1, response);
    } else {
      this.qaResponses.push(response);
    }

    if (this.qaResponses.length > 0) {
      this.markStepCompleted('qa');
    }
  }

  removeQaResponse(questionId: string) {
    this.qaResponses = this.qaResponses.filter((entry) => entry.questionId !== questionId);

    if (this.qaResponses.length === 0) {
      this.completedStepsInternal.delete('qa');
    }
  }

  setGeneratedPrompt(prompt: string) {
    this.generatedPrompt = prompt;
    if (prompt.trim()) {
      this.markStepCompleted('prompt-preview');
      this.markStepCompleted('final');
    }
  }

  markStepCompleted(step: WizardStepId) {
    this.completedStepsInternal.add(step);
  }

  markStepIncomplete(step: WizardStepId) {
    this.completedStepsInternal.delete(step);
  }

  isStepCompleted(step: WizardStepId): boolean {
    return this.completedStepsInternal.has(step);
  }

  setLastVisitedStep(step: WizardStepId) {
    this.lastVisitedStep = sanitizeStep(step);
  }

  advanceTo(step: WizardStepId) {
    this.setLastVisitedStep(step);
  }

  reset() {
    runInAction(() => {
      this.purpose = '';
      this.outputMethod = '';
      this.predefinedFormat = '';
      this.documentStyle = '';
      this.uploadedFile = null;
      this.qaResponses = [];
      this.generatedPrompt = '';
      this.lastVisitedStep = 'purpose';
      this.selectedTemplate = null;
      this.completedStepsInternal.clear();
    });
  }

  toSnapshot(): PromptWizardSnapshot {
    return {
      purpose: this.purpose,
      outputMethod: this.outputMethod,
      predefinedFormat: this.predefinedFormat,
      documentStyle: this.documentStyle,
      uploadedFile: this.uploadedFile,
      qaResponses: [...this.qaResponses],
      generatedPrompt: this.generatedPrompt,
      completedSteps: this.completedSteps,
      lastVisitedStep: this.lastVisitedStep,
      selectedTemplate: this.selectedTemplate
    };
  }

  serializeForQuery(): PromptWizardQueryState {
    const state: PromptWizardQueryState = {};

    if (this.purpose.trim()) {
      state.purpose = this.purpose;
    }

    if (this.outputMethod) {
      state.output = this.outputMethod;
    }

    if (this.predefinedFormat) {
      state.format = this.predefinedFormat;
    }

    if (this.documentStyle) {
      state.style = this.documentStyle;
    }

    if (this.qaResponses.length > 0) {
      const encodedQa = encodeState(this.qaResponses);
      if (encodedQa) {
        state.qa = encodedQa;
      }
    }

    if (this.lastVisitedStep) {
      state.step = this.lastVisitedStep;
    }

    return state;
  }

  applyQueryState(query: PromptWizardQueryState) {
    if (query.purpose) {
      this.setPurpose(query.purpose);
    }

    if (query.output) {
      this.setOutputMethod(query.output);
    }

    if (query.format) {
      this.setPredefinedFormat(query.format);
    }

    if (query.style) {
      this.setDocumentStyle(query.style);
    }

    if (query.qa) {
      const decoded = decodeState<WizardAnswer[]>(query.qa);
      if (decoded) {
        decoded.forEach((entry) => {
          if (entry.questionId && entry.answer) {
            this.upsertQaResponse(entry);
          }
        });
      }
    }

    if (query.step) {
      this.setLastVisitedStep(query.step);
    }
  }

  private hydrateFromSnapshot(snapshot: Partial<PromptWizardSnapshot>) {
    if (snapshot.purpose) {
      this.purpose = snapshot.purpose;
    }

    if (snapshot.outputMethod) {
      this.outputMethod = snapshot.outputMethod;
    }

    if (snapshot.predefinedFormat) {
      this.predefinedFormat = snapshot.predefinedFormat;
    }

    if (snapshot.documentStyle) {
      this.documentStyle = snapshot.documentStyle;
    }

    if (snapshot.uploadedFile) {
      this.uploadedFile = snapshot.uploadedFile;
    }

    if (snapshot.qaResponses) {
      this.qaResponses = [...snapshot.qaResponses];
    }

    if (snapshot.generatedPrompt) {
      this.generatedPrompt = snapshot.generatedPrompt;
    }

    if (snapshot.lastVisitedStep) {
      this.lastVisitedStep = snapshot.lastVisitedStep;
    }

    if (snapshot.selectedTemplate) {
      this.selectedTemplate = snapshot.selectedTemplate;
    }

    if (snapshot.completedSteps) {
      snapshot.completedSteps.forEach((step) => {
        if (WIZARD_STEP_SEQUENCE.includes(step)) {
          this.completedStepsInternal.add(step);
        }
      });
    }
  }

  setSelectedTemplate(template: TemplateSummary | null) {
    this.selectedTemplate = template;
  }
}

export type PromptWizardStoreInstance = PromptWizardStore & Record<string, unknown>;

export function createPromptWizardStore(
  initialState?: Partial<PromptWizardSnapshot>
): PromptWizardStoreInstance {
  return new PromptWizardStore(initialState) as PromptWizardStoreInstance;
}

export function mergeQueryStates(
  base: PromptWizardQueryState,
  next: PromptWizardQueryState
): PromptWizardQueryState {
  const merged: PromptWizardQueryState = { ...base };

  SERIALIZE_KEYS.forEach((key) => {
    if (next[key] !== undefined) {
      merged[key] = next[key];
    }
  });

  return merged;
}
