// 브라우저 콘솔에서 실행할 AI 연결 테스트 코드
// 개발자 도구 → Console 탭에서 실행하세요

console.log('🔍 Testing AI connection...');

// PromptMate AI 인스턴스에 접근
import('./lib/ai/openai-client.js').then(async (module) => {
  const { promptMateAI } = module;

  console.log('📊 AI Status:', {
    enabled: promptMateAI.isAIEnabled(),
    apiKey: import.meta.env?.VITE_OPENAI_API_KEY ? 'Present' : 'Missing'
  });

  if (promptMateAI.isAIEnabled()) {
    console.log('🔄 Starting connection test...');
    const result = await promptMateAI.testConnection();

    if (result.success) {
      console.log('✅ Connection test PASSED');
    } else {
      console.log('❌ Connection test FAILED:', result.error);
    }
  } else {
    console.log('⚠️ AI is not enabled');
  }
}).catch(error => {
  console.error('❌ Failed to import AI client:', error);
});