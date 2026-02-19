import { useState } from 'react';
import { api } from '../api/client';

interface Props {
  interactionId: number;
  currentOverride?: string | null;
  onOverrideApplied: (verdict: string) => void;
}

const verdicts = [
  { value: 'correct', label: 'Correct', className: 'btn-override-correct' },
  { value: 'partially_correct', label: 'Partial', className: 'btn-override-partial' },
  { value: 'incorrect', label: 'Incorrect', className: 'btn-override-incorrect' },
] as const;

export default function TeacherOverride({ interactionId, currentOverride, onOverrideApplied }: Props) {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<string | null>(currentOverride || null);

  const handleOverride = async (verdict: string) => {
    setLoading(true);
    try {
      await api.override(interactionId, verdict);
      setApplied(verdict);
      onOverrideApplied(verdict);
    } catch (err: any) {
      console.error('Override failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debug-panel">
      <div className="debug-section-title">Teacher Override</div>
      <p className="override-description">
        Если оценка SLM неверна, преподаватель может указать правильный вердикт.
        Это создаст пример для обучения SLM — в будущих оценках модель будет учитывать
        эту поправку как подсказку (но не гарантию).
      </p>
      <div className="override-buttons">
        {verdicts.map((v) => (
          <button
            key={v.value}
            className={`btn ${v.className} ${applied === v.value ? 'active' : ''}`}
            onClick={() => handleOverride(v.value)}
            disabled={loading || applied !== null}
          >
            {v.label}
          </button>
        ))}
      </div>
      {applied && (
        <div className="override-status">
          Вердикт преподавателя: <strong>{applied}</strong>.
          {applied !== 'partially_correct' && applied !== currentOverride
            ? ' Пример добавлен в обучающую выборку SLM.'
            : ''}
        </div>
      )}
    </div>
  );
}
