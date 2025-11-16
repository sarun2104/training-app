import { apiClient } from './api';
import {
  Course,
  Question,
  SubmitQuizRequest,
  QuizResult,
  Notification,
  EmployeeProfile,
  CourseProgress,
} from '@/types';

export const employeeService = {
  // Course Access
  async getAssignedCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/api/employee/courses');
    return response.data;
  },

  async getCourseDetails(courseId: number): Promise<Course> {
    const response = await apiClient.get<Course>(`/api/employee/courses/${courseId}`);
    return response.data;
  },

  async startCourse(courseId: number) {
    const response = await apiClient.post(`/api/employee/courses/${courseId}/start`);
    return response.data;
  },

  // Quiz
  async getQuizQuestions(courseId: number): Promise<{ questions: Question[] }> {
    const response = await apiClient.get(`/api/employee/courses/${courseId}/quiz`);
    return response.data;
  },

  async submitQuiz(courseId: number, data: SubmitQuizRequest): Promise<QuizResult> {
    const response = await apiClient.post<QuizResult>(
      `/api/employee/courses/${courseId}/submit-quiz`,
      data
    );
    return response.data;
  },

  // Profile and Progress
  async getProfile(): Promise<EmployeeProfile> {
    const response = await apiClient.get<EmployeeProfile>('/api/employee/profile');
    return response.data;
  },

  async getProgress(): Promise<CourseProgress[]> {
    const response = await apiClient.get<CourseProgress[]>('/api/employee/progress');
    return response.data;
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/api/employee/notifications');
    return response.data;
  },

  async markNotificationAsRead(notificationId: number) {
    const response = await apiClient.put(
      `/api/employee/notifications/${notificationId}/read`
    );
    return response.data;
  },
};
