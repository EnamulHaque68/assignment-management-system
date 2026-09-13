import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS, DemoAccount } from '../context/AuthContext';
import { Menu, LogOut, ChevronDown, User as UserIcon, ShieldCheck, Sparkles, Check } from '../components/Icons';
import { RoleBadge } from '../components/ui/Badge';
import { useToast } from '../components/Toast';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout, quickLoginAccount, getRoleDashboardPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSwitchAccounts, setShowSwitchAccounts] = useState(false);
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setShowSwitchAccounts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/users')) return 'User Directory';
    if (path.includes('/classes')) return 'Classrooms & Sections';
    if (path.includes('/subjects')) return 'Curriculum Subjects';
    if (path.includes('/teacher-assignments')) return 'Teacher Allocations';
    if (path.includes('/assignments/create')) return 'Create Assignment';
    if (path.includes('/assignments') && path.includes('/submissions')) return 'Assignment Submissions';
    if (path.includes('/assignments')) return 'Assignments Management';
    if (path.includes('/submissions')) return 'My Submissions';
    if (path.includes('/profile')) return 'User Profile';
    return 'Assignment Management System';
  };

  const handleSwitchAccount = async (account: DemoAccount) => {
    setSwitchingEmail(account.email);
    try {
      const res = await quickLoginAccount(account);
      toast.success(`Switched account to ${res.fullName}!`);
      setIsDropdownOpen(false);
      setShowSwitchAccounts(false);
      navigate(getRoleDashboardPath(res.role), { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch account.');
    } finally {
      setSwitchingEmail(null);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 pr-6 sm:pr-10 md:pr-16 lg:pr-24 flex items-center justify-between gap-4">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 md:hidden shrink-0"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight truncate">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Connected to MongoDB API</span>
          </div>
        </div>
      </div>

      {/* Right section: Profile Dropdown & Logout (Shifted left for optimal breathing room) */}
      {user && (
        <div className="flex items-center gap-2.5 shrink-0 mr-3 sm:mr-6 md:mr-10 lg:mr-16" ref={dropdownRef}>
          {/* User Account Capsule Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setShowSwitchAccounts(false);
              }}
              className={`flex items-center gap-2.5 py-1.5 px-3 rounded-2xl border transition-all cursor-pointer select-none shrink-0 ${
                isDropdownOpen
                  ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Avatar with Status Dot */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-sm shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>

              {/* Name & Role */}
              <div className="flex flex-col items-start text-left min-w-0 hidden sm:flex">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[130px] md:max-w-[170px]">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px] md:max-w-[170px]">
                  {user.email}
                </span>
              </div>

              <div className="shrink-0">
                <RoleBadge role={user.role} />
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Floating Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Identity Header */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-base text-white shrink-0 shadow-md">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-100 truncate">{user.fullName}</span>
                        <RoleBadge role={user.role} />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono truncate block mt-0.5">
                        {user.email}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Authenticated • JWT Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                  >
                    <UserIcon size={16} className="text-cyan-400" />
                    <span>View & Edit My Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowSwitchAccounts(!showSwitchAccounts)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-purple-300 hover:bg-purple-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-purple-400" />
                      <span>Switch Demo Account</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`transition-transform text-slate-500 ${showSwitchAccounts ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Switch Accounts List */}
                  {showSwitchAccounts && (
                    <div className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1 my-1 max-h-48 overflow-y-auto">
                      {DEMO_ACCOUNTS.map((acc) => {
                        const isCurrent = user.email.toLowerCase() === acc.email.toLowerCase();
                        const isSwitching = switchingEmail === acc.email;
                        return (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleSwitchAccount(acc)}
                            disabled={isCurrent || isSwitching}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-500/15 border border-cyan-500/30'
                                : 'hover:bg-white/5 text-slate-300'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                              <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-200 truncate">{acc.name}</span>
                                <RoleBadge role={acc.role} />
                              </div>
                              <span className="text-[10px] text-slate-500 truncate block">{acc.details}</span>
                            </div>
                            {isCurrent && <Check size={14} className="text-cyan-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="h-px bg-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Direct Logout Icon Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut size={15} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
