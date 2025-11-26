// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  department?: string;
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
  due_date?: string;
}

export interface CreateCourseRequest {
  course_name: string;
  parent_id: string;
  parent_type: 'track' | 'subtrack' | 'course';
}

// Course with hierarchy for assignment
export interface CourseWithHierarchy {
  course_id: string;
  course_name: string;
  subtracks: {
    subtrack_id: string;
    subtrack_name: string;
    track_id: string;
    track_name: string;
  }[];
}

export interface AssignedCourse {
  course_id: string;
  course_name: string;
  subtrack_name?: string;
  track_name?: string;
  due_date?: string;
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
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  selected_option?: string;
  multiple_answer_flag?: boolean;
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
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | ('A' | 'B' | 'C' | 'D')[];
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

export interface EmployeeProfileDetails {
  employee_id: string;
  brief_profile: string | null;
  primary_skills: string[];
  secondary_skills: string[];
  past_projects: string[];
  certifications: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface EmployeeProfileUpdateRequest {
  brief_profile?: string | null;
  primary_skills?: string[];
  secondary_skills?: string[];
  past_projects?: string[];
  certifications?: string[];
}

// Capstone Types
export interface WeeklyPlanItem {
  week: number;
  title: string;
  topics: string[];
  tasks: string[];
  deliverables: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: string;  // "dataset", "documentation", "tutorial", etc.
}

export interface FinalDeliverable {
  title: string;
  description: string;
  requirements: string[];
}

export interface CapstoneGuidelines {
  description: string;
  objectives: string[];
  weekly_plan: WeeklyPlanItem[];
  final_deliverable: FinalDeliverable;
  resources: Resource[];
}

export interface CapstoneListItem {
  capstone_id: string;
  capstone_name: string;
  tags: string[];
  duration_weeks: number;
}

export interface CapstoneDetail {
  capstone_id: string;
  capstone_name: string;
  tags: string[];
  duration_weeks: number;
  dataset_link: string | null;
  guidelines: CapstoneGuidelines;
  created_at: string | null;
  updated_at: string | null;
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
