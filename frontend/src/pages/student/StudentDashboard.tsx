import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assignmentsApi, submissionsApi } from '../../api';
import { Assignment, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import {
  BookOpen,
  FileText,
  Clock,
  Award,
  CheckCircle,
  Send,
  Eye,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from '../../components/Icons';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Submission Modal State
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<{
    assignment: Assignment;
    submission: Submission;
  } | null>(null);

  // Queries
  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  const {
    data: submissions = [],
    isLoading: isSubmissionsLoading,
    error: submissionsError,
  } = useQuery({
    queryKey: ['student', 'submissions'],
    queryFn: () => submissionsApi.getMy(),
  });

  // Map submissions by assignmentId
  const submissionMap = new Map<string, Submission>(
    submissions.map((s) => [s.assignmentId, s])
  );

  // Calculations
  const totalTasks = assignments.length;
  const submittedTasks = submissions.length;
  const pendingTasks = Math.max(0, totalTasks - submittedTasks);
  const reviewedTasks = submissions.filter((s) => s.status === 'Reviewed').length;

  // Find nearest upcoming unsubmitted deadline
  const now = new Date();
  const upcomingUnsubmitted = assignments
    .filter((a) => !submissionMap.has(a.id) && new Date(a.deadline) > now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  const formatCountdown = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff <= 0) return 'Deadline Closed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
    const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (assignmentsError || submissionsError) {
    return (
      <ErrorState
        title="Failed to load student workspace"
        message="Could not load coursework tasks or submissions from the server."
        onRetry={() => refetchAssignments()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <GraduationCap size={16} className="text-cyan-400" />
              <span>Student Scholar Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="gradient-text">{user?.fullName || 'Scholar'}</span>!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Stay ahead of your coursework deadlines, submit responses, and review teacher feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/student/assignments">
              <Button
                variant="primary"
                leftIcon={<FileText size={16} />}
                className="font-semibold shadow-lg shadow-cyan-500/20"
              >
                View Coursework ({totalTasks})
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BookOpen size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Assigned
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalTasks}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Classroom Tasks</div>
          </div>
        </div>

        {/* Handed In */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Submitted
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{submittedTasks}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Handed In Successfully</div>
          </div>
        </div>

        {/* Pending Action */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Action Needed
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{pendingTasks}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Pending Submissions</div>
          </div>
        </div>

        {/* Graded & Reviewed */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Evaluated
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">{reviewedTasks}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Graded & Reviewed</div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadline Alert Banner */}
      {upcomingUnsubmitted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Upcoming Deadline Alert
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold font-mono border border-amber-500/30">
                  {formatCountdown(upcomingUnsubmitted.deadline)}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mt-1">
                {upcomingUnsubmitted.title} • <span className="text-purple-300">{upcomingUnsubmitted.subjectName}</span>
              </h4>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setSubmittingAssignment(upcomingUnsubmitted)}
            leftIcon={<Send size={14} />}
            className="shrink-0 font-medium"
          >
            Submit Answer Now
          </Button>
        </div>
      )}

      {/* Active Coursework Table Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Enrolled Coursework</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active assignments published for your classroom.
            </p>
          </div>
          <Link to="/student/submissions">
            <Button variant="ghost" size="sm">
              My Submissions History
            </Button>
          </Link>
        </div>

        <DataTable
          data={assignments}
          keyExtractor={(item) => item.id}
          isLoading={isAssignmentsLoading || isSubmissionsLoading}
          emptyTitle="No coursework posted"
          emptyDescription="There are currently no published assignments for your classroom. Check back soon!"
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
              header: 'Subject & Instructor',
              cell: (item) => (
                <div className="space-y-0.5 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-purple-400" />
                    {item.subjectName}
                  </div>
                  <div className="text-slate-400">Teacher: {item.teacherName}</div>
                </div>
              ),
            },
            {
              header: 'Deadline & Countdown',
              cell: (item) => {
                const deadlineDate = new Date(item.deadline);
                const isPast = deadlineDate < now;
                const countdown = formatCountdown(item.deadline);

                return (
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      {deadlineDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                      , {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`text-xs font-semibold mt-0.5 font-mono ${
                        isPast ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {countdown}
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
              header: 'My Status',
              cell: (item) => {
                const sub = submissionMap.get(item.id);
                if (!sub) {
                  const isPast = new Date(item.deadline) < now;
                  return isPast ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      Missing
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Not Submitted
                    </span>
                  );
                }

                if (sub.status === 'Reviewed') {
                  return (
                    <div>
                      <StatusBadge status="Reviewed" />
                      <span className="text-xs font-bold text-cyan-300 block mt-1 font-mono">
                        Score: {sub.marks} / {sub.maximumMarks}
                      </span>
                    </div>
                  );
                }

                return <StatusBadge status={sub.status} />;
              },
            },
            {
              header: 'Actions',
              align: 'right',
              cell: (item) => {
                const sub = submissionMap.get(item.id);
                const isPast = new Date(item.deadline) < now;

                if (!sub) {
                  return (
                    <div className="flex items-center justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSubmittingAssignment(item)}
                        leftIcon={<Send size={14} />}
                        className="text-xs"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingSubmission({ assignment: item, submission: sub })}
                      leftIcon={<Eye size={14} />}
                      className="text-xs"
                    >
                      Details
                    </Button>

                    {!isPast && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSubmittingAssignment(item)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        isOpen={Boolean(submittingAssignment)}
        onClose={() => setSubmittingAssignment(null)}
        assignment={submittingAssignment}
        existingSubmission={submittingAssignment ? submissionMap.get(submittingAssignment.id) : null}
      />

      {/* View Submission Details & Feedback Modal */}
      <Modal
        isOpen={Boolean(viewingSubmission)}
        onClose={() => setViewingSubmission(null)}
        title="Submission & Instructor Remarks"
        description="Detailed record of your answer and teacher evaluation remarks."
        size="lg"
      >
        {viewingSubmission && (
          <div className="space-y-5">
            {/* Header */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  {viewingSubmission.assignment.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitted on {new Date(viewingSubmission.submission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <StatusBadge status={viewingSubmission.submission.status} />
                {viewingSubmission.submission.marks !== null && (
                  <p className="text-lg font-bold text-cyan-300 font-mono mt-1">
                    {viewingSubmission.submission.marks} / {viewingSubmission.submission.maximumMarks} Points
                  </p>
                )}
              </div>
            </div>

            {/* Teacher Feedback Card */}
            {viewingSubmission.submission.status === 'Reviewed' || viewingSubmission.submission.feedback ? (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  <Award size={14} className="text-purple-400" />
                  <span>Instructor Evaluation Remarks</span>
                </div>
                <p className="text-sm text-purple-100 whitespace-pre-wrap leading-relaxed">
                  {viewingSubmission.submission.feedback || 'No written remarks provided.'}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
                <Clock size={15} className="text-cyan-400 shrink-0" />
                <span>Your hand-in is currently pending instructor evaluation and scoring.</span>
              </div>
            )}

            {/* Student's Written Answer */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">
                Your Submitted Answer
              </span>
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap border border-slate-800 select-text">
                {viewingSubmission.submission.answer || viewingSubmission.submission.content}
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setViewingSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default StudentDashboard;
