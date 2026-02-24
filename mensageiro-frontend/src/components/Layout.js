import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/templates', label: 'Templates', icon: '⊞' },
  { to: '/send', label: 'Enviar E-mail', icon: '⊹' },
  { to: '/history', label: 'Histórico', icon: '◷' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.shell}>
      <aside style={{ ...styles.sidebar, width: collapsed ? 64 : 220 }}>
        <div style={styles.sideTop}>
          <div style={styles.brand} onClick={() => setCollapsed(!collapsed)}>
            <span style={styles.logo}>M</span>
            {!collapsed && <span style={styles.logoText}>ensageiro</span>}
          </div>
          <nav style={styles.nav}>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}>
                <span style={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={styles.sideBottom}>
          {!collapsed && (
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userEmail}>{user?.email}</div>
              </div>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}
            style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', marginTop: 8 }}>
            <span>↪</span>
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 12px',
    position: 'sticky', top: 0, height: '100vh', transition: 'width 0.2s',
    overflow: 'hidden',
  },
  sideTop: { flex: 1 },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 32, cursor: 'pointer' },
  logo: {
    width: 32, height: 32, borderRadius: 8, background: 'var(--accent)',
    color: '#0a0a0f', fontFamily: 'var(--font-head)', fontWeight: 800,
    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 'var(--radius-sm)', transition: 'all 0.15s', fontSize: 14,
    fontWeight: 500, textDecoration: 'none',
  },
  navIcon: { fontSize: 16, flexShrink: 0 },
  navLabel: { whiteSpace: 'nowrap', fontFamily: 'var(--font-head)' },
  sideBottom: { borderTop: '1px solid var(--border)', paddingTop: 16 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 4 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)',
    color: 'var(--accent)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 },
  userEmail: { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 },
  main: { flex: 1, padding: '40px 48px', overflowY: 'auto' },
};