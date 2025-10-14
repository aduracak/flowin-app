import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, User, Flag, GripVertical, Edit, Trash2 } from 'lucide-react';
import { useConfirmation } from '../../contexts/ConfirmationContext';
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

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { showConfirmation } = useConfirmation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔥';
      case 'high':
        return '⚡';
      case 'medium':
        return '📋';
      case 'low':
        return '📝';
      default:
        return '📋';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 group relative overflow-hidden ${
        isDragging ? 'opacity-50 rotate-5 shadow-2xl' : 'hover:scale-[1.02] hover:-translate-y-1'
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30 dark:from-primary-900/5 dark:to-secondary-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {/* Action Buttons */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Edit task"
            >
              <Edit className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showConfirmation({
                  type: 'delete',
                  title: 'Delete Task',
                  message: `Are you sure you want to delete "${task.title}"?`,
                  details: 'This action cannot be undone. The task and all its data will be permanently deleted.',
                  confirmText: 'Delete Task',
                  onConfirm: () => onDelete(task.id),
                });
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete task"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {/* Drag Handle */}
          <div
            {...listeners}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          {/* Priority */}
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getPriorityColor(task.priority)}`}>
            <span className="text-xs">{getPriorityIcon(task.priority)}</span>
            <span className="capitalize">{task.priority}</span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Assigned User */}
        {task.assignedTo && (
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3 text-gray-400" />
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {task.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          </div>
        )}
        </div>
      </div>
    </motion.div>
  );
}