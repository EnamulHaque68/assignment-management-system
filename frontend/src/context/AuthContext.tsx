import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginRequest, LoginResponse, Role } from '../types';
import { authApi } from '../api';

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: Role;
  label: string;
  avatarUrl: string;
  details: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'System Administrator',
    email: 'admin@assignment.local',
    password: 'Admin@123',
    role: 'Admin',
    label: 'Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    details: 'Full system management & role control',
  },
  {
    name: 'Prof. Robert Davis',
    email: 'teacher@assignment.local',
    password: 'Teacher@123',
    role: 'Teacher',
    label: 'Teacher #1 (Web Eng)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    details: 'Web Engineering coursework instructor',
  },
  {
    name: 'Dr. Elena Rostova',
    email: 'teacher2@assignment.local',
    password: 'Teacher@123',
    role: 'Teacher',
    label: 'Teacher #2 (Databases)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    details: 'Database Systems coursework instructor',
  },
  {
    name: 'Alex Morgan',
    email: 'student@assignment.local',
    password: 'Student@123',
    role: 'Student',
    label: 'Student #1 (CSE-6)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    details: 'Enrolled in Class CSE-6',
  },
  {
    name: 'Sarah Connor',
    email: 'student2@assignment.local',
    password: 'Student@123',
    role: 'Student',
    label: 'Student #2 (CSE-6)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    details: 'Enrolled in Class CSE-6',
  },
  {
    name: 'David Chen',
    email: 'student3@assignment.local',
    password: 'Student@123',
    role: 'Student',
    label: 'Student #3 (CSE-6)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    details: 'Enrolled in Class CSE-6',
  },
];

interface AuthContextType {
  user: LoginResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  quickLogin: (role: Role) => Promise<LoginResponse>;
  quickLoginAccount: (account: DemoAccount) => Promise<LoginResponse>;
  logout: () => void;
  updateUserProfile: (data: Partial<LoginResponse>) => void;
  getRoleDashboardPath: (role?: Role) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<Role, LoginRequest> = {
  Admin: { email: 'admin@assignment.local', password: 'Admin@123' },
  Teacher: { email: 'teacher@assignment.local', password: 'Teacher@123' },
  Student: { email: 'student@assignment.local', password: 'Student@123' },
};

export const getRoleDashboardPath = (role?: Role): string => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Teacher':
      return '/teacher/dashboard';
    case 'Student':
      return '/student/dashboard';
    default:
      return '/login';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(() => {
    try {
      const savedUser = localStorage.getItem('assignment_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('assignment_token');
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleUnauthorized = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setUser(null);
      setToken(null);
      localStorage.removeItem('assignment_token');
      localStorage.removeItem('assignment_user');
      console.warn(customEvent.detail?.message || 'Unauthorized session');
    };

    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('assignment_token', response.token);
      localStorage.setItem('assignment_user', JSON.stringify(response));
      setToken(response.token);
      setUser(response);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: Role): Promise<LoginResponse> => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) throw new Error(`Unknown role: ${role}`);
    return await login(creds);
  };

  const quickLoginAccount = async (account: DemoAccount): Promise<LoginResponse> => {
    return await login({ email: account.email, password: account.password });
  };

  const logout = () => {
    localStorage.removeItem('assignment_token');
    localStorage.removeItem('assignment_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (data: Partial<LoginResponse>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('assignment_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        quickLogin,
        quickLoginAccount,
        logout,
        updateUserProfile,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
