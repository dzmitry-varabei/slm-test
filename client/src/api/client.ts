import { EvaluationResponse, OverrideResponse } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || response.statusText);
  }
  return response.json();
}

export const api = {
  // Flashcards
  getFlashcards: () => request<any[]>('/flashcards'),
  getFlashcard: (id: number) => request<any>(`/flashcards/${id}`),
  getRandomFlashcard: () => request<any>('/flashcards/random'),

  // Sessions
  createSession: (provider?: string, model?: string) =>
    request<any>('/sessions', { method: 'POST', body: JSON.stringify({ provider, model }) }),
  getSessions: () => request<any[]>('/sessions'),
  getSession: (id: number) => request<any>(`/sessions/${id}`),

  // Quiz
  evaluate: (session_id: number, flashcard_id: number, user_answer: string, debug: boolean = false) =>
    request<EvaluationResponse>('/quiz/evaluate', {
      method: 'POST',
      body: JSON.stringify({ session_id, flashcard_id, user_answer, debug }),
    }),

  // Teacher Override
  override: (interactionId: number, verdict: string) =>
    request<OverrideResponse>(`/quiz/${interactionId}/override`, {
      method: 'POST',
      body: JSON.stringify({ verdict }),
    }),

  // Settings
  getProvider: () => request<any>('/settings/provider'),
  setProvider: (provider: string) =>
    request<any>('/settings/provider', { method: 'PUT', body: JSON.stringify({ provider }) }),
  testProvider: (provider: string) =>
    request<any>('/settings/test', { method: 'POST', body: JSON.stringify({ provider }) }),

  // Logs
  getExportUrl: (format: string = 'json') => `${BASE}/logs/export?format=${format}`,
};
