import { apiClient } from './api';
import {
  Track,
  CreateTrackRequest,
  UpdateTrackRequest,
  SubTrack,
  CreateSubTrackRequest,
  UpdateSubTrackRequest,
  TrackWithSubtracks,
  Course,
  CreateCourseRequest,
  Question,
  CreateQuestionRequest,
  AssignQuestionRequest,
  CreateStudyLinkRequest,
  CreateEmployeeRequest,
  AssignTrackRequest,
  AssignCourseRequest,
} from '@/types';

export const adminService = {
  // Track Management
  async createTrack(data: CreateTrackRequest) {
    const response = await apiClient.post('/api/admin/tracks', data);
    return response.data;
  },

  async updateTrack(trackId: string, data: UpdateTrackRequest) {
    const response = await apiClient.put(`/api/admin/tracks/${trackId}`, data);
    return response.data;
  },

  async getTracks(): Promise<Track[]> {
    const response = await apiClient.get<Track[]>('/api/admin/tracks');
    return response.data;
  },

  async getTracksTree(): Promise<TrackWithSubtracks[]> {
    const response = await apiClient.get<TrackWithSubtracks[]>('/api/admin/tracks-tree');
    return response.data;
  },

  async getCompleteTree() {
    const response = await apiClient.get('/api/admin/complete-tree');
    return response.data;
  },

  // SubTrack Management
  async createSubTrack(data: CreateSubTrackRequest) {
    const response = await apiClient.post('/api/admin/subtracks', data);
    return response.data;
  },

  async updateSubTrack(subtrackId: string, data: UpdateSubTrackRequest) {
    const response = await apiClient.put(`/api/admin/subtracks/${subtrackId}`, data);
    return response.data;
  },

  async getSubTracks(): Promise<SubTrack[]> {
    const response = await apiClient.get<SubTrack[]>('/api/admin/subtracks');
    return response.data;
  },

  // Course Management
  async createCourse(data: CreateCourseRequest) {
    const response = await apiClient.post('/api/admin/courses', data);
    return response.data;
  },

  async updateCourse(courseId: string, data: { course_name: string }) {
    const response = await apiClient.put(`/api/admin/courses/${courseId}`, data);
    return response.data;
  },

  async addCourseToSubtrack(courseId: string, subtrackId: string) {
    const response = await apiClient.post(`/api/admin/courses/${courseId}/subtracks/${subtrackId}`);
    return response.data;
  },

  async getCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/api/admin/courses');
    return response.data;
  },

  // Study Link Management
  async addStudyLink(data: CreateStudyLinkRequest) {
    const response = await apiClient.post('/api/admin/add-link', data);
    return response.data;
  },

  // Question Management
  async createQuestion(data: CreateQuestionRequest) {
    const response = await apiClient.post('/api/admin/questions', data);
    return response.data;
  },

  async assignQuestion(data: AssignQuestionRequest) {
    const response = await apiClient.post('/api/admin/assign-question', data);
    return response.data;
  },

  // Employee Management
  async createEmployee(data: CreateEmployeeRequest) {
    const response = await apiClient.post('/api/admin/employees', data);
    return response.data;
  },

  async getEmployees() {
    const response = await apiClient.get('/api/admin/employees');
    return response.data;
  },

  async assignTrack(data: AssignTrackRequest) {
    const response = await apiClient.post('/api/admin/assign-track', data);
    return response.data;
  },

  async assignCourse(data: AssignCourseRequest) {
    const response = await apiClient.post('/api/admin/assign-course', data);
    return response.data;
  },

  // Reporting
  async getEmployeeProgress(userId: number) {
    const response = await apiClient.get(`/api/admin/employee-progress/${userId}`);
    return response.data;
  },

  async getCourseStats(courseId: number) {
    const response = await apiClient.get(`/api/admin/course-stats/${courseId}`);
    return response.data;
  },
};
