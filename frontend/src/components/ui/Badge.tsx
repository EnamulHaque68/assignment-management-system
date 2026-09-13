import React, { ReactNode } from 'react';
import { ShieldAlert, BookOpen, GraduationCap, Clock, CheckCircle2, AlertCircle } from '../Icons';

export interface BadgeProps {
  variant?: 'admin' | 'teacher' | 'student' | 'published' | 'draft' | 'reviewed' | 'submitted' | 'rejected' | 'late' | 'outline' | 'default';
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, icon, className = '' }) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'admin':
        return 'badge-admin';
      case 'teacher':
        return 'badge-teacher';
      case 'student':
        return 'badge-student';
      case 'published':
      case 'reviewed':
        return 'badge-published';
      case 'draft':
      case 'submitted':
        return 'badge-draft';
      case 'rejected':
      case 'late':
        return 'badge-rejected';
      case 'outline':
        return 'border border-slate-700 text-slate-300 bg-transparent';
      default:
        return 'bg-white/10 text-slate-200 border border-white/10';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: string; className?: string }> = ({ role, className = '' }) => {
  switch (role) {
    case 'Admin':
      return (
        <Badge variant="admin" icon={<ShieldAlert size={12} />} className={className}>
          Admin
        </Badge>
      );
    case 'Teacher':
      return (
        <Badge variant="teacher" icon={<BookOpen size={12} />} className={className}>
          Teacher
        </Badge>
      );
    case 'Student':
      return (
        <Badge variant="student" icon={<GraduationCap size={12} />} className={className}>
          Student
        </Badge>
      );
    default:
      return <Badge variant="default" className={className}>{role}</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const s = status.toLowerCase();
  if (s === 'published') {
    return <Badge variant="published" icon={<CheckCircle2 size={12} />} className={className}>Published</Badge>;
  }
  if (s === 'draft') {
    return <Badge variant="draft" className={className}>Draft</Badge>;
  }
  if (s === 'reviewed') {
    return <Badge variant="reviewed" icon={<CheckCircle2 size={12} />} className={className}>Reviewed</Badge>;
  }
  if (s === 'rejected') {
    return <Badge variant="rejected" icon={<AlertCircle size={12} />} className={className}>Rejected</Badge>;
  }
  if (s === 'late') {
    return <Badge variant="late" icon={<Clock size={12} />} className={className}>Late</Badge>;
  }
  return <Badge variant="submitted" className={className}>{status}</Badge>;
};
