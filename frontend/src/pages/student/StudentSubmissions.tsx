import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { submissionsApi, assignmentsApi } from '../../api';
import { Submission, Assignment } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import {
  GraduationCap,
  Award,
  CheckCircle,
  Clock,
  Search,
  Eye,
  Edit,
  FileText,
} from '../../components/Icons';

export const StudentSubmissions: React.FC = () => {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<{
    submission: Submission;
    assignment: Assignment;
  } | null>(null);

  // Queries
  const {
    data: submissions = [],
    isLoading: isSubmissionsLoading,
    error: submissionsError,
    refetch,
  } = useQuery({
    queryKey: ['student', 'submissions'],
    queryFn: () => submissionsApi.getMy(),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  const assignmentMap = new Map<string, Assignment>(
    assignments.map((a) => [a.id, a])
  );

  // Stats
  const totalSubmissions = submissions.length;
  const reviewedCount = submissions.filter((s) => s.status === 'Reviewed').length;
  const pendingCount = submissions.filter((s) => s.status === 'Submitted' || s.status === 'Late').length;

  const scoredSubmissions = submissions.filter((s) => s.marks !== null && s.marks !== undefined);
  const averagePercentage = scoredSubmissions.length > 0
    ? Math.round(
        scoredSubmissions.reduce(
          (acc, curr) => acc + ((curr.marks || 0) / curr.maximumMarks) * 100,
          0
        ) / scoredSubmissions.length
      )
    : 0;

  // Filtered submissions
  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.answer && item.answer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (submission: Submission) => {
    const assignment = assignmentMap.get(submission.assignmentId);
    if (!assignment) return;
    setEditingSubmission({ submission, assignment });
  };

  if (submissionsError) {
    return (
      <ErrorState
        title="Failed to load hand-ins"
        message="Could not load your submission records from the server."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-cyan-400" size={28} />
            My Hand-ins & <span className="gradient-text">Academic Records</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your submitted coursework, view instructor evaluations, and check earned marks.
          </p>
        </div>

        <Link to="/student/assignments">
          <Button variant="secondary" size="sm" leftIcon={<FileText size={16} />}>
            Coursework Catalog
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Hand-ins
            </p>
            <p className="text-3xl font-extrabold text-white mt-1">{totalSubmissions}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <FileText size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Graded & Reviewed
            </p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{reviewedCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pending Review
            </p>
            <p className="text-3xl font-extrabold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cumulative Average
            </p>
            <p className="text-3xl font-extrabold text-purple-400 mt-1 font-mono">
              {scoredSubmissions.length > 0 ? `${averagePercentage}%` : 'N/A'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by assignment title or answer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2 text-sm w-full"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field !py-2 text-sm w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted (Pending Review)</option>
              <option value="Reviewed">Reviewed & Graded</option>
              <option value="Rejected">Rejected</option>
              <option value="Late">Late Submission</option>
            </select>

            {(searchTerm || statusFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        isLoading={isSubmissionsLoading}
        emptyTitle="No hand-ins recorded"
        emptyDescription={
          searchTerm || statusFilter !== 'ALL'
            ? 'No hand-ins match your search or filter settings.'
            : 'You have not submitted work for any coursework yet.'
        }
        columns={[
          {
            header: 'Coursework Title',
            cell: (item) => (
              <div>
                <div className="font-semibold text-slate-100">{item.assignmentTitle}</div>
                <div className="text-xs text-slate-400 line-clamp-1 font-mono mt-0.5">
                  "{item.answer || item.content}"
                </div>
              </div>
            ),
          },
          {
            header: 'Hand-in Date',
            cell: (item) => (
              <div>
                <div className="text-xs font-medium text-slate-200">
                  {new Date(item.submittedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ),
          },
          {
            header: 'Awarded Score',
            cell: (item) => {
              if (item.marks !== null && item.marks !== undefined) {
                const percentage = Math.round((item.marks / item.maximumMarks) * 100);
                return (
                  <div>
                    <span className="font-bold text-sm text-cyan-300 font-mono">
                      {item.marks} / {item.maximumMarks} pts
                    </span>
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          percentage >= 80
                            ? 'bg-emerald-400'
                            : percentage >= 50
                            ? 'bg-cyan-400'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
              return <span className="text-xs text-amber-400 font-medium">Ungraded</span>;
            },
          },
          {
            header: 'Status',
            cell: (item) => <StatusBadge status={item.status} />,
          },
          {
            header: 'Instructor Remarks',
            cell: (item) => (
              <p className="text-xs text-slate-300 line-clamp-2 max-w-xs">
                {item.feedback || 'No written remarks yet'}
              </p>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            cell: (item) => {
              const assignment = assignmentMap.get(item.assignmentId);
              const isPast = assignment ? new Date(assignment.deadline) < new Date() : true;

              return (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewingSubmission(item)}
                    leftIcon={<Eye size={14} />}
                    className="text-xs"
                  >
                    Inspect
                  </Button>

                  {assignment && !isPast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      leftIcon={<Edit size={13} />}
                      className="text-xs text-slate-300 hover:text-white"
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

      {/* Inspect Submission Modal */}
      <Modal
        isOpen={Boolean(viewingSubmission)}
        onClose={() => setViewingSubmission(null)}
        title="Hand-in Details & Remarks"
        description="Comprehensive review of your submitted work and faculty evaluation."
        size="lg"
      >
        {viewingSubmission && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  {viewingSubmission.assignmentTitle}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Handed in on {new Date(viewingSubmission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <StatusBadge status={viewingSubmission.status} />
                {viewingSubmission.marks !== null && (
                  <p className="text-lg font-bold text-cyan-300 font-mono mt-1">
                    {viewingSubmission.marks} / {viewingSubmission.maximumMarks} Points
                  </p>
                )}
              </div>
            </div>

            {/* Teacher Feedback */}
            {viewingSubmission.status === 'Reviewed' || viewingSubmission.feedback ? (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  <Award size={14} className="text-purple-400" />
                  <span>Faculty Feedback & Remarks</span>
                </div>
                <p className="text-sm text-purple-100 whitespace-pre-wrap leading-relaxed">
                  {viewingSubmission.feedback || 'No written remarks provided.'}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
                <Clock size={15} className="text-cyan-400 shrink-0" />
                <span>Your hand-in is awaiting instructor evaluation and remarks.</span>
              </div>
            )}

            {/* Answer Text */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">
                Your Submitted Answer
              </span>
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap border border-slate-800 select-text">
                {viewingSubmission.answer || viewingSubmission.content}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setViewingSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <SubmitAssignmentModal
          isOpen={Boolean(editingSubmission)}
          onClose={() => setEditingSubmission(null)}
          assignment={editingSubmission.assignment}
          existingSubmission={editingSubmission.submission}
        />
      )}
    </div>
  );
};
export default StudentSubmissions;
