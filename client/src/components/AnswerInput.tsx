import { useState } from 'react';

interface Props {
  onSubmit: (answer: string) => void;
  disabled: boolean;
  onClear?: () => void;
  clearSignal?: number;
}

export default function AnswerInput({ onSubmit, disabled, clearSignal }: Props) {
  const [answer, setAnswer] = useState('');
  const [lastClear, setLastClear] = useState(0);

  // Clear when clearSignal changes (new question loaded)
  if (clearSignal !== undefined && clearSignal !== lastClear) {
    setAnswer('');
    setLastClear(clearSignal);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  return (
    <form className="answer-form" onSubmit={handleSubmit}>
      <textarea
        className="answer-textarea"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        disabled={disabled}
      />
      <button className="btn btn-primary" type="submit" disabled={disabled || !answer.trim()}>
        {disabled ? 'Evaluating...' : 'Submit Answer'}
      </button>
    </form>
  );
}
