import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assignmentsApi, submissionsApi } from '../../api';
import { Assignment, Submission } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import {
  FileText,
  Search,
  BookOpen,
  Calendar,
  Award,
  Send,
  Eye,
  Clock,
  Edit,
} from '../../components/Icons';

export const StudentAssignments: React.FC = () => {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
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
    refetch,
  } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  const {
    data: submissions = [],
    isLoading: isSubmissionsLoading,
  } = useQuery({
    queryKey: ['student', 'submissions'],
    queryFn: () => submissionsApi.getMy(),
  });

  // Map submissions
  const submissionMap = new Map<string, Submission>(
    submissions.map((s) => [s.assignmentId, s])
  );

  // Extract unique subjects
  const uniqueSubjects = Array.from(
    new Set(assignments.map((a) => a.subjectName).filter(Boolean))
  );

  const now = new Date();

  const formatCountdown = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff <= 0) return { text: 'Closed', isPast: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
    const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}d ${hours}h left`, isPast: false };
    if (hours > 0) return { text: `${hours}h ${minutes}m left`, isPast: false };
    return { text: `${minutes}m left`, isPast: false };
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((item) => {
    const sub = submissionMap.get(item.id);
    const isPast = new Date(item.deadline) < now;

    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

    // Subject filter
    const matchesSubject = subjectFilter === 'ALL' || item.subjectName === subjectFilter;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'UNSUBMITTED') {
      matchesStatus = !sub && !isPast;
    } else if (statusFilter === 'SUBMITTED') {
      matchesStatus = Boolean(sub && sub.status !== 'Reviewed');
    } else if (statusFilter === 'GRADED') {
      matchesStatus = Boolean(sub && sub.status === 'Reviewed');
    } else if (statusFilter === 'MISSING') {
      matchesStatus = !sub && isPast;
    }

    return matchesSearch && matchesSubject && matchesStatus;
  });

  if (assignmentsError) {
    return (
      <ErrorState
        title="Failed to load coursework"
        message="Could not load coursework assignments from the server."
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
            <FileText className="text-cyan-400" size={28} />
            Coursework & <span className="gradient-text">Assigned Tasks</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete your classroom assignments, view evaluation criteria, and submit answers before deadlines.
          </p>
        </div>

        <div className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2">
          <BookOpen size={14} />
          <span>Active Curriculum Catalog</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, subject, instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2 text-sm w-full"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="select-field !py-2 text-sm w-full"
            >
              <option value="ALL">All Subjects</option>
              {uniqueSubjects.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Hand-in Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field !py-2 text-sm w-full"
            >
              <option value="ALL">All Hand-in Statuses</option>
              <option value="UNSUBMITTED">To Do (Pending Hand-in)</option>
              <option value="SUBMITTED">Handed In (Awaiting Grading)</option>
              <option value="GRADED">Graded & Evaluated</option>
              <option value="MISSING">Past Due / Missing</option>
            </select>

            {(searchTerm || subjectFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSubjectFilter('ALL');
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

      {/* Coursework Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="glass-panel p-10">
          <EmptyState
            title="No coursework found"
            description={
              searchTerm || subjectFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No assignments match your search or filter settings.'
                : 'No coursework has been published for your class yet.'
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment) => {
            const sub = submissionMap.get(assignment.id);
            const isPast = new Date(assignment.deadline) < now;
            const countdown = formatCountdown(assignment.deadline);

            return (
              <div
                key={assignment.id}
                className="glass-panel p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group relative overflow-hidden"
              >
                {/* Top Accent Line on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      <BookOpen size={12} />
                      {assignment.subjectName}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      <Award size={12} />
                      {assignment.maximumMarks} pts
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mt-3 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Instructor: <strong className="text-slate-300">{assignment.teacherName}</strong>
                  </p>

                  {/* Instructions preview */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mt-3">
                    {assignment.description || 'No detailed instructions provided.'}
                  </p>
                </div>

                {/* Deadline & Status Pill */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar size={13} className="text-cyan-400" />
                      {new Date(assignment.deadline).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>

                    <span
                      className={`font-semibold font-mono text-xs px-2 py-0.5 rounded-full ${
                        isPast
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {countdown.text}
                    </span>
                  </div>

                  {/* Submission status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">My Status:</span>
                    {sub ? (
                      sub.status === 'Reviewed' ? (
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                          Score: {sub.marks} / {sub.maximumMarks}
                        </span>
                      ) : (
                        <StatusBadge status={sub.status} />
                      )
                    ) : isPast ? (
                      <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        Missing
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        Not Handed In
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {!sub ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSubmittingAssignment(assignment)}
                        leftIcon={<Send size={14} />}
                        className="w-full text-xs font-medium"
                      >
                        Submit Hand-in
                      </Button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewingSubmission({ assignment, submission: sub })}
                          leftIcon={<Eye size={13} />}
                          className="text-xs"
                        >
                          View Work
                        </Button>

                        {!isPast ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSubmittingAssignment(assignment)}
                            leftIcon={<Edit size={13} />}
                            className="text-xs text-slate-300 hover:text-white"
                          >
                            Edit
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 text-center flex items-center justify-center font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        isOpen={Boolean(submittingAssignment)}
        onClose={() => setSubmittingAssignment(null)}
        assignment={submittingAssignment}
        existingSubmission={submittingAssignment ? submissionMap.get(submittingAssignment.id) : null}
      />

      {/* View Submission & Feedback Modal */}
      <Modal
        isOpen={Boolean(viewingSubmission)}
        onClose={() => setViewingSubmission(null)}
        title="Coursework Hand-in & Feedback"
        description="Review your submitted work and faculty evaluation."
        size="lg"
      >
        {viewingSubmission && (
          <div className="space-y-5">
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

            {/* Evaluation remarks */}
            {viewingSubmission.submission.status === 'Reviewed' || viewingSubmission.submission.feedback ? (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  <Award size={14} className="text-purple-400" />
                  <span>Instructor Feedback & Score Analysis</span>
                </div>
                <p className="text-sm text-purple-100 whitespace-pre-wrap leading-relaxed">
                  {viewingSubmission.submission.feedback || 'No written feedback remarks provided.'}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
                <Clock size={15} className="text-cyan-400 shrink-0" />
                <span>Your hand-in is currently pending instructor review.</span>
              </div>
            )}

            {/* Submitted answer text */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">
                Your Submitted Answer
              </span>
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap border border-slate-800 select-text">
                {viewingSubmission.submission.answer || viewingSubmission.submission.content}
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
    </div>
  );
};
export default StudentAssignments;
