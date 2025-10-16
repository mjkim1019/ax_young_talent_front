// 직접 fetch를 사용한 OpenAI API 호출 (SDK 우회)

interface DirectOpenAIRequest {
  model: string;
  messages: Array<{ role: string; content: string | any[] }>;
  max_tokens: number;
  temperature: number;
}

export async function directOpenAICall(requestData: DirectOpenAIRequest): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🔗 [Direct] Making direct fetch call to OpenAI');
  console.log('🔑 [Direct] Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'PromptMate/1.0'
    },
    body: JSON.stringify(requestData)
  });

  console.log('📊 [Direct] Response status:', response.status);
  console.log('📊 [Direct] Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Direct] API Error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ [Direct] API Response:', data);

  return data.choices[0]?.message?.content || '';
}