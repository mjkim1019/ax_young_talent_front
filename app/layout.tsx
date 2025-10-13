import type { Metadata } from 'next';
import './globals.css';

import { PromptWizardProvider } from './providers';

export const metadata: Metadata = {
  title: 'PromptMate',
  description: 'PromptMate – 프롬프트 생성 도구 UX 데모'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <PromptWizardProvider>{children}</PromptWizardProvider>
      </body>
    </html>
  );
}
