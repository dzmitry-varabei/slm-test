import { Router } from 'express';
import {
  getFlashcardWithAnswer,
  createInteraction,
  getProviderConfig,
  updateTeacherOverride,
  getInteractionById,
  createPromptExample,
  getAllAnswersForFlashcard,
} from '../db/queries';
import { evaluateAnswer } from '../services/slm/evaluation';
import { evaluateWithClaude } from '../services/slm/claude-cli';

export const quizRouter = Router();

quizRouter.post('/evaluate', async (req, res) => {
  try {
    const { session_id, flashcard_id, user_answer, debug } = req.body;

    if (!session_id || !flashcard_id || !user_answer) {
      return res.status(400).json({ error: 'Missing required fields: session_id, flashcard_id, user_answer' });
    }

    const flashcard = await getFlashcardWithAnswer(flashcard_id);
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Get all answers (primary + alternatives)
    const allAnswers = await getAllAnswersForFlashcard(flashcard_id);
    const providerConfig = await getProviderConfig();

    // Always run SLM evaluation
    const slmPromise = evaluateAnswer(
      flashcard.question,
      allAnswers,
      user_answer,
      providerConfig.provider,
    );

    // If debug mode, also run Claude evaluation in parallel
    const claudePromise = debug
      ? evaluateWithClaude(flashcard.question, allAnswers, user_answer).catch((err) => {
          console.error('Claude CLI evaluation failed:', err.message);
          return null;
        })
      : Promise.resolve(null);

    const [slmResult, claudeResult] = await Promise.all([slmPromise, claudePromise]);

    const interaction = await createInteraction({
      session_id,
      flashcard_id,
      user_answer,
      slm_verdict: slmResult.verdict,
      slm_comment: slmResult.comment,
      slm_raw_response: slmResult.rawResponse,
      provider: slmResult.provider,
      model: slmResult.model,
      prompt_tokens: slmResult.promptTokens,
      completion_tokens: slmResult.completionTokens,
      latency_ms: slmResult.latencyMs,
      claude_verdict: claudeResult?.verdict,
      claude_comment: claudeResult?.comment,
      claude_explanation: claudeResult?.explanation,
      claude_raw_response: claudeResult?.rawResponse,
      claude_latency_ms: claudeResult?.latencyMs,
      prompt_sent: slmResult.promptSent,
    });

    // Base response (student mode)
    const response: any = {
      interaction_id: interaction.id,
      verdict: slmResult.verdict,
      comment: slmResult.comment,
      provider: slmResult.provider,
      model: slmResult.model,
      latency_ms: slmResult.latencyMs,
    };

    // Debug mode: add extended data
    if (debug) {
      response.prompt_sent = slmResult.promptSent;
      response.slm_raw_response = slmResult.rawResponse;
      response.prompt_tokens = slmResult.promptTokens;
      response.completion_tokens = slmResult.completionTokens;
      response.reference_answer = flashcard.answer;
      response.all_reference_answers = allAnswers;

      if (claudeResult) {
        response.claude = {
          verdict: claudeResult.verdict,
          comment: claudeResult.comment,
          explanation: claudeResult.explanation,
          latency_ms: claudeResult.latencyMs,
        };
      }
    }

    res.json(response);
  } catch (error: any) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: error.message || 'Evaluation failed' });
  }
});

quizRouter.post('/:id/override', async (req, res) => {
  try {
    const interactionId = parseInt(req.params.id, 10);
    const { verdict } = req.body;

    if (!verdict || !['correct', 'partially_correct', 'incorrect'].includes(verdict)) {
      return res.status(400).json({ error: 'Invalid verdict. Must be: correct, partially_correct, or incorrect' });
    }

    const interaction = await getInteractionById(interactionId);
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    await updateTeacherOverride(interactionId, verdict);

    // If teacher verdict differs from SLM verdict, create a few-shot example
    if (verdict !== interaction.slm_verdict) {
      const flashcard = await getFlashcardWithAnswer(interaction.flashcard_id);
      if (flashcard) {
        await createPromptExample({
          question: flashcard.question,
          reference_answer: flashcard.answer,
          user_answer: interaction.user_answer,
          expected_verdict: verdict,
          reason: `SLM said "${interaction.slm_verdict}", teacher corrected to "${verdict}"`,
        });
      }
    }

    res.json({ success: true, interaction_id: interactionId, teacher_override: verdict });
  } catch (error: any) {
    console.error('Override error:', error);
    res.status(500).json({ error: error.message || 'Override failed' });
  }
});
