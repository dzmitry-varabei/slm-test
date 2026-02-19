interface Props {
  verdict: string;
  comment: string;
  explanation: string;
  latencyMs: number;
}

const verdictLabels: Record<string, string> = {
  correct: 'Correct',
  partially_correct: 'Partially Correct',
  incorrect: 'Incorrect',
};

export default function ClaudeResult({ verdict, comment, explanation, latencyMs }: Props) {
  return (
    <div className="debug-panel">
      <div className="debug-section-title">Claude Evaluation</div>
      <div className={`evaluation-result verdict-${verdict}`}>
        <div className="evaluation-header">
          <span className={`verdict-badge ${verdict}`}>
            {verdictLabels[verdict] || verdict}
          </span>
          <span className="latency-badge latency-slow">{latencyMs}ms</span>
        </div>
        <p className="evaluation-comment">{comment}</p>
        {explanation && (
          <p className="claude-explanation">{explanation}</p>
        )}
        <div className="evaluation-meta">Claude CLI</div>
      </div>
    </div>
  );
}
