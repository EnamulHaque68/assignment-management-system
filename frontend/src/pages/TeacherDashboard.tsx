import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Assignment, Submission, TeacherAssignment, ClassItem, SubjectItem } from '../types';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Send,
  FileCheck,
  Calendar,
  Award,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  X,
  FileText
} from '../components/Icons';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherAllocations, setTeacherAllocations] = useState<TeacherAssignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [filter, setFilter] = useState<'All' | 'Published' | 'Draft'>('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Submissions review drawer / modal
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<Submission | null>(null);
  const [evaluationData, setEvaluationData] = useState({ marks: 0, feedback: '', status: 'Reviewed' as 'Reviewed' | 'Rejected' });

  // Create/Edit form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    deadline: '',
    maximumMarks: 100,
    status: 'Published' as 'Draft' | 'Published',
  });

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [assigns, allocs, cls, subs] = await Promise.all([
        api.getAssignments(),
        api.getTeacherAssignments(),
        api.getClasses(),
        api.getSubjects(),
      ]);
      setAssignments(assigns);
      setTeacherAllocations(allocs);
      setClasses(cls);
      setSubjects(subs);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load teacher workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    // Auto-select first class and subject from allocations if available
    const myAllocs = teacherAllocations.filter((ta) => ta.teacherId === user?.userId);
    const defaultClass = myAllocs[0]?.classId || classes[0]?.id || '';
    const defaultSub = myAllocs[0]?.subjectId || subjects[0]?.id || '';

    // Default deadline 7 days from now
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isoString = nextWeek.toISOString().slice(0, 16);

    setFormData({
      title: '',
      description: '',
      classId: defaultClass,
      subjectId: defaultSub,
      deadline: isoString,
      maximumMarks: 100,
      status: 'Published',
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (a: Assignment) => {
    setEditingAssignment(a);
    const deadlineFormatted = new Date(a.deadline).toISOString().slice(0, 16);
    setFormData({
      title: a.title,
      description: a.description,
      classId: a.classId,
      subjectId: a.subjectId,
      deadline: deadlineFormatted,
      maximumMarks: a.maximumMarks,
      status: a.status,
    });
    setShowCreateModal(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId) {
      toast.error('Please specify both class and subject');
      return;
    }

    try {
      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, {
          title: formData.title,
          description: formData.description,
          deadline: new Date(formData.deadline).toISOString(),
          maximumMarks: Number(formData.maximumMarks),
        });
        toast.success('Assignment updated');
      } else {
        await api.createAssignment({
          title: formData.title,
          description: formData.description,
          classId: formData.classId,
          subjectId: formData.subjectId,
          deadline: new Date(formData.deadline).toISOString(),
          maximumMarks: Number(formData.maximumMarks),
          status: formData.status,
        });
        toast.success('Assignment created successfully');
      }
      setShowCreateModal(false);
      loadTeacherData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleTogglePublish = async (a: Assignment) => {
    try {
      if (a.status === 'Draft') {
        await api.publishAssignment(a.id);
        toast.success(`Published "${a.title}"`);
      } else {
        await api.draftAssignment(a.id);
        toast.success(`Set "${a.title}" to Draft`);
      }
      loadTeacherData();
    } catch (err: any) {
      toast.error(err.message || 'Status change failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.deleteAssignment(id);
      toast.success('Assignment deleted');
      loadTeacherData();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // View Submissions for an assignment
  const handleOpenSubmissions = async (a: Assignment) => {
    setSelectedAssignmentForReview(a);
    try {
      const subs = await api.getAssignmentSubmissions(a.id);
      setSubmissions(subs);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch student submissions');
    }
  };

  const handleOpenGradeModal = (sub: Submission) => {
    setEvaluatingSubmission(sub);
    setEvaluationData({
      marks: sub.marks ?? (selectedAssignmentForReview?.maximumMarks ? Math.floor(selectedAssignmentForReview.maximumMarks * 0.8) : 80),
      feedback: sub.feedback ?? 'Great effort! Well articulated response.',
      status: 'Reviewed',
    });
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingSubmission || !selectedAssignmentForReview) return;

    if (evaluationData.marks > selectedAssignmentForReview.maximumMarks) {
      toast.error(`Marks cannot exceed maximum marks (${selectedAssignmentForReview.maximumMarks})!`);
      return;
    }
    if (evaluationData.marks < 0) {
      toast.error('Marks cannot be negative.');
      return;
    }

    try {
      await api.reviewSubmission(evaluatingSubmission.id, {
        marks: Number(evaluationData.marks),
        feedback: evaluationData.feedback,
        status: evaluationData.status,
      });
      toast.success('Grade & feedback submitted!');
      setEvaluatingSubmission(null);
      // Reload submissions
      const updated = await api.getAssignmentSubmissions(selectedAssignmentForReview.id);
      setSubmissions(updated);
    } catch (err: any) {
      toast.error(err.message || 'Review failed');
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'All') return true;
    return a.status === filter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
            Teacher <span className="gradient-text">Studio</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Publish tasks, set deadlines, and grade student submissions.
          </p>
        </div>

        <button
          id="teacher-create-assignment-btn"
          onClick={handleOpenCreate}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Teacher's Assigned Classes / Subjects Notice */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderColor: 'rgba(168, 85, 247, 0.25)',
          background: 'rgba(168, 85, 247, 0.05)',
        }}
      >
        <BookOpen size={20} color="#c084fc" />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Your Teaching Allocations: </strong>
          {teacherAllocations.filter((ta) => ta.teacherId === user?.userId).length === 0 ? (
            <span>All system classes (Demo / Admin override enabled)</span>
          ) : (
            teacherAllocations
              .filter((ta) => ta.teacherId === user?.userId)
              .map((ta) => `${ta.className || 'Class'} (${ta.subjectName || 'Subject'})`)
              .join(', ')
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {(['All', 'Published', 'Draft'] as const).map((t) => (
          <button
            key={t}
            className={`tab-button ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            <span>{t} Assignments</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {t === 'All' ? assignments.length : assignments.filter((a) => a.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}
        >
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No assignments found</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Click "New Assignment" to create a task for your students.
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredAssignments.map((a) => (
            <div key={a.id} className="glass-panel assignment-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span className={`badge badge-${a.status.toLowerCase()}`}>
                    {a.status}
                  </span>
                  <span className="badge badge-teacher">{a.subjectName}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{a.title}</h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {a.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Class:</span>
                    <strong style={{ color: 'var(--cyan)' }}>{a.className}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Max Score:</span>
                    <strong style={{ color: 'var(--emerald)' }}>{a.maximumMarks} pts</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Deadline:</span>
                    <span>{new Date(a.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenSubmissions(a)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Eye size={15} />
                    <span>Submissions</span>
                  </button>

                  <button
                    onClick={() => handleTogglePublish(a)}
                    className={`btn ${a.status === 'Draft' ? 'btn-emerald' : 'btn-secondary'} btn-sm`}
                    title={a.status === 'Draft' ? 'Publish Assignment' : 'Revert to Draft'}
                  >
                    {a.status === 'Draft' ? <Send size={15} /> : <FileCheck size={15} />}
                    <span>{a.status === 'Draft' ? 'Publish' : 'Draft'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="btn btn-secondary btn-icon"
                    title="Edit Assignment"
                  >
                    <Edit size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="btn btn-danger btn-icon"
                    title="Delete Assignment"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Assignment */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment}>
              <div className="input-group">
                <label className="input-label">Assignment Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Algorithms & Data Structures Homework #1"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Instructions / Description</label>
                <textarea
                  required
                  className="textarea-field"
                  placeholder="Describe the problem statement, deliverables, and guidelines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Target Class</label>
                  <select
                    disabled={!!editingAssignment}
                    required
                    className="select-field"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  >
                    <option value="">Choose Class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.section ? `(${c.section})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <select
                    disabled={!!editingAssignment}
                    required
                    className="select-field"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  >
                    <option value="">Choose Subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    className="input-field"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Maximum Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    className="input-field"
                    value={formData.maximumMarks}
                    onChange={(e) => setFormData({ ...formData, maximumMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              {!editingAssignment && (
                <div className="input-group">
                  <label className="input-label">Initial State</label>
                  <select
                    className="select-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Draft' | 'Published' })}
                  >
                    <option value="Published">Publish Immediately (Visible to Students)</option>
                    <option value="Draft">Save as Draft (Private)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Review Modal */}
      {selectedAssignmentForReview && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content" style={{ maxWidth: '840px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Student Submissions</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {selectedAssignmentForReview.title} • {selectedAssignmentForReview.className} (Max: {selectedAssignmentForReview.maximumMarks} pts)
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignmentForReview(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {submissions.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No submissions received yet for this assignment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {sub.studentName || 'Student'}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          {sub.updatedAt && ` (Edited: ${new Date(sub.updatedAt).toLocaleString()})`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge badge-${sub.status.toLowerCase()}`}>
                          {sub.status}
                        </span>
                        {sub.marks !== undefined && sub.marks !== null && (
                          <span
                            className="badge"
                            style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}
                          >
                            <Award size={12} /> {sub.marks} / {selectedAssignmentForReview.maximumMarks}
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenGradeModal(sub)}
                          className="btn btn-secondary btn-sm"
                        >
                          Grade / Review
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        padding: '14px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: '#cbd5e1',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        borderLeft: '3px solid var(--cyan)',
                      }}
                    >
                      {sub.content}
                    </div>

                    {sub.feedback && (
                      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#c084fc' }}>
                        <strong>Teacher Feedback: </strong> {sub.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade / Review Submission Modal */}
      {evaluatingSubmission && (
        <div className="modal-backdrop" style={{ zIndex: 250 }}>
          <div className="glass-panel modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Grade Submission</h3>
              <button
                onClick={() => setEvaluatingSubmission(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation}>
              <div className="input-group">
                <label className="input-label">
                  Marks (Out of {selectedAssignmentForReview?.maximumMarks || 100})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignmentForReview?.maximumMarks || 100}
                  required
                  className="input-field"
                  value={evaluationData.marks}
                  onChange={(e) => setEvaluationData({ ...evaluationData, marks: Number(e.target.value) })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Decision Status</label>
                <select
                  className="select-field"
                  value={evaluationData.status}
                  onChange={(e) => setEvaluationData({ ...evaluationData, status: e.target.value as any })}
                >
                  <option value="Reviewed">Reviewed & Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Teacher Feedback</label>
                <textarea
                  className="textarea-field"
                  placeholder="Provide constructive feedback and pointers for improvement..."
                  value={evaluationData.feedback}
                  onChange={(e) => setEvaluationData({ ...evaluationData, feedback: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setEvaluatingSubmission(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
