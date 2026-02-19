import { SLMProviderConfig } from './types';
import { config } from '../../config';

export function getOllamaConfig(): SLMProviderConfig {
  return {
    name: 'ollama',
    baseUrl: config.ollama.baseUrl,
    model: config.ollama.model,
  };
}
