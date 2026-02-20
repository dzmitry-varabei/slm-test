export interface Flashcard {
  id: number;
  question: string;
  source: string;
  created_at: string;
}

export interface Session {
  id: number;
  started_at: string;
  finished_at: string | null;
  provider: string | null;
  model: string | null;
  interactions?: Interaction[];
}

export interface Interaction {
  id: number;
  session_id: number;
  flashcard_id: number;
  user_answer: string;
  slm_verdict: string | null;
  slm_comment: string | null;
  slm_raw_response: string | null;
  provider: string | null;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  latency_ms: number | null;
  claude_verdict: string | null;
  claude_comment: string | null;
  claude_explanation: string | null;
  claude_raw_response: string | null;
  claude_latency_ms: number | null;
  teacher_override: string | null;
  prompt_sent: string | null;
  created_at: string;
  question?: string;
  reference_answer?: string;
}

export interface ProviderConfig {
  provider: string;
  model: string;
  base_url: string;
}

export interface EvaluationResponse {
  interaction_id: number;
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  comment: string;
  provider: string;
  model: string;
  latency_ms: number;
  // Debug mode fields
  prompt_sent?: string;
  slm_raw_response?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  reference_answer?: string;
  all_reference_answers?: string[];
  examples_count?: number;
  auto_example_created?: boolean;
  claude?: {
    verdict: 'correct' | 'partially_correct' | 'incorrect';
    comment: string;
    explanation: string;
    latency_ms: number;
  };
}

export interface OverrideResponse {
  success: boolean;
  interaction_id: number;
  teacher_override: string;
}
