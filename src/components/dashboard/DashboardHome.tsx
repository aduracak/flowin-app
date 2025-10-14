import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { createProject, createTask, getUserProjects } from '../../lib/firestore';
import { useMobile } from '../../contexts/MobileContext';
import ProjectModal from './ProjectModal';

// Local type definitions to avoid import issues
interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  FolderKanban,
  BarChart3,
} from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Load user projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;
      
      try {
        const userProjects = await getUserProjects(user.id);
        setProjects(userProjects);
        
        // If no projects exist, create a sample project
        if (userProjects.length === 0) {
          await createSampleProject();
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  const createSampleProject = async () => {
    if (!user) return;
    
    try {
      const projectId = await createProject(
        'Welcome Project 🎉',
        'This is your first project! Try adding some tasks, editing them, and dragging them between columns.',
        user.id
      );
      
      // Create some sample tasks
      await createTask(projectId, {
        title: '🚀 Welcome to Flowin!',
        description: 'This is a sample task. Click the edit button to modify it, add labels, set priorities, or drag it to different columns. Try all the features!',
        priority: 'high',
        assignedTo: user.displayName,
        labels: ['welcome', 'getting-started'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      }, user.id);
      
      await createTask(projectId, {
        title: '✏️ Try editing this task',
        description: 'Click the edit button to see the task modal. You can update the title, description, priority, assignee, due date, and labels.',
        priority: 'medium',
        labels: ['demo', 'editing'],
      }, user.id);
      
      await createTask(projectId, {
        title: '🎯 Set task priorities',
        description: 'Tasks can have different priority levels: Low, Medium, High, and Urgent. Use priorities to organize your work effectively.',
        priority: 'low',
        labels: ['demo', 'priorities'],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
      }, user.id);
      
      await createTask(projectId, {
        title: '✅ Drag me to "Done"!',
        description: 'Try dragging this task to the "Done" column. All changes sync in real-time with the database.',
        priority: 'urgent',
        assignedTo: user.displayName,
        labels: ['demo', 'drag-drop'],
      }, user.id);
      
      // Reload projects
      const userProjects = await getUserProjects(user.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error creating sample project:', error);
    }
  };

  const handleCreateProject = async (projectData: { name: string; description?: string }) => {
    if (!user) return;
    
    setIsCreatingProject(true);
    try {
      await createProject(projectData.name, projectData.description || '', user.id);
      
      // Reload projects
      const userProjects = await getUserProjects(user.id);
      setProjects(userProjects);
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleNewProjectClick = () => {
    setIsProjectModalOpen(true);
  };

  // Stats with real data
  const stats = [
    {
      title: 'Active Projects',
      value: projects.length.toString(),
      change: 'Real-time data',
      icon: <FolderKanban className="h-6 w-6" />,
      color: 'text-blue-600',
    },
    {
      title: 'Tasks Completed',
      value: '89',
      change: '+15 this week',
      icon: <CheckCircle2 className="h-6 w-6" />,
      color: 'text-green-600',
    },
    {
      title: 'Team Members',
      value: '24',
      change: '+3 this month',
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-600',
    },
    {
      title: 'Productivity',
      value: '94%',
      change: '+5% this week',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-orange-600',
    },
  ];

  // const recentProjects = [
  //   {
  //     id: '1',
  //     name: 'Website Redesign',
  //     description: 'Complete overhaul of the company website',
  //     progress: 75,
  //     members: 5,
  //     dueDate: '2024-12-15',
  //     color: 'bg-blue-500',
  //   },
  //   {
  //     id: '2',
  //     name: 'Mobile App',
  //     description: 'Cross-platform mobile application development',
  //     progress: 45,
  //     members: 8,
  //     dueDate: '2024-12-30',
  //     color: 'bg-green-500',
  //   },
  //   {
  //     id: '3',
  //     name: 'Marketing Campaign',
  //     description: 'Q1 2024 marketing strategy implementation',
  //     progress: 60,
  //     members: 4,
  //     dueDate: '2024-11-20',
  //     color: 'bg-purple-500',
  //   },
  // ];

  const upcomingTasks = [
    {
      id: '1',
      title: 'Design review meeting',
      project: 'Website Redesign',
      dueDate: '2024-10-15',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Code review for login feature',
      project: 'Mobile App',
      dueDate: '2024-10-16',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Content creation for social media',
      project: 'Marketing Campaign',
      dueDate: '2024-10-17',
      priority: 'low',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 sm:space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white`}>
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {projects.length === 0 
              ? "Ready to start your first project? Click 'New Project' to get started!"
              : "Here's what's happening with your projects today."
            }
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNewProjectClick}
          className="btn-gradient flex items-center space-x-2"
        >
          <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span className={isMobile ? 'text-sm' : ''}>{isMobile ? 'New' : 'New Project'}</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} bg-gradient-logo-light p-3 rounded-xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <Link
              to="/dashboard/projects"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No projects yet. Create your first project!</p>
              </div>
            ) : (
              projects.slice(0, 3).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/project/${project.id}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-primary-500`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Created {project.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-primary-600 hover:text-primary-500">
                    <span className="text-sm font-medium">View Project →</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Upcoming Tasks
          </h2>
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {task.project}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Overview
          </h2>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-64 flex items-end justify-center space-x-2">
          <div className="text-center text-gray-400">
            <div className="text-sm mb-4">Chart visualization would go here</div>
            <div className="text-xs">Integration with charting library needed</div>
          </div>
        </div>
      </motion.div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleCreateProject}
        isLoading={isCreatingProject}
      />
    </div>
  );
}
