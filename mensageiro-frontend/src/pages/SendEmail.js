import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesApi, usersApi, emailsApi } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'AVISO_INCIDENTE', label: 'Aviso de Incidente' },
  { value: 'CONFIRMACAO_EQUIPAMENTO', label: 'Confirmação de Equipamento' },
  { value: 'AVISO_MANUTENCAO', label: 'Aviso de Manutenção' },
  { value: 'COMUNICADO_EVENTO', label: 'Comunicado de Evento' },
  { value: 'CONVITE_REUNIAO', label: 'Convite para Reunião' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function SendEmail() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [variables, setVariables] = useState({});
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    Promise.all([templatesApi.listAll(), usersApi.list()])
      .then(([t, u]) => { setTemplates(t.data); setUsers(u.data); });
  }, []);

  const resolveVars = (text) => {
    let result = text;
    Object.entries(variables).forEach(([k, v]) => {
      result = result.replace(new RegExp(`{{${k}}}`, 'g'), v || `{{${k}}}`);
    });
    return result;
  };

  const extractVars = (text) => {
    const matches = text.match(/{{(\w+)}}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  const handleTemplateSelect = (t) => {
    setSelectedTemplate(t);
    const allVars = extractVars(t.subject + ' ' + t.body);
    const initVars = {};
    allVars.forEach(v => { initVars[v] = ''; });
    setVariables(initVars);
    setStep(2);
  };

  const toggleRecipient = (email) => {
    setSelectedRecipients(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSend = async () => {
    if (!selectedTemplate) return toast.error('Selecione um template');
    if (selectedRecipients.length === 0) return toast.error('Selecione ao menos um destinatário');
    setSending(true);
    try {
      await emailsApi.send({
        templateId: selectedTemplate.id,
        recipientEmails: selectedRecipients,
        variables,
      });
      toast.success('E-mail enviado com sucesso!');
      navigate('/history');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao enviar e-mail');
    } finally { setSending(false); }
  };

  const varKeys = selectedTemplate ? extractVars(selectedTemplate.subject + ' ' + selectedTemplate.body) : [];

  return (
    <Layout>
      <div className="fade-in">
        <div style={styles.header}>
          <h1 style={styles.title}>Enviar E-mail</h1>
          <p style={styles.sub}>Selecione um template, preencha as variáveis e dispare</p>
        </div>

        <div style={styles.steps}>
          {[{n:1,label:'Template'},{n:2,label:'Variáveis'},{n:3,label:'Destinatários'},{n:4,label:'Revisar'}].map(s => (
            <div key={s.n} style={styles.step} onClick={() => selectedTemplate && setStep(s.n)}>
              <div style={{ ...styles.stepNum, ...(step === s.n ? styles.stepActive : step > s.n ? styles.stepDone : {}) }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ ...styles.stepLabel, color: step >= s.n ? 'var(--text)' : 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={styles.content}>
          {step === 1 && (
            <div>
              <h3 style={styles.stepTitle}>Escolha o template</h3>
              {templates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Nenhum template disponível.</p>
              ) : (
                <div style={styles.templateGrid}>
                  {templates.map(t => (
                    <div key={t.id} className="card"
                      style={{ ...styles.templateOption, ...(selectedTemplate?.id === t.id ? styles.templateSelected : {}) }}
                      onClick={() => handleTemplateSelect(t)}>
                      <div style={styles.tName}>{t.name}</div>
                      <div style={styles.tOwner}>por {t.ownerName}</div>
                      <div style={styles.tCategory}>
                        {CATEGORIES.find(c => c.value === t.category)?.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedTemplate && (
            <div>
              <h3 style={styles.stepTitle}>Preencha as variáveis</h3>
              {varKeys.length === 0 ? (
                <div className="card" style={{ marginBottom: 20, padding: 24 }}>
                  <p style={{ color: 'var(--text-muted)' }}>Este template não possui variáveis.</p>
                </div>
              ) : (
                <div style={styles.varGrid}>
                  {varKeys.map(v => (
                    <div key={v} className="form-group">
                      <label className="label">{v}</label>
                      <input value={variables[v] || ''} onChange={e => setVariables({...variables, [v]: e.target.value})}
                        placeholder={`Valor para {{${v}}}`} />
                    </div>
                  ))}
                </div>
              )}
              <div style={styles.navBtns}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Voltar</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Próximo →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={styles.stepTitle}>Selecione os destinatários</h3>
              <p style={styles.stepSub}>Apenas usuários cadastrados no sistema</p>
              <div style={styles.userList}>
                {users.map(u => (
                  <div key={u.email} className="card" style={styles.userItem}
                    onClick={() => toggleRecipient(u.email)}>
                    <div style={styles.userCheck}>
                      {selectedRecipients.includes(u.email)
                        ? <div style={styles.checked}>✓</div>
                        : <div style={styles.unchecked}/>}
                    </div>
                    <div style={styles.userAvatar}>{u.name[0].toUpperCase()}</div>
                    <div>
                      <div style={styles.userName}>{u.name}</div>
                      <div style={styles.userEmail}>{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedRecipients.length > 0 && (
                <p style={styles.selectedCount}>{selectedRecipients.length} destinatário(s) selecionado(s)</p>
              )}
              <div style={styles.navBtns}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Voltar</button>
                <button className="btn btn-primary" onClick={() => setStep(4)} disabled={selectedRecipients.length === 0}>Revisar →</button>
              </div>
            </div>
          )}

          {step === 4 && selectedTemplate && (
            <div>
              <h3 style={styles.stepTitle}>Revisão final</h3>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={styles.reviewRow}>
                  <span style={styles.reviewLabel}>Template</span>
                  <span>{selectedTemplate.name}</span>
                </div>
                <div style={styles.reviewRow}>
                  <span style={styles.reviewLabel}>Destinatários</span>
                  <span>{selectedRecipients.join(', ')}</span>
                </div>
                <div style={styles.reviewRow}>
                  <span style={styles.reviewLabel}>Assunto</span>
                  <span style={{ fontWeight: 600 }}>{resolveVars(selectedTemplate.subject)}</span>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--bg)' }}>
                <div style={styles.reviewLabel}>CORPO DO E-MAIL</div>
                <pre style={styles.previewBody}>{resolveVars(selectedTemplate.body)}</pre>
              </div>
              <div style={styles.navBtns}>
                <button className="btn btn-ghost" onClick={() => setStep(3)}>← Voltar</button>
                <button className="btn btn-primary" onClick={handleSend} disabled={sending} style={{ minWidth: 160 }}>
                  {sending ? <><span className="spinner"/> Enviando...</> : '⊹ Disparar e-mail'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  header: { marginBottom: 32 },
  title: { fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14 },
  steps: { display: 'flex', gap: 32, marginBottom: 40, alignItems: 'center' },
  step: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  stepNum: { width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' },
  stepActive: { background: 'var(--accent)', color: '#0a0a0f', border: '1px solid var(--accent)' },
  stepDone: { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid #4ade80' },
  stepLabel: { fontSize: 14, fontWeight: 600 },
  content: { maxWidth: 700 },
  stepTitle: { fontSize: 18, letterSpacing: '-0.01em', marginBottom: 6 },
  stepSub: { color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 },
  templateGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  templateOption: { cursor: 'pointer', transition: 'border-color 0.15s' },
  templateSelected: { borderColor: 'var(--accent)', background: 'var(--accent-dim)' },
  tName: { fontWeight: 700, fontSize: 14, marginBottom: 2 },
  tOwner: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 },
  tCategory: { fontSize: 12, color: 'var(--accent)' },
  varGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 },
  navBtns: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  userList: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  userItem: { display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 20px' },
  userCheck: { width: 20, flexShrink: 0 },
  checked: { width: 20, height: 20, borderRadius: 5, background: 'var(--accent)', color: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 },
  unchecked: { width: 20, height: 20, borderRadius: 5, border: '1px solid var(--border)' },
  userAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  userName: { fontWeight: 600, fontSize: 14 },
  userEmail: { fontSize: 12, color: 'var(--text-muted)' },
  selectedCount: { color: 'var(--accent)', fontSize: 13, fontWeight: 600, marginBottom: 8 },
  reviewRow: { display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 },
  reviewLabel: { minWidth: 120, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 },
  previewBody: { whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.7 },
};