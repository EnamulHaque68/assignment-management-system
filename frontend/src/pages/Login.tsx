import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Role } from '../types';
import { loginSchema, LoginFormData } from '../schemas/authSchema';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  Server,
} from '../components/Icons';

export const Login: React.FC = () => {
  const { login, quickLogin, loading, getRoleDashboardPath } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeQuickRole, setActiveQuickRole] = useState<Role | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);
      toast.success(`Welcome back, ${response.fullName}!`);
      const from = (location.state as any)?.from?.pathname;
      navigate(from || getRoleDashboardPath(response.role), { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setActiveQuickRole(role);
    try {
      const response = await quickLogin(role);
      toast.success(`Logged in as ${role}!`);
      const from = (location.state as any)?.from?.pathname;
      navigate(from || getRoleDashboardPath(response.role), { replace: true });
    } catch (err: any) {
      toast.error(err.message || `Failed to sign in as ${role}`);
    } finally {
      setActiveQuickRole(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-start lg:pl-16 xl:pl-28 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 relative z-10">
      <div className="glass-panel glass-panel-glow w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-950/85 backdrop-blur-2xl border-slate-800/90 shadow-2xl relative overflow-hidden">
        {/* Subtle Top Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles size={14} />
            <span>Role-Based Authentication</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 mb-2">
            Aura<span className="text-cyan-400">Hub</span>
          </h1>
          <p className="text-sm text-slate-400">
            Assignment & Submission Management Portal
          </p>
        </div>

        {/* Instant 1-Click Demo Logins */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left mb-3">
            Instant 1-Click Demo Login
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              id="quick-login-admin"
              type="button"
              onClick={() => handleQuickLogin('Admin')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 transition-all text-center group cursor-pointer disabled:opacity-50 active:translate-y-0.5 active:scale-95 shadow-sm hover:shadow-rose-500/20 hover:-translate-y-0.5"
            >
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 group-hover:scale-110 transition-transform mb-1 shadow-inner">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-bold text-slate-200">Admin</span>
              <span className="text-[10px] text-slate-400">System</span>
            </button>

            <button
              id="quick-login-teacher"
              type="button"
              onClick={() => handleQuickLogin('Teacher')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/60 transition-all text-center group cursor-pointer disabled:opacity-50 active:translate-y-0.5 active:scale-95 shadow-sm hover:shadow-purple-500/20 hover:-translate-y-0.5"
            >
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform mb-1 shadow-inner">
                <BookOpen size={18} />
              </div>
              <span className="text-xs font-bold text-slate-200">Teacher</span>
              <span className="text-[10px] text-slate-400">Instructor</span>
            </button>

            <button
              id="quick-login-student"
              type="button"
              onClick={() => handleQuickLogin('Student')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/60 transition-all text-center group cursor-pointer disabled:opacity-50 active:translate-y-0.5 active:scale-95 shadow-sm hover:shadow-cyan-500/20 hover:-translate-y-0.5"
            >
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 group-hover:scale-110 transition-transform mb-1 shadow-inner">
                <GraduationCap size={18} />
              </div>
              <span className="text-xs font-bold text-slate-200">Student</span>
              <span className="text-[10px] text-slate-400">Learner</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            or enter credentials
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Custom Credential Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="admin@assignment.local"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            required
            {...register('password')}
          />

          {/* Left-Shifted Responsive Login Submit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 pt-2">
            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading && !activeQuickRole}
              rightIcon={<ArrowRight size={16} />}
              className="w-full sm:w-auto sm:min-w-[210px] justify-between shadow-lg"
            >
              Sign In to Portal
            </Button>
          </div>
        </form>

        {/* Backend Info Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <Server size={14} className="text-emerald-400" />
          <span>Real API: ASP.NET Core 8 Web API + MongoDB</span>
        </div>
      </div>
    </div>
  );
};
