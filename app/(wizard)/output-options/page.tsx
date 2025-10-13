'use client';

import { useEffect } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import { OutputOptionsStep } from '../../../src/components/wizard/OutputOptionsStep';
import { WizardProgressHeader } from '../../../src/components/wizard/WizardProgressHeader';
import { ROUTES } from '../../../lib/routes';
import { usePromptWizardStore } from '../../providers';

const OutputOptionsPage = observer(function OutputOptionsPage() {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  useEffect(() => {
    wizardStore.setLastVisitedStep('output-options');
  }, [wizardStore]);

  const handleBack = () => {
    router.push(ROUTES.home as Route);
  };

  const handleNext = () => {
    router.push(ROUTES.qa as Route);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <WizardProgressHeader
          title="새 프롬프트 만들기"
          description="목적과 원하는 출력 형식을 정의해 주세요."
          onBack={handleBack}
          progress={wizardStore.progress}
        />
        <OutputOptionsStep onProceed={handleNext} />
      </div>
    </div>
  );
});

export default OutputOptionsPage;
