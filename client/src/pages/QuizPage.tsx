import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Flashcard, EvaluationResponse } from '../types';
import QuestionCard from '../components/QuestionCard';
import AnswerInput from '../components/AnswerInput';
import EvaluationResult from '../components/EvaluationResult';
import ProviderSelector from '../components/ProviderSelector';
import DebugPanel from '../components/DebugPanel';
import ClaudeResult from '../components/ClaudeResult';
import ReferenceAnswer from '../components/ReferenceAnswer';
import TeacherOverride from '../components/TeacherOverride';

interface Props {
  debugMode: boolean;
}

export default function QuizPage({ debugMode }: Props) {
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EvaluationResponse[]>([]);

  const loadQuestion = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const fc = await api.getRandomFlashcard();
      setFlashcard(fc);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const ensureSession = useCallback(async (): Promise<number> => {
    if (sessionId) return sessionId;
    const session = await api.createSession();
    setSessionId(session.id);
    return session.id;
  }, [sessionId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleSubmit = async (answer: string) => {
    if (!flashcard) return;
    setEvaluating(true);
    setError(null);
    setResult(null);

    try {
      const sid = await ensureSession();
      const evalResult = await api.evaluate(sid, flashcard.id, answer, debugMode);
      setResult(evalResult);
      setHistory((prev) => [evalResult, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNewSession = () => {
    setSessionId(null);
    setHistory([]);
    setResult(null);
    loadQuestion();
  };

  return (
    <div className="quiz-page">
      <div className="quiz-controls">
        <ProviderSelector />
        <button className="btn btn-sm" onClick={handleNewSession}>New Session</button>
        {sessionId && <span className="session-badge">Session #{sessionId}</span>}
        {debugMode && <span className="debug-badge">DEBUG</span>}
      </div>

      {flashcard && (
        <QuestionCard flashcard={flashcard} onNext={loadQuestion} />
      )}

      <AnswerInput onSubmit={handleSubmit} disabled={evaluating || !flashcard} />

      {evaluating && (
        <div className="loading">
          Evaluating with SLM...{debugMode ? ' + Claude (may take longer)' : ''}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      {result && (
        <>
          <EvaluationResult result={result} />

          {debugMode && (
            <div className="debug-sections">
              {result.prompt_sent && result.slm_raw_response && (
                <DebugPanel
                  promptSent={result.prompt_sent}
                  rawResponse={result.slm_raw_response}
                  promptTokens={result.prompt_tokens}
                  completionTokens={result.completion_tokens}
                />
              )}

              {result.claude && (
                <ClaudeResult
                  verdict={result.claude.verdict}
                  comment={result.claude.comment}
                  explanation={result.claude.explanation}
                  latencyMs={result.claude.latency_ms}
                />
              )}

              {result.reference_answer && (
                <ReferenceAnswer
                  answer={result.reference_answer}
                  allAnswers={result.all_reference_answers}
                />
              )}

              <TeacherOverride
                interactionId={result.interaction_id}
                onOverrideApplied={(verdict) => {
                  setResult((prev) => prev ? { ...prev, _override: verdict } as any : null);
                }}
              />
            </div>
          )}
        </>
      )}

      {history.length > 1 && (
        <div className="quiz-history">
          <h3>Session History</h3>
          {history.slice(1).map((r, i) => (
            <div key={i} className="history-item">
              <span className={`verdict-badge-sm ${r.verdict}`}>{r.verdict}</span>
              <span className="history-comment">{r.comment}</span>
              <span className="history-latency">{r.latency_ms}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
