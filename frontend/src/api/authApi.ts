import { axiosClient } from './axiosClient';
import { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    axiosClient.post('/auth/login', data),
};
