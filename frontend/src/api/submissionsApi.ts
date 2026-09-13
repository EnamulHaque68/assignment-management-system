import { axiosClient } from './axiosClient';
import {
  Submission,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  ReviewSubmissionRequest,
} from '../types';

export const submissionsApi = {
  create: (data: CreateSubmissionRequest): Promise<Submission> =>
    axiosClient.post('/submissions', data),
  update: (id: string, data: UpdateSubmissionRequest): Promise<Submission> =>
    axiosClient.put(`/submissions/${id}`, data),
  getMy: (): Promise<Submission[]> => axiosClient.get('/submissions/my'),
  getByAssignment: (assignmentId: string): Promise<Submission[]> =>
    axiosClient.get(`/submissions/assignment/${assignmentId}`),
  review: (id: string, data: ReviewSubmissionRequest): Promise<Submission> =>
    axiosClient.put(`/submissions/${id}/review`, data),
};
