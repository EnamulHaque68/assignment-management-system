import { axiosClient } from './axiosClient';
import { TeacherAssignment, CreateTeacherAssignmentRequest } from '../types';

export const teacherAssignmentsApi = {
  getAll: (): Promise<TeacherAssignment[]> => axiosClient.get('/teacher-assignments'),
  create: (data: CreateTeacherAssignmentRequest): Promise<TeacherAssignment> =>
    axiosClient.post('/teacher-assignments', data),
  delete: (id: string): Promise<object> => axiosClient.delete(`/teacher-assignments/${id}`),
};
