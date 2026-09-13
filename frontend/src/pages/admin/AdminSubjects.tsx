import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectsApi } from '../../api';
import { SubjectItem, UpsertSubjectRequest } from '../../types';
import { useToast } from '../../components/Toast';
import { upsertSubjectSchema, UpsertSubjectFormData } from '../../schemas/adminSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import { BookOpen, Plus, Search, Edit, Trash2 } from '../../components/Icons';

export const AdminSubjects: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null);

  // Queries
  const {
    data: subjects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Forms
  const createForm = useForm<UpsertSubjectFormData>({
    resolver: zodResolver(upsertSubjectSchema),
    defaultValues: { name: '', code: '', description: '', isActive: true },
  });

  const editForm = useForm<UpsertSubjectFormData>({
    resolver: zodResolver(upsertSubjectSchema),
    defaultValues: { name: '', code: '', description: '', isActive: true },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: UpsertSubjectRequest) => subjectsApi.create(data),
    onSuccess: (newSub) => {
      toast.success(`Subject "${newSub.name}" created successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create subject.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpsertSubjectRequest }) =>
      subjectsApi.update(id, data),
    onSuccess: (updated) => {
      toast.success(`Subject "${updated.name}" updated.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      setEditingSubject(null);
      editForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update subject.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.delete(id),
    onSuccess: () => {
      toast.success('Subject deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      setDeletingSubject(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete subject.');
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    createForm.reset({ name: '', code: '', description: '', isActive: true });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (s: SubjectItem) => {
    setEditingSubject(s);
    editForm.reset({
      name: s.name,
      code: s.code,
      description: s.description || '',
      isActive: s.isActive,
    });
  };

  const onCreateSubmit = (data: UpsertSubjectFormData) => {
    createMutation.mutate({
      name: data.name,
      code: data.code,
      description: data.description || null,
      isActive: data.isActive,
    });
  };

  const onEditSubmit = (data: UpsertSubjectFormData) => {
    if (!editingSubject) return;
    updateMutation.mutate({
      id: editingSubject.id,
      data: {
        name: data.name,
        code: data.code,
        description: data.description || null,
        isActive: data.isActive,
      },
    });
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <ErrorState
        title="Failed to load subjects"
        message="Could not retrieve curriculum subject data from the API."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Curriculum <span className="gradient-text">Subjects</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure academic courses, modules, and institutional syllabus codes.
          </p>
        </div>

        <Button
          id="btn-create-subject"
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={handleOpenCreate}
        >
          Add Subject
        </Button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects by name or syllabus code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field !pl-10 !py-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Subject Title',
            cell: (s) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.description || 'No description provided'}</div>
                </div>
              </div>
            ),
          },
          {
            header: 'Syllabus Code',
            cell: (s) => (
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-purple-400 border border-slate-700">
                {s.code}
              </span>
            ),
          },
          {
            header: 'Status',
            cell: (s) => (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  s.isActive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            header: 'Created Date',
            cell: (s) => (
              <span className="text-xs text-slate-400">
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            cell: (s) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(s)}
                  title="Edit Subject"
                >
                  <Edit size={15} />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => setDeletingSubject(s)}
                  title="Delete Subject"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredSubjects}
        isLoading={isLoading}
        keyExtractor={(s) => s.id}
        emptyTitle="No subjects configured"
        emptyDescription="Add curriculum subjects to enable teachers to create assignments."
        emptyActionLabel="Add Subject"
        onEmptyAction={handleOpenCreate}
      />

      {/* Modal: Create Subject */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Subject"
        description="Register an academic subject in the curriculum."
        size="sm"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Distributed Systems"
            error={createForm.formState.errors.name?.message}
            required
            {...createForm.register('name')}
          />

          <Input
            label="Syllabus Code"
            placeholder="e.g. CS-402"
            error={createForm.formState.errors.code?.message}
            required
            {...createForm.register('code')}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Syllabus scope and topic outline..."
            rows={3}
            error={createForm.formState.errors.description?.message}
            {...createForm.register('description')}
          />

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200 pt-1">
            <input
              type="checkbox"
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
              {...createForm.register('isActive')}
            />
            <span>Active Subject</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
            >
              Create Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Subject */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title={`Edit Subject: ${editingSubject?.name}`}
        description="Update subject syllabus details or status."
        size="sm"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Subject Name"
            error={editForm.formState.errors.name?.message}
            required
            {...editForm.register('name')}
          />

          <Input
            label="Syllabus Code"
            error={editForm.formState.errors.code?.message}
            required
            {...editForm.register('code')}
          />

          <Textarea
            label="Description (Optional)"
            rows={3}
            error={editForm.formState.errors.description?.message}
            {...editForm.register('description')}
          />

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200 pt-1">
            <input
              type="checkbox"
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
              {...editForm.register('isActive')}
            />
            <span>Active Subject</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditingSubject(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Subject */}
      <ConfirmDialog
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={() => {
          if (deletingSubject) deleteMutation.mutate(deletingSubject.id);
        }}
        title="Delete Curriculum Subject"
        message={`Are you sure you want to delete subject "${deletingSubject?.name}" (${deletingSubject?.code})?`}
        confirmText="Delete Subject"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
