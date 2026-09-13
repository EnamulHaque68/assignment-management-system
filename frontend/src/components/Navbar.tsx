import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldAlert, GraduationCap, BookOpen, Layers } from './Icons';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="badge badge-admin">
            <ShieldAlert size={12} /> Admin
          </span>
        );
      case 'Teacher':
        return (
          <span className="badge badge-teacher">
            <BookOpen size={12} /> Teacher
          </span>
        );
      case 'Student':
        return (
          <span className="badge badge-student">
            <GraduationCap size={12} /> Student
          </span>
        );
      default:
        return <span className="badge">{role}</span>;
    }
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <Layers size={22} color="#040612" strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Aura<span className="gradient-text">Assignments</span>
          </h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            API Connected • 3D Core Active
          </div>
        </div>
      </div>

      <div className="nav-user">
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{user.fullName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{user.email}</span>
            {getRoleBadge(user.role)}
          </div>
        </div>

        <button
          id="logout-button"
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </nav>
  );
};
