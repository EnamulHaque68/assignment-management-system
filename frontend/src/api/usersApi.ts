import { axiosClient } from './axiosClient';
import { User, CreateUserRequest, UpdateUserRequest, BatchCreateUsersRequest, BatchCreateUsersResult } from '../types';

export const usersApi = {
  getAll: (): Promise<User[]> => axiosClient.get('/users'),
  getById: (id: string): Promise<User> => axiosClient.get(`/users/${id}`),
  create: (data: CreateUserRequest): Promise<User> => axiosClient.post('/users', data),
  batchCreate: (data: BatchCreateUsersRequest): Promise<BatchCreateUsersResult> =>
    axiosClient.post('/users/batch', data),
  update: (id: string, data: UpdateUserRequest): Promise<User> => axiosClient.put(`/users/${id}`, data),
  delete: (id: string): Promise<object> => axiosClient.delete(`/users/${id}`),
};
