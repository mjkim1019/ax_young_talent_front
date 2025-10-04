import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ArrowLeft, User, Calendar, TrendingUp, Star, ChevronDown, Copy, Play } from "lucide-react";
import { useState } from "react";
import {
  TemplateExampleOutput,
  templateExampleOutputs,
  templateSamplePrompt,
  TemplateSummary,
} from "../../lib/mock/templates";

interface TemplateDetailPageProps {
  template?: TemplateSummary;
  onNavigate: (view: string, data?: any) => void;
}

export function TemplateDetailPage({ template, onNavigate }: TemplateDetailPageProps) {
  const [expandedOutput, setExpandedOutput] = useState<number | null>(null);

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Template not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('templates')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl mb-2">{template.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{template.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {template.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prompt Template</CardTitle>
                <CardDescription>
                  The complete prompt that will be used to generate content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {templateSamplePrompt}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </Button>
                  <Button size="sm" onClick={() => onNavigate('feedback', { prompt: templateSamplePrompt, template })}>
                    <Play className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Outputs</CardTitle>
                <CardDescription>
                  See what this template can generate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templateExampleOutputs.map((output: TemplateExampleOutput) => (
                  <Collapsible key={output.id}>
                    <CollapsibleTrigger
                      className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedOutput(expandedOutput === output.id ? null : output.id)}
                    >
                      <span className="text-sm font-medium">{output.title}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedOutput === output.id ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {output.preview}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{template.creator}</p>
                    <p className="text-muted-foreground">{template.team}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Last updated {template.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{template.usageCount} times used</p>
                    <p className="text-muted-foreground">by your organization</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="text-sm">
                    <p className="font-medium">{template.rating}/5.0 rating</p>
                    <p className="text-muted-foreground">from 24 reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => onNavigate('feedback', { prompt: templateSamplePrompt, template })}>
                  <Play className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
                <Button variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to My Templates
                </Button>
                <Button variant="outline" className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This week</span>
                    <span className="font-medium">8 uses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This month</span>
                    <span className="font-medium">24 uses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">All time</span>
                    <span className="font-medium">{template.usageCount} uses</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top user</span>
                    <span className="font-medium">Mike R.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Performance Goals Template</p>
                    <p className="text-muted-foreground text-xs">by Sarah Chen</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">1:1 Meeting Notes</p>
                    <p className="text-muted-foreground text-xs">by David Wilson</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Annual Review Summary</p>
                    <p className="text-muted-foreground text-xs">by Lisa Park</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
