import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Assignment, Submission } from '../types';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Edit3,
  X,
  Sparkles
} from '../components/Icons';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [assigns, mySubs] = await Promise.all([
        api.getAssignments(),
        api.getMySubmissions(),
      ]);
      setAssignments(assigns);
      setSubmissions(mySubs);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const handleOpenSubmit = (assignment: Assignment, existing?: Submission) => {
    setActiveAssignment(assignment);
    setExistingSubmission(existing || null);
    setSubmissionContent(existing ? existing.content : '');
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !submissionContent.trim()) {
      toast.error('Please provide your answer content.');
      return;
    }

    setSubmitting(true);
    try {
      if (existingSubmission) {
        await api.updateSubmission(existingSubmission.id, submissionContent);
        toast.success('Your submission has been updated!');
      } else {
        await api.createSubmission(activeAssignment.id, submissionContent);
        toast.success('Assignment submitted successfully!');
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#a855f7', '#10b981'],
        });
      }
      setActiveAssignment(null);
      loadStudentData();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to determine if deadline has passed
  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline).getTime() < Date.now();
  };

  // Helper for deadline countdown string
  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'Deadline passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
          Student <span className="gradient-text">Portal</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View published assignments for your class, track deadlines, and submit your coursework.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}>
            <FileText size={26} />
          </div>
          <div>
            <div className="stat-val">{assignments.length}</div>
            <div className="stat-label">Available Tasks</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-val">{submissions.length}</div>
            <div className="stat-label">Completed Submissions</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple)' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="stat-val">
              {submissions.filter((s) => s.status === 'Reviewed').length}
            </div>
            <div className="stat-label">Reviewed & Graded</div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Your Class Assignments</h2>

        {assignments.length === 0 ? (
          <div
            className="glass-panel"
            style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}
          >
            <GraduationCap size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <h3>No assignments active right now</h3>
            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
              Check back soon when your teachers publish coursework.
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {assignments.map((assignment) => {
              const mySub = submissions.find((s) => s.assignmentId === assignment.id);
              const pastDeadline = isDeadlinePassed(assignment.deadline);

              return (
                <div key={assignment.id} className="glass-panel assignment-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span className="badge badge-student">{assignment.subjectName}</span>
                      <span
                        className="countdown-badge"
                        style={{
                          color: pastDeadline ? '#f87171' : 'var(--cyan)',
                          borderColor: pastDeadline ? 'rgba(244,63,94,0.3)' : 'rgba(0,240,255,0.3)',
                        }}
                      >
                        <Clock size={12} />
                        {getTimeRemaining(assignment.deadline)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{assignment.title}</h3>
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
                      {assignment.description}
                    </p>
                  </div>

                  <div>
                    {/* Meta info box */}
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
                        <span style={{ color: 'var(--text-muted)' }}>Teacher:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{assignment.teacherName}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Max Score:</span>
                        <strong style={{ color: 'var(--emerald)' }}>{assignment.maximumMarks} pts</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Deadline:</span>
                        <span>{new Date(assignment.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Submission status or feedback */}
                    {mySub ? (
                      <div
                        style={{
                          background: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: '10px',
                          padding: '12px',
                          marginBottom: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className={`badge badge-${mySub.status.toLowerCase()}`}>
                            {mySub.status}
                          </span>
                          {mySub.marks !== undefined && mySub.marks !== null && (
                            <span style={{ fontWeight: 700, color: 'var(--cyan)', fontSize: '0.9rem' }}>
                              Score: {mySub.marks} / {assignment.maximumMarks}
                            </span>
                          )}
                        </div>

                        {mySub.feedback && (
                          <div style={{ fontSize: '0.82rem', color: '#c084fc', marginTop: '6px' }}>
                            <strong>Feedback:</strong> {mySub.feedback}
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Action buttons */}
                    {mySub ? (
                      <div>
                        {!pastDeadline ? (
                          <button
                            onClick={() => handleOpenSubmit(assignment, mySub)}
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                          >
                            <Edit3 size={16} />
                            <span>Edit Submission</span>
                          </button>
                        ) : (
                          <div
                            style={{
                              textAlign: 'center',
                              fontSize: '0.82rem',
                              color: 'var(--text-muted)',
                              padding: '8px',
                            }}
                          >
                            Submission finalized (deadline closed)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {!pastDeadline ? (
                          <button
                            onClick={() => handleOpenSubmit(assignment)}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                          >
                            <Send size={16} />
                            <span>Submit Solution</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="btn btn-secondary"
                            style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                          >
                            <AlertCircle size={16} />
                            <span>Closed (Past Deadline)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {activeAssignment && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>
                  {existingSubmission ? 'Update Your Submission' : 'Submit Assignment Answer'}
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {activeAssignment.title} • Max: {activeAssignment.maximumMarks} pts
                </div>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '14px',
                borderRadius: '10px',
                marginBottom: '18px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Assignment Prompt
              </div>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                {activeAssignment.description}
              </div>
            </div>

            <form onSubmit={handleSubmitAnswer}>
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">Your Response / Answer</label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {submissionContent.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  className="textarea-field"
                  placeholder="Type or paste your complete solution, code snippets, or analysis here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setActiveAssignment(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{existingSubmission ? 'Update Answer' : 'Submit Solution'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
