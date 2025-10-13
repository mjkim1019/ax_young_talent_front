import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface WizardProgressHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
  progress: number;
  actionSlot?: ReactNode;
}

export function WizardProgressHeader({
  title,
  description,
  onBack,
  progress,
  actionSlot,
}: WizardProgressHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} aria-label="홈으로 돌아가기">
          <ArrowLeft className="h-4 w-4 mr-2" /> 홈으로 돌아가기
        </Button>
        {actionSlot}
      </div>
      <h1 className="text-3xl mb-2">{title}</h1>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Progress value={progress} className="h-2" aria-label="마법사 진행률" />
    </div>
  );
}
