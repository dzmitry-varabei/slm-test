import { Interaction } from '../types';

interface Props {
  interactions: Interaction[];
}

const verdictLabels: Record<string, string> = {
  correct: 'Correct',
  partially_correct: 'Partially Correct',
  incorrect: 'Incorrect',
};

export default function LogViewer({ interactions }: Props) {
  if (interactions.length === 0) {
    return <p className="empty-state">No interactions yet.</p>;
  }

  return (
    <div className="log-viewer">
      <table className="log-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Answer</th>
            <th>Verdict</th>
            <th>Comment</th>
            <th>Provider</th>
            <th>Latency</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {interactions.map((i, idx) => (
            <tr key={i.id}>
              <td>{idx + 1}</td>
              <td className="cell-truncate" title={i.question}>{i.question || `Flashcard #${i.flashcard_id}`}</td>
              <td className="cell-truncate" title={i.user_answer}>{i.user_answer}</td>
              <td>
                <span className={`verdict-badge-sm ${i.slm_verdict}`}>
                  {verdictLabels[i.slm_verdict || ''] || i.slm_verdict || '—'}
                </span>
              </td>
              <td className="cell-truncate" title={i.slm_comment || ''}>{i.slm_comment || '—'}</td>
              <td>{i.provider || '—'}</td>
              <td>{i.latency_ms != null ? `${i.latency_ms}ms` : '—'}</td>
              <td>{new Date(i.created_at).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
