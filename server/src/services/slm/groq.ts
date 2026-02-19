import { SLMProviderConfig } from './types';
import { config } from '../../config';

export function getGroqConfig(): SLMProviderConfig {
  return {
    name: 'groq',
    baseUrl: config.groq.baseUrl,
    apiKey: config.groq.apiKey,
    model: config.groq.model,
  };
}
