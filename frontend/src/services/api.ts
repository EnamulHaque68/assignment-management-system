import {
  ApiResponse,
  LoginResponseData,
  User,
  ClassItem,
  SubjectItem,
  TeacherAssignment,
  Assignment,
  Submission
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  errors?: string[];
  status?: number;

  constructor(message: string, errors?: string[], status?: number) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('assignment_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : 'An unexpected error occurred.');
    const errors = data?.errors || [];
    if (response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('assignment_token');
      localStorage.removeItem('assignment_user');
      window.dispatchEvent(new Event('auth_logout'));
    }
    throw new ApiError(errorMsg, errors, response.status);
  }

  return (data?.data !== undefined ? data.data : data) as T;
}

export const api = {
  // Auth
  login: (email: string, password: string): Promise<LoginResponseData> =>
    request<LoginResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Users (Admin)
  getUsers: (): Promise<User[]> => request<User[]>('/users'),
  createUser: (userData: { fullName: string; email: string; password: string; role: string; classId?: string }): Promise<User> =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUser: (id: string, userData: Partial<User>): Promise<User> =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: string): Promise<void> =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),

  // Classes
  getClasses: (): Promise<ClassItem[]> => request<ClassItem[]>('/classes'),
  createClass: (name: string, section?: string): Promise<ClassItem> =>
    request<ClassItem>('/classes', {
      method: 'POST',
      body: JSON.stringify({ name, section }),
    }),
  deleteClass: (id: string): Promise<void> =>
    request<void>(`/classes/${id}`, { method: 'DELETE' }),

  // Subjects
  getSubjects: (): Promise<SubjectItem[]> => request<SubjectItem[]>('/subjects'),
  createSubject: (name: string, code: string): Promise<SubjectItem> =>
    request<SubjectItem>('/subjects', {
      method: 'POST',
      body: JSON.stringify({ name, code }),
    }),
  deleteSubject: (id: string): Promise<void> =>
    request<void>(`/subjects/${id}`, { method: 'DELETE' }),

  // Teacher Assignments (Admin)
  getTeacherAssignments: (): Promise<TeacherAssignment[]> =>
    request<TeacherAssignment[]>('/teacher-assignments'),
  createTeacherAssignment: (teacherId: string, classId: string, subjectId: string): Promise<TeacherAssignment> =>
    request<TeacherAssignment>('/teacher-assignments', {
      method: 'POST',
      body: JSON.stringify({ teacherId, classId, subjectId }),
    }),
  deleteTeacherAssignment: (id: string): Promise<void> =>
    request<void>(`/teacher-assignments/${id}`, { method: 'DELETE' }),

  // Assignments
  getAssignments: (): Promise<Assignment[]> => request<Assignment[]>('/assignments'),
  getAssignmentById: (id: string): Promise<Assignment> =>
    request<Assignment>(`/assignments/${id}`),
  createAssignment: (data: {
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    deadline: string;
    maximumMarks: number;
    status: 'Draft' | 'Published';
  }): Promise<Assignment> =>
    request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAssignment: (id: string, data: Partial<Assignment>): Promise<Assignment> =>
    request<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAssignment: (id: string): Promise<void> =>
    request<void>(`/assignments/${id}`, { method: 'DELETE' }),
  publishAssignment: (id: string): Promise<Assignment> =>
    request<Assignment>(`/assignments/${id}/publish`, { method: 'PATCH' }),
  draftAssignment: (id: string): Promise<Assignment> =>
    request<Assignment>(`/assignments/${id}/draft`, { method: 'PATCH' }),

  // Submissions
  createSubmission: (assignmentId: string, content: string): Promise<Submission> =>
    request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ assignmentId, content }),
    }),
  updateSubmission: (id: string, content: string): Promise<Submission> =>
    request<Submission>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  getMySubmissions: (): Promise<Submission[]> =>
    request<Submission[]>('/submissions/my'),
  getAssignmentSubmissions: (assignmentId: string): Promise<Submission[]> =>
    request<Submission[]>(`/submissions/assignment/${assignmentId}`),
  reviewSubmission: (
    id: string,
    data: { marks: number; feedback: string; status: 'Reviewed' | 'Rejected' }
  ): Promise<Submission> =>
    request<Submission>(`/submissions/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
