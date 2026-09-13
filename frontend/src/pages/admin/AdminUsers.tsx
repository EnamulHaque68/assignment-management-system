import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi, classesApi } from '../../api';
import { User, CreateUserRequest, UpdateUserRequest, Role } from '../../types';
import { useToast } from '../../components/Toast';
import {
  createUserSchema,
  CreateUserFormData,
  updateUserSchema,
  UpdateUserFormData,
} from '../../schemas/adminSchemas';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleBadge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  Upload
} from '../../components/Icons';
import { BatchCreateUsersRequest } from '../../types';

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchRole, setBatchRole] = useState<'Student' | 'Teacher'>('Student');
  const [batchClassId, setBatchClassId] = useState<string>('');
  const [batchRows, setBatchRows] = useState<Array<{ fullName: string; email: string; password: string }>>([
    { fullName: '', email: '', password: 'Student@123' },
    { fullName: '', email: '', password: 'Student@123' },
    { fullName: '', email: '', password: 'Student@123' },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Queries
  const {
    data: users = [],
    isLoading: isUsersLoading,
    error: usersError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersApi.getAll(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  // Form for Create User
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'Student',
      classId: '',
    },
  });

  // Form for Edit User
  const editForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: '',
      classId: '',
      isActive: true,
      password: '',
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: (newUser) => {
      toast.success(`User ${newUser.fullName} created successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      if (createAnother) {
        const currentRole = createForm.getValues('role');
        const currentClassId = createForm.getValues('classId');
        createForm.reset({
          fullName: '',
          email: '',
          password: '',
          role: currentRole,
          classId: currentClassId,
        });
      } else {
        setIsCreateOpen(false);
        createForm.reset();
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create user.');
    },
  });

  const batchCreateMutation = useMutation({
    mutationFn: (data: BatchCreateUsersRequest) => usersApi.batchCreate(data),
    onSuccess: (res) => {
      toast.success(`Batch created ${res.createdCount} users successfully!`);
      if (res.errors && res.errors.length > 0) {
        toast.error(`Some errors occurred: ${res.errors.join('; ')}`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setIsBatchOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create batch users.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (updatedUser) => {
      toast.success(`User ${updatedUser.fullName} updated.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditingUser(null);
      editForm.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update user.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeletingUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete user.');
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setCreateAnother(false);
    createForm.reset({
      fullName: '',
      email: '',
      password: '',
      role: 'Student',
      classId: classes[0]?.id || '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenBatch = (role: 'Student' | 'Teacher' = 'Student') => {
    setBatchRole(role);
    setBatchClassId(classes[0]?.id || '');
    setBatchRows([
      { fullName: '', email: '', password: `${role}@123` },
      { fullName: '', email: '', password: `${role}@123` },
      { fullName: '', email: '', password: `${role}@123` },
    ]);
    setIsBatchOpen(true);
  };

  const handleAddBatchRow = () => {
    setBatchRows((prev) => [...prev, { fullName: '', email: '', password: `${batchRole}@123` }]);
  };

  const handleRemoveBatchRow = (index: number) => {
    if (batchRows.length <= 1) {
      toast.info('At least one row is required.');
      return;
    }
    setBatchRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchRowChange = (index: number, field: 'fullName' | 'email' | 'password', val: string) => {
    setBatchRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleGeneratePasswords = () => {
    setBatchRows((prev) =>
      prev.map((row) => ({
        ...row,
        password: `${batchRole}@${Math.floor(1000 + Math.random() * 9000)}!`,
      }))
    );
    toast.success('Generated secure passwords for all rows!');
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = batchRows.filter((r) => r.fullName.trim() && r.email.trim() && r.password.trim());
    if (validRows.length === 0) {
      toast.error('Please fill at least one row with name, email, and password.');
      return;
    }
    if (batchRole === 'Student' && !batchClassId) {
      toast.error('Please select a target classroom for students.');
      return;
    }

    const payload: BatchCreateUsersRequest = {
      users: validRows.map((r) => ({
        fullName: r.fullName.trim(),
        email: r.email.trim(),
        password: r.password.trim(),
        role: batchRole,
        classId: batchRole === 'Student' ? batchClassId : null,
      })),
    };

    batchCreateMutation.mutate(payload);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      fullName: user.fullName,
      classId: user.classId || '',
      isActive: user.isActive,
      password: '',
    });
  };

  const handleToggleActive = async (user: User) => {
    updateMutation.mutate({
      id: user.id,
      data: {
        fullName: user.fullName,
        classId: user.classId,
        isActive: !user.isActive,
      },
    });
  };

  const onCreateSubmit = (data: CreateUserFormData) => {
    createMutation.mutate({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role as Role,
      classId: data.role === 'Student' ? data.classId : null,
    });
  };

  const onEditSubmit = (data: UpdateUserFormData) => {
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: {
        fullName: data.fullName,
        classId: editingUser.role === 'Student' ? data.classId : null,
        isActive: data.isActive,
        password: data.password ? data.password : null,
      },
    });
  };

  // Filtered dataset
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive) ||
      (statusFilter === 'INACTIVE' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getClassName = (classId?: string | null) => {
    if (!classId) return '—';
    const found = classes.find((c) => c.id === classId);
    return found ? `${found.name} (${found.code})` : classId;
  };

  if (usersError) {
    return (
      <ErrorState
        title="Failed to load users"
        message="Could not load the user directory from the API."
        onRetry={() => refetch()}
      />
    );
  }

  const selectedRoleInCreate = createForm.watch('role');

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            User <span className="gradient-text">Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, view, update, and manage accounts for students, instructors, and administrators.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            id="btn-batch-user"
            variant="secondary"
            size="md"
            leftIcon={<Users size={16} />}
            onClick={() => handleOpenBatch('Student')}
          >
            Add Multiple Users
          </Button>
          <Button
            id="btn-create-user"
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={handleOpenCreate}
          >
            Create Single User
          </Button>
        </div>
      </div>

      {/* Quick Role Badges / Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            roleFilter === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          All Accounts
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setRoleFilter('Student')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            roleFilter === 'Student'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Students
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            {users.filter((u) => u.role === 'Student').length}
          </span>
        </button>
        <button
          onClick={() => setRoleFilter('Teacher')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            roleFilter === 'Teacher'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Instructors / Teachers
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-purple-950 text-purple-400 border border-purple-800/40">
            {users.filter((u) => u.role === 'Teacher').length}
          </span>
        </button>
        <button
          onClick={() => setRoleFilter('Admin')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            roleFilter === 'Admin'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Administrators
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-950 text-rose-400 border border-rose-800/40">
            {users.filter((u) => u.role === 'Admin').length}
          </span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field !pl-10 !py-2 text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-field !py-2 text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="Admin">Admins</option>
            <option value="Teacher">Teachers</option>
            <option value="Student">Students</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field !py-2 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'User',
            cell: (u) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0 shadow-sm">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                  ) : (
                    u.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{u.fullName}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </div>
              </div>
            ),
          },
          {
            header: 'Role',
            cell: (u) => <RoleBadge role={u.role} />,
          },
          {
            header: 'Classroom',
            cell: (u) => (
              <span className="text-xs text-slate-300">
                {u.role === 'Student' ? getClassName(u.classId) : 'N/A'}
              </span>
            ),
          },
          {
            header: 'Status',
            cell: (u) => (
              <button
                onClick={() => handleToggleActive(u)}
                disabled={updateMutation.isPending}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  u.isActive
                    ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                    : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30'
                }`}
                title="Click to toggle active/inactive status"
              >
                {u.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                <span>{u.isActive ? 'Active' : 'Inactive'}</span>
              </button>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            cell: (u) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingUser(u)}
                  title="View User Details"
                >
                  <Eye size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(u)}
                  title="Edit User"
                >
                  <Edit size={15} />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => setDeletingUser(u)}
                  title="Delete User"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredUsers}
        isLoading={isUsersLoading}
        keyExtractor={(u) => u.id}
        emptyTitle="No users found"
        emptyDescription={
          searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
            ? 'No users match the search criteria. Try clearing filters.'
            : 'No users exist in the system yet. Click below to add the first user.'
        }
        emptyActionLabel="Create User"
        onEmptyAction={handleOpenCreate}
      />

      {/* Modal: Create User */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User"
        description="Add a new administrator, instructor, or student to the system."
        size="md"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Marie Curie"
            leftIcon={<UserIcon size={16} />}
            error={createForm.formState.errors.fullName?.message}
            required
            {...createForm.register('fullName')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="marie.curie@assignment.local"
            leftIcon={<Mail size={16} />}
            error={createForm.formState.errors.email?.message}
            required
            {...createForm.register('email')}
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="Minimum 6 characters"
            leftIcon={<Lock size={16} />}
            error={createForm.formState.errors.password?.message}
            required
            {...createForm.register('password')}
          />

          <Select
            label="Account Role"
            error={createForm.formState.errors.role?.message}
            required
            {...createForm.register('role')}
          >
            <option value="Student">Student (Enrolled in Class)</option>
            <option value="Teacher">Teacher (Coursework Instructor)</option>
            <option value="Admin">Administrator (System Manager)</option>
          </Select>

          {selectedRoleInCreate === 'Student' && (
            <Select
              label="Assigned Classroom"
              placeholder="Select a class..."
              error={createForm.formState.errors.classId?.message}
              required
              {...createForm.register('classId')}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </Select>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
              />
              <span>Keep modal open & create another user</span>
            </label>
          </div>

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
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Batch Create Users */}
      <Modal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        title={`Batch Create ${batchRole === 'Student' ? 'Students' : 'Teachers'}`}
        description="Quickly create multiple student or teacher accounts with one click."
        size="lg"
      >
        <form onSubmit={handleBatchSubmit} className="space-y-5">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Target Role
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenBatch('Student')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    batchRole === 'Student'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenBatch('Teacher')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    batchRole === 'Teacher'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Teachers
                </button>
              </div>
            </div>

            {batchRole === 'Student' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Assign Classroom (For all students)
                </label>
                <select
                  value={batchClassId}
                  onChange={(e) => setBatchClassId(e.target.value)}
                  className="select-field !py-2 text-xs w-full"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={handleAddBatchRow}
              >
                Add Row
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBatchRows((prev) => [
                    ...prev,
                    { fullName: '', email: '', password: `${batchRole}@123` },
                    { fullName: '', email: '', password: `${batchRole}@123` },
                  ]);
                }}
              >
                +2 Rows
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={handleGeneratePasswords}
            >
              Auto-generate Passwords
            </Button>
          </div>

          {/* Dynamic Users Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Password</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                {batchRows.map((row, index) => (
                  <tr key={index} className="hover:bg-white/[0.02]">
                    <td className="p-3 text-slate-500 font-mono">{index + 1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="e.g. Maya Lin"
                        value={row.fullName}
                        onChange={(e) => handleBatchRowChange(index, 'fullName', e.target.value)}
                        className="input-field !py-1.5 !px-2.5 text-xs w-full"
                        required
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="email"
                        placeholder="maya@school.edu"
                        value={row.email}
                        onChange={(e) => handleBatchRowChange(index, 'email', e.target.value)}
                        className="input-field !py-1.5 !px-2.5 text-xs w-full"
                        required
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Password"
                        value={row.password}
                        onChange={(e) => handleBatchRowChange(index, 'password', e.target.value)}
                        className="input-field !py-1.5 !px-2.5 text-xs w-full font-mono"
                        required
                      />
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchRow(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Total to create:{' '}
              <strong className="text-slate-200">
                {batchRows.filter((r) => r.fullName.trim() && r.email.trim()).length}
              </strong>{' '}
              users
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsBatchOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={batchCreateMutation.isPending}
                leftIcon={<Users size={16} />}
              >
                Create All {batchRows.length} Users
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.fullName}`}
        description="Update user display details, assigned classroom, or reset password."
        size="md"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            error={editForm.formState.errors.fullName?.message}
            required
            {...editForm.register('fullName')}
          />

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <strong>Email Address: </strong>
            <span className="text-slate-200">{editingUser?.email}</span> (Permanent identifier)
          </div>

          {editingUser?.role === 'Student' && (
            <Select
              label="Assigned Classroom"
              placeholder="Select a class..."
              error={editForm.formState.errors.classId?.message}
              {...editForm.register('classId')}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </Select>
          )}

          <div className="input-group">
            <label className="input-label">Account Status</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                  {...editForm.register('isActive')}
                />
                <span>Active Account (Permit Login)</span>
              </label>
            </div>
          </div>

          <Input
            label="Reset Password (Optional)"
            type="password"
            placeholder="Leave blank to keep existing password"
            leftIcon={<Lock size={16} />}
            helperText="Only supply a value if you wish to overwrite the user's password."
            error={editForm.formState.errors.password?.message}
            {...editForm.register('password')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditingUser(null)}
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

      {/* Modal: View User Details */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="User Account Details"
        size="sm"
      >
        {viewingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-lg text-slate-950">
                {viewingUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-base">{viewingUser.fullName}</h4>
                <RoleBadge role={viewingUser.role} />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-slate-200">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <span className={viewingUser.isActive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {viewingUser.isActive ? 'Active (Can login)' : 'Inactive (Login blocked)'}
                </span>
              </div>
              {viewingUser.role === 'Student' && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Classroom:</span>
                  <span className="font-medium text-cyan-400">{getClassName(viewingUser.classId)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Registered:</span>
                <span className="font-medium text-slate-300">
                  {new Date(viewingUser.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Database ID:</span>
                <span className="font-mono text-slate-400 text-[11px]">{viewingUser.id}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete User */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) deleteMutation.mutate(deletingUser.id);
        }}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${deletingUser?.fullName}" (${deletingUser?.email})? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
