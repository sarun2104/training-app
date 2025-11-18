// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'employee';
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Track Types
export interface Track {
  track_id: string;
  track_name: string;
}

export interface CreateTrackRequest {
  track_name: string;
}

export interface UpdateTrackRequest {
  track_name: string;
}

// SubTrack Types
export interface SubTrack {
  subtrack_id: string;
  subtrack_name: string;
  track_id?: string;
}

export interface CreateSubTrackRequest {
  subtrack_name: string;
  track_id: string;
}

export interface UpdateSubTrackRequest {
  subtrack_name: string;
  track_id: string;
}

// Track Tree Types (for hierarchical display)
export interface TrackWithSubtracks {
  track_id: string;
  track_name: string;
  subtracks: SubTrack[];
}

// Course Types
export interface Course {
  course_id: number;
  title: string;
  description: string;
  subtrack_id: number;
  created_at?: string;
  links?: StudyLink[];
  progress?: number;
  status?: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  subtrack_id: number;
}

// Study Link Types
export interface StudyLink {
  link_id: number;
  url: string;
  title: string;
  course_id: number;
}

export interface CreateStudyLinkRequest {
  course_id: number;
  url: string;
  title: string;
}

// Question Types
export interface Question {
  question_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  selected_option?: string;
}

export interface CreateQuestionRequest {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
}

export interface AssignQuestionRequest {
  question_id: number;
  course_id: number;
}

// Employee Types
export interface CreateEmployeeRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface AssignTrackRequest {
  user_id: number;
  track_id: number;
}

export interface AssignCourseRequest {
  user_id: number;
  course_id: number;
}

// Quiz Types
export interface QuizAnswer {
  question_id: number;
  selected_option: 'A' | 'B' | 'C' | 'D';
}

export interface SubmitQuizRequest {
  answers: QuizAnswer[];
}

export interface QuizResult {
  score: number;
  passed: boolean;
  attempt_number?: number;
  correct_answers?: number;
  total_questions?: number;
}

// Notification Types
export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Progress Types
export interface CourseProgress {
  course_id: number;
  course_title: string;
  progress: number;
  status: string;
  quiz_score?: number;
  quiz_passed?: boolean;
}

export interface EmployeeProfile {
  user: User;
  enrolled_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  average_score?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
