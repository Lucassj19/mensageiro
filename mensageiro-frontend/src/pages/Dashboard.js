import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { templatesApi, emailsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const CATEGORY_LABELS = {
  AVISO_INCIDENTE: 'Aviso de Incidente',
  CONFIRMACAO_EQUIPAMENTO: 'Confirmação Equipamento',
  AVISO_MANUTENCAO: 'Aviso de Manutenção',
  COMUNICADO_EVENTO: 'Comunicado de Evento',
  CONVITE_REUNIAO: 'Convite para Reunião',
  OUTROS: 'Outros',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([templatesApi.listMine(), emailsApi.history()])
      .then(([t, h]) => { setTemplates(t.data); setHistory(h.data); })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Meus Templates', value: templates.length },
    { label: 'E-mails Enviados', value: history.length },
    { label: 'Taxa de Sucesso', value: history.length ? `${Math.round(history.filter(h => h.status === 'SENT').length / history.length * 100)}%` : '—', accent: true },
  ];

  return (
    <Layout>
      <div className="fade-in">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Olá, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={styles.sub}>Aqui está um resumo das suas atividades</p>
          </div>
          <Link to="/send" className="btn btn-primary">
            <span>⊹</span> Novo E-mail
          </Link>
        </div>

        <div style={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ ...styles.statCard, ...(s.accent ? styles.statAccent : {}) }}>
              <div style={styles.statValue}>{loading ? '—' : s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.grid}>
          <div>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Templates Recentes</h3>
              <Link to="/templates" style={styles.seeAll}>Ver todos →</Link>
            </div>
            {loading ? <div style={styles.center}><span className="spinner"/></div> :
              templates.length === 0 ? (
                <div className="card" style={styles.empty}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Nenhum template criado ainda.</p>
                  <Link to="/templates" className="btn btn-ghost btn-sm">Criar template</Link>
                </div>
              ) : templates.slice(0, 4).map(t => (
                <div key={t.id} className="card" style={styles.templateItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={styles.templateName}>{t.name}</div>
                      <div style={styles.templateSubject}>{t.subject}</div>
                    </div>
                    <span className="badge badge-yellow">{CATEGORY_LABELS[t.category]}</span>
                  </div>
                </div>
              ))
            }
          </div>

          <div>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Últimos Envios</h3>
              <Link to="/history" style={styles.seeAll}>Ver histórico →</Link>
            </div>
            {loading ? <div style={styles.center}><span className="spinner"/></div> :
              history.length === 0 ? (
                <div className="card" style={styles.empty}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Nenhum envio registrado.</p>
                  <Link to="/send" className="btn btn-ghost btn-sm">Enviar e-mail</Link>
                </div>
              ) : history.slice(0, 4).map(h => (
                <div key={h.id} className="card" style={styles.histItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={styles.histSubject}>{h.subject}</div>
                    <span className={`badge ${h.status === 'SENT' ? 'badge-green' : 'badge-red'}`}>
                      {h.status === 'SENT' ? 'Enviado' : 'Falhou'}
                    </span>
                  </div>
                  <div style={styles.histMeta}>
                    Para: {h.recipients?.join(', ')} · {h.sentAt ? new Date(h.sentAt).toLocaleDateString('pt-BR') : ''}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 },
  title: { fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 },
  statCard: { textAlign: 'center', padding: '24px' },
  statAccent: { borderColor: 'var(--accent)', background: 'var(--accent-dim)' },
  statValue: { fontSize: 36, fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 },
  statLabel: { color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, letterSpacing: '-0.01em' },
  seeAll: { fontSize: 13, color: 'var(--accent)', fontWeight: 600 },
  center: { display: 'flex', justifyContent: 'center', padding: 40 },
  empty: { textAlign: 'center', padding: 32 },
  templateItem: { marginBottom: 10, padding: '16px 20px' },
  templateName: { fontWeight: 600, fontSize: 14, marginBottom: 2 },
  templateSubject: { color: 'var(--text-muted)', fontSize: 13 },
  histItem: { marginBottom: 10, padding: '14px 20px' },
  histSubject: { fontWeight: 600, fontSize: 14, flex: 1, marginRight: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  histMeta: { color: 'var(--text-muted)', fontSize: 12, marginTop: 4 },
};