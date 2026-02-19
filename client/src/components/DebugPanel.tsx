import { useState } from 'react';

interface Props {
  promptSent: string;
  rawResponse: string;
  promptTokens?: number;
  completionTokens?: number;
}

function CollapsibleSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="collapsible">
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span className="collapsible-arrow">{open ? '\u25BC' : '\u25B6'}</span>
        <span>{title}</span>
      </button>
      {open && (
        <pre className="collapsible-content">{content}</pre>
      )}
    </div>
  );
}

export default function DebugPanel({ promptSent, rawResponse, promptTokens, completionTokens }: Props) {
  return (
    <div className="debug-panel">
      <div className="debug-section-title">SLM Evaluation Details</div>
      <CollapsibleSection title="Full Prompt Sent to SLM" content={promptSent} />
      <CollapsibleSection title="Raw SLM Response" content={rawResponse} />
      {(promptTokens != null || completionTokens != null) && (
        <div className="token-info">
          Tokens: {promptTokens ?? '?'} prompt / {completionTokens ?? '?'} completion
        </div>
      )}
    </div>
  );
}
