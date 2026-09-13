import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight } from '../components/Icons';
import { Button } from '../components/ui/Button';

export const Unauthorized: React.FC = () => {
  const { user, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate(getRoleDashboardPath(user?.role));
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="glass-panel p-10 max-w-md w-full text-center border-rose-500/30">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-5">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">403 Forbidden</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          You do not have permission to perform this action or view this resource. Your role is{' '}
          <strong className="text-slate-200">{user?.role || 'Guest'}</strong>.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={handleReturn}
          rightIcon={<ArrowRight size={16} />}
          className="w-full"
        >
          Return to Your Dashboard
        </Button>
      </div>
    </div>
  );
};
