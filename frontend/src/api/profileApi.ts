import { axiosClient } from './axiosClient';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../types';

export const profileApi = {
  getProfile: (): Promise<UserProfile> => axiosClient.get('/profile/me'),
  updateProfile: (data: UpdateProfileRequest): Promise<UserProfile> =>
    axiosClient.put('/profile/me', data),
  changePassword: (data: ChangePasswordRequest): Promise<object> =>
    axiosClient.put('/profile/change-password', data),
};
