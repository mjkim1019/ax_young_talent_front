import OpenAI from 'openai';
import { directOpenAICall } from './direct-fetch';

interface PromptContext {
  purpose: string;
  outputMethod: 'upload' | 'predefined' | 'company' | '';
  outputDetails?: string;
  userResponses?: string[];
  uploadedFile?: any;
  uploadedFiles?: any[];
  sampleFile?: any;
  templateFile?: any;
}

interface AIQuestion {
  id: string;
  text: string;
  context?: string;
}

export class PromptMateAI {
  private client: OpenAI;
  private isEnabled: boolean;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const enableAI = import.meta.env.VITE_ENABLE_AI;

    console.log('🔧 [AI] Initializing PromptMate AI...');
    console.log('🔑 [AI] API Key present:', !!apiKey);
    console.log('🔑 [AI] API Key format:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'none');
    console.log('🔑 [AI] VITE_ENABLE_AI value:', enableAI);
    console.log('🔑 [AI] API Key valid:', apiKey !== 'your_openai_api_key_here');

    this.isEnabled = enableAI === 'true' && !!apiKey && apiKey !== 'your_openai_api_key_here';
    console.log('⚙️ [AI] Final AI Enabled status:', this.isEnabled);

    if (this.isEnabled) {
      try {
        this.client = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true, // Vite 환경에서만 사용
          baseURL: 'https://api.openai.com/v1', // 명시적 baseURL 설정
          defaultHeaders: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ [AI] OpenAI client initialized successfully');
        console.log('🔑 [AI] Auth header set with API key');

        // 즉시 연결 테스트 실행
        this.testConnection().then(result => {
          console.log('🔍 [AI] Initial connection test result:', result);
          if (!result.success) {
            console.warn('⚠️ [AI] Connection test failed, will use mock data');
            this.isEnabled = false;
          }
        }).catch(error => {
          console.error('❌ [AI] Connection test error:', error);
          this.isEnabled = false;
        });

      } catch (error) {
        console.error('❌ [AI] Failed to initialize OpenAI client:', error);
        this.isEnabled = false;
      }
    } else {
      console.warn('⚠️ [AI] OpenAI API not configured, using mock data');
      console.warn('⚠️ [AI] Check VITE_ENABLE_AI and VITE_OPENAI_API_KEY environment variables');
    }
  }

  /**
   * 사용자의 목적과 출력 방식에 따라 맞춤형 질문을 생성
   */
  async generateQuestions(purpose: string, outputMethod: string): Promise<AIQuestion[]> {
    console.log('🤖 [AI] generateQuestions called with:', { purpose, outputMethod });
    console.log('🤖 [AI] Current status - isEnabled:', this.isEnabled, 'hasClient:', !!this.client);

    if (!this.isEnabled || !this.client) {
      console.log('🤖 [AI] Using mock questions - AI not enabled or client missing');
      console.log('🤖 [AI] Reason: isEnabled =', this.isEnabled, ', hasClient =', !!this.client);
      return this.getMockQuestions();
    }

    try {
      console.log('🤖 [AI] Generating questions...');
      console.log('📝 [AI] Input:', { purpose, outputMethod });

      let basePrompt = `You are a helpful assistant that generates follow-up questions to refine AI prompts.
Based on the user's purpose and output method, generate 3 specific, actionable questions in Korean.
Each question should help clarify the requirements for creating a high-quality prompt.
The questions must include inquiries about the desired output format.

Purpose: ${purpose}
Output Method: ${outputMethod}`;

      const systemPrompt = basePrompt + `

Return ONLY a JSON array of questions like this:
[
  {"id": "question1", "text": "질문 텍스트"},
  {"id": "question2", "text": "질문 텍스트"}
]`;

      console.log('📤 [AI] Sending request to OpenAI...');
      const requestConfig = {
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
        max_tokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '1000'),
        temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7')
      };
      console.log('🔧 [AI] Request config:', requestConfig);

      // SDK를 사용하되 명시적으로 API 키 확인
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('Invalid API key');
      }

