'use client';

import { useEffect } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import { PromptPreviewStep } from '../../../src/components/wizard/PromptPreviewStep';
import { WizardProgressHeader } from '../../../src/components/wizard/WizardProgressHeader';
import { ROUTES } from '../../../lib/routes';
import { usePromptWizardStore } from '../../providers';

const PromptPreviewPage = observer(function PromptPreviewPage() {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  useEffect(() => {
    if (!wizardStore.isStepCompleted('output-options')) {
      router.replace(ROUTES.outputOptions as Route);
      return;
    }

    wizardStore.setLastVisitedStep('prompt-preview');
  }, [router, wizardStore]);

  const handleBack = () => {
    router.push(ROUTES.qa as Route);
  };

  const handleNext = () => {
    router.push(ROUTES.sharedGallery as Route);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <WizardProgressHeader
          title="생성된 프롬프트"
          description="AI가 제안한 프롬프트를 검토하고 필요 시 수정하세요."
          onBack={handleBack}
          progress={wizardStore.progress}
        />
        <PromptPreviewStep onBack={handleBack} onProceed={handleNext} />
      </div>
    </div>
  );
});

export default PromptPreviewPage;
