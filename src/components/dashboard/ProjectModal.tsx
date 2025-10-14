import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Folder, Calendar, Globe } from 'lucide-react';
import { useConfirmation } from '../../contexts/ConfirmationContext';

// Local type definitions
interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProjectData {
  name: string;
  description?: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProjectData) => void;
  project?: Project;
  isLoading?: boolean;
}

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  onSave, 
  project, 
  isLoading = false 
}: ProjectModalProps) {
  const { showConfirmation } = useConfirmation();
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
  });
  const [initialData, setInitialData] = useState<CreateProjectData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    const data = project ? {
      name: project.name,
      description: project.description || '',
    } : {
      name: '',
      description: '',
    };
    
    setFormData(data);
    setInitialData(data);
  }, [project, isOpen]);

  const hasUnsavedChanges = () => {
    return formData.name !== initialData.name || formData.description !== initialData.description;
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      showConfirmation({
        type: 'discard-changes',
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to close without saving?',
        details: 'Your progress will be lost if you continue.',
        confirmText: 'Discard Changes',
        onConfirm: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const projectTemplates = [
    {
      name: '🚀 Product Launch',
      description: 'Complete product launch with marketing, development, and operations tasks',
      icon: '🚀'
    },
    {
      name: '💻 Software Development',
      description: 'Full stack development project with planning, coding, and deployment',
      icon: '💻'
    },
    {
      name: '📊 Marketing Campaign',
      description: 'End-to-end marketing campaign from strategy to execution',
      icon: '📊'
    },
    {
      name: '🎨 Design System',
      description: 'Create comprehensive design system and component library',
      icon: '🎨'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {project ? 'Edit Project' : 'Create New Project'}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project ? 'Update your project details' : 'Start organizing your work with a new project'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Templates (only show for new projects) */}
                {!project && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Quick Start Templates
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {projectTemplates.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => setFormData({
                            name: template.name,
                            description: template.description
                          })}
                          className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {template.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Describe what this project is about..."
                    />
                  </div>

                  {/* Features Info */}
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
                      What you'll get:
                    </h4>
                    <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        <span>Kanban board with drag & drop</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        <span>Real-time collaboration</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        <span>Task management with priorities</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        <span>Team member collaboration</span>
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.name.trim() || isLoading}
                      className="btn-gradient px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading && (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      )}
                      {project ? 'Update Project' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}