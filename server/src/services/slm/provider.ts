import { SLMProviderConfig, ChatCompletionResponse } from './types';

export async function chatCompletion(
  providerConfig: SLMProviderConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<ChatCompletionResponse> {
  const url = `${providerConfig.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (providerConfig.apiKey) {
    headers['Authorization'] = `Bearer ${providerConfig.apiKey}`;
  }

  const body = {
    model: providerConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 256,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SLM API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<ChatCompletionResponse>;
}
