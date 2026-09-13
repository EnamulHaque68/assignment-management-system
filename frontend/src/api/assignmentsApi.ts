import { axiosClient } from './axiosClient';
import {
  Assignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from '../types';

export const assignmentsApi = {
  getAll: (): Promise<Assignment[]> => axiosClient.get('/assignments'),
  getById: (id: string): Promise<Assignment> => axiosClient.get(`/assignments/${id}`),
  create: (data: CreateAssignmentRequest): Promise<Assignment> =>
    axiosClient.post('/assignments', data),
  update: (id: string, data: UpdateAssignmentRequest): Promise<Assignment> =>
    axiosClient.put(`/assignments/${id}`, data),
  delete: (id: string): Promise<object> => axiosClient.delete(`/assignments/${id}`),
  publish: (id: string): Promise<Assignment> =>
    axiosClient.patch(`/assignments/${id}/publish`),
  draft: (id: string): Promise<Assignment> =>
    axiosClient.patch(`/assignments/${id}/draft`),
};
