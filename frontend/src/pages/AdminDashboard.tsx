import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { User, ClassItem, SubjectItem, TeacherAssignment, Assignment } from '../types';
import {
  Users,
  School,
  BookOpen,
  LinkIcon,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Layers,
  X
} from '../components/Icons';

export const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'subjects' | 'teacherAssignments' | 'assignments'>('users');
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'Student', classId: '' });
  const [newClass, setNewClass] = useState({ name: '', section: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [newAssign, setNewAssign] = useState({ teacherId: '', classId: '', subjectId: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, c, s, ta, a] = await Promise.all([
        api.getUsers(),
        api.getClasses(),
        api.getSubjects(),
        api.getTeacherAssignments(),
        api.getAssignments(),
      ]);
      setUsers(u);
      setClasses(c);
      setSubjects(s);
      setTeacherAssignments(ta);
      setAssignments(a);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(newUser);
      toast.success('User registered successfully');
      setShowUserModal(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'Student', classId: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleToggleUserActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      toast.success('User deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClass(newClass.name, newClass.section);
      toast.success('Class added');
      setShowClassModal(false);
      setNewClass({ name: '', section: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add class');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Delete class?')) return;
    try {
      await api.deleteClass(id);
      toast.success('Class deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSubject(newSubject.name, newSubject.code);
      toast.success('Subject added');
      setShowSubjectModal(false);
      setNewSubject({ name: '', code: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete subject?')) return;
    try {
      await api.deleteSubject(id);
      toast.success('Subject deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssign.teacherId || !newAssign.classId || !newAssign.subjectId) {
      toast.error('Please select teacher, class, and subject.');
      return;
    }
    try {
      await api.createTeacherAssignment(newAssign.teacherId, newAssign.classId, newAssign.subjectId);
      toast.success('Teacher assigned successfully');
      setShowAssignModal(false);
      setNewAssign({ teacherId: '', classId: '', subjectId: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create teacher assignment');
    }
  };

  const handleDeleteAssign = async (id: string) => {
    if (!confirm('Remove teacher assignment?')) return;
    try {
      await api.deleteTeacherAssignment(id);
      toast.success('Assignment removed');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  const teachers = users.filter((u) => u.role === 'Teacher');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      {/* Page Title & Stats */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
          Admin <span className="gradient-text">Command Center</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage global users, classrooms, curriculum subjects, and teacher appointments.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-val">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}>
            <School size={26} />
          </div>
          <div>
            <div className="stat-val">{classes.length}</div>
            <div className="stat-label">Classes Registered</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple)' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div className="stat-val">{subjects.length}</div>
            <div className="stat-label">Subjects</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
            <FileText size={26} />
          </div>
          <div>
            <div className="stat-val">{assignments.length}</div>
            <div className="stat-label">System Assignments</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>Users ({users.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <School size={18} />
          <span>Classes ({classes.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <BookOpen size={18} />
          <span>Subjects ({subjects.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'teacherAssignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('teacherAssignments')}
        >
          <LinkIcon size={18} />
          <span>Teacher Allocations ({teacherAssignments.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <Layers size={18} />
          <span>All Assignments ({assignments.length})</span>
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>User Directory</h3>
            <button
              id="admin-create-user-btn"
              onClick={() => setShowUserModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              <span>Create New User</span>
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Class (Students)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                    </td>
                    <td>{u.className || '—'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: u.isActive ? 'var(--emerald)' : 'var(--rose)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {u.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn btn-danger btn-icon"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Classes */}
      {activeTab === 'classes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Classrooms</h3>
            <button onClick={() => setShowClassModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Class</span>
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.section || 'General'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteClass(c.id)} className="btn btn-danger btn-icon">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Subjects */}
      {activeTab === 'subjects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Curriculum Subjects</h3>
            <button onClick={() => setShowSubjectModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Subject Code</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {s.code}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteSubject(s.id)} className="btn btn-danger btn-icon">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Teacher Allocations */}
      {activeTab === 'teacherAssignments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Teacher Subject & Class Allocations</h3>
            <button onClick={() => setShowAssignModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Assign Teacher</span>
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
                      No teacher assignments found. Assign a teacher to a class and subject above.
                    </td>
                  </tr>
                ) : (
                  teacherAssignments.map((ta) => (
                    <tr key={ta.id}>
                      <td style={{ fontWeight: 600 }}>{ta.teacherName || ta.teacherId}</td>
                      <td>
                        <span className="badge badge-student">{ta.className || ta.classId}</span>
                      </td>
                      <td>
                        <span className="badge badge-teacher">{ta.subjectName || ta.subjectId}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteAssign(ta.id)} className="btn btn-danger btn-icon">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: All Assignments Overview */}
      {activeTab === 'assignments' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>System-wide Assignments</h3>
          <div className="cards-grid">
            {assignments.map((a) => (
              <div key={a.id} className="glass-panel assignment-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span>
                    <span className="badge badge-teacher">{a.subjectName}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{a.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '14px' }}>
                    {a.description.slice(0, 100)}...
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>Teacher: <strong style={{ color: 'var(--text-primary)' }}>{a.teacherName}</strong></div>
                  <div>Class: <strong style={{ color: 'var(--text-primary)' }}>{a.className}</strong></div>
                  <div>Deadline: {new Date(a.deadline).toLocaleString()}</div>
                  <div>Max Marks: <strong style={{ color: 'var(--cyan)' }}>{a.maximumMarks}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showUserModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Create New User</h3>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Alan Turing"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="alan@assignment.local"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="Min 6 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Role</label>
                <select
                  className="select-field"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {newUser.role === 'Student' && (
                <div className="input-group">
                  <label className="input-label">Assigned Class</label>
                  <select
                    className="select-field"
                    value={newUser.classId}
                    onChange={(e) => setNewUser({ ...newUser, classId: e.target.value })}
                  >
                    <option value="">Select a class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.section ? `(${c.section})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Class */}
      {showClassModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Add Class</h3>
              <button onClick={() => setShowClassModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="input-group">
                <label className="input-label">Class Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Class 10"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Section (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Section A"
                  value={newClass.section}
                  onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowClassModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Subject */}
      {showSubjectModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Add Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="input-group">
                <label className="input-label">Subject Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Computer Science"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Subject Code</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. CS-101"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Teacher */}
      {showAssignModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Assign Teacher to Class & Subject</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignTeacher}>
              <div className="input-group">
                <label className="input-label">Select Teacher</label>
                <select
                  required
                  className="select-field"
                  value={newAssign.teacherId}
                  onChange={(e) => setNewAssign({ ...newAssign, teacherId: e.target.value })}
                >
                  <option value="">Choose Teacher...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Select Class</label>
                <select
                  required
                  className="select-field"
                  value={newAssign.classId}
                  onChange={(e) => setNewAssign({ ...newAssign, classId: e.target.value })}
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
                <label className="input-label">Select Subject</label>
                <select
                  required
                  className="select-field"
                  value={newAssign.subjectId}
                  onChange={(e) => setNewAssign({ ...newAssign, subjectId: e.target.value })}
                >
                  <option value="">Choose Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
