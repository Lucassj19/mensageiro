import React, { useEffect, useState } from 'react';
import { emailsApi } from '../services/api';
import Layout from '../components/Layout';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    emailsApi.history().then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="fade-in">
        <div style={styles.header}>
          <h1 style={styles.title}>Histórico de Envios</h1>
          <p style={styles.sub}>{history.length} e-mail(s) enviado(s)</p>
        </div>

        {loading ? (
          <div style={styles.center}><span className="spinner"/></div>
        ) : history.length === 0 ? (
          <div className="card" style={styles.empty}>
            <div style={styles.emptyIcon}>◷</div>
            <h3 style={{ marginBottom: 8 }}>Nenhum envio ainda</h3>
            <p style={{ color: 'var(--text-muted)' }}>Seus e-mails enviados aparecerão aqui.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {history.map(h => (
              <div key={h.id} className="card" style={styles.item}>
                <div style={styles.itemHeader} onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
                  <div style={styles.itemLeft}>
                    <span className={`badge ${h.status === 'SENT' ? 'badge-green' : 'badge-red'}`}>
                      {h.status === 'SENT' ? '✓ Enviado' : '✕ Falhou'}
                    </span>
                    <div style={styles.itemSubject}>{h.subject}</div>
                  </div>
                  <div style={styles.itemRight}>
                    {h.templateName && (
                      <span style={styles.templateTag}>{h.templateName}</span>
                    )}
                    <div style={styles.itemDate}>
                      {h.sentAt ? new Date(h.sentAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </div>
                    <span style={styles.chevron}>{expanded === h.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expanded === h.id && (
                  <div style={styles.itemDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Destinatários</span>
                      <div style={styles.recipients}>
                        {h.recipients?.map(r => <span key={r} style={styles.recipient}>{r}</span>)}
                      </div>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Corpo</span>
                      <pre style={styles.body}>{h.body}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  header: { marginBottom: 32 },
  title: { fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.3 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  item: { padding: 0, overflow: 'hidden' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', gap: 16 },
  itemLeft: { display: 'flex', alignItems: 'center', gap: 14, flex: 1, overflow: 'hidden' },
  itemSubject: { fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemRight: { display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 },
  templateTag: { fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 10px', borderRadius: 20, border: '1px solid var(--border)' },
  itemDate: { color: 'var(--text-muted)', fontSize: 13 },
  chevron: { color: 'var(--text-dim)', fontSize: 10 },
  itemDetails: { padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)' },
  detailRow: { marginBottom: 16 },
  detailLabel: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 },
  recipients: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  recipient: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 12px', fontSize: 13 },
  body: { whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.7, background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' },
};