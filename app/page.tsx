'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';

import type { Route } from 'next';

import type { TemplateSummary } from '../lib/mock/templates';
import { ROUTES } from '../lib/routes';
import { HomePage } from '../src/components/HomePage';
import { usePromptWizardStore } from './providers';

type LegacyView = 'home' | 'create' | 'templates' | 'template-detail' | 'feedback' | 'profile';

const viewToRouteMap: Record<'create' | 'templates' | 'feedback', string> = {
  create: ROUTES.outputOptions,
  templates: ROUTES.sharedGallery,
  feedback: ROUTES.final
};

const HomeRoute = observer(function HomeRoute() {
  const router = useRouter();
  const wizardStore = usePromptWizardStore();

  useEffect(() => {
    wizardStore.setLastVisitedStep('purpose');
  }, [wizardStore]);

  const handleNavigate = useCallback(
    (view: LegacyView, data?: unknown) => {
      if (view === 'home' || view === 'profile') {
        return;
      }

      if (view === 'template-detail' && typeof data === 'object' && data) {
        const template = data as TemplateSummary;
        wizardStore.setSelectedTemplate(template);
        router.push(`${ROUTES.sharedGallery}/${template.id}` as Route);
        return;
      }

      const nextRoute = viewToRouteMap[view as keyof typeof viewToRouteMap];
      if (!nextRoute) {
        return;
      }

      if (view === 'feedback' && typeof data === 'object' && data && 'prompt' in (data as Record<string, unknown>)) {
        const payload = data as { prompt: string; template?: TemplateSummary | null };
        wizardStore.setGeneratedPrompt(payload.prompt);
        wizardStore.setSelectedTemplate(payload.template ?? null);
      }

      router.push(nextRoute as Route);
    },
    [router, wizardStore]
  );

  return (
    <main className="min-h-screen bg-background">
      <HomePage onNavigate={handleNavigate} />
    </main>
  );
});

export default HomeRoute;
