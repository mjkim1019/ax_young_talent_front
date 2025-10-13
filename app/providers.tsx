'use client';

import { ReactNode, createContext, useContext } from 'react';
import { enableStaticRendering, useLocalStore } from 'mobx-react-lite';

import {
  PromptWizardSnapshot,
  PromptWizardStoreInstance,
  createPromptWizardStore
} from '../lib/stores/promptWizardStore';

enableStaticRendering(typeof window === 'undefined');

interface PromptWizardProviderProps {
  children: ReactNode;
  initialState?: Partial<PromptWizardSnapshot>;
}

const PromptWizardContext = createContext<PromptWizardStoreInstance | null>(null);

export function PromptWizardProvider({ children, initialState }: PromptWizardProviderProps) {
  const snapshot = initialState ?? ({} as Partial<PromptWizardSnapshot>);
  const store = useLocalStore(createPromptWizardStore, snapshot);

  return <PromptWizardContext.Provider value={store}>{children}</PromptWizardContext.Provider>;
}

export function usePromptWizardStore(): PromptWizardStoreInstance {
  const store = useContext(PromptWizardContext);

  if (!store) {
    throw new Error('usePromptWizardStore는 PromptWizardProvider 내부에서만 사용할 수 있습니다.');
  }

  return store;
}
