import type { ReactNode } from 'react';

interface WizardLayoutProps {
  children: ReactNode;
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return <section className="min-h-screen bg-background">{children}</section>;
}
