import { axiosClient } from './axiosClient';
import { ClassItem, UpsertClassRequest } from '../types';

export const classesApi = {
  getAll: (): Promise<ClassItem[]> => axiosClient.get('/classes'),
  getById: (id: string): Promise<ClassItem> => axiosClient.get(`/classes/${id}`),
  create: (data: UpsertClassRequest): Promise<ClassItem> => axiosClient.post('/classes', data),
  update: (id: string, data: UpsertClassRequest): Promise<ClassItem> => axiosClient.put(`/classes/${id}`, data),
  delete: (id: string): Promise<object> => axiosClient.delete(`/classes/${id}`),
};
