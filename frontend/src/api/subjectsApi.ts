import { axiosClient } from './axiosClient';
import { SubjectItem, UpsertSubjectRequest } from '../types';

export const subjectsApi = {
  getAll: (): Promise<SubjectItem[]> => axiosClient.get('/subjects'),
  getById: (id: string): Promise<SubjectItem> => axiosClient.get(`/subjects/${id}`),
  create: (data: UpsertSubjectRequest): Promise<SubjectItem> => axiosClient.post('/subjects', data),
  update: (id: string, data: UpsertSubjectRequest): Promise<SubjectItem> => axiosClient.put(`/subjects/${id}`, data),
  delete: (id: string): Promise<object> => axiosClient.delete(`/subjects/${id}`),
};
