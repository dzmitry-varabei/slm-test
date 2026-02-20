import { useState } from 'react';
import { Flashcard } from '../types';

interface Props {
  flashcard: Flashcard;
  onNext: () => void;
  onGoTo: (id: number) => void;
}

export default function QuestionCard({ flashcard, onNext, onGoTo }: Props) {
  const [goToId, setGoToId] = useState('');

  const handleGoTo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(goToId, 10);
    if (id > 0) {
      onGoTo(id);
      setGoToId('');
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-id">#{flashcard.id}</span>
        <div className="question-nav">
          <form className="goto-form" onSubmit={handleGoTo}>
            <input
              type="number"
              className="goto-input"
              placeholder="#"
              value={goToId}
              onChange={(e) => setGoToId(e.target.value)}
              min="1"
            />
            <button type="submit" className="btn btn-sm" disabled={!goToId}>Go</button>
          </form>
          <button className="btn btn-sm" onClick={onNext}>Random</button>
        </div>
      </div>
      <p className="question-text">{flashcard.question}</p>
    </div>
  );
}
