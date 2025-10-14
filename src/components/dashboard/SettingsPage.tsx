import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Camera,
  Edit3,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Mail,
  Smartphone,
  Lock,
  Key,
  LogOut,
  AlertTriangle,
  Check,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { toast } from 'react-hot-toast';

// Local type definitions
interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    taskReminders: boolean;
    projectUpdates: boolean;
    teamInvites: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    activityStatus: boolean;
    readReceipts: boolean;
    dataCollection: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    soundEnabled: boolean;
    autoSave: boolean;
    compactView: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordLastChanged: Date;
  };
}

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function SettingsPage() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showConfirmation } = useConfirmation();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // User profile states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(user?.photoURL || '');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      taskReminders: true,
      projectUpdates: true,
      teamInvites: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: 'team',
      activityStatus: true,
      readReceipts: true,
      dataCollection: false,
    },
    preferences: {
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      soundEnabled: true,
      autoSave: true,
      compactView: false,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 60,
      passwordLastChanged: new Date(),
    },
  });

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      description: 'Manage your personal information and profile settings',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'Control how and when you receive notifications',
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: <Shield className="h-5 w-5" />,
      description: 'Manage your privacy and data sharing preferences',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="h-5 w-5" />,
      description: 'Customize the look and feel of your workspace',
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: <Globe className="h-5 w-5" />,
      description: 'Set your language, timezone, and other preferences',
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Lock className="h-5 w-5" />,
      description: 'Manage your account security and authentication',
    },
    {
      id: 'data',
      title: 'Data & Storage',
      icon: <Download className="h-5 w-5" />,
      description: 'Import, export, and manage your data',
    },
  ];

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile({
        displayName,
        photoURL: profileImage,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    
    showConfirmation({
      type: 'delete',
      title: 'Delete Account',
      message: 'Are you absolutely sure you want to delete your account?',
      details: 'This will permanently delete your account, all projects, tasks, and data. This action cannot be undone.',
      confirmText: 'Delete Account',
      requireTyping: true,
      requiredText: 'DELETE',
      onConfirm: async () => {
        try {
          await deleteAccount();
          toast.success('Account deleted successfully');
        } catch (error) {
          toast.error('Failed to delete account');
          console.error('Account deletion error:', error);
        }
      },
    });
  };

  const handleExportData = () => {
    const data = {
      user: {
        name: displayName,
        email,
        bio,
      },
      settings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowin-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updatePreferenceSetting = (key: keyof UserSettings['preferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const updateSecuritySetting = (key: keyof UserSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }));
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-logo rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {displayName ? displayName[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {displayName || 'User'}
            </h4>
            <p className="text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Tell us a little about yourself..."
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="btn-gradient px-6 py-2 rounded-lg disabled:opacity-50 flex items-center"
          >
            {isLoading && (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
            { key: 'desktop', label: 'Desktop Notifications', description: 'System desktop notifications' },
            { key: 'taskReminders', label: 'Task Reminders', description: 'Reminders for due tasks' },
            { key: 'projectUpdates', label: 'Project Updates', description: 'Updates on project changes' },
            { key: 'teamInvites', label: 'Team Invitations', description: 'Notifications for team invites' },
            { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of activities' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              </div>
              <button
                onClick={() => updateNotificationSetting(key as keyof UserSettings['notifications'], !settings.notifications[key as keyof UserSettings['notifications']])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[key as keyof UserSettings['notifications']]
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[key as keyof UserSettings['notifications']]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme & Appearance
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Color Theme
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: 'Light', icon: <Sun className="h-5 w-5" /> },
                { key: 'dark', label: 'Dark', icon: <Moon className="h-5 w-5" /> },
                { key: 'system', label: 'System', icon: <Monitor className="h-5 w-5" /> },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as any)}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    theme === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {icon}
                  <span className="text-sm font-medium mt-2">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sound Effects</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for notifications and actions</p>
            </div>
            <button
              onClick={() => updatePreferenceSetting('soundEnabled', !settings.preferences.soundEnabled)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                settings.preferences.soundEnabled
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              {settings.preferences.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="text-sm">{settings.preferences.soundEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Compact View</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use a more compact layout to fit more content</p>
            </div>
            <button
              onClick={() => updatePreferenceSetting('compactView', !settings.preferences.compactView)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.preferences.compactView ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.preferences.compactView ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Security
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Password</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last changed {settings.security.passwordLastChanged.toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordChange(true)}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {settings.security.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
              </p>
            </div>
            <button
              onClick={() => updateSecuritySetting('twoFactorEnabled', !settings.security.twoFactorEnabled)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                settings.security.twoFactorEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400'
              }`}
            >
              {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically log out after inactivity</p>
            </div>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-red-500">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danger Zone
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Export Data</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data in JSON format</p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Export
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Import Data</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Import data from a JSON file</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
              Import
            </button>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Data Usage
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Your account is currently using 2.4 MB of storage across projects and tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Settings className="h-8 w-8 mr-3 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <nav className="space-y-1 p-2">
              {settingSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {section.icon}
                  <span className="ml-3 font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'profile' && renderProfileSection()}
            {activeSection === 'notifications' && renderNotificationsSection()}
            {activeSection === 'appearance' && renderAppearanceSection()}
            {activeSection === 'security' && renderSecuritySection()}
            {activeSection === 'data' && renderDataSection()}
            
            {/* Placeholder sections for Privacy and Preferences */}
            {activeSection === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">Privacy settings will be available in the next update.</p>
              </div>
            )}
            
            {activeSection === 'preferences' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Preferences</h3>
                <p className="text-gray-600 dark:text-gray-400">Additional preferences will be available in the next update.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordChange && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPasswordChange(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPasswords ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
                    className="btn-gradient px-6 py-2 rounded-lg disabled:opacity-50 flex items-center"
                  >
                    {isLoading && (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    Change Password
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete your account? All of your data will be permanently removed.
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isLoading && (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
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
