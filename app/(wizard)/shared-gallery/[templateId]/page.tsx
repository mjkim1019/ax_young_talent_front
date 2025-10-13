'use client';

import { useEffect, useMemo } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import type { TemplateSummary } from '../../../../lib/mock/templates';
import { templateSummaries } from '../../../../lib/mock/templates';
import { ROUTES } from '../../../../lib/routes';
import { TemplateDetailPage } from '../../../../src/components/TemplateDetailPage';
import { usePromptWizardStore } from '../../../providers';

interface TemplateDetailRouteProps {
  params: {
    templateId: string;
  };
}

const TemplateDetailRoute = observer(function TemplateDetailRoute({ params }: TemplateDetailRouteProps) {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  const template = useMemo(() => {
    const id = Number(params.templateId);
    return templateSummaries.find((item) => item.id === id) ?? null;
  }, [params.templateId]);

  useEffect(() => {
    wizardStore.setLastVisitedStep('shared-gallery');
    wizardStore.setSelectedTemplate(template);
  }, [template, wizardStore]);

  const handleNavigate = (view: string, data?: unknown) => {
    if (view === 'templates') {
      router.push(ROUTES.sharedGallery as Route);
      return;
    }

    if (view === 'home') {
      router.push(ROUTES.home as Route);
      return;
    }

    if (view === 'feedback' && typeof data === 'object' && data && 'prompt' in (data as Record<string, unknown>)) {
      const payload = data as { prompt: string; template?: TemplateSummary };
      wizardStore.setGeneratedPrompt(payload.prompt);
      wizardStore.setSelectedTemplate(payload.template ?? template);
      router.push(ROUTES.final as Route);
      return;
    }

    if (view === 'create') {
      router.push(ROUTES.outputOptions as Route);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TemplateDetailPage template={template ?? undefined} onNavigate={handleNavigate} />
    </div>
  );
});

export default TemplateDetailRoute;
