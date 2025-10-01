import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Plus, Clock, Users, ChevronRight, Zap, FileText } from "lucide-react";

interface HomePageProps {
  onNavigate: (view: string, data?: any) => void;
}

const recentPrompts = [
  { id: 1, title: "Email Response Template", category: "Communication", lastUsed: "2 hours ago" },
  { id: 2, title: "Project Status Report", category: "Reports", lastUsed: "1 day ago" },
  { id: 3, title: "Meeting Summary", category: "Documentation", lastUsed: "3 days ago" },
  { id: 4, title: "Customer Feedback Analysis", category: "Analysis", lastUsed: "1 week ago" },
];

const teamTemplates = [
  { id: 1, title: "Quarterly Review", creator: "Sarah Kim", tags: ["Reports", "Performance"], uses: 42 },
  { id: 2, title: "Customer Onboarding", creator: "Mike Lee", tags: ["Process", "Communication"], uses: 28 },
  { id: 3, title: "Bug Report Analysis", creator: "Alex Park", tags: ["Technical", "Analysis"], uses: 35 },
  { id: 4, title: "Marketing Copy", creator: "Emma Choi", tags: ["Marketing", "Content"], uses: 19 },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2">Hello, Alex</h1>
              <p className="text-muted-foreground text-lg">
                Create powerful prompts with AI assistance or explore team templates
              </p>
            </div>
            <div className="w-48 h-32 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1650171457588-dc7baef3ed22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHJvYm90JTIwYXNzaXN0YW50fGVufDF8fHx8MTc1ODEyNjYwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="AI Assistant"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20" onClick={() => onNavigate('create')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Create Prompt</CardTitle>
                    <CardDescription>
                      Step-by-step wizard with AI clarifying questions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>AI-powered guidance</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20" onClick={() => onNavigate('templates')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Browse Templates</CardTitle>
                    <CardDescription>
                      Templates shared by teams and organization
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{teamTemplates.length} team templates available</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Prompts */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Recent Prompts</h2>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentPrompts.map((prompt) => (
                <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm">{prompt.title}</p>
                          <p className="text-xs text-muted-foreground">{prompt.category}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{prompt.lastUsed}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team's Shared Templates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Team Shared Templates</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('templates')}>
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {teamTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('template-detail', template)}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{template.title}</p>
                        <span className="text-xs text-muted-foreground">{template.uses} uses</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">by {template.creator}</p>
                        <div className="flex space-x-1">
                          {template.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}