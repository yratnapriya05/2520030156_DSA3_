import { useState } from 'react';

export default function CodeViewer({ algorithm, file, fn, explanation, code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-viewer">
      <div className="code-viewer-head">
        <div>
          {algorithm ? <div className="code-kicker">{algorithm}</div> : null}
          <strong>{fn || 'implementation'}</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            {file}
          </div>
        </div>
        <button className="btn btn-ghost" type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
      {explanation ? <p className="muted" style={{ margin: '8px 0 10px', fontSize: 13 }}>{explanation}</p> : null}
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
}
