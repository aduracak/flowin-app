import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
// Local type definitions to avoid import issues
type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  labels: string[];
  order: number;
  projectId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  labels: string[];
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  labels?: string[];
  order?: number;
}

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Task Operations
export const createTask = async (
  projectId: string,
  taskData: CreateTaskData,
  userId: string
): Promise<string> => {
  try {
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      status: 'todo',
      projectId,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      order: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: UpdateTaskData): Promise<void> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('projectId', '==', projectId),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Task);
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting project tasks:', error);
    throw error;
  }
};

// Real-time task listener
export const subscribeToProjectTasks = (
  projectId: string,
  callback: (tasks: Task[]) => void
): (() => void) => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('projectId', '==', projectId),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Task);
      });
      callback(tasks);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to project tasks:', error);
    throw error;
  }
};

// Batch update task orders for drag and drop
export const updateTaskOrders = async (tasks: Task[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    tasks.forEach((task, index) => {
      const taskRef = doc(db, 'tasks', task.id);
      batch.update(taskRef, {
        order: index,
        status: task.status,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error updating task orders:', error);
    throw error;
  }
};

// Project Operations
export const createProject = async (
  name: string,
  description: string,
  userId: string
): Promise<string> => {
  try {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      name,
      description,
      owner: userId,
      members: [userId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, 'projects');
    let q;
    
    try {
      // Try with orderBy first (requires index)
      q = query(
        projectsRef,
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
    } catch (indexError) {
      // Fallback to simple query if index not ready
      q = query(
        projectsRef,
        where('members', 'array-contains', userId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Project);
    });
    
    // Sort client-side as backup
    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting user projects:', error);
    
    // If the error is about missing index, provide helpful message
    if (error instanceof Error && error.message?.includes('index')) {
      console.log('Index is being created. Please wait a few minutes and refresh.');
    }
    
    throw error;
  }
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const data = projectSnap.data();
      return {
        id: projectSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Project;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const addProjectMember = async (projectId: string, memberEmail: string): Promise<void> => {
  try {
    // This would typically involve looking up the user by email first
    // For now, we'll just add the email to the members array
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const currentMembers = projectSnap.data().members || [];
      if (!currentMembers.includes(memberEmail)) {
        await updateDoc(projectRef, {
          members: [...currentMembers, memberEmail],
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error adding project member:', error);
    throw error;
  }
};