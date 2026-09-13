import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { assignmentsApi, classesApi, subjectsApi } from '../../api';
import { Assignment, UpdateAssignmentRequest } from '../../types';
import { useToast } from '../../components/Toast';
import {
  updateAssignmentSchema,
  UpdateAssignmentFormData,
} from '../../schemas/teacherSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  FileText,
  Plus,
  Search,
  Eye,
  School,
  BookOpen,
  Calendar,
  Award,
  Trash2,
  Edit,
  CheckCircle,
} from '../../components/Icons';

export const TeacherAssignments: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // Modals
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  // Queries
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teacher', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['common', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['common', 'subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Edit Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateAssignmentFormData>({
    resolver: zodResolver(updateAssignmentSchema),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentRequest }) =>
      assignmentsApi.update(id, data),
    onSuccess: (updated) => {
      toast.success(`"${updated.title}" updated successfully.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      setEditingAssignment(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update assignment.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.delete(id),
    onSuccess: () => {
      toast.success('Assignment deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      setDeletingAssignment(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete assignment.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.publish(id),
    onSuccess: (updated) => {
      toast.success(`"${updated.title}" published to students.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to publish.');
    },
  });

  const draftMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.draft(id),
    onSuccess: (updated) => {
      toast.info(`"${updated.title}" reverted to draft.`);
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to revert to draft.');
    },
  });

  const handleOpenEdit = (a: Assignment) => {
    setEditingAssignment(a);
    const deadlineLocal = a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : '';
    reset({
      title: a.title,
      description: a.description,
      classId: a.classId,
      subjectId: a.subjectId,
      deadline: deadlineLocal,
      maximumMarks: a.maximumMarks,
    });
  };

  const onEditSubmit = (data: UpdateAssignmentFormData) => {
    if (!editingAssignment) return;
    updateMutation.mutate({
      id: editingAssignment.id,
      data: {
        title: data.title,
        description: data.description,
        classId: data.classId,
        subjectId: data.subjectId,
        deadline: new Date(data.deadline).toISOString(),
        maximumMarks: data.maximumMarks,
      },
    });
  };

  // Filtered list
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || item.classId === classFilter;
    const matchesSubject = subjectFilter === 'ALL' || item.subjectId === subjectFilter;

    return matchesSearch && matchesStatus && matchesClass && matchesSubject;
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load assignments"
        message="Could not load your coursework registry from the server."
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
            My Coursework & <span className="gradient-text">Assignments</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your assignments, modify instructions, toggle publish status, and evaluate student work.
          </p>
        </div>

        <Button
          onClick={() => navigate('/teacher/assignments/create')}
          variant="primary"
          leftIcon={<Plus size={16} />}
        >
          Create Assignment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search coursework title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2 text-sm w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field !py-2 text-sm w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published (Active)</option>
              <option value="Draft">Draft (Private)</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="select-field !py-2 text-sm w-full"
            >
              <option value="ALL">All Classrooms</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="select-field !py-2 text-sm w-full"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter !== 'ALL' || classFilter !== 'ALL' || subjectFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setClassFilter('ALL');
                  setSubjectFilter('ALL');
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
        data={filteredAssignments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyTitle="No assignments found"
        emptyDescription={
          searchTerm || statusFilter !== 'ALL' || classFilter !== 'ALL' || subjectFilter !== 'ALL'
            ? 'No assignments match your search and filter criteria.'
            : 'You have not created any assignments yet. Click "Create Assignment" to get started.'
        }
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
            header: 'Class & Subject',
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
                      isPast && item.status === 'Published' ? 'text-rose-400 font-semibold' : 'text-slate-200'
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
              <div className="flex items-center justify-end gap-1.5">
                {/* View Submissions */}
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

                {/* Quick Publish / Draft */}
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

                {/* Edit */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(item)}
                  title="Edit assignment"
                >
                  <Edit size={14} />
                </Button>

                {/* Delete */}
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => setDeletingAssignment(item)}
                  title="Delete assignment"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={Boolean(editingAssignment)}
        onClose={() => setEditingAssignment(null)}
        title="Edit Coursework Assignment"
        description="Modify assignment questions, deadline, or points."
        size="lg"
      >
        {editingAssignment && (
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <Input
              label="Assignment Title"
              placeholder="e.g. Physics Lab Report 1: Newton's Laws"
              error={errors.title?.message}
              required
              {...register('title')}
            />

            <Textarea
              label="Detailed Instructions"
              placeholder="Describe assignment expectations, questions, and grading criteria..."
              rows={4}
              error={errors.description?.message}
              required
              {...register('description')}
            />

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
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Curriculum Subject <span className="text-rose-400">*</span>
                </label>
                <Select
                  {...register('subjectId')}
                  error={errors.subjectId?.message}
                  className="w-full"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Submission Deadline"
                type="datetime-local"
                error={errors.deadline?.message}
                required
                {...register('deadline')}
              />

              <Input
                label="Maximum Marks"
                type="number"
                min="1"
                max="1000"
                error={errors.maximumMarks?.message}
                required
                {...register('maximumMarks', { valueAsNumber: true })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingAssignment(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateMutation.isPending}
                leftIcon={<CheckCircle size={16} />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingAssignment)}
        onClose={() => setDeletingAssignment(null)}
        onConfirm={() => {
          if (deletingAssignment) {
            deleteMutation.mutate(deletingAssignment.id);
          }
        }}
        title="Delete Assignment"
        message={
          deletingAssignment
            ? `Are you sure you want to delete "${deletingAssignment.title}"? All submitted student work and evaluation history for this assignment will be permanently removed.`
            : 'Are you sure you want to delete this assignment?'
        }
        confirmText="Delete Assignment"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
export default TeacherAssignments;
