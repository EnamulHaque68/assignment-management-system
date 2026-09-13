export type Role = 'Admin' | 'Teacher' | 'Student';

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  address?: string | null;
  department?: string | null;
  classId?: string | null;
}

export type LoginResponseData = LoginResponse;

// User
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  classId?: string | null;
  className?: string;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  address?: string | null;
  department?: string | null;
}

export interface UserProfile extends User {
  totalAssignments: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  averageScore: number;
  assignedClassesCount: number;
  assignedSubjectsCount: number;
  totalStudentsCount: number;
  assignedClassNames: string[];
  assignedSubjectNames: string[];
}

export interface UpdateProfileRequest {
  fullName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  address?: string | null;
  department?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  classId?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  address?: string | null;
  department?: string | null;
}

export interface UpdateUserRequest {
  fullName: string;
  classId?: string | null;
  isActive: boolean;
  password?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  address?: string | null;
  department?: string | null;
}

export interface BatchCreateUsersRequest {
  users: CreateUserRequest[];
}

export interface BatchCreateUsersResult {
  createdCount: number;
  createdUsers: User[];
  errors: string[];
}

// Class
export interface ClassItem {
  id: string;
  name: string;
  code: string;
  section?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UpsertClassRequest {
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

// Subject
export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UpsertSubjectRequest {
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

// Teacher Assignment
export interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName?: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  createdAt: string;
}

export interface CreateTeacherAssignmentRequest {
  teacherId: string;
  classId: string;
  subjectId: string;
}

// Assignment
export type AssignmentStatus = 'Draft' | 'Published';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  deadline: string;
  maximumMarks: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  mySubmissionStatus?: string | null;
  mySubmissionMarks?: number | null;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  deadline: string;
  maximumMarks: number;
  publishNow: boolean;
}

export interface UpdateAssignmentRequest {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  deadline: string;
  maximumMarks: number;
}

// Submission
export type SubmissionStatus = 'Submitted' | 'Reviewed' | 'Rejected' | 'Late';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  answer: string;
  content?: string;
  submittedAt: string;
  updatedAt?: string | null;
  marks?: number | null;
  maximumMarks: number;
  feedback?: string | null;
  status: SubmissionStatus;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  answer: string;
}

export interface UpdateSubmissionRequest {
  answer: string;
}

export interface ReviewSubmissionRequest {
  marks: number;
  feedback?: string | null;
  status?: 'Reviewed' | 'Rejected' | null;
}
