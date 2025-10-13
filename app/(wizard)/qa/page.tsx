'use client';

import { useEffect } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import { AiQaStep } from '../../../src/components/wizard/AiQaStep';
import { WizardProgressHeader } from '../../../src/components/wizard/WizardProgressHeader';
import { ROUTES } from '../../../lib/routes';
import { usePromptWizardStore } from '../../providers';

const AiQaPage = observer(function AiQaPage() {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  useEffect(() => {
    wizardStore.setLastVisitedStep('qa');
  }, [wizardStore]);

  const handleBack = () => {
    router.push(ROUTES.outputOptions as Route);
  };

  const handleNext = () => {
    router.push(ROUTES.promptPreview as Route);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <WizardProgressHeader
          title="AI 확인 질문"
          description="질문에 답변하면 더 정확한 프롬프트를 생성할 수 있어요."
          onBack={handleBack}
          progress={wizardStore.progress}
        />
        <AiQaStep onProceed={handleNext} onStepBack={handleBack} />
      </div>
    </div>
  );
});

export default AiQaPage;
