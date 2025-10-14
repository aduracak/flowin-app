export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: string[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  labels: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionPercentage: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  labels: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  labels?: string[];
  order?: number;
}
