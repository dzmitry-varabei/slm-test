import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ProviderConfig } from '../types';

export default function SettingsPage() {
  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [testStatus, setTestStatus] = useState<Record<string, { status: string; message?: string }>>({});
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    api.getProvider().then(setConfig).catch(console.error);
  }, []);

  const handleSwitch = async (provider: string) => {
    try {
      const updated = await api.setProvider(provider);
      setConfig(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTest = async (provider: string) => {
    setTesting(provider);
    try {
      const result = await api.testProvider(provider);
      setTestStatus((prev) => ({ ...prev, [provider]: result }));
    } catch (err: any) {
      setTestStatus((prev) => ({ ...prev, [provider]: { status: 'error', message: err.message } }));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="settings-page">
      <h2>Provider Settings</h2>

      <div className="provider-cards">
        {['groq', 'ollama'].map((provider) => (
          <div key={provider} className={`provider-card ${config?.provider === provider ? 'active' : ''}`}>
            <div className="provider-card-header">
              <h3>{provider === 'groq' ? 'Groq (Cloud)' : 'Ollama (Local)'}</h3>
              {config?.provider === provider && <span className="active-badge">Active</span>}
            </div>
            <p className="provider-description">
              {provider === 'groq'
                ? 'Fast cloud inference via Groq API. Requires API key in .env file.'
                : 'Local inference via Ollama. Requires Ollama running on localhost:11434.'}
            </p>
            {config?.provider === provider && (
              <div className="provider-details">
                <div><strong>Model:</strong> {config.model}</div>
                <div><strong>URL:</strong> {config.base_url}</div>
              </div>
            )}
            <div className="provider-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleSwitch(provider)}
                disabled={config?.provider === provider}
              >
                {config?.provider === provider ? 'Selected' : 'Select'}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => handleTest(provider)}
                disabled={testing === provider}
              >
                {testing === provider ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            {testStatus[provider] && (
              <div className={`test-result ${testStatus[provider].status}`}>
                {testStatus[provider].status === 'ok' ? 'Connected' : `Error: ${testStatus[provider].message}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
