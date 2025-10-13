'use client';

import { useEffect } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import { FeedbackPage } from '../../../src/components/FeedbackPage';
import { buildPromptFromStore } from '../../../lib/prompt/generatePrompt';
import { ROUTES } from '../../../lib/routes';
import { usePromptWizardStore } from '../../providers';

const FinalDeliverablePage = observer(function FinalDeliverablePage() {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  useEffect(() => {
    if (!wizardStore.generatedPrompt) {
      const prompt = buildPromptFromStore(wizardStore);
      wizardStore.setGeneratedPrompt(prompt);
    }

    wizardStore.setLastVisitedStep('final');
  }, [wizardStore]);

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'home':
        router.push(ROUTES.home as Route);
        break;
      case 'templates':
        router.push(ROUTES.sharedGallery as Route);
        break;
      case 'create':
        router.push(ROUTES.outputOptions as Route);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FeedbackPage
        data={{ prompt: wizardStore.generatedPrompt, template: wizardStore.selectedTemplate ?? undefined }}
        onNavigate={handleNavigate}
      />
    </div>
  );
});

export default FinalDeliverablePage;
