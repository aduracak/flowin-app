import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Mail,
  Crown,
  UserCheck,
  UserX,
  Search,
  Shield,
  Calendar,
  Activity,
  ChevronDown,
  MoreVertical,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProjects } from '../../lib/firestore';

// Local type definitions
type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
type MemberStatus = 'active' | 'pending' | 'inactive';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActive: Date;
  tasksCount: number;
  projectsCount: number;
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

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  // Mock team members data
  const mockMembers: TeamMember[] = [
    {
      id: '1',
      name: user?.displayName || 'You',
      email: user?.email || '',
      role: 'owner',
      status: 'active',
      joinedAt: new Date(2024, 0, 15),
      lastActive: new Date(),
      tasksCount: 12,
      projectsCount: 3,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date(2024, 1, 20),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tasksCount: 8,
      projectsCount: 2,
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      role: 'member',
      status: 'active',
      joinedAt: new Date(2024, 2, 10),
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tasksCount: 15,
      projectsCount: 4,
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      role: 'member',
      status: 'pending',
      joinedAt: new Date(2024, 3, 5),
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tasksCount: 3,
      projectsCount: 1,
    },
  ];

  useEffect(() => {
    const loadTeamData = async () => {
      if (!user) return;
      
      try {
        const userProjects = await getUserProjects(user.id);
        setProjects(userProjects);
        setMembers(mockMembers);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [user]);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !user) return;

    setIsInviting(true);
    try {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        joinedAt: new Date(),
        lastActive: new Date(),
        tasksCount: 0,
        projectsCount: 0,
      };
      
      setMembers([...members, newMember]);
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <UserX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary-600" />
            Team Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your team members and their permissions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsInviteModalOpen(true)}
          className="btn-gradient flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Invite Member</span>
        </motion.button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Members',
            value: members.length.toString(),
            icon: <Users className="h-6 w-6" />,
            color: 'text-blue-600',
          },
          {
            title: 'Active Members',
            value: members.filter(m => m.status === 'active').length.toString(),
            icon: <UserCheck className="h-6 w-6" />,
            color: 'text-green-600',
          },
          {
            title: 'Pending Invites',
            value: members.filter(m => m.status === 'pending').length.toString(),
            icon: <Mail className="h-6 w-6" />,
            color: 'text-yellow-600',
          },
          {
            title: 'Active Projects',
            value: projects.length.toString(),
            icon: <Activity className="h-6 w-6" />,
            color: 'text-purple-600',
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30 dark:from-primary-900/5 dark:to-secondary-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} bg-gradient-logo-light p-3 rounded-xl shadow-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as MemberRole | 'all')}
            className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Members ({filteredMembers.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-logo rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                        {member.email === user?.email && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {member.joinedAt.toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {formatLastActive(member.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {member.tasksCount} tasks
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.projectsCount} projects
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                  
                  {member.email !== user?.email && (
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsInviteModalOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-logo rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Invite Team Member
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send an invitation to join your team
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="colleague@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Role Permissions:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {inviteRole === 'admin' && (
                        <>
                          <li>• Manage team members and projects</li>
                          <li>• Create and delete projects</li>
                          <li>• Assign tasks and set permissions</li>
                        </>
                      )}
                      {inviteRole === 'member' && (
                        <>
                          <li>• Create and manage tasks</li>
                          <li>• Participate in projects</li>
                          <li>• Collaborate with team members</li>
                        </>
                      )}
                      {inviteRole === 'viewer' && (
                        <>
                          <li>• View projects and tasks</li>
                          <li>• Add comments and updates</li>
                          <li>• Limited editing permissions</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={isInviting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim() || isInviting}
                    className="btn-gradient px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isInviting && (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    <Send className="h-4 w-4 mr-2" />
                    {isInviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}