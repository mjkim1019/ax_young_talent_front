'use client';

import { useEffect, useMemo } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import type { TemplateSummary } from '../../../lib/mock/templates';
import { ROUTES } from '../../../lib/routes';
import { TemplatesPage } from '../../../src/components/TemplatesPage';
import { usePromptWizardStore } from '../../providers';

const SharedGalleryPage = observer(function SharedGalleryPage() {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  useEffect(() => {
    wizardStore.setLastVisitedStep('shared-gallery');
  }, [wizardStore]);

  const navigationHandler = useMemo(
    () =>
      (view: string, data?: unknown) => {
        if (view === 'home') {
          router.push(ROUTES.home as Route);
          return;
        }

        if (view === 'templates') {
          return;
        }

        if (view === 'template-detail' && typeof data === 'object' && data) {
          const template = data as TemplateSummary;
          wizardStore.setSelectedTemplate(template);
          router.push(`${ROUTES.sharedGallery}/${template.id}` as Route);
          return;
        }

        if (view === 'create') {
          router.push(ROUTES.outputOptions as Route);
        }
      },
    [router, wizardStore]
  );

  return (
    <div className="min-h-screen bg-background">
      <TemplatesPage onNavigate={navigationHandler} />
    </div>
  );
});

export default SharedGalleryPage;
