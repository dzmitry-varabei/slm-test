import { EvaluationResult, SLMProviderConfig } from './types';
import { chatCompletion } from './provider';
import { buildUserPrompt, buildSystemPromptWithExamples, buildFullPromptPayload } from './prompt';
import { getGroqConfig } from './groq';
import { getOllamaConfig } from './ollama';
import { getActivePromptExamples } from '../../db/queries';

interface ParsedVerdict {
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  comment: string;
}

export function parseVerdict(raw: string): ParsedVerdict {
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(raw);
    if (parsed.verdict && parsed.comment) {
      return { verdict: parsed.verdict, comment: parsed.comment };
    }
  } catch {}

  // Try extracting from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed.verdict && parsed.comment) {
        return { verdict: parsed.verdict, comment: parsed.comment };
      }
    } catch {}
  }

  // Regex fallback
  const verdictMatch = raw.match(/"verdict"\s*:\s*"(correct|partially_correct|incorrect)"/);
  const commentMatch = raw.match(/"comment"\s*:\s*"([^"]+)"/);

  if (verdictMatch) {
    return {
      verdict: verdictMatch[1] as ParsedVerdict['verdict'],
      comment: commentMatch ? commentMatch[1] : 'No comment provided',
    };
  }

  return {
    verdict: 'incorrect',
    comment: 'Failed to parse SLM response',
  };
}

export function getProviderConfig(providerName: string): SLMProviderConfig {
  switch (providerName) {
    case 'groq':
      return getGroqConfig();
    case 'ollama':
      return getOllamaConfig();
    default:
      return getGroqConfig();
  }
}

export interface EvaluateAnswerResult extends EvaluationResult {
  promptSent: string;
}

export async function evaluateAnswer(
  question: string,
  referenceAnswers: string[],
  userAnswer: string,
  providerName: string,
): Promise<EvaluateAnswerResult> {
  const providerConfig = getProviderConfig(providerName);

  // Build prompt with few-shot examples
  const examples = await getActivePromptExamples();
  const systemPrompt = buildSystemPromptWithExamples(examples);
  const userPrompt = buildUserPrompt(question, referenceAnswers, userAnswer);
  const promptPayload = buildFullPromptPayload(systemPrompt, userPrompt);

  const startTime = Date.now();
  const response = await chatCompletion(providerConfig, systemPrompt, userPrompt);
  const latencyMs = Date.now() - startTime;

  const rawContent = response.choices[0]?.message?.content || '';
  const parsed = parseVerdict(rawContent);

  return {
    verdict: parsed.verdict,
    comment: parsed.comment,
    rawResponse: rawContent,
    provider: providerConfig.name,
    model: providerConfig.model,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    latencyMs,
    promptSent: promptPayload.full,
  };
}
