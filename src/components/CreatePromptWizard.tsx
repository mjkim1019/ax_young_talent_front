import { useRef, useState, useEffect } from "react";
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
} from "../../lib/mock/wizard";
import { parseFileToText, SupportedUploadType } from "../../lib/fileParsers";
import { promptMateAI } from "../../lib/ai/openai-client";

interface CreatePromptWizardProps {
  onNavigate: (view: string, data?: any) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  format: SupportedUploadType;
  warnings: string[];
  imageData?: string;
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
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Step 3: Clarifying Q&A
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [aiQuestions, setAiQuestions] = useState<{id: string, text: string}[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  // Step 4: Final Prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Step 5: Prompt Execution
  const [executionResult, setExecutionResult] = useState("");
  const [isExecutingPrompt, setIsExecutingPrompt] = useState(false);
  const [showExecutionResult, setShowExecutionResult] = useState(false);

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
  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    setUploadError(null);
    setUploadedFile(null);
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete("step2");
      return newSet;
    });
    try {
      const parsed = await parseFileToText(file);
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        content: parsed.text,
        format: parsed.type,
        warnings: parsed.warnings,
        imageData: parsed.imageData,
      });
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
      // Generate AI questions when file upload is completed
      loadAIQuestions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "파일을 처리하는 중 알 수 없는 오류가 발생했습니다.";
      setUploadError(message);
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
      event.target.value = "";
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
      void processFile(file);
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
      loadAIQuestions();
    } else if (method === "company" && documentStyle) {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
      loadAIQuestions();
    } else if (method === "upload" && uploadedFile) {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
      loadAIQuestions();
    }
  };

  const handlePredefinedFormatChange = (format: string) => {
    setPredefinedFormat(format);
    if (outputMethod === "predefined") {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
      // Generate AI questions when step 2 is completed
      loadAIQuestions();
    }
  };

  const handleDocumentStyleChange = (style: string) => {
    setDocumentStyle(style);
    if (outputMethod === "company") {
      completeStep("step2");
      if (!openSections.includes("step3")) {
        setOpenSections(prev => [...prev, "step3"]);
      }
      // Generate AI questions when step 2 is completed
      loadAIQuestions();
    }
  };

  // Load AI-generated questions when step 2 is completed
  const loadAIQuestions = async () => {
    if (!purpose.trim() || !outputMethod) return;

    console.log('🚀 [Wizard] Loading AI questions...');
    console.log('📋 [Wizard] Purpose:', purpose);
    console.log('🎯 [Wizard] Output method:', outputMethod);

    setIsLoadingQuestions(true);
    try {
      const questions = await promptMateAI.generateQuestions(purpose, outputMethod);
      setAiQuestions(questions);
      console.log('✅ [Wizard] AI questions loaded successfully:', questions);
    } catch (error) {
      console.error('❌ [Wizard] Failed to load AI questions:', error);
      // Fallback to mock questions
      setAiQuestions([
        { id: "document-type", text: "이 프롬프트가 생성해야 하는 문서나 콘텐츠 유형은 무엇인가요?" },
        { id: "audience", text: "결과물을 사용할 대상은 누구인가요?" },
        { id: "tone", text: "원하는 톤은 무엇인가요? (격식체, 캐주얼, 설득 등)" },
        { id: "constraints", text: "알려야 할 특별한 요구 사항이나 제약이 있나요?" }
      ]);
      console.log('🔄 [Wizard] Using fallback mock questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Load AI questions when step 2 is completed
  useEffect(() => {
    if (completedSteps.has("step2") && aiQuestions.length === 0 && !isLoadingQuestions) {
      loadAIQuestions();
    }
  }, [completedSteps, purpose, outputMethod]);

  // Step 3: Handle AI Q&A
  const handleAiResponse = () => {
    if (userResponse.trim()) {
      setAiResponses([...aiResponses, userResponse]);
      setUserResponse("");

      if (currentQuestion < aiQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        completeStep("step3");
        generateAIPrompt();
        if (!openSections.includes("step4")) {
          setOpenSections(prev => [...prev, "step4"]);
        }
      }
    }
  };

  // Generate AI-powered prompt
  const generateAIPrompt = async () => {
    console.log('🚀 [Wizard] Starting AI prompt generation...');
    setIsGeneratingPrompt(true);

    try {
      let outputDetails = "";

      if (outputMethod === "upload" && uploadedFile) {
        outputDetails = `첨부한 샘플 파일 기준: ${uploadedFile.name}`;
      } else if (outputMethod === "predefined") {
        const formatLabel = predefinedFormats.find((option) => option.id === predefinedFormat)?.label ?? predefinedFormat;
        outputDetails = `출력 형식: ${formatLabel}`;
      } else if (outputMethod === "company") {
        const styleLabel = companyDocumentStyles.find((style) => style.id === documentStyle)?.label ?? documentStyle;
        outputDetails = `문서 스타일: ${styleLabel}`;
      }

      const context = {
        purpose,
        outputMethod: outputMethod as 'upload' | 'predefined' | 'company' | '',
        outputDetails,
        userResponses: aiResponses
      };

      console.log('📊 [Wizard] Prompt context:', context);
      console.log('💭 [Wizard] User responses:', aiResponses);

      const aiPrompt = await promptMateAI.generatePrompt(context);
      setGeneratedPrompt(aiPrompt);
      console.log('✅ [Wizard] AI prompt generated successfully');

    } catch (error) {
      console.error('❌ [Wizard] Failed to generate AI prompt:', error);
      console.log('🔄 [Wizard] Falling back to manual prompt generation');
      // Fallback to manual prompt generation
      generateFallbackPrompt();
    } finally {
      setIsGeneratingPrompt(false);
      completeStep("step4");
    }
  };

  // Fallback prompt generation (original logic)
  const generateFallbackPrompt = () => {
    let outputContext = "";

    if (outputMethod === "upload" && uploadedFile) {
      outputContext = `첨부한 샘플 파일 기준: ${uploadedFile.name}`;
    } else if (outputMethod === "predefined") {
      const formatLabel = predefinedFormats.find((option) => option.id === predefinedFormat)?.label ?? predefinedFormat;
      outputContext = `출력 형식: ${formatLabel}`;
    } else if (outputMethod === "company") {
      const styleLabel = companyDocumentStyles.find((style) => style.id === documentStyle)?.label ?? documentStyle;
      outputContext = `문서 스타일: ${styleLabel}`;
    }

    const prompt = `요청 주제: ${purpose}

${outputContext}

추가 질문 응답:
${aiResponses
      .map((response, i) => `${aiQuestions[i]?.text ?? ""}: ${response}`)
      .join("\n")}

위 정보에 맞춰 구조화되고 명확한 결과물을 작성하세요.`;

    setGeneratedPrompt(prompt);
  };

  const handleAcceptPrompt = async () => {
    if (!generatedPrompt.trim()) {
      console.warn('No prompt to execute');
      return;
    }

    console.log('🚀 [Wizard] Starting prompt execution...');
    console.log('🖼️ [Wizard] Has uploaded image:', !!uploadedFile?.imageData);
    setIsExecutingPrompt(true);

    try {
      const result = await promptMateAI.executePrompt(generatedPrompt, uploadedFile?.imageData);
      console.log('✅ [Wizard] Prompt executed successfully');

      // Navigate to FeedbackPage with prompt and AI result
      onNavigate('feedback', {
        prompt: generatedPrompt,
        aiResult: result.text,
        aiImageUrl: result.imageUrl,
        uploadedFile: uploadedFile
      });
    } catch (error) {
      console.error('❌ [Wizard] Failed to execute prompt:', error);
      setExecutionResult(`오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setShowExecutionResult(true);
    } finally {
      setIsExecutingPrompt(false);
    }
  };


  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> 홈으로 돌아가기
          </Button>
          <h1>새 프롬프트 만들기</h1>
          <p className="text-muted-foreground mb-4">
            아래 각 섹션을 완료해 맞춤형 프롬프트를 구성하세요.
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
                  <h3>1단계: 목적과 배경</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step1") ? "완료됨" : "프롬프트로 달성하려는 목표를 작성하세요."}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <Label>프롬프트의 목적은 무엇인가요?</Label>
                <Textarea
                  placeholder="예: 고객 문의에 대한 전문적인 이메일 답장을 작성하세요..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  onBlur={handlePurposeComplete}
                  className="min-h-[120px]"
                />
                {purpose.trim() && (
                  <div className="text-sm text-muted-foreground">
                    ✓ 목적이 정의되었습니다. 2단계로 진행하세요.
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
                  <h3>2단계: 원하는 출력</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step2") ? "완료됨" : "원하는 출력 형식과 스타일을 지정하세요."}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">출력 방식을 선택하세요:</Label>
                  <RadioGroup value={outputMethod} onValueChange={handleOutputMethodChange}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload" />
                        <Label htmlFor="upload" className="flex items-center space-x-2 cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <span>샘플 파일 업로드</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="predefined" id="predefined" />
                        <Label htmlFor="predefined" className="cursor-pointer">
                          기본 옵션에서 선택
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company" className="cursor-pointer">
                          회사 표준 문서 스타일 선택
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
                      accept={[...uploadAccepts.extensions, ...uploadAccepts.mimeTypes].join(",")}
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
                          샘플 파일을 끌어다 놓거나 클릭해서 업로드하세요.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          지원 형식: .txt, .doc, .docx, .pdf
                        </p>
                        {isProcessingFile && (
                          <p className="text-xs text-muted-foreground mt-3" aria-live="polite">
                            파일을 처리하는 중입니다...
                          </p>
                        )}
                        {uploadError && (
                          <p className="text-xs text-red-500 mt-3" role="alert">
                            {uploadError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.format.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadError(null);
                              setCompletedSteps(prev => {
                                const newSet = new Set(prev);
                                newSet.delete("step2");
                                return newSet;
                              });
                            }}
                          >
                            제거
                          </Button>
                        </div>
                        {uploadedFile.warnings.length > 0 && (
                          <div className="mt-3 text-xs text-muted-foreground space-y-1">
                            {uploadedFile.warnings.map((warning, index) => (
                              <p key={index}>⚠ {warning}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Predefined Options */}
                {outputMethod === "predefined" && (
                  <div>
                    <Label className="text-sm mb-2 block">출력 형식 선택:</Label>
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
                    <Label htmlFor="style-select" className="text-sm mb-2 block">문서 스타일:</Label>
                    <Select value={documentStyle} onValueChange={handleDocumentStyleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="문서 스타일을 선택하세요" />
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
                    ✓ 출력 방식이 선택되었습니다. 3단계로 진행하세요.
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
                  <h3>3단계: 추가 질문</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step3") ? "모든 질문에 응답했습니다." : "AI 질문에 답해 프롬프트를 구체화하세요."}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Loading state for AI questions */}
                {isLoadingQuestions && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">AI가 맞춤형 질문을 생성하고 있습니다...</p>
                  </div>
                )}

                {/* Previous conversations */}
                {aiResponses.map((response, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="text-sm">{aiQuestions[index]?.text || '질문을 불러오는 중...'}</p>
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
                {currentQuestion < aiQuestions.length && !completedSteps.has("step3") && !isLoadingQuestions && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="text-sm">{aiQuestions[currentQuestion]?.text}</p>
                        {promptMateAI.isAIEnabled() && (
                          <p className="text-xs text-muted-foreground mt-1">
                            🤖 AI 생성 질문 ({currentQuestion + 1}/{aiQuestions.length})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end space-x-3">
                      <Textarea
                        placeholder="답변을 입력하세요..."
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

                {/* AI questions not available */}
                {!isLoadingQuestions && aiQuestions.length === 0 && completedSteps.has("step2") && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>2단계를 완료하면 맞춤형 질문이 생성됩니다.</p>
                  </div>
                )}

                {/* Completed state */}
                {completedSteps.has("step3") && (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">모든 질문에 답했습니다!</p>
                    <p className="text-sm text-muted-foreground mt-1">✓ 이제 4단계로 이동하세요.</p>
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
                  <h3>4단계: 최종 프롬프트</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.has("step4") ? "프롬프트가 준비되었습니다." : "생성된 프롬프트를 검토하고 수정하세요."}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {generatedPrompt ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>생성된 프롬프트</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                      >
                        {isEditingPrompt ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            편집 완료
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            편집
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
                        프롬프트 저장
                      </Button>
                      <Button
                        onClick={handleAcceptPrompt}
                        disabled={isExecutingPrompt}
                      >
                        {isExecutingPrompt ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            테스트 중...
                          </>
                        ) : (
                          <>
                            승인하고 테스트하기
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Prompt Execution Result */}
                    {showExecutionResult && (
                      <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium">🎯 프롬프트 실행 결과</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowExecutionResult(false)}
                          >
                            ✕
                          </Button>
                        </div>

                        {isExecutingPrompt ? (
                          <div className="text-center py-8">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">
                              {promptMateAI.isAIEnabled() ? 'AI가 프롬프트를 실행하고 있습니다...' : '프롬프트를 실행하고 있습니다...'}
                            </p>
                          </div>
                        ) : executionResult ? (
                          <div className="space-y-3">
                            <div className="bg-background p-4 rounded border max-h-96 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-sm font-mono">
                                {executionResult}
                              </pre>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(executionResult)}
                              >
                                📋 결과 복사
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            실행 결과가 여기에 표시됩니다.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : isGeneratingPrompt ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      {promptMateAI.isAIEnabled() ? 'AI가 맞춤형 프롬프트를 생성하고 있습니다...' : '프롬프트를 생성하고 있습니다...'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit3 className="h-8 w-8 mx-auto mb-2" />
                    <p>이전 단계를 완료하면 프롬프트가 생성됩니다.</p>
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
