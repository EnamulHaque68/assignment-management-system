import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assignmentsApi, submissionsApi } from '../../api';
import { Submission, ReviewSubmissionRequest } from '../../types';
import { useToast } from '../../components/Toast';
import {
  reviewSubmissionSchema,
  ReviewSubmissionFormData,
} from '../../schemas/teacherSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  FileText,
  School,
  BookOpen,
  Calendar,
  Award,
  Users,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  FileCheck,
} from '../../components/Icons';

export const TeacherSubmissions: React.FC = () => {
  const { id: assignmentId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Queries
  const {
    data: assignment,
    isLoading: isAssignmentLoading,
    error: assignmentError,
  } = useQuery({
    queryKey: ['teacher', 'assignment', assignmentId],
    queryFn: () => assignmentsApi.getById(assignmentId!),
    enabled: Boolean(assignmentId),
  });

  const {
    data: submissions = [],
    isLoading: isSubmissionsLoading,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useQuery({
    queryKey: ['teacher', 'submissions', assignmentId],
    queryFn: () => submissionsApi.getByAssignment(assignmentId!),
    enabled: Boolean(assignmentId),
  });

  // Review Form
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ReviewSubmissionFormData>({
    resolver: zodResolver(reviewSubmissionSchema),
    defaultValues: {
      marks: 0,
      feedback: '',
      status: 'Reviewed',
    },
  });

  // Mutation for grading
  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewSubmissionRequest }) =>
      submissionsApi.review(id, data),
    onSuccess: (updated) => {
      toast.success(`Submission by ${updated.studentName} evaluated successfully.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions', assignmentId] });
      setSelectedSubmission(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit evaluation.');
    },
  });

  const handleOpenReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    reset({
      marks: submission.marks ?? assignment?.maximumMarks ?? 100,
      feedback: submission.feedback || '',
      status: (submission.status === 'Rejected' ? 'Rejected' : 'Reviewed') as 'Reviewed' | 'Rejected',
    });
  };

  const onReviewSubmit = (data: ReviewSubmissionFormData) => {
    if (!selectedSubmission || !assignment) return;

    // Validate marks does not exceed maximumMarks
    if (data.marks > assignment.maximumMarks) {
      setError('marks', {
        type: 'manual',
        message: `Marks cannot exceed the maximum of ${assignment.maximumMarks} points.`,
      });
      return;
    }

    reviewMutation.mutate({
      id: selectedSubmission.id,
      data: {
        marks: data.marks,
        feedback: data.feedback || '',
        status: data.status,
      },
    });
  };

  // Metrics
  const totalSubmissions = submissions.length;
  const reviewedCount = submissions.filter((s) => s.status === 'Reviewed').length;
  const rejectedCount = submissions.filter((s) => s.status === 'Rejected').length;
  const pendingCount = submissions.filter((s) => s.status === 'Submitted' || s.status === 'Late').length;

  const scoredSubmissions = submissions.filter((s) => s.marks !== null && s.marks !== undefined);
  const averageScore = scoredSubmissions.length > 0
    ? Math.round(
        scoredSubmissions.reduce((acc, curr) => acc + (curr.marks || 0), 0) / scoredSubmissions.length
      )
    : 0;

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.answer && s.answer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (assignmentError || submissionsError) {
    return (
      <ErrorState
        title="Failed to load submissions"
        message="Could not load the assignment or student submissions from the server."
        onRetry={() => refetchSubmissions()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/teacher/assignments">
            <Button variant="secondary" size="sm" leftIcon={<ChevronLeft size={16} />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                {assignment?.title || 'Coursework Submissions'}
              </h1>
              {assignment && <StatusBadge status={assignment.status} />}
            </div>

            {assignment && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                <span className="flex items-center gap-1 text-cyan-300">
                  <School size={13} />
                  {assignment.className}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-purple-300">
                  <BookOpen size={13} />
                  {assignment.subjectName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Deadline: {new Date(assignment.deadline).toLocaleString()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-indigo-300 font-mono">
                  <Award size={13} />
                  Max {assignment.maximumMarks} pts
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Hand-ins</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalSubmissions}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Users size={20} />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Grading</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reviewed</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{reviewedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <XCircle size={20} />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1 font-mono">
              {scoredSubmissions.length > 0 ? `${averageScore} / ${assignment?.maximumMarks}` : 'N/A'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name or answer..."
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
              <option value="Reviewed">Reviewed & Approved</option>
              <option value="Rejected">Rejected (Revise)</option>
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

      {/* Submissions Table */}
      <DataTable
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        isLoading={isSubmissionsLoading || isAssignmentLoading}
        emptyTitle="No student submissions found"
        emptyDescription={
          searchTerm || statusFilter !== 'ALL'
            ? 'No student hand-ins match your search filter.'
            : 'Enrolled students have not submitted work for this coursework yet.'
        }
        columns={[
          {
            header: 'Student Scholar',
            cell: (item) => {
              const initials = item.studentName
                ? item.studentName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'S';

              return (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-slate-700/60 text-slate-200 font-semibold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">{item.studentName}</div>
                    <div className="text-xs text-slate-400 font-mono">ID: {item.studentId.slice(-6)}</div>
                  </div>
                </div>
              );
            },
          },
          {
            header: 'Hand-in Answer Preview',
            cell: (item) => (
              <div className="max-w-xs sm:max-w-md">
                <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono">
                  "{item.answer || item.content || 'No text answer provided'}"
                </p>
              </div>
            ),
          },
          {
            header: 'Submission Time',
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
            header: 'Awarded Marks',
            cell: (item) => {
              if (item.marks !== null && item.marks !== undefined) {
                const percentage = Math.round((item.marks / item.maximumMarks) * 100);
                return (
                  <div>
                    <span className="font-bold text-sm text-cyan-300 font-mono">
                      {item.marks} / {item.maximumMarks}
                    </span>
                    <span className="text-xs text-slate-400 block font-mono">({percentage}%)</span>
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
            header: 'Actions',
            align: 'right',
            cell: (item) => (
              <div className="flex items-center justify-end">
                <Button
                  variant={item.status === 'Reviewed' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleOpenReview(item)}
                  leftIcon={<FileCheck size={14} />}
                  className="text-xs"
                >
                  {item.status === 'Reviewed' ? 'Re-evaluate' : 'Grade Hand-in'}
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Grade & Review Modal */}
      <Modal
        isOpen={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title="Grade Student Hand-in"
        description="Review student submission content, award points, and provide constructive feedback."
        size="lg"
      >
        {selectedSubmission && (
          <form onSubmit={handleSubmit(onReviewSubmit)} className="space-y-5">
            {/* Student & Submission Header */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Student</span>
                <h4 className="text-base font-bold text-slate-100 mt-0.5">
                  {selectedSubmission.studentName}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitted on {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase">Assignment Max</span>
                <p className="text-lg font-bold text-cyan-400 font-mono">
                  {selectedSubmission.maximumMarks} Points
                </p>
              </div>
            </div>

            {/* Student's Full Answer Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-200">
                  Student's Written Submission
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedSubmission.answer?.length || 0} characters
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap border border-slate-800 select-text">
                {selectedSubmission.answer || selectedSubmission.content || 'No text answer content.'}
              </div>
            </div>

            {/* Evaluation Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label={`Awarded Score (0 - ${selectedSubmission.maximumMarks})`}
                  type="number"
                  min="0"
                  max={selectedSubmission.maximumMarks}
                  error={errors.marks?.message}
                  required
                  {...register('marks', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Evaluation Verdict <span className="text-rose-400">*</span>
                </label>
                <Select
                  {...register('status')}
                  error={errors.status?.message}
                  className="w-full"
                >
                  <option value="Reviewed">Reviewed (Approved & Graded)</option>
                  <option value="Rejected">Rejected (Needs Revision)</option>
                </Select>
              </div>
            </div>

            {/* Teacher Written Feedback */}
            <div>
              <Textarea
                label="Instructor Feedback & Remarks"
                placeholder="Write constructive guidance, highlight strong points, or explain point deductions..."
                rows={4}
                error={errors.feedback?.message}
                {...register('feedback')}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={reviewMutation.isPending}
                leftIcon={<CheckCircle size={16} />}
              >
                Submit Evaluation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default TeacherSubmissions;
