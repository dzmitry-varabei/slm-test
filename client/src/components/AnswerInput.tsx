import { useState } from 'react';

interface Props {
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export default function AnswerInput({ onSubmit, disabled }: Props) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
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
