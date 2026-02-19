import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface Props {
  onChange?: (provider: string) => void;
}

export default function ProviderSelector({ onChange }: Props) {
  const [provider, setProvider] = useState('groq');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getProvider().then((config) => setProvider(config.provider)).catch(() => {});
  }, []);

  const handleChange = async (newProvider: string) => {
    setLoading(true);
    try {
      await api.setProvider(newProvider);
      setProvider(newProvider);
      onChange?.(newProvider);
    } catch (err) {
      console.error('Failed to switch provider:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="provider-selector">
      <label className="provider-label">Provider:</label>
      <div className="provider-buttons">
        <button
          className={`btn btn-provider ${provider === 'groq' ? 'active' : ''}`}
          onClick={() => handleChange('groq')}
          disabled={loading}
        >
          Groq (Cloud)
        </button>
        <button
          className={`btn btn-provider ${provider === 'ollama' ? 'active' : ''}`}
          onClick={() => handleChange('ollama')}
          disabled={loading}
        >
          Ollama (Local)
        </button>
      </div>
    </div>
  );
}
