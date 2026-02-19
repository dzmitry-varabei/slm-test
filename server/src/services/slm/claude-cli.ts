import { spawn } from 'child_process';

export interface ClaudeEvaluationResult {
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  comment: string;
  explanation: string;
  rawResponse: string;
  latencyMs: number;
}

const CLAUDE_SYSTEM_PROMPT = `Ты — опытный экзаменатор. Сравни ответ студента с эталонным ответом.

ПРАВИЛА:
1. Оценивай СМЫСЛ, не точное совпадение слов
2. Не требуй всех деталей эталона — достаточно ключевой идеи
3. Допускай ответы на русском и английском
4. Будь строже к фактическим ошибкам

ШКАЛА:
- "correct" — ключевая идея верна
- "partially_correct" — частично прав, но упустил важное
- "incorrect" — неверно или не по теме

ФОРМАТ (строго JSON, без дополнительного текста):
{"verdict": "...", "comment": "Краткий комментарий (1-2 предложения)", "explanation": "Подробное объяснение: что верно, что неверно, чего не хватает (2-4 предложения)"}`;

function buildClaudePrompt(question: string, referenceAnswers: string[], userAnswer: string): string {
  let answersBlock: string;
  if (referenceAnswers.length === 1) {
    answersBlock = `ЭТАЛОННЫЙ ОТВЕТ: ${referenceAnswers[0]}`;
  } else {
    const lines = referenceAnswers.map((a, i) => `  ${i + 1}. ${a}`).join('\n');
    answersBlock = `ДОПУСТИМЫЕ ЭТАЛОННЫЕ ОТВЕТЫ:\n${lines}`;
  }

  return `${CLAUDE_SYSTEM_PROMPT}

ВОПРОС: ${question}

${answersBlock}

ОТВЕТ СТУДЕНТА: ${userAnswer}`;
}

function parseClaudeResponse(raw: string): { verdict: ClaudeEvaluationResult['verdict']; comment: string; explanation: string } {
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(raw);
    if (parsed.verdict && parsed.comment) {
      return {
        verdict: parsed.verdict,
        comment: parsed.comment,
        explanation: parsed.explanation || '',
      };
    }
  } catch {}

  // Try extracting from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed.verdict && parsed.comment) {
        return {
          verdict: parsed.verdict,
          comment: parsed.comment,
          explanation: parsed.explanation || '',
        };
      }
    } catch {}
  }

  // Try to find JSON object in the response
  const jsonMatch = raw.match(/\{[\s\S]*"verdict"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.verdict) {
        return {
          verdict: parsed.verdict,
          comment: parsed.comment || 'No comment',
          explanation: parsed.explanation || '',
        };
      }
    } catch {}
  }

  // Regex fallback
  const verdictMatch = raw.match(/"verdict"\s*:\s*"(correct|partially_correct|incorrect)"/);
  const commentMatch = raw.match(/"comment"\s*:\s*"([^"]+)"/);
  const explanationMatch = raw.match(/"explanation"\s*:\s*"([^"]+)"/);

  if (verdictMatch) {
    return {
      verdict: verdictMatch[1] as ClaudeEvaluationResult['verdict'],
      comment: commentMatch ? commentMatch[1] : 'No comment provided',
      explanation: explanationMatch ? explanationMatch[1] : '',
    };
  }

  return {
    verdict: 'incorrect',
    comment: 'Failed to parse Claude response',
    explanation: raw.slice(0, 500),
  };
}

export async function evaluateWithClaude(
  question: string,
  referenceAnswers: string[],
  userAnswer: string,
): Promise<ClaudeEvaluationResult> {
  const prompt = buildClaudePrompt(question, referenceAnswers, userAnswer);
  const startTime = Date.now();

  const rawResponse = await new Promise<string>((resolve, reject) => {
    // Remove CLAUDECODE env var to allow nested CLI invocation
    const env = { ...process.env };
    delete env.CLAUDECODE;

    const proc = spawn(
      'claude',
      ['--output-format', 'text', '--max-turns', '1', '-p', '-'],
      { env, stdio: ['pipe', 'pipe', 'pipe'] },
    );

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Claude CLI timeout (30s)'));
    }, 30000);

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Claude CLI spawn error: ${err.message}`));
    });

    // Write prompt to stdin and close
    proc.stdin.write(prompt);
    proc.stdin.end();
  });

  const latencyMs = Date.now() - startTime;
  const parsed = parseClaudeResponse(rawResponse);

  return {
    verdict: parsed.verdict,
    comment: parsed.comment,
    explanation: parsed.explanation,
    rawResponse,
    latencyMs,
  };
}
