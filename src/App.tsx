import { useState } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { CreatePromptWizard } from "./components/CreatePromptWizard";
import { TemplatesPage } from "./components/TemplatesPage";
import { TemplateDetailPage } from "./components/TemplateDetailPage";
import { FeedbackPage } from "./components/FeedbackPage";

type ViewType = 'home' | 'create' | 'templates' | 'template-detail' | 'feedback' | 'profile';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [viewData, setViewData] = useState<any>(null);

  const handleNavigate = (view: ViewType, data?: any) => {
    setCurrentView(view);
    setViewData(data || null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'create':
        return <CreatePromptWizard onNavigate={handleNavigate} />;
      case 'templates':
        return <TemplatesPage onNavigate={handleNavigate} />;
      case 'template-detail':
        return <TemplateDetailPage template={viewData} onNavigate={handleNavigate} />;
      case 'feedback':
        return <FeedbackPage data={viewData} onNavigate={handleNavigate} />;
      case 'profile':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl mb-2">My Profile</h1>
              <p className="text-muted-foreground">Profile page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      {renderCurrentView()}
    </div>
  );
}