// Authentication types
export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'student';
  };
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Judge0 API types
export interface CodeSubmission {
  source_code: string;
  language_id: number;
  stdin?: string;
}

export interface CodeExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: {
    id: number;
    description: string;
  };
}

// Dashboard data types
export interface DashboardStats {
  students: number;
  courses: number;
  tests: number;
  assignments: number;
}

export interface RecentActivity {
  _id: string;
  type: 'completion' | 'enrollment' | 'update' | 'deadline';
  title: string;
  details: string;
  timestamp: Date;
  icon: string;
  color: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  score: number;
  courseId?: string;
  testId?: string;
  assignmentId?: string;
  completedAt: Date;
}

// Student Assignment types
export interface AssignmentStatus {
  _id: string;
  title: string;
  courseTitle: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

// Student Test types
export interface TestStatus {
  _id: string;
  title: string;
  courseTitle: string;
  questions: number;
  status: 'pending' | 'completed';
}
