import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { submissionsApi } from '../../api';
import { Assignment, Submission } from '../../types';
import { useToast } from '../../components/Toast';
import { submitAnswerSchema, SubmitAnswerFormData } from '../../schemas/studentSchemas';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import {
  Send,
  Calendar,
  Award,
  BookOpen,
  School,
} from '../../components/Icons';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  existingSubmission?: Submission | null;
  onSuccess?: () => void;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubmitAnswerFormData>({
    resolver: zodResolver(submitAnswerSchema),
    defaultValues: {
      answer: '',
    },
  });

  const watchedAnswer = watch('answer') || '';

  useEffect(() => {
    if (existingSubmission) {
      reset({
        answer: existingSubmission.answer || existingSubmission.content || '',
      });
    } else {
      reset({ answer: '' });
    }
  }, [existingSubmission, assignment, reset, isOpen]);

  // Check deadline
  const isPastDeadline = assignment ? new Date(assignment.deadline) < new Date() : false;
  const isEdit = Boolean(existingSubmission);
  const cannotEditPastDeadline = isEdit && isPastDeadline;

  // Create submission mutation
  const createMutation = useMutation({
    mutationFn: (data: { assignmentId: string; answer: string }) =>
      submissionsApi.create(data),
    onSuccess: () => {
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback gracefully if canvas is blocked
      }

      toast.success('Your coursework answer has been submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'submissions'] });
      onClose();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit assignment.');
    },
  });

  // Update submission mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) =>
      submissionsApi.update(id, { answer }),
    onSuccess: () => {
      toast.success('Your submission has been updated.');
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'submissions'] });
      onClose();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update submission.');
    },
  });

  const onSubmit = (data: SubmitAnswerFormData) => {
    if (!assignment) return;

    if (isEdit && existingSubmission) {
      updateMutation.mutate({
        id: existingSubmission.id,
        answer: data.answer,
      });
    } else {
      createMutation.mutate({
        assignmentId: assignment.id,
        answer: data.answer,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Update Coursework Submission' : 'Submit Coursework Answer'}
      description="Provide your written response for instructor evaluation."
      size="lg"
    >
      {assignment && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Assignment Header Summary */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-base font-bold text-slate-100">{assignment.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1 font-medium text-cyan-300">
                <School size={13} />
                {assignment.className}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-purple-300">
                <BookOpen size={13} />
                {assignment.subjectName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-indigo-300 font-mono">
                <Award size={13} />
                {assignment.maximumMarks} Points Max
              </span>
            </div>

            {/* Assignment Instructions */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Instructions
              </span>
              <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {assignment.description || 'No additional instructions provided.'}
              </p>
            </div>
          </div>

          {/* Deadline Alert Banner */}
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-3 ${
              isPastDeadline
                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                : 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30'
            }`}
          >
            <Calendar size={18} className="shrink-0" />
            <div>
              <span className="font-semibold">
                {isPastDeadline ? 'Deadline has passed: ' : 'Submission Deadline: '}
              </span>
              <span className="font-mono">
                {new Date(assignment.deadline).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
              {isPastDeadline && !isEdit && (
                <span className="block text-rose-400 font-medium mt-0.5">
                  Submissions after the deadline will be flagged with status "Late".
                </span>
              )}
              {cannotEditPastDeadline && (
                <span className="block text-rose-400 font-medium mt-0.5">
                  Edits are closed because the deadline has passed.
                </span>
              )}
            </div>
          </div>

          {/* Answer Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-200">
                Your Answer / Submission <span className="text-rose-400">*</span>
              </label>
              <span
                className={`text-xs font-mono ${
                  watchedAnswer.length > 9500 ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}
              >
                {watchedAnswer.length} / 10,000 characters
              </span>
            </div>

            <Textarea
              placeholder="Type or paste your complete coursework response, solution, or essay here..."
              rows={8}
              error={errors.answer?.message}
              disabled={cannotEditPastDeadline}
              className="font-mono text-sm leading-relaxed"
              {...register('answer')}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={cannotEditPastDeadline}
              isLoading={isPending}
              leftIcon={<Send size={16} />}
            >
              {isEdit ? 'Save Changes' : 'Submit Work'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
export default SubmitAssignmentModal;
