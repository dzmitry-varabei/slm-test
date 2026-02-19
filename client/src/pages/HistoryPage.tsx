import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Session } from '../types';
import LogViewer from '../components/LogViewer';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sessionDetail, setSessionDetail] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSession = async (id: number) => {
    if (expanded === id) {
      setExpanded(null);
      setSessionDetail(null);
      return;
    }
    setExpanded(id);
    try {
      const detail = await api.getSession(id);
      setSessionDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (format: string) => {
    window.open(api.getExportUrl(format), '_blank');
  };

  if (loading) return <div className="loading">Loading sessions...</div>;

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Session History</h2>
        <div className="export-buttons">
          <button className="btn btn-sm" onClick={() => handleExport('json')}>Export JSON</button>
          <button className="btn btn-sm" onClick={() => handleExport('csv')}>Export CSV</button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="empty-state">No sessions yet. Start a quiz to create one.</p>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-row" onClick={() => toggleSession(session.id)}>
                <span className="session-id">Session #{session.id}</span>
                <span className="session-provider">{session.provider || '—'}</span>
                <span className="session-time">{new Date(session.started_at).toLocaleString()}</span>
                <span className="expand-icon">{expanded === session.id ? '▼' : '▶'}</span>
              </div>
              {expanded === session.id && sessionDetail && (
                <div className="session-detail">
                  <LogViewer interactions={sessionDetail.interactions || []} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
