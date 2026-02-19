import { EvaluationResponse } from '../types';

interface Props {
  result: EvaluationResponse;
}

const verdictLabels: Record<string, string> = {
  correct: 'Correct',
  partially_correct: 'Partially Correct',
  incorrect: 'Incorrect',
};

function getLatencyClass(ms: number): string {
  if (ms < 1000) return 'latency-fast';
  if (ms < 5000) return 'latency-medium';
  return 'latency-slow';
}

export default function EvaluationResult({ result }: Props) {
  return (
    <div className={`evaluation-result verdict-${result.verdict}`}>
      <div className="evaluation-header">
        <span className={`verdict-badge ${result.verdict}`}>
          {verdictLabels[result.verdict] || result.verdict}
        </span>
        <span className={`latency-badge ${getLatencyClass(result.latency_ms)}`}>
          {result.latency_ms}ms
        </span>
      </div>
      <p className="evaluation-comment">{result.comment}</p>
      <div className="evaluation-meta">
        <span>{result.provider} / {result.model}</span>
      </div>
    </div>
  );
}
