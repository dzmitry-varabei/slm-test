import { PromptExample } from '../../db/queries';

export const EVALUATION_SYSTEM_PROMPT = `Ты — ассистент-стажёр экзаменатора. Сравни ответ студента с эталонным.

ПРАВИЛА:
1. Оценивай СМЫСЛ, не точное совпадение слов
2. Не требуй всех деталей эталона — достаточно ключевой идеи
3. Допускай ответы на русском и английском
4. Если указано несколько допустимых ответов — достаточно совпадения с любым из них

ШКАЛА:
- "correct" — ключевая идея верна
- "partially_correct" — частично прав, но упустил важное
- "incorrect" — неверно или не по теме

ФОРМАТ (строго JSON, без дополнительного текста):
{"verdict": "...", "comment": "Краткий комментарий (1-2 предложения)"}`;

export function buildUserPrompt(question: string, referenceAnswers: string[], userAnswer: string): string {
  if (referenceAnswers.length === 1) {
    return `ВОПРОС: ${question}

ЭТАЛОННЫЙ ОТВЕТ: ${referenceAnswers[0]}

ОТВЕТ СТУДЕНТА: ${userAnswer}`;
  }

  const answersBlock = referenceAnswers.map((a, i) => `  ${i + 1}. ${a}`).join('\n');
  return `ВОПРОС: ${question}

ДОПУСТИМЫЕ ЭТАЛОННЫЕ ОТВЕТЫ:
${answersBlock}

ОТВЕТ СТУДЕНТА: ${userAnswer}`;
}

export function buildSystemPromptWithExamples(examples: PromptExample[]): string {
  if (!examples.length) return EVALUATION_SYSTEM_PROMPT;

  const examplesBlock = examples.map((ex, i) => {
    let text = `ПРИМЕР ${i + 1}:
Вопрос: ${ex.question}
Эталонный ответ: ${ex.reference_answer}
Ответ студента: ${ex.user_answer}
Верный вердикт: ${ex.expected_verdict}`;
    if (ex.reason) {
      text += `, потому что ${ex.reason}`;
    }
    return text;
  }).join('\n\n');

  return `${EVALUATION_SYSTEM_PROMPT}

ПРИМЕРЫ ПРАВИЛЬНОЙ ОЦЕНКИ (учись на них):
${examplesBlock}`;
}

export function buildFullPromptPayload(
  systemPrompt: string,
  userPrompt: string,
): { system: string; user: string; full: string } {
  return {
    system: systemPrompt,
    user: userPrompt,
    full: `[SYSTEM]\n${systemPrompt}\n\n[USER]\n${userPrompt}`,
  };
}
