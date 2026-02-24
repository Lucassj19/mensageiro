import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <span style={styles.logo}>M</span>
          <span style={styles.logoText}>ensageiro</span>
        </div>
        <div style={styles.tagline}>
          <h1 style={styles.headline}>Comunicação<br/>corporativa<br/><span style={styles.highlight}>sem atrito.</span></h1>
          <p style={styles.sub}>Templates inteligentes para cada situação do seu time.</p>
        </div>
        <div style={styles.features}>
          {['Templates por categoria', 'Variáveis dinâmicas', 'Histórico completo'].map(f => (
            <div key={f} style={styles.feat}>
              <span style={styles.dot}/>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.formCard} className="fade-in">
          <h2 style={styles.formTitle}>Entrar</h2>
          <p style={styles.formSub}>Acesse sua conta para continuar</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">E-mail</label>
              <input type="email" placeholder="voce@empresa.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Senha</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: 8 }}>
              {loading ? <span className="spinner"/> : 'Entrar'}
            </button>
          </form>
          <p style={styles.switchLink}>
            Não tem conta? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
    padding: '60px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: {
    width: 36, height: 36, borderRadius: 8, background: 'var(--accent)',
    color: '#0a0a0f', fontFamily: 'var(--font-head)', fontWeight: 800,
    fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20 },
  tagline: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, paddingTop: 80 },
  headline: { fontSize: 52, lineHeight: 1.1, letterSpacing: '-0.03em' },
  highlight: { color: 'var(--accent)' },
  sub: { color: 'var(--text-muted)', fontSize: 17, maxWidth: 340, lineHeight: 1.5 },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  feat: { display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 14 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  right: {
    width: 480, background: 'var(--bg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  formCard: { width: '100%', maxWidth: 380 },
  formTitle: { fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 },
  formSub: { color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 },
  switchLink: { textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 },
};