import { Router } from 'express';
import { getProviderConfig, updateProviderConfig } from '../db/queries';
import { config } from '../config';

export const settingsRouter = Router();

settingsRouter.get('/provider', async (_req, res) => {
  const providerConfig = await getProviderConfig();
  res.json(providerConfig);
});

settingsRouter.put('/provider', async (req, res) => {
  const { provider } = req.body;

  let model: string;
  let base_url: string;

  if (provider === 'ollama') {
    model = config.ollama.model;
    base_url = config.ollama.baseUrl;
  } else {
    model = config.groq.model;
    base_url = config.groq.baseUrl;
  }

  await updateProviderConfig({ provider, model, base_url });
  const updated = await getProviderConfig();
  res.json(updated);
});

settingsRouter.post('/test', async (req, res) => {
  const { provider } = req.body;

  try {
    const { getProviderConfig: getSlmConfig } = await import('../services/slm/evaluation');
    const providerConfig = getSlmConfig(provider || 'groq');

    const url = `${providerConfig.baseUrl}/models`;
    const headers: Record<string, string> = {};
    if (providerConfig.apiKey) {
      headers['Authorization'] = `Bearer ${providerConfig.apiKey}`;
    }

    const response = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      res.json({ status: 'ok', provider: providerConfig.name });
    } else {
      res.status(502).json({ status: 'error', message: `Provider returned ${response.status}` });
    }
  } catch (error: any) {
    res.status(502).json({ status: 'error', message: error.message });
  }
});
