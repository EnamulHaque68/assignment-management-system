import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { assignmentsApi, classesApi, subjectsApi } from '../../api';
import { CreateAssignmentRequest } from '../../types';
import { useToast } from '../../components/Toast';
import {
  createAssignmentSchema,
  CreateAssignmentFormData,
} from '../../schemas/teacherSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import {
  FileText,
  Calendar,
  Award,
  School,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ChevronLeft,
} from '../../components/Icons';

export const TeacherCreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Queries for classes and subjects
  const { data: classes = [] } = useQuery({
    queryKey: ['common', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['common', 'subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Calculate default deadline: 7 days from now formatted for datetime-local
  const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      classId: '',
      subjectId: '',
      deadline: defaultDeadline,
      maximumMarks: 100,
      publishNow: true,
    },
  });

  // Watch fields for live preview card
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedClassId = watch('classId');
  const watchedSubjectId = watch('subjectId');
  const watchedDeadline = watch('deadline');
  const watchedMaximumMarks = watch('maximumMarks');
  const watchedPublishNow = watch('publishNow');

  const selectedClass = classes.find((c) => c.id === watchedClassId);
  const selectedSubject = subjects.find((s) => s.id === watchedSubjectId);

  // Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignmentsApi.create(data),
    onSuccess: (newAssignment) => {
      toast.success(
        `Assignment "${newAssignment.title}" created ${
          newAssignment.status === 'Published' ? 'and published!' : 'as draft.'
        }`
      );
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      navigate('/teacher/assignments');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create assignment.');
    },
  });

  const onSubmit = (data: CreateAssignmentFormData) => {
    createMutation.mutate({
      title: data.title,
      description: data.description,
      classId: data.classId,
      subjectId: data.subjectId,
      deadline: new Date(data.deadline).toISOString(),
      maximumMarks: data.maximumMarks,
      publishNow: data.publishNow,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link to="/teacher/assignments">
          <Button variant="secondary" size="sm" leftIcon={<ChevronLeft size={16} />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="text-cyan-400" size={26} />
            Create <span className="gradient-text">Coursework Assignment</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Author new coursework, define evaluation marks, and set student submission deadlines.
          </p>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <CardTitle className="text-lg font-bold text-slate-100">
                Assignment Details & Parameters
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in the details below. You can publish immediately to students or keep as a private draft.
              </p>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Title */}
                <Input
                  label="Assignment Title"
                  placeholder="e.g. Modern Physics: Wave-Particle Duality Essay"
                  error={errors.title?.message}
                  required
                  {...register('title')}
                />

                {/* Instructions */}
                <Textarea
                  label="Detailed Instructions & Questions"
                  placeholder="Write clear expectations, formatting rules, questions, and grading criteria for students..."
                  rows={6}
                  error={errors.description?.message}
                  required
                  {...register('description')}
                />

                {/* Class & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Target Classroom <span className="text-rose-400">*</span>
                    </label>
                    <Select
                      {...register('classId')}
                      error={errors.classId?.message}
                      className="w-full"
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Academic Subject <span className="text-rose-400">*</span>
                    </label>
                    <Select
                      {...register('subjectId')}
                      error={errors.subjectId?.message}
                      className="w-full"
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Deadline & Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Submission Deadline"
                    type="datetime-local"
                    error={errors.deadline?.message}
                    required
                    {...register('deadline')}
                  />

                  <Input
                    label="Maximum Evaluation Marks"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="100"
                    error={errors.maximumMarks?.message}
                    required
                    {...register('maximumMarks', { valueAsNumber: true })}
                  />
                </div>

                {/* Teacher Allocation Notice */}
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-3">
                  <AlertCircle size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cyan-300">Teaching Permission Requirement: </span>
                    Faculty can only assign coursework for classrooms and subjects they have been allocated to by an Administrator.
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-100 block">
                      Publish to Students Immediately
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      If unchecked, the assignment will be saved as a private Draft visible only to you.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register('publishNow')}
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/teacher/assignments')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createMutation.isPending}
                    leftIcon={<ArrowRight size={16} />}
                  >
                    {watchedPublishNow ? 'Publish Assignment' : 'Save as Draft'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Student Preview Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Live Student View Simulation</span>
          </div>

          <div className="glass-panel p-5 space-y-4 border border-cyan-500/30 shadow-xl shadow-cyan-950/20 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600" />

            {/* Header: Status and Score */}
            <div className="flex items-start justify-between gap-2 pt-1">
              <StatusBadge status={watchedPublishNow ? 'Published' : 'Draft'} />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 font-mono">
                <Award size={13} />
                {watchedMaximumMarks || 100} pts
              </span>
            </div>

            {/* Title */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Assignment Title
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5 leading-snug">
                {watchedTitle || 'Untitled Assignment'}
              </h3>
            </div>

            {/* Target Classroom & Subject Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                <School size={13} />
                {selectedClass?.name || 'Target Class'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium">
                <BookOpen size={13} />
                {selectedSubject?.name || 'Target Subject'}
              </span>
            </div>

            {/* Deadline Card */}
            <div className="flex items-center gap-2.5 text-xs text-slate-300 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <Calendar size={15} className="text-cyan-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-400">Deadline: </span>
                <span className="text-slate-200 font-mono">
                  {watchedDeadline
                    ? new Date(watchedDeadline).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'No deadline set'}
                </span>
              </div>
            </div>

            {/* Description / Instructions preview */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Instructions Preview
              </span>
              <div className="text-xs text-slate-300 mt-1 whitespace-pre-wrap line-clamp-6 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 font-mono">
                {watchedDescription || 'No instructions provided yet.'}
              </div>
            </div>

            {/* Mock student submit button */}
            <div className="pt-2">
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 border border-slate-800 text-slate-500 cursor-not-allowed text-center"
              >
                Submit Answer (Student View Simulator)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeacherCreateAssignment;
