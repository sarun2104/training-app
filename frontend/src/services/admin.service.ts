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

  async getCourseLinks(courseId: string) {
    const response = await apiClient.get(`/api/admin/courses/${courseId}/links`);
    return response.data;
  },

  async addCourseLink(courseId: string, data: { link_label: string; link_url: string }) {
    const response = await apiClient.post(`/api/admin/courses/${courseId}/links`, data);
    return response.data;
  },

  async updateCourseLink(linkId: string, data: { link_label: string; link_url: string }) {
    const response = await apiClient.put(`/api/admin/links/${linkId}`, data);
    return response.data;
  },

  async deleteCourseLink(linkId: string) {
    const response = await apiClient.delete(`/api/admin/links/${linkId}`);
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

  // MCQ Management
  async getCourseMCQs(courseId: string) {
    const response = await apiClient.get(`/api/admin/courses/${courseId}/mcqs`);
    return response.data;
  },

  async addMCQ(courseId: string, data: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answers: string[];
    multiple_answer_flag: boolean;
  }) {
    const response = await apiClient.post(`/api/admin/courses/${courseId}/mcqs`, data);
    return response.data;
  },

  async updateMCQ(questionId: string, data: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answers: string[];
    multiple_answer_flag: boolean;
  }) {
    const response = await apiClient.put(`/api/admin/mcqs/${questionId}`, data);
    return response.data;
  },

  async deleteMCQ(questionId: string) {
    const response = await apiClient.delete(`/api/admin/mcqs/${questionId}`);
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

  async getEmployeeAssignedCourses(employeeId: string) {
    const response = await apiClient.get(`/api/admin/employees/${employeeId}/assigned-courses`);
    return response.data;
  },

  async assignCourseToEmployee(employeeId: string, courseId: string, dueDate?: string) {
    const response = await apiClient.post(`/api/admin/employees/${employeeId}/courses/${courseId}`, null, {
      params: { due_date: dueDate }
    });
    return response.data;
  },

  async unassignCourseFromEmployee(employeeId: string, courseId: string) {
    const response = await apiClient.delete(`/api/admin/employees/${employeeId}/courses/${courseId}`);
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

  // Capstones
  async getCapstones() {
    const response = await apiClient.get('/api/capstones');
    return response.data;
  },

  async getCapstoneDetail(capstoneId: string) {
    const response = await apiClient.get(`/api/capstones/${capstoneId}`);
    return response.data;
  },
};
