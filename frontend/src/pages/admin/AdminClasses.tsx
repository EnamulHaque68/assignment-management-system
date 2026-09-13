import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classesApi } from '../../api';
import { ClassItem, UpsertClassRequest } from '../../types';
import { useToast } from '../../components/Toast';
import { upsertClassSchema, UpsertClassFormData } from '../../schemas/adminSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import { School, Plus, Search, Edit, Trash2 } from '../../components/Icons';

export const AdminClasses: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);

  // Queries
  const {
    data: classes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  // Forms
  const createForm = useForm<UpsertClassFormData>({
    resolver: zodResolver(upsertClassSchema),
    defaultValues: { name: '', code: '', description: '', isActive: true },
  });

  const editForm = useForm<UpsertClassFormData>({
    resolver: zodResolver(upsertClassSchema),
    defaultValues: { name: '', code: '', description: '', isActive: true },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: UpsertClassRequest) => classesApi.create(data),
    onSuccess: (newClass) => {
      toast.success(`Class "${newClass.name}" created successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create class.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpsertClassRequest }) =>
      classesApi.update(id, data),
    onSuccess: (updated) => {
      toast.success(`Class "${updated.name}" updated.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
      setEditingClass(null);
      editForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update class.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => {
      toast.success('Class deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
      setDeletingClass(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete class.');
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    createForm.reset({ name: '', code: '', description: '', isActive: true });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    editForm.reset({
      name: c.name,
      code: c.code,
      description: c.description || '',
      isActive: c.isActive,
    });
  };

  const onCreateSubmit = (data: UpsertClassFormData) => {
    createMutation.mutate({
      name: data.name,
      code: data.code,
      description: data.description || null,
      isActive: data.isActive,
    });
  };

  const onEditSubmit = (data: UpsertClassFormData) => {
    if (!editingClass) return;
    updateMutation.mutate({
      id: editingClass.id,
      data: {
        name: data.name,
        code: data.code,
        description: data.description || null,
        isActive: data.isActive,
      },
    });
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <ErrorState
        title="Failed to load classes"
        message="Could not load classroom data from the backend API."
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
            Class <span className="gradient-text">Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure student classroom cohorts, sections, and academic year codes.
          </p>
        </div>

        <Button
          id="btn-create-class"
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={handleOpenCreate}
        >
          Add Class
        </Button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes by name or code..."
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
            header: 'Classroom Name',
            cell: (c) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  <School size={16} />
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.description || 'No description'}</div>
                </div>
              </div>
            ),
          },
          {
            header: 'Class Code',
            cell: (c) => (
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                {c.code}
              </span>
            ),
          },
          {
            header: 'Status',
            cell: (c) => (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  c.isActive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {c.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            header: 'Created Date',
            cell: (c) => (
              <span className="text-xs text-slate-400">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            cell: (c) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(c)}
                  title="Edit Class"
                >
                  <Edit size={15} />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => setDeletingClass(c)}
                  title="Delete Class"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredClasses}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        emptyTitle="No classes registered"
        emptyDescription="Create your first classroom cohort to begin assigning students."
        emptyActionLabel="Add Class"
        onEmptyAction={handleOpenCreate}
      />

      {/* Modal: Create Class */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Classroom"
        description="Register an academic classroom cohort."
        size="sm"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <Input
            label="Class Name"
            placeholder="e.g. Grade 10 - Section A"
            error={createForm.formState.errors.name?.message}
            required
            {...createForm.register('name')}
          />

          <Input
            label="Class Code"
            placeholder="e.g. G10-A"
            error={createForm.formState.errors.code?.message}
            required
            {...createForm.register('code')}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Additional notes about this class cohort..."
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
            <span>Active Class</span>
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
              Create Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Class */}
      <Modal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title={`Edit Class: ${editingClass?.name}`}
        description="Update class information or status."
        size="sm"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Class Name"
            error={editForm.formState.errors.name?.message}
            required
            {...editForm.register('name')}
          />

          <Input
            label="Class Code"
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
            <span>Active Class</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditingClass(null)}
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

      {/* Confirmation Dialog: Delete Class */}
      <ConfirmDialog
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        onConfirm={() => {
          if (deletingClass) deleteMutation.mutate(deletingClass.id);
        }}
        title="Delete Classroom"
        message={`Are you sure you want to delete classroom "${deletingClass?.name}" (${deletingClass?.code})?`}
        confirmText="Delete Class"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
