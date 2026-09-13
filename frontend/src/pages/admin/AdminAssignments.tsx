import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assignmentsApi, classesApi, subjectsApi } from '../../api';
import { Assignment } from '../../types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  FileText,
  Search,
  Eye,
  School,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Users,
  AlertCircle,
  CheckCircle,
} from '../../components/Icons';

export const AdminAssignments: React.FC = () => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // Modal state
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);

  // Queries
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'assignments'],
    queryFn: () => assignmentsApi.getAll(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: () => classesApi.getAll(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Calculate Metrics
  const totalCount = assignments.length;
  const publishedCount = assignments.filter((a) => a.status === 'Published').length;
  const draftCount = assignments.filter((a) => a.status === 'Draft').length;
  const pastDeadlineCount = assignments.filter(
    (a) => a.status === 'Published' && new Date(a.deadline) < new Date()
  ).length;

  // Filtered list
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || item.classId === classFilter;
    const matchesSubject = subjectFilter === 'ALL' || item.subjectId === subjectFilter;

    return matchesSearch && matchesStatus && matchesClass && matchesSubject;
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load assignments"
        message="Could not retrieve the system assignments catalog from the server."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <FileText className="text-cyan-400" size={28} />
            Institutional <span className="gradient-text">Assignments</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide overview and audit of coursework published by faculty across all classes and subjects.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
          <AlertCircle size={15} className="text-cyan-400" />
          <span>Faculty managed • Read-only audit</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{totalCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Coursework
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{publishedCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Published & Active
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{draftCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Faculty Drafts
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400">{pastDeadlineCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Past Deadline
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, teacher, class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-10 !py-2 text-sm w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
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

            {(searchTerm || statusFilter !== 'ALL' || classFilter !== 'ALL' || subjectFilter !== 'ALL') && (
              <Button
                variant="outline"
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
            ? 'No assignments match your filter criteria.'
            : 'Faculty instructors have not yet created any coursework assignments.'
        }
        columns={[
          {
            header: 'Assignment Title',
            cell: (item) => (
              <div className="max-w-xs sm:max-w-sm">
                <div className="font-semibold text-slate-100 line-clamp-1">{item.title}</div>
                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {item.description || 'No description provided'}
                </div>
              </div>
            ),
          },
          {
            header: 'Class & Subject',
            cell: (item) => (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                  <School size={14} className="text-cyan-400" />
                  <span>{item.className}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <BookOpen size={14} className="text-purple-400" />
                  <span>{item.subjectName}</span>
                </div>
              </div>
            ),
          },
          {
            header: 'Instructor',
            cell: (item) => {
              const initials = item.teacherName
                ? item.teacherName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'T';

              return (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-semibold text-xs flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-slate-200">{item.teacherName}</span>
                </div>
              );
            },
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
                      isPast && item.status === 'Published' ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {deadlineDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            },
          },
          {
            header: 'Max Marks',
            cell: (item) => (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                <Award size={13} />
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
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingAssignment(item)}
                  leftIcon={<Eye size={15} />}
                  className="text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                >
                  Inspect
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Assignment Details Modal */}
      <Modal
        isOpen={Boolean(viewingAssignment)}
        onClose={() => setViewingAssignment(null)}
        title="Assignment Details"
        size="lg"
      >
        {viewingAssignment && (
          <div className="space-y-6">
            {/* Header & Status */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{viewingAssignment.title}</h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>
                    Created: {new Date(viewingAssignment.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    Updated: {new Date(viewingAssignment.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <StatusBadge status={viewingAssignment.status} />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Class</span>
                <p className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <School size={14} className="text-cyan-400" />
                  {viewingAssignment.className}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Subject</span>
                <p className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-purple-400" />
                  {viewingAssignment.subjectName}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Instructor</span>
                <p className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <Users size={14} className="text-indigo-400" />
                  {viewingAssignment.teacherName}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Max Marks</span>
                <p className="text-sm font-semibold text-cyan-400 mt-0.5 flex items-center gap-1.5">
                  <Award size={14} />
                  {viewingAssignment.maximumMarks} Points
                </p>
              </div>
            </div>

            {/* Deadline Banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
              <Calendar size={18} className="text-cyan-400 shrink-0" />
              <div>
                <span className="font-semibold">Submission Deadline: </span>
                <span>
                  {new Date(viewingAssignment.deadline).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* Description / Instructions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Assignment Instructions</h3>
              <div className="p-4 rounded-xl bg-slate-900 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans border border-slate-800 select-text">
                {viewingAssignment.description || 'No detailed instructions provided.'}
              </div>
            </div>

            {/* Admin Notice */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2">
              <AlertCircle size={15} className="text-slate-500 shrink-0 mt-0.5" />
              <span>
                Note for Administrators: Coursework content and grading are maintained by the assigned
                faculty member (<strong>{viewingAssignment.teacherName}</strong>). Administrative access
                is read-only for audit compliance.
              </span>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingAssignment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminAssignments;
