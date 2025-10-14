import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
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

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddTask?: (status: 'todo' | 'in-progress' | 'done') => void;
}

export default function KanbanColumn({ column, tasks, onEditTask, onDeleteTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg p-4 min-h-[600px] transition-colors duration-200 ${
          isOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
        } ${column.color}`}
        ref={setNodeRef}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddTask?.(column.status)}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={`Add task to ${column.title}`}
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </motion.button>
        </div>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard 
                  task={task} 
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </motion.div>
            ))}
            
            {tasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-gray-400"
              >
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm text-center">
                  Drop tasks here or click + to add new ones
                </p>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </motion.div>
    </div>
  );
}