interface Props {
  answer: string;
  allAnswers?: string[];
}

export default function ReferenceAnswer({ answer, allAnswers }: Props) {
  const answers = allAnswers && allAnswers.length > 1 ? allAnswers : [answer];
  const hasMultiple = answers.length > 1;

  return (
    <div className="debug-panel">
      <div className="debug-section-title">
        {hasMultiple ? `Reference Answers (${answers.length})` : 'Reference Answer'}
      </div>
      {hasMultiple ? (
        <ol className="reference-answers-list">
          {answers.map((a, i) => (
            <li key={i} className="reference-answer-item">{a}</li>
          ))}
        </ol>
      ) : (
        <div className="reference-answer-content">{answers[0]}</div>
      )}
    </div>
  );
}
