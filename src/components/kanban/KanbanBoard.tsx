import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, Loader } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskOrders,
  getUserProjects,
} from '../../lib/firestore';

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

interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
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

interface KanbanBoardProps {
  projectId?: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!projectId) {
      // Load user projects for selection
      const loadProjects = async () => {
        if (!user) return;
        try {
          const userProjects = await getUserProjects(user.id);
          setProjects(userProjects);
        } catch (error) {
          console.error('Error loading projects:', error);
        } finally {
          setLoading(false);
        }
      };
      loadProjects();
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToProjectTasks(projectId, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, user]);

  // Task management functions
  const handleCreateTask = async (taskData: CreateTaskData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createTask(projectId!, taskData, user.id);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      // You could add toast notifications here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskData) => {
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleAddTask = (_status?: 'todo' | 'in-progress' | 'done') => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      status: 'todo',
      color: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      color: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((task) => task.id === activeId);
    const overTask = tasks.find((task) => task.id === overId);

    if (!activeTask) return;

    // Check if we're dropping over a column
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.status) {
      // Update task status immediately in local state for smooth UX
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId
            ? { ...task, status: overColumn.status }
            : task
        )
      );
      return;
    }

    // If dropping over a task, update status to match that task's status
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId
            ? { ...task, status: overTask.status }
            : task
        )
      );
    }
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((task) => task.id === activeId);
    const overTask = tasks.find((task) => task.id === overId);

    if (!activeTask) return;

    try {
      // Check if dropping over a column
      const overColumn = columns.find((col) => col.id === overId);
      if (overColumn && activeTask.status !== overColumn.status) {
        await updateTask(activeId, { status: overColumn.status });
        return;
      }

      // Reordering within the same status or between statuses
      if (overTask) {
        const activeIndex = tasks.findIndex((task) => task.id === activeId);
        const overIndex = tasks.findIndex((task) => task.id === overId);

        if (activeTask.status === overTask.status) {
          // Same column reordering - update the entire order
          const newTasks = arrayMove(tasks, activeIndex, overIndex);
          const statusTasks = newTasks.filter(task => task.status === activeTask.status);
          const updatedTasks = statusTasks.map((task, index) => ({
            ...task,
            order: index
          }));
          
          // Update orders in Firestore
          await updateTaskOrders(updatedTasks);
        } else {
          // Different column - update status only
          await updateTask(activeId, { status: overTask.status });
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // You could revert the local state here if needed
    }
  };

  const getTasksByStatus = (status: 'todo' | 'in-progress' | 'done') => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {projectId ? 'Loading tasks...' : 'Loading projects...'}
          </p>
        </div>
      </div>
    );
  }

  // Show project selection if no projectId is provided
  if (!projectId) {
    return (
      <div className="p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select a Project
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Choose a project to view its task board, or go back to the dashboard to create a new project.
          </p>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first project to get started with task management.
              </p>
              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </motion.a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.a
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created {project.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Project Board
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsTaskModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </motion.button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-5 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        onSave={(data) => editingTask ? handleUpdateTask(data as UpdateTaskData) : handleCreateTask(data as CreateTaskData)}
        task={editingTask}
        isLoading={isSubmitting}
      />
    </div>
  );
}
