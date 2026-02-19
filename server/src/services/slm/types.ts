export interface SLMProviderConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export interface EvaluationResult {
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  comment: string;
  rawResponse: string;
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
