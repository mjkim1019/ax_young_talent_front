import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, MessageSquare, Edit3, Check, X, Plus } from "lucide-react";

interface FeedbackPageProps {
  data: {
    prompt: string;
    template?: any;
  };
  onNavigate: (view: string, data?: any) => void;
}

interface Comment {
  id: string;
  text: string;
  position: { start: number; end: number };
  type: 'prompt' | 'output';
}

const sampleOutput = `**Employee Information:**
- Name: Alex Thompson
- Role: Senior Software Engineer
- Department: Engineering
- Review Period: Q3 2024

**Performance Areas:**

1. **Goal Achievement**
   - Successfully led the migration of legacy authentication system, completing it 2 weeks ahead of schedule
   - Delivered 3 major features including the new user dashboard and API optimization
   - Exceeded code quality metrics with 95% test coverage on all new features
   - Collaborated effectively with the design team to implement user-friendly interfaces

2. **Key Competencies**
   - **Technical Skills**: Demonstrated mastery of React, Node.js, and database optimization
   - **Communication**: Provided clear documentation and mentored 2 junior developers
   - **Problem-solving**: Identified and resolved critical performance bottlenecks
   - **Leadership**: Led daily standups and code review sessions during team lead's absence

3. **Growth and Development**
   - Completed advanced TypeScript certification
   - Attended React Conference and shared learnings with the team
   - Initiated weekly tech talks within the engineering department
   - Areas for development: Public speaking and stakeholder management

4. **Feedback Integration**
   - Successfully improved code review feedback turnaround time from 2 days to 4 hours
   - Demonstrated increased proactivity in identifying technical debt
   - Shows strong self-awareness and actively seeks feedback from peers

**Recommendations:**
- Continue leading complex technical initiatives
- Consider taking on more cross-functional projects to develop stakeholder management skills
- Explore opportunities to present at external conferences

**Goals for Q4 2024:**
- Lead the microservices architecture transition project
- Mentor 1 additional junior developer
- Complete stakeholder management training
- Improve system monitoring and alerting implementation`;

export function FeedbackPage({ data, onNavigate }: FeedbackPageProps) {
  const [editablePrompt, setEditablePrompt] = useState(data.prompt);
  const [comments, setComments] = useState<Comment[]>([]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; type: 'prompt' | 'output' } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleTextSelection = (type: 'prompt' | 'output') => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.parentElement;
      
      if (container && container.getAttribute('data-content') === type) {
        const start = range.startOffset;
        const end = range.endOffset;
        setSelectedText({ start, end, type });
        setShowCommentForm(true);
      }
    }
  };

  const addComment = () => {
    if (selectedText && newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        position: { start: selectedText.start, end: selectedText.end },
        type: selectedText.type
      };
      setComments([...comments, comment]);
      setNewComment("");
      setShowCommentForm(false);
      setSelectedText(null);
    }
  };

  const renderTextWithComments = (text: string, type: 'prompt' | 'output') => {
    const typeComments = comments.filter(c => c.type === type);
    if (typeComments.length === 0) {
      return (
        <div
          data-content={type}
          onMouseUp={() => handleTextSelection(type)}
          className="whitespace-pre-wrap"
        >
          {text}
        </div>
      );
    }

    // Sort comments by position to handle overlapping ranges
    const sortedComments = [...typeComments].sort((a, b) => a.position.start - b.position.start);
    
    let result: JSX.Element[] = [];
    let currentIndex = 0;

    sortedComments.forEach((comment, i) => {
      // Add text before comment
      if (currentIndex < comment.position.start) {
        result.push(
          <span key={`text-${i}-before`}>
            {text.slice(currentIndex, comment.position.start)}
          </span>
        );
      }

      // Add highlighted comment text
      result.push(
        <span
          key={`comment-${comment.id}`}
          className="bg-yellow-200 dark:bg-yellow-800 relative cursor-pointer group"
          title={comment.text}
        >
          {text.slice(comment.position.start, comment.position.end)}
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-lg p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-64">
            {comment.text}
          </div>
        </span>
      );

      currentIndex = Math.max(currentIndex, comment.position.end);
    });

    // Add remaining text
    if (currentIndex < text.length) {
      result.push(
        <span key="text-final">
          {text.slice(currentIndex)}
        </span>
      );
    }

    return (
      <div
        data-content={type}
        onMouseUp={() => handleTextSelection(type)}
        className="whitespace-pre-wrap"
      >
        {result}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
          <h1 className="text-2xl mb-2">Test Prompt & Provide Feedback</h1>
          <p className="text-muted-foreground">
            Review the generated prompt and its output. Add annotations and feedback to improve it.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Prompt */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prompt Template</CardTitle>
                  <Button size="sm" variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <CardDescription>
                  Click and drag to select text for annotation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm max-h-96 overflow-y-auto">
                  {renderTextWithComments(editablePrompt, 'prompt')}
                </div>
                
                {/* Prompt Comments */}
                {comments.filter(c => c.type === 'prompt').length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm text-muted-foreground">Prompt Comments:</h4>
                    {comments.filter(c => c.type === 'prompt').map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2 bg-background border rounded-lg p-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-muted-foreground">
                            "{editablePrompt.slice(comment.position.start, comment.position.end)}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {data.template && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Template:</span>
                      <span className="text-sm font-medium">{data.template.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Creator:</span>
                      <span className="text-sm">{data.template.creator}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {data.template.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Generated Output</CardTitle>
                <CardDescription>
                  Select text to add feedback comments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm max-h-96 overflow-y-auto">
                  {renderTextWithComments(sampleOutput, 'output')}
                </div>

                {/* Output Comments */}
                {comments.filter(c => c.type === 'output').length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm text-muted-foreground">Output Comments:</h4>
                    {comments.filter(c => c.type === 'output').map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2 bg-background border rounded-lg p-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-muted-foreground">
                            "{sampleOutput.slice(comment.position.start, comment.position.end)}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General Feedback</CardTitle>
                <CardDescription>
                  Overall thoughts about the prompt and output quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What worked well? What could be improved? Any suggestions for the prompt or output format?"
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{comments.length} annotation{comments.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => onNavigate('home')}>
                      Save as Draft
                    </Button>
                    <Button onClick={() => onNavigate('home')}>
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comment Form Modal */}
        {showCommentForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Comment</CardTitle>
                <CardDescription>
                  Add feedback for the selected text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment("");
                      setSelectedText(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}