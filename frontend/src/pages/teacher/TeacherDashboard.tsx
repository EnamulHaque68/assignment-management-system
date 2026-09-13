import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api';
import { Assignment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  FileText,
  Plus,
  School,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Award,
  Sparkles,
  AlertCircle,
} from '../../components/Icons';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch teacher's own assignments
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teacher', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  // Mutations for quick toggle
  const publishMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.publish(id),
    onSuccess: (updated) => {
      toast.success(`"${updated.title}" is now published.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to publish assignment.');
    },
  });

  const draftMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.draft(id),
    onSuccess: (updated) => {
      toast.info(`"${updated.title}" reverted to draft.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to set to draft.');
    },
  });

  // Metrics
  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter((a) => a.status === 'Published').length;
  const draftAssignments = assignments.filter((a) => a.status === 'Draft').length;
  const overdueAssignments = assignments.filter(
    (a) => a.status === 'Published' && new Date(a.deadline) < new Date()
  ).length;

  if (error) {
    return (
      <ErrorState
        title="Failed to load teacher workspace"
        message="Could not load your coursework assignments from the server."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Faculty Coursework Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="gradient-text">{user?.fullName || 'Teacher'}</span>!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Create curriculum coursework tasks, monitor student submission activity, and evaluate academic hand-ins.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/teacher/assignments/create">
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                className="font-semibold shadow-lg shadow-cyan-500/20"
              >
                Create Assignment
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coursework */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Total
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalAssignments}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">My Authored Tasks</div>
          </div>
        </div>

        {/* Published & Active */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Live
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{publishedAssignments}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Published to Students</div>
          </div>
        </div>

        {/* Drafts in Progress */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Drafts
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{draftAssignments}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Drafts in Progress</div>
          </div>
        </div>

        {/* Past Deadline */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Calendar size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Closed
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{overdueAssignments}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Past Deadline (Closed)</div>
          </div>
        </div>
      </div>

      {/* Recent Coursework Table Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Recent Coursework Registry</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and grade submissions for your published assignments.
            </p>
          </div>
          <Link to="/teacher/assignments">
            <Button variant="ghost" size="sm">
              View All ({totalAssignments})
            </Button>
          </Link>
        </div>

        <DataTable
          data={assignments.slice(0, 5)}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyTitle="No assignments created yet"
          emptyDescription="You haven't posted any assignments yet. Click below to create your first coursework."
          emptyActionLabel="Create Assignment"
          onEmptyAction={() => navigate('/teacher/assignments/create')}
          columns={[
            {
              header: 'Coursework Title',
              cell: (item) => (
                <div className="max-w-xs sm:max-w-sm">
                  <div className="font-semibold text-slate-100 line-clamp-1">{item.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </div>
              ),
            },
            {
              header: 'Classroom & Subject',
              cell: (item) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <School size={13} className="text-cyan-400" />
                    <span>{item.className}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <BookOpen size={13} className="text-purple-400" />
                    <span>{item.subjectName}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Deadline',
              cell: (item) => {
                const deadlineDate = new Date(item.deadline);
                const isPast = deadlineDate < new Date();
                return (
                  <div>
                    <div
                      className={`text-xs font-medium ${
                        isPast && item.status === 'Published' ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {deadlineDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Max Marks',
              cell: (item) => (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                  <Award size={12} />
                  {item.maximumMarks} pts
                </span>
              ),
            },
            {
              header: 'Status',
              cell: (item) => <StatusBadge status={item.status} />,
            },
            {
              header: 'Actions',
              align: 'right',
              cell: (item) => (
                <div className="flex items-center justify-end gap-2">
                  <Link to={`/teacher/assignments/${item.id}/submissions`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Eye size={14} />}
                      className="text-xs"
                      title="Review student submissions"
                    >
                      Submissions
                    </Button>
                  </Link>

                  {item.status === 'Draft' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => publishMutation.mutate(item.id)}
                      isLoading={publishMutation.isPending}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      title="Publish to students"
                    >
                      Publish
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => draftMutation.mutate(item.id)}
                      isLoading={draftMutation.isPending}
                      className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                      title="Revert to draft"
                    >
                      Draft
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
export default TeacherDashboard;
