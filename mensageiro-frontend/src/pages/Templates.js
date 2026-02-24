import React, { useEffect, useState } from 'react';
import { templatesApi } from '../services/api';
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

const CATEGORY_BADGE = {
  AVISO_INCIDENTE: 'badge-red',
  CONFIRMACAO_EQUIPAMENTO: 'badge-green',
  AVISO_MANUTENCAO: 'badge-blue',
  COMUNICADO_EVENTO: 'badge-yellow',
  CONVITE_REUNIAO: 'badge-blue',
  OUTROS: 'badge-yellow',
};

const EMPTY_FORM = { name: '', category: 'AVISO_INCIDENTE', subject: '', body: '' };

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    templatesApi.listMine().then(r => setTemplates(r.data)).finally(() => setLoading(false));
  };

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (t) => { setEditId(t.id); setForm({ name: t.name, category: t.category, subject: t.subject, body: t.body }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await templatesApi.update(editId, form); toast.success('Template atualizado!'); }
      else { await templatesApi.create(form); toast.success('Template criado!'); }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deletar este template?')) return;
    try { await templatesApi.delete(id); toast.success('Template removido'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erro ao deletar'); }
  };

  return (
    <Layout>
      <div className="fade-in">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Templates</h1>
            <p style={styles.sub}>Gerencie seus modelos de e-mail</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Novo Template</button>
        </div>

        {showForm && (
          <div style={styles.overlay}>
            <div style={styles.panel} className="fade-in">
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>{editId ? 'Editar Template' : 'Novo Template'}</h2>
                <button onClick={() => setShowForm(false)} style={styles.closeBtn}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="label">Nome do template</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Ex: Aviso de VPN indisponível" required />
                </div>
                <div className="form-group">
                  <label className="label">Categoria</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Assunto</label>
                  <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                    placeholder="Use {{variavel}} para valores dinâmicos" required />
                </div>
                <div className="form-group">
                  <label className="label">Corpo do e-mail</label>
                  <textarea rows={8} value={form.body} onChange={e => setForm({...form, body: e.target.value})}
                    placeholder={"Olá {{nome}},\n\nInformamos que {{assunto}}.\n\nAtenciosamente,\n{{remetente}}"} required />
                  <p style={styles.hint}>💡 Use <code style={styles.code}>{'{{variavel}}'}</code> para campos dinâmicos</p>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner"/> : (editId ? 'Salvar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {preview && (
          <div style={styles.overlay} onClick={() => setPreview(null)}>
            <div style={styles.panel} className="fade-in" onClick={e => e.stopPropagation()}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>Preview: {preview.name}</h2>
                <button onClick={() => setPreview(null)} style={styles.closeBtn}>✕</button>
              </div>
              <div style={styles.previewBox}>
                <div style={styles.previewLabel}>ASSUNTO</div>
                <div style={styles.previewSubject}>{preview.subject}</div>
                <div style={styles.previewLabel}>CORPO</div>
                <pre style={styles.previewBody}>{preview.body}</pre>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={styles.center}><span className="spinner"/></div>
        ) : templates.length === 0 ? (
          <div className="card" style={styles.empty}>
            <div style={styles.emptyIcon}>⊞</div>
            <h3 style={{ marginBottom: 8 }}>Nenhum template ainda</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Crie seu primeiro template para começar.</p>
            <button className="btn btn-primary" onClick={openCreate}>Criar template</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {templates.map(t => (
              <div key={t.id} className="card" style={styles.card}>
                <div style={{ marginBottom: 8 }}>
                  <span className={`badge ${CATEGORY_BADGE[t.category]}`}>
                    {CATEGORIES.find(c => c.value === t.category)?.label}
                  </span>
                </div>
                <h3 style={styles.cardName}>{t.name}</h3>
                <p style={styles.cardSubject}>{t.subject}</p>
                <p style={styles.cardBody}>{t.body}</p>
                <div style={styles.cardFooter}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPreview(t)}>Preview</button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Deletar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 },
  title: { fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: { display: 'flex', flexDirection: 'column', gap: 8 },
  cardName: { fontSize: 16, letterSpacing: '-0.01em' },
  cardSubject: { fontSize: 13, color: 'var(--text-muted)' },
  cardBody: { fontSize: 13, color: 'var(--text-dim)', overflow: 'hidden', maxHeight: 60, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.3 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  panelTitle: { fontSize: 20, letterSpacing: '-0.02em' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' },
  hint: { fontSize: 12, color: 'var(--text-muted)', marginTop: 6 },
  code: { background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' },
  previewBox: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 },
  previewLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6, marginTop: 14 },
  previewSubject: { fontWeight: 600, fontSize: 15, marginBottom: 16 },
  previewBody: { whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.7 },
};