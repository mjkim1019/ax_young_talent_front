import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import {
  ArrowLeft,
  Upload,
  MessageCircle,
  Bot,
  User,
  CheckCircle,
  FileText,
  Target,
  MessageSquare,
  Edit3,
  Check,
} from "lucide-react";
import {
  companyDocumentStyles,
  predefinedFormats,
  uploadAccepts,
  wizardQuestions,
} from "../../lib/mock/wizard";

interface CreatePromptWizardProps {
  onNavigate: (view: string, data?: any) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
}

export function CreatePromptWizard({ onNavigate }: CreatePromptWizardProps) {
  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<string[]>(["step1"]);
  
  // Step 1: Purpose/Context
  const [purpose, setPurpose] = useState("");
  
  // Step 2: Desired Output
  const [outputMethod, setOutputMethod] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [predefinedFormat, setPredefinedFormat] = useState("");
  const [documentStyle, setDocumentStyle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Step 3: Clarifying Q&A
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  
  // Step 4: Final Prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Calculate progress based on completed steps
  const progress = (completedSteps.size / 4) * 100;

  // Mark step as completed
  const completeStep = (step: string) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  // Handle accordion section changes
  const handleAccordionChange = (value: string[]) => {
    setOpenSections(value);
  };

  // Step 1: Check if purpose is filled
  const handlePurposeComplete = () => {
    if (purpose.trim()) {
      completeStep("step1");
      if (!openSections.includes("step2")) {
        setOpenSections(prev => [...prev, "step2"]);
      }
    }
  };

  // Step 2: Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          content: content,
        });
        completeStep("step2");
        if (!openSections.includes("step3")) {
          setOpenSections(prev => [...prev, "step3"]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          content: content,
        });
        completeStep("step2");
        if (!openSections.includes("step3")) {
          setOpenSections(prev => [...prev, "step3"]);
        }
      };
      reader.readAsText(file);
    }
  };

  // Step 2: Handle output method selection
  const handleOutputMethodChange = (method: string) => {
    setOutputMethod(method);
    if (method === "predefined" && predefinedFormat) {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
    } else if (method === "company" && documentStyle) {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
    }
  };

  const handlePredefinedFormatChange = (format: string) => {
    setPredefinedFormat(format);
    if (outputMethod === "predefined") {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
    }
  };

  const handleDocumentStyleChange = (style: string) => {
    setDocumentStyle(style);
    if (outputMethod === "company") {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
    }
  };

  // Step 3: Handle AI Q&A
  const handleAiResponse = () => {
    if (userResponse.trim()) {
      setAiResponses([...aiResponses, userResponse]);
      setUserResponse("");
      
      if (currentQuestion < wizardQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        completeStep("step3");
        generatePrompt();
        if (!openSections.includes("step4")) {
          setOpenSections(prev => [...prev, "step4"]);
        }
      }
    }
  };

  // Generate the final prompt
  const generatePrompt = () => {
    let outputContext = "";
    
    if (outputMethod === "upload" && uploadedFile) {
      outputContext = `Based on the uploaded sample file: ${uploadedFile.name}`;
    } else if (outputMethod === "predefined") {
      const formatLabel = predefinedFormats.find((option) => option.id === predefinedFormat)?.label ?? predefinedFormat;
      outputContext = `Format: ${formatLabel}`;
    } else if (outputMethod === "company") {
      const styleLabel = companyDocumentStyles.find((style) => style.id === documentStyle)?.label ?? documentStyle;
      outputContext = `Style: ${styleLabel}`;
    }

    const prompt = `Generate content for: ${purpose}

${outputContext}

Context from clarifying questions:
${aiResponses
      .map((response, i) => `${wizardQuestions[i]?.text ?? ""}: ${response}`)
      .join("\n")}

Please ensure the output is well-structured, clear, and meets the specified requirements.`;
    
    setGeneratedPrompt(prompt);
    completeStep("step4");
  };

  const handleAcceptPrompt = () => {
    onNavigate('feedback', { prompt: generatedPrompt });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
          <h1>Create New Prompt</h1>
          <p className="text-muted-foreground mb-4">
            Complete each section below to build your custom prompt
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Progressive Accordion Wizard */}
        <Accordion 
          type="multiple" 
          value={openSections} 
          onValueChange={handleAccordionChange}
          className="space-y-4"
        >
          {/* Step 1: Purpose/Context */}
          <AccordionItem value="step1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedSteps.has("step1") 
                    ? "bg-green-100 text-green-600" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {completedSteps.has("step1") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left">
                  <h3>Step 1: Purpose & Context</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step1") ? "Completed" : "Describe what you want your prompt to accomplish"}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <Label>What is the purpose of your prompt?</Label>
                <Textarea
                  placeholder="Example: Generate professional email responses to customer inquiries..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  onBlur={handlePurposeComplete}
                  className="min-h-[120px]"
                />
                {purpose.trim() && (
                  <div className="text-sm text-muted-foreground">
                    ✓ Purpose defined - you can now proceed to Step 2
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 2: Desired Output */}
          <AccordionItem value="step2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedSteps.has("step2") 
                    ? "bg-green-100 text-green-600" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {completedSteps.has("step2") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Target className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left">
                  <h3>Step 2: Desired Output</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step2") ? "Completed" : "Specify the format and style of your desired output"}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Choose output method:</Label>
                  <RadioGroup value={outputMethod} onValueChange={handleOutputMethodChange}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload" />
                        <Label htmlFor="upload" className="flex items-center space-x-2 cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <span>Upload sample file</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="predefined" id="predefined" />
                        <Label htmlFor="predefined" className="cursor-pointer">
                          Choose from predefined options
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company" className="cursor-pointer">
                          Select from company's standard document style
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Upload File Option */}
                {outputMethod === "upload" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept={uploadAccepts.extensions.join(",")}
                      className="hidden"
                    />
                    {!uploadedFile ? (
                      <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop a sample file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: .txt, .doc, .docx, .pdf
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setUploadedFile(null);
                              setCompletedSteps(prev => {
                                const newSet = new Set(prev);
                                newSet.delete("step2");
                                return newSet;
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Predefined Options */}
                {outputMethod === "predefined" && (
                  <div>
                    <Label className="text-sm mb-2 block">Choose format:</Label>
                    <RadioGroup value={predefinedFormat} onValueChange={handlePredefinedFormatChange}>
                      <div className="space-y-2">
                        {predefinedFormats.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Company Standards */}
                {outputMethod === "company" && (
                  <div>
                    <Label htmlFor="style-select" className="text-sm mb-2 block">Document style:</Label>
                    <Select value={documentStyle} onValueChange={handleDocumentStyleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document style" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyDocumentStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {completedSteps.has("step2") && (
                  <div className="text-sm text-muted-foreground">
                    ✓ Output format selected - you can now proceed to Step 3
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 3: Clarifying Q&A */}
          <AccordionItem value="step3" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedSteps.has("step3") 
                    ? "bg-green-100 text-green-600" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {completedSteps.has("step3") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left">
                  <h3>Step 3: Clarifying Q&A</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step3") ? "All questions answered" : "Answer AI questions to refine your prompt"}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Previous conversations */}
                {aiResponses.map((response, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="text-sm">{wizardQuestions[index]?.text}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="flex-1 bg-primary rounded-lg p-3 text-primary-foreground text-right max-w-[80%] ml-auto">
                        <p className="text-sm">{response}</p>
                      </div>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current question */}
                {currentQuestion < wizardQuestions.length && !completedSteps.has("step3") && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="text-sm">{wizardQuestions[currentQuestion]?.text}</p>
                      </div>
                    </div>
                    <div className="flex items-end space-x-3">
                      <Textarea
                        placeholder="Enter your response..."
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAiResponse())}
                      />
                      <Button onClick={handleAiResponse} disabled={!userResponse.trim()}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Completed state */}
                {completedSteps.has("step3") && (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">All questions answered!</p>
                    <p className="text-sm text-muted-foreground mt-1">✓ You can now proceed to Step 4</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 4: Final Prompt */}
          <AccordionItem value="step4" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedSteps.has("step4") 
                    ? "bg-green-100 text-green-600" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {completedSteps.has("step4") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left">
                  <h3>Step 4: Final Prompt</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step4") ? "Prompt ready for use" : "Review and edit your generated prompt"}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {generatedPrompt ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Your Generated Prompt</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                      >
                        {isEditingPrompt ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Done Editing
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={generatedPrompt}
                      onChange={(e) => setGeneratedPrompt(e.target.value)}
                      className="min-h-[200px]"
                      readOnly={!isEditingPrompt}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => onNavigate('home')}>
                        Save Prompt
                      </Button>
                      <Button onClick={handleAcceptPrompt}>
                        Accept & Test Prompt
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit3 className="h-8 w-8 mx-auto mb-2" />
                    <p>Complete the previous steps to generate your prompt</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
