import { Flashcard } from '../types';

interface Props {
  flashcard: Flashcard;
  onNext: () => void;
}

export default function QuestionCard({ flashcard, onNext }: Props) {
  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-id">#{flashcard.id}</span>
        <button className="btn btn-sm" onClick={onNext}>Next question</button>
      </div>
      <p className="question-text">{flashcard.question}</p>
    </div>
  );
}
