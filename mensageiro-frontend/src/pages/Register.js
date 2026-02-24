import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Senha deve ter ao menos 6 caracteres'); return; }
    const result = await register(name, email, password);
    if (result.success) {
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container} className="fade-in">
        <div style={styles.header}>
          <Link to="/login" style={styles.back}>← Voltar</Link>
          <div style={styles.brand}>
            <span style={styles.logo}>M</span>
            <span style={styles.logoText}>ensageiro</span>
          </div>
        </div>
        <h2 style={styles.title}>Criar conta</h2>
        <p style={styles.sub}>Preencha os dados para começar</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Nome completo</label>
            <input type="text" placeholder="João Silva" value={name}
              onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">E-mail</label>
            <input type="email" placeholder="voce@empresa.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Senha</label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: 8 }}>
            {loading ? <span className="spinner"/> : 'Criar conta'}
          </button>
        </form>
        <p style={styles.switchLink}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 },
  container: { width: '100%', maxWidth: 420 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  back: { color: 'var(--text-muted)', fontSize: 14 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: {
    width: 32, height: 32, borderRadius: 7, background: 'var(--accent)',
    color: '#0a0a0f', fontFamily: 'var(--font-head)', fontWeight: 800,
    fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18 },
  title: { fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 },
  sub: { color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 },
  switchLink: { textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 },
};