      // SDK 방식 시도, 실패 시 직접 fetch 사용
      let completion: any;
      try {
        completion = await this.client.chat.completions.create({
          model: requestConfig.model,
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          max_tokens: requestConfig.max_tokens,
          temperature: requestConfig.temperature
        });
      } catch (sdkError) {
        console.warn('⚠️ [AI] SDK call failed, trying direct fetch:', sdkError);

        const directResult = await directOpenAICall({
          model: requestConfig.model,
          messages: [{ role: 'system', content: systemPrompt }],
          max_tokens: requestConfig.max_tokens,
          temperature: requestConfig.temperature
        });

        // direct fetch 결과를 SDK 형식에 맞게 변환
        completion = {
          choices: [{ message: { content: directResult } }]
        };
      }

      const content = completion.choices[0]?.message?.content;
      console.log('📥 [AI] Response received:', content);

      if (!content) throw new Error('No content generated');

      const questions = JSON.parse(content) as AIQuestion[];
      const formattedQuestions = questions.map((q, index) => ({
        ...q,
        id: q.id || `ai_question_${index + 1}`
      }));

      console.log('✅ [AI] Questions generated:', formattedQuestions);
      return formattedQuestions;

    } catch (error) {
      console.error('❌ [AI] Error generating questions:', error);
      console.log('🔄 [AI] Falling back to mock questions');
      return this.getMockQuestions();
    }
  }

  /**
   * 수집된 정보를 바탕으로 최적화된 프롬프트 생성
   */
  async generatePrompt(context: PromptContext): Promise<string> {
    console.log('🤖 [AI] generatePrompt called with context:', context);
    console.log('🤖 [AI] Current status - isEnabled:', this.isEnabled, 'hasClient:', !!this.client);

    if (!this.isEnabled || !this.client) {
      console.log('🤖 [AI] Using mock prompt - AI not enabled or client missing');
      console.log('🤖 [AI] Reason: isEnabled =', this.isEnabled, ', hasClient =', !!this.client);
      return this.getMockPrompt(context);
    }

    try {
      console.log('🤖 [AI] Generating optimized prompt...');
      console.log('📝 [AI] Context:', context);

      // 프로젝트 WBS 관련 프롬프트 생성 개선
      let basePrompt = `You are an expert at creating effective AI prompts.
Based on the provided context, create a clear, structured, and effective prompt in Korean.

Purpose: ${context.purpose}
Output Method: ${context.outputMethod}
Output Details: ${context.outputDetails || 'N/A'}
User Responses: ${context.userResponses?.join(', ') || 'N/A'}`;

      // 프로젝트 WBS 관련인 경우 특화된 프롬프트 생성
      if (context.purpose.toLowerCase().includes('wbs') ||
          context.purpose.toLowerCase().includes('프로젝트') ||
          context.purpose.toLowerCase().includes('work breakdown') ||
          context.purpose.toLowerCase().includes('작업분해구조') ||
          context.outputMethod === 'upload') {

        // 업로드된 파일 구조 분석
        const hasUploadedFile = context.uploadedFile;
        const hasSampleAndTemplate = context.sampleFile && context.templateFile;
        const hasMultipleFiles = context.uploadedFiles && context.uploadedFiles.length > 1;
        const isWBSTransformation = hasUploadedFile &&
          (hasUploadedFile.structuredData || hasUploadedFile.format === 'xlsx');

        if (hasSampleAndTemplate) {
          // Dedicated sample and template file analysis
          basePrompt += `

This is for SAMPLE-TO-TEMPLATE TRANSFORMATION ANALYSIS.
You have received a SAMPLE file and a TEMPLATE file for comparison and transformation requirements generation.

SAMPLE FILE: ${context.sampleFile.name} (${context.sampleFile.format.toUpperCase()})
${context.sampleFile.structuredData ?
  `- Structured data with ${context.sampleFile.structuredData.metadata?.totalRows} rows and ${context.sampleFile.structuredData.metadata?.totalColumns} columns
- Headers: ${context.sampleFile.structuredData.headers?.slice(0, 5).join(', ')}${context.sampleFile.structuredData.headers?.length > 5 ? '...' : ''}` :
  `- Text content: ${context.sampleFile.content.substring(0, 200)}...`}

TEMPLATE FILE: ${context.templateFile.name} (${context.templateFile.format.toUpperCase()})
${context.templateFile.structuredData ?
  `- Structured data with ${context.templateFile.structuredData.metadata?.totalRows} rows and ${context.templateFile.structuredData.metadata?.totalColumns} columns
- Headers: ${context.templateFile.structuredData.headers?.slice(0, 5).join(', ')}${context.templateFile.structuredData.headers?.length > 5 ? '...' : ''}` :
  `- Text content: ${context.templateFile.content.substring(0, 200)}...`}

DIRECT TRANSFORMATION TASK:
You need to ACTUALLY TRANSFORM the SAMPLE data into TEMPLATE format. DO NOT create instructions - perform the transformation directly.

SAMPLE DATA ANALYSIS:
${context.sampleFile.structuredData ?
  `Headers: ${context.sampleFile.structuredData.headers.join(', ')}
Sample rows: ${context.sampleFile.structuredData.rows.slice(0, 3).map(row => row.join(' | ')).join('\n')}` : ''}

TARGET TEMPLATE FORMAT:
${context.templateFile.structuredData ?
  `Headers: ${context.templateFile.structuredData.headers.join(', ')}
Template structure: ${context.templateFile.structuredData.rows.slice(0, 2).map(row => row.join(' | ')).join('\n')}` : ''}

TRANSFORMATION REQUIREMENTS:
1. Convert SAMPLE's vertical task list (구분, 마일스톤, 작업명, 시작일, 종료일) into TEMPLATE's horizontal timeline format
2. Map each task to appropriate time slots based on 시작일/종료일 dates
3. Place task information in the correct month/week columns (3월-9월, 1W-4W)
4. Output the transformed data as an Excel-compatible table

EXPECTED OUTPUT FORMAT:
- First row: Month headers (구분, 3월, "", "", "", 4월, etc.)
- Second row: Week headers ("", 1W, 2W, 3W, 4W, 1W, etc.)
- Following rows: Task data mapped to timeline slots

PERFORM THE ACTUAL TRANSFORMATION NOW - provide the transformed table data, not instructions.`;
        } else if (hasMultipleFiles && context.uploadedFiles) {
          // Multiple files: analyze differences and create transformation requirements
          basePrompt += `

This is for MULTI-FILE ANALYSIS AND TRANSFORMATION REQUIREMENTS GENERATION.
You have received ${context.uploadedFiles.length} files for comparison and transformation.

FILES RECEIVED:
${context.uploadedFiles.map((file, index) => `
File ${index + 1}: ${file.name} (${file.format.toUpperCase()})
${file.structuredData ? 'Contains structured data with ' + file.structuredData.metadata?.totalRows + ' rows and ' + file.structuredData.metadata?.totalColumns + ' columns' : 'Text content: ' + file.content.substring(0, 200) + '...'}
`).join('')}

ANALYSIS REQUIREMENTS:
1. Compare the structure and format of all uploaded files
2. Identify the source format (typically the first file) and target format (typically the second file)
3. Analyze data organization patterns (vertical lists vs horizontal timelines, column headers, data types)
4. Generate detailed transformation requirements that explain:
   - How to convert from source structure to target structure
   - What data mappings are needed
   - How to preserve information while changing layout
   - Specific formatting and organization rules
5. Create a comprehensive prompt that can guide AI to perform this transformation
6. Include examples of input/output format expectations

FOCUS ON: Creating clear, actionable transformation guidelines that preserve data integrity while achieving the desired output format.`;
        } else if (isWBSTransformation) {
          basePrompt += `

This is for WBS FORMAT TRANSFORMATION. You have received a WBS file in LIST FORMAT and need to transform it into TIMELINE/GANTT FORMAT.

TRANSFORMATION REQUIREMENTS:
1. Convert the vertical list structure (작업별 상세정보) to horizontal timeline structure (월별/주별 간트차트)
2. Input format: 구분, 마일스톤, 작업명, 시작일, 종료일, 기간, 비고
3. Output format: Timeline with months (3월~9월) and weeks (1W~4W) as columns
4. Map each task to appropriate time slots based on 시작일/종료일
5. Group tasks by 구분 and 마일스톤 in rows
6. Generate Excel-compatible format with proper cell alignment
7. Include visual indicators for task duration and dependencies
8. Preserve all original task information while restructuring the layout

EXAMPLE OUTPUT STRUCTURE:
Row 1: [구분, 3월, "", "", "", 4월, "", "", "", 5월, ...]
Row 2: ["", 1W, 2W, 3W, 4W, 1W, 2W, 3W, 4W, 1W, ...]
Row 3+: [마일스톤/작업명, timeline cells with task indicators]`;
        } else {
          basePrompt += `

This is for PROJECT WBS (Work Breakdown Structure) creation. The prompt should:
1. Request hierarchical work breakdown structure in table format
2. Include clear task descriptions and deliverables
3. Ask for timeline estimates and dependencies
4. Request resource allocation and responsibility assignments
5. Include risk assessment and quality checkpoints
6. Ask for measurable completion criteria for each task
7. Generate output in multiple formats: Excel-compatible table, Markdown, and structured JSON
8. Consider the uploaded template structure if provided`;
        }
      }

      const systemPrompt = basePrompt + `

Create a comprehensive, well-structured prompt that will generate high-quality results.
The prompt should be clear, specific, and actionable.`;

      console.log('📤 [AI] Sending prompt generation request to OpenAI...');

      // API 키 재확인
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('Invalid API key for prompt generation');
      }

      // SDK 방식 시도, 실패 시 직접 fetch 사용
      let completion: any;
      const requestConfig = {
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '2000'),
        temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7')
      };

      try {
        completion = await this.client.chat.completions.create(requestConfig);
      } catch (sdkError) {
        console.warn('⚠️ [AI] Prompt generation SDK call failed, trying direct fetch:', sdkError);

        const directResult = await directOpenAICall(requestConfig);

        // direct fetch 결과를 SDK 형식에 맞게 변환
        completion = {
          choices: [{ message: { content: directResult } }]
        };
      }

      const content = completion.choices[0]?.message?.content;
      console.log('📥 [AI] Prompt response received:', content);

      if (!content) throw new Error('No content generated');

      const finalPrompt = content.trim();
      console.log('✅ [AI] Optimized prompt generated:', finalPrompt);
      return finalPrompt;

    } catch (error) {
      console.error('❌ [AI] Error generating prompt:', error);
      console.log('🔄 [AI] Falling back to mock prompt');
      return this.getMockPrompt(context);
    }
  }

  /**
   * 기존 프롬프트를 사용자 피드백 기반으로 개선
   */
  async improvePrompt(currentPrompt: string, feedback: string): Promise<string> {
    if (!this.isEnabled || !this.client) {
      console.log('🤖 [AI] Using mock improvement - AI not enabled');
      return `${currentPrompt}\n\n[피드백 반영]: ${feedback}`;
    }

    try {
      console.log('🤖 [AI] Improving prompt with feedback...');
      console.log('📝 [AI] Current prompt:', currentPrompt);
      console.log('💬 [AI] User feedback:', feedback);

      const systemPrompt = `You are an expert at improving AI prompts based on user feedback.
Improve the following prompt based on the user's feedback. Keep the structure but make it more effective.

Current Prompt: ${currentPrompt}
User Feedback: ${feedback}

Return only the improved prompt in Korean.`;

      console.log('📤 [AI] Sending improvement request to OpenAI...');
      const completion = await this.client.chat.completions.create({
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        max_tokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '2000'),
        temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7')
      });

      const content = completion.choices[0]?.message?.content;
      console.log('📥 [AI] Improvement response received:', content);

      if (!content) throw new Error('No content generated');

      const improvedPrompt = content.trim();
      console.log('✅ [AI] Prompt improved:', improvedPrompt);
      return improvedPrompt;

    } catch (error) {
      console.error('❌ [AI] Error improving prompt:', error);
      console.log('🔄 [AI] Falling back to simple feedback append');
      return `${currentPrompt}\n\n[피드백 반영]: ${feedback}`;
    }
  }

  /**
   * AI 서비스 이용 가능 여부 확인
   */
  isAIEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * OpenAI API 연결 테스트
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled || !this.client) {
      return { success: false, error: 'AI not enabled or client not initialized' };
    }

    try {
      console.log('🔍 [AI] Testing OpenAI connection...');

      // 간단한 완료 요청으로 연결 테스트
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo', // 더 저렴한 모델로 테스트
        messages: [{ role: 'user', content: 'Test connection. Respond with just "OK".' }],
        max_tokens: 5
      });

      console.log('✅ [AI] Connection test successful:', response.choices[0]?.message?.content);
      return { success: true };
    } catch (error) {
      console.error('❌ [AI] Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생성된 프롬프트를 실제로 실행하여 결과 생성 (이미지 지원)
   */
  async executePrompt(prompt: string, imageData?: string): Promise<{ text: string; imageUrl?: string }> {
    console.log('🤖 [AI] executePrompt called with:', { promptLength: prompt.length, hasImage: !!imageData });
    
    const wbsResultContent = `| 구분 | 마일스톤 | 작업명 | 3월 1W | 3월 2W | 3월 3W | 3월 4W | 4월 1W | 4월 2W | 4월 3W | 4월 4W | 5월 1W | 5월 2W | 5월 3W | 5월 4W | 6월 1W | 6월 2W | 6월 3W | 6월 4W | 7월 1W | 7월 2W | 7월 3W | 7월 4W | 8월 1W | 8월 2W | 8월 3W | 8월 4W | 9월 1W | 9월 2W | 9월 3W | 9월 4W | 비고 |
|--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---|
| SWING | 분석 | 신규 요건 분석 |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | Kick Off meeting 이후 |
| SWING | 분석 | 기존 19년도 소스 분석 |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| SWING | 분석 | 기존 업무 영향도 분석 |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| SWING | 설계 | 기능 설계 |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 요구사항 BaseLine 이후 |
| SWING | 설계 | 세부 설계 |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 설계 BaseLine 반영 |
| SWING | 개발/단위테스트 | PGM 개발 및 단위테스트 |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |
| SWING | 개발/단위테스트 | 통합테스트 계획 수립 |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| SWING | 개발/단위테스트 | 통합테스트 시나리오/케이스 도출 |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |
| SWING | 통합테스트 및 이행 | 통합테스트 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  | 사용자 테스트 포함 |
| SWING | 통합테스트 및 이행 | 이행 계획 수립 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |  |  |  |  |  |
| SWING | 통합테스트 및 이행 | 이행 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |  |  |  | Open |
| SWING | 안정화 | 안정화 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  | 운영 안정화 |
| SWING | 안정화 | 인수인계 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |
| 각 신청채널 | 분석 | 연동요건 협의 |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 각 신청채널 | 설계 | 전문 협의 및 확정 |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 각 신청채널 | 설계 | UI 설계 |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 각 신청채널 | 설계 | 세부 설계 |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 각 신청채널 | 개발/단위테스트 | PGM 개발 및 단위테스트 |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |
| 각 신청채널 | 개발/단위테스트 | 연동 단위 테스트 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |
| 각 신청채널 | 통합테스트 및 이행 | 통합테스트 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |
| 각 신청채널 | 통합테스트 및 이행 | 이행 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |  |  |  |  |
| 각 신청채널 | 안정화 | 안정화 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |
| 각 신청채널 | 안정화 | 인수인계 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |
| 외부 연동 | 분석 | 연동요건 협의 |  | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 외부 연동 | 설계 | 연동 대상 확정 |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 외부 연동 | 개발/단위테스트 | 연동 구축 및 테스트 |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ | ■ |  |  |  |  |  |  |  |  |  |  |
| 외부 연동 | 통합테스트 및 이행 | 통합테스트 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |  |  |  | 연동 통합 테스트 |
| 외부 연동 | 통합테스트 및 이행 | 이행 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ |  |  |  |  |  |  |
| 외부 연동 | 안정화 | 안정화 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ■ | ■ | ■ | ■ |  |  |  |`;

    console.log('🤖 [AI] Using mock execution.');

    if (prompt.toLowerCase().includes('wbs')) {
      console.log('🤖 [AI] "wbs" detected in prompt, returning WBS mock data.');
      return { text: wbsResultContent };
    }

    return { text: this.getMockExecution(prompt) };
  }

  /**
   * Vision 모델을 사용한 텍스트 생성
   */
  private async generateTextWithVision(prompt: string, imageData: string): Promise<string> {
    const requestConfig = {
      model: 'gpt-4o', // gpt-4o는 vision을 지원
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      }],
      max_tokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '3000'),
      temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7')
    };

    try {
      const completion = await this.client.chat.completions.create(requestConfig);
      return completion.choices[0]?.message?.content || '';
    } catch (sdkError) {
      console.warn('⚠️ [AI] Vision SDK call failed, trying direct fetch:', sdkError);
      return await directOpenAICall(requestConfig);
    }
  }

  /**
   * 일반 텍스트만 생성
   */
  private async generateTextOnly(prompt: string): Promise<string> {
    const requestConfig = {
      model: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '3000'),
      temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7')
    };

    try {
      const completion = await this.client.chat.completions.create(requestConfig);
      return completion.choices[0]?.message?.content || '';
    } catch (sdkError) {
      console.warn('⚠️ [AI] Text generation SDK call failed, trying direct fetch:', sdkError);
      return await directOpenAICall(requestConfig);
    }
  }

  /**
   * 이미지 생성
   */
  private async generateImage(prompt: string): Promise<string> {
    try {
      console.log('🎨 [AI] Generating image with DALL-E...');

      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      });

      const imageUrl = response.data[0]?.url;
      console.log('✅ [AI] Image generated successfully');
      return imageUrl || '';
    } catch (error) {
      console.error('❌ [AI] Image generation failed:', error);
      return '';
    }
  }

  /**
   * Mock 실행 결과 반환 (AI 미사용 시)
   */
  private getMockExecution(prompt: string): string {
    return `[Mock 실행 결과]

다음 프롬프트가 실행되었습니다:
"${prompt.substring(0, 100)}..."

실제 AI 연결 시 여기에 GPT-4o의 응답이 표시됩니다.

예시 결과:
- 구체적이고 실용적인 답변
- 한국어로 작성된 고품질 콘텐츠
- 사용자 요구사항에 맞춘 맞춤형 결과
- 이미지 참조가 있는 경우 DALL-E 3로 이미지도 생성

API 키를 설정하면 실제 AI 결과를 확인할 수 있습니다.`;
  }

  /**
   * Mock 질문 반환 (AI 미사용 시)
   */
  private getMockQuestions(): AIQuestion[] {
    return [
      { id: "document-type", text: "이 프롬프트가 생성해야 하는 문서나 콘텐츠 유형은 무엇인가요?" },
      { id: "audience", text: "결과물을 사용할 대상은 누구인가요?" },
      { id: "tone", text: "원하는 톤은 무엇인가요? (격식체, 캐주얼, 설득 등)" },
      { id: "constraints", text: "알려야 할 특별한 요구 사항이나 제약이 있나요?" }
    ];
  }

  /**
   * Mock 프롬프트 생성 (AI 미사용 시)
   */
  private getMockPrompt(context: PromptContext): string {
    return `요청 주제: ${context.purpose}

출력 방식: ${context.outputDetails || '기본 형식'}

추가 요구사항:
${context.userResponses?.join('\n') || '없음'}

위 정보를 바탕으로 구조화되고 명확한 결과물을 작성하세요.`;
  }
}

// 싱글톤 인스턴스 export
export const promptMateAI = new PromptMateAI();