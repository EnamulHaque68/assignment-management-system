import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Users,
  School,
  BookOpen,
  LinkIcon,
  FileText,
  Plus,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from '../components/Icons';
import { RoleBadge } from '../components/ui/Badge';

export interface SidebarContentProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileClose?: () => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'Admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: <Layers size={18} /> },
          { to: '/admin/users', label: 'Users Directory', icon: <Users size={18} /> },
          { to: '/admin/classes', label: 'Classrooms', icon: <School size={18} /> },
          { to: '/admin/subjects', label: 'Subjects', icon: <BookOpen size={18} /> },
          { to: '/admin/teacher-assignments', label: 'Teacher Allocations', icon: <LinkIcon size={18} /> },
          { to: '/admin/assignments', label: 'Assignments Audit', icon: <FileText size={18} /> },
        ];
      case 'Teacher':
        return [
          { to: '/teacher/dashboard', label: 'Studio Dashboard', icon: <Layers size={18} /> },
          { to: '/teacher/assignments', label: 'My Coursework', icon: <FileText size={18} /> },
          { to: '/teacher/assignments/create', label: 'Create Assignment', icon: <Plus size={18} /> },
        ];
      case 'Student':
        return [
          { to: '/student/dashboard', label: 'Portal Dashboard', icon: <Layers size={18} /> },
          { to: '/student/assignments', label: 'Enrolled Tasks', icon: <FileText size={18} /> },
          { to: '/student/submissions', label: 'My Submissions', icon: <GraduationCap size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
            <Layers size={22} className="text-slate-950 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Aura<span className="text-cyan-400">Hub</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                Assignment Portal
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <div
          className={`px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${
            isCollapsed ? 'hidden' : 'block'
          }`}
        >
          Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <span className="shrink-0 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        <div
          className={`px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${
            isCollapsed ? 'hidden' : 'block'
          }`}
        >
          Account
        </div>

        <NavLink
          to="/profile"
          onClick={onMobileClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            } ${isCollapsed ? 'justify-center px-2' : ''}`
          }
          title={isCollapsed ? 'My Profile' : undefined}
        >
          <span className="shrink-0 group-hover:scale-110 transition-transform">
            <GraduationCap size={18} />
          </span>
          {!isCollapsed && <span>My Profile</span>}
        </NavLink>
      </div>

      {/* User Info Footer & Collapse Button */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName ? user.fullName[0].toUpperCase() : 'U'
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {user.fullName}
                </span>
                <div className="mt-0.5">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Desktop Collapse Trigger */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full mt-2 py-1.5 hidden lg:flex items-center justify-center text-slate-500 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarContentProps> = (props) => {
  return <SidebarContent {...props} />;
};
