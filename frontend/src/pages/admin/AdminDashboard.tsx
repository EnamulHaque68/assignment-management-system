import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersApi, classesApi, subjectsApi, assignmentsApi } from '../../api';
import {
  Users,
  School,
  BookOpen,
  FileText,
  Plus,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Sparkles,
  LinkIcon,
} from '../../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';

export const AdminDashboard: React.FC = () => {
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersApi.getAll(),
  });

  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  const {
    data: assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ['admin', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  const isLoading = usersLoading || classesLoading || subjectsLoading || assignmentsLoading;
  const hasError = usersError || classesError || subjectsError || assignmentsError;

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        message="Could not retrieve administrative data from the API."
        onRetry={() => {
          refetchUsers();
          refetchClasses();
          refetchSubjects();
          refetchAssignments();
        }}
      />
    );
  }

  // Aggregate statistics
  const totalUsers = users?.length ?? 0;
  const activeUsers = users?.filter((u) => u.isActive).length ?? 0;
  const teacherCount = users?.filter((u) => u.role === 'Teacher').length ?? 0;
  const studentCount = users?.filter((u) => u.role === 'Student').length ?? 0;
  const totalClasses = classes?.length ?? 0;
  const totalSubjects = subjects?.length ?? 0;
  const totalAssignments = assignments?.length ?? 0;

  const recentUsers = users?.slice(0, 6) ?? [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Master Administration Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Command <span className="gradient-text">Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time infrastructure overview of academic users, classrooms, subjects, and curriculum allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/users">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Create New User
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Users size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {activeUsers} Active
            </span>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-extrabold text-white tracking-tight">{totalUsers}</div>
            )}
            <div className="text-xs font-medium text-slate-400 mt-1">Total System Users</div>
          </div>
        </div>

        {/* Faculty Instructors */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Faculty
            </span>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-extrabold text-white tracking-tight">{teacherCount}</div>
            )}
            <div className="text-xs font-medium text-slate-400 mt-1">Coursework Instructors</div>
          </div>
        </div>

        {/* Student Scholars */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GraduationCap size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Scholars
            </span>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-extrabold text-white tracking-tight">{studentCount}</div>
            )}
            <div className="text-xs font-medium text-slate-400 mt-1">Enrolled Students</div>
          </div>
        </div>

        {/* Assignments & Curriculum */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Curriculum
            </span>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-extrabold text-white tracking-tight">{totalAssignments}</div>
            )}
            <div className="text-xs font-medium text-slate-400 mt-1">
              Coursework ({totalClasses} classes, {totalSubjects} subs)
            </div>
          </div>
        </div>
      </div>

      {/* Quick Operations Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">System Modules</h2>
          <span className="text-xs text-slate-400">Administrative Operations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* User Management */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-rose-500/40 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-100 text-base">User Directory & Roles</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Manage accounts, grant instructor and student privileges, toggle login access, and reset passwords.
              </p>
            </div>
            <div className="pt-5 mt-3 border-t border-slate-800/80">
              <Link to="/admin/users">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />} className="w-full">
                  Manage Users ({totalUsers})
                </Button>
              </Link>
            </div>
          </div>

          {/* Classes & Curriculum */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <School size={20} />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Classrooms & Subjects</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Structure academic cohorts, configure syllabus codes, and create modular courses for educators.
              </p>
            </div>
            <div className="pt-5 mt-3 border-t border-slate-800/80 flex gap-2">
              <Link to="/admin/classes" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Classes ({totalClasses})
                </Button>
              </Link>
              <Link to="/admin/subjects" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Subjects ({totalSubjects})
                </Button>
              </Link>
            </div>
          </div>

          {/* Teacher Allocations */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <LinkIcon size={20} />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Teacher Allocations</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Authorize faculty members to post assignments and evaluate submissions for specific classes and subjects.
              </p>
            </div>
            <div className="pt-5 mt-3 border-t border-slate-800/80">
              <Link to="/admin/teacher-assignments">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />} className="w-full">
                  Configure Allocations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Accounts Table */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="font-bold text-base text-slate-100">Recently Registered Accounts</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most recent user entries recorded in the MongoDB database.</p>
          </div>
          <Link to="/admin/users">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              View All
            </Button>
          </Link>
        </div>

        <div className="mt-2">
          {isLoading ? (
            <div className="space-y-3 pt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">No users found.</div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-200">
                      {u.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{u.fullName}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={u.role} />
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        u.isActive
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
