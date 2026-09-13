import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teacherAssignmentsApi, usersApi, classesApi, subjectsApi } from '../../api';
import { TeacherAssignment, CreateTeacherAssignmentRequest } from '../../types';
import { useToast } from '../../components/Toast';
import {
  createTeacherAssignmentSchema,
  CreateTeacherAssignmentFormData,
} from '../../schemas/adminSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Card, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  LinkIcon,
  Plus,
  Search,
  Trash2,
  Users,
  School,
  BookOpen,
} from '../../components/Icons';

export const AdminTeacherAssignments: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<TeacherAssignment | null>(null);

  // Queries
  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ['admin', 'teacherAssignments'],
    queryFn: () => teacherAssignmentsApi.getAll(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersApi.getAll(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Filter teachers only
  const teachers = users.filter((u) => u.role === 'Teacher');

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeacherAssignmentFormData>({
    resolver: zodResolver(createTeacherAssignmentSchema),
    defaultValues: {
      teacherId: '',
      classId: '',
      subjectId: '',
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateTeacherAssignmentRequest) => teacherAssignmentsApi.create(data),
    onSuccess: () => {
      toast.success('Teacher allocated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacherAssignments'] });
      setIsCreateOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to allocate teacher.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teacherAssignmentsApi.delete(id),
    onSuccess: () => {
      toast.success('Teacher allocation removed.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacherAssignments'] });
      setDeletingAssignment(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove allocation.');
    },
  });

  const handleOpenCreate = () => {
    reset({
      teacherId: '',
      classId: '',
      subjectId: '',
    });
    setIsCreateOpen(true);
  };

  const onSubmit = (data: CreateTeacherAssignmentFormData) => {
    const exists = assignments.some(
      (a) =>
        a.teacherId === data.teacherId &&
        a.classId === data.classId &&
        a.subjectId === data.subjectId
    );

    if (exists) {
      toast.error('This teacher is already assigned to this class and subject.');
      return;
    }

    createMutation.mutate(data);
  };

  // Helper mappings
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Filtering
  const filteredAssignments = assignments.filter((item) => {
    const teacher = teacherMap.get(item.teacherId);
    const teacherName = item.teacherName || teacher?.fullName || '';
    const teacherEmail = teacher?.email || '';
    const cls = classMap.get(item.classId);
    const className = item.className || cls?.name || '';
    const classCode = cls?.code || '';
    const sub = subjectMap.get(item.subjectId);
    const subjectName = item.subjectName || sub?.name || '';
    const subjectCode = sub?.code || '';

    const matchesSearch =
      searchTerm === '' ||
      teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacherEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeacher = teacherFilter === 'ALL' || item.teacherId === teacherFilter;
    const matchesClass = classFilter === 'ALL' || item.classId === classFilter;
    const matchesSubject = subjectFilter === 'ALL' || item.subjectId === subjectFilter;

    return matchesSearch && matchesTeacher && matchesClass && matchesSubject;
  });

  const uniqueTeachersCount = new Set(assignments.map((a) => a.teacherId)).size;
  const uniqueClassesCount = new Set(assignments.map((a) => a.classId)).size;
  const uniqueSubjectsCount = new Set(assignments.map((a) => a.subjectId)).size;

  if (assignmentsError) {
    return (
      <ErrorState
        title="Failed to load teacher allocations"
        message="Could not retrieve the teacher assignments list from the server."
        onRetry={() => refetchAssignments()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <LinkIcon className="text-cyan-400" size={28} />
            Teacher <span className="gradient-text">Allocations</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Map qualified faculty to active classroom cohorts and academic subjects.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          leftIcon={<Plus size={16} />}
        >
          Allocate Teacher
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <LinkIcon size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{assignments.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Allocations
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{uniqueTeachersCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Active Faculty
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <School size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{uniqueClassesCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Classes Covered
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">{uniqueSubjectsCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Subjects Covered
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher, class, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2 text-sm w-full"
            />
          </div>

          {/* Teacher Filter */}
          <div>
            <Select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full"
            >
              <option value="ALL">All Faculty</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </Select>
          </div>

          {/* Class Filter */}
          <div>
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </Select>
          </div>

          {/* Subject Filter */}
          <div className="flex gap-2">
            <Select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </Select>

            {(searchTerm || teacherFilter !== 'ALL' || classFilter !== 'ALL' || subjectFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTeacherFilter('ALL');
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
        isLoading={isAssignmentsLoading}
        emptyTitle="No teacher allocations found"
        emptyDescription={
          searchTerm || teacherFilter !== 'ALL' || classFilter !== 'ALL' || subjectFilter !== 'ALL'
            ? 'No allocations match your search or filter criteria.'
            : 'Get started by allocating a faculty teacher to their class and subject.'
        }
        emptyActionLabel="Allocate Teacher"
        onEmptyAction={handleOpenCreate}
        columns={[
          {
            header: 'Faculty Instructor',
            cell: (item) => {
              const teacher = teacherMap.get(item.teacherId);
              const name = item.teacherName || teacher?.fullName || 'Unknown Teacher';
              const email = teacher?.email || 'N/A';
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-semibold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">{name}</div>
                    <div className="text-xs text-slate-400">{email}</div>
                  </div>
                </div>
              );
            },
          },
          {
            header: 'Classroom',
            cell: (item) => {
              const cls = classMap.get(item.classId);
              const name = item.className || cls?.name || 'Unknown Class';
              const code = cls?.code;

              return (
                <div>
                  <div className="font-medium text-slate-200 flex items-center gap-2">
                    <School size={15} className="text-cyan-400 shrink-0" />
                    {name}
                  </div>
                  {code && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-mono bg-slate-800 text-cyan-400 rounded border border-slate-700">
                      {code}
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            header: 'Curricular Subject',
            cell: (item) => {
              const sub = subjectMap.get(item.subjectId);
              const name = item.subjectName || sub?.name || 'Unknown Subject';
              const code = sub?.code;

              return (
                <div>
                  <div className="font-medium text-slate-200 flex items-center gap-2">
                    <BookOpen size={15} className="text-purple-400 shrink-0" />
                    {name}
                  </div>
                  {code && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-mono bg-slate-800 text-purple-400 rounded border border-slate-700">
                      {code}
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            header: 'Assigned Date',
            cell: (item) => (
              <span className="text-xs text-slate-400 font-mono">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            cell: (item) => (
              <div className="flex items-center justify-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingAssignment(item)}
                  title="Remove allocation"
                  leftIcon={<Trash2 size={14} />}
                >
                  Unassign
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Allocate Teacher Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Allocate Faculty Teacher"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-slate-400">
            Select a faculty teacher and assign them to an active class and curriculum subject.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Select Faculty Teacher <span className="text-rose-400">*</span>
            </label>
            <Select
              {...register('teacherId')}
              error={errors.teacherId?.message}
              className="w-full"
            >
              <option value="">-- Choose a teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </Select>
            {teachers.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">
                No active teachers found. Create a Teacher account under "Users" first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Target Class <span className="text-rose-400">*</span>
            </label>
            <Select
              {...register('classId')}
              error={errors.classId?.message}
              className="w-full"
            >
              <option value="">-- Choose a class --</option>
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
              <option value="">-- Choose a subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              leftIcon={<LinkIcon size={16} />}
            >
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Unassign Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingAssignment)}
        onClose={() => setDeletingAssignment(null)}
        onConfirm={() => {
          if (deletingAssignment) {
            deleteMutation.mutate(deletingAssignment.id);
          }
        }}
        title="Remove Teacher Allocation"
        message={
          deletingAssignment
            ? `Are you sure you want to unassign ${
                deletingAssignment.teacherName ||
                teacherMap.get(deletingAssignment.teacherId)?.fullName ||
                'this teacher'
              } from ${
                deletingAssignment.subjectName ||
                subjectMap.get(deletingAssignment.subjectId)?.name ||
                'Subject'
              } for class ${
                deletingAssignment.className ||
                classMap.get(deletingAssignment.classId)?.name ||
                'Class'
              }? This teacher will lose permission to publish assignments or grade submissions for this class subject.`
            : 'Are you sure you want to remove this assignment?'
        }
        confirmText="Remove Allocation"
        cancelText="Keep"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
export default AdminTeacherAssignments;
