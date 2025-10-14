import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  LogOut,
  UserX,
  FileX,
  Settings,
} from 'lucide-react';

// Types for different confirmation scenarios
export type ConfirmationType = 
  | 'delete'
  | 'danger'
  | 'warning' 
  | 'info'
  | 'success'
  | 'logout'
  | 'archive'
  | 'remove-member'
  | 'reset'
  | 'discard-changes';

export interface ConfirmationOptions {
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  details?: string;
  icon?: React.ReactNode;
  requireTyping?: boolean;
  requiredText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => void;
  hideConfirmation: () => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (context === undefined) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
}

interface ConfirmationProviderProps {
  children: React.ReactNode;
}

export function ConfirmationProvider({ children }: ConfirmationProviderProps) {
  const [confirmation, setConfirmation] = useState<ConfirmationOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState('');

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    setConfirmation(options);
    setTypedText('');
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(null);
    setIsLoading(false);
    setTypedText('');
  }, []);

  const handleConfirm = async () => {
    if (!confirmation) return;

    // Check typing requirement
    if (confirmation.requireTyping && typedText !== confirmation.requiredText) {
      return;
    }

    setIsLoading(true);
    try {
      await confirmation.onConfirm();
      hideConfirmation();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirmation?.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  };

  const getTypeConfig = (type: ConfirmationType) => {
    switch (type) {
      case 'delete':
        return {
          icon: <Trash2 className="h-8 w-8 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'Delete',
        };
      case 'danger':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'Confirm',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-8 w-8 text-yellow-500" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'Continue',
        };
      case 'info':
        return {
          icon: <Info className="h-8 w-8 text-blue-500" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          confirmText: 'Continue',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          confirmText: 'Confirm',
        };
      case 'logout':
        return {
          icon: <LogOut className="h-8 w-8 text-orange-500" />,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          confirmBg: 'bg-orange-600 hover:bg-orange-700',
          confirmText: 'Logout',
        };
      case 'remove-member':
        return {
          icon: <UserX className="h-8 w-8 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'Remove',
        };
      case 'archive':
        return {
          icon: <FileX className="h-8 w-8 text-gray-500" />,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          confirmBg: 'bg-gray-600 hover:bg-gray-700',
          confirmText: 'Archive',
        };
      case 'reset':
        return {
          icon: <Settings className="h-8 w-8 text-orange-500" />,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          confirmBg: 'bg-orange-600 hover:bg-orange-700',
          confirmText: 'Reset',
        };
      case 'discard-changes':
        return {
          icon: <X className="h-8 w-8 text-yellow-500" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'Discard',
        };
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-gray-500" />,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          confirmBg: 'bg-gray-600 hover:bg-gray-700',
          confirmText: 'Confirm',
        };
    }
  };

  const value: ConfirmationContextType = {
    showConfirmation,
    hideConfirmation,
  };

  const typeConfig = confirmation ? getTypeConfig(confirmation.type || 'info') : null;
  const canConfirm = !confirmation?.requireTyping || typedText === confirmation.requiredText;

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancel}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border ${typeConfig?.borderColor} overflow-hidden`}
              >
                {/* Header with colored background */}
                <div className={`px-6 py-4 ${typeConfig?.bgColor} border-b ${typeConfig?.borderColor}`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {confirmation.icon || typeConfig?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {confirmation.title}
                      </h3>
                    </div>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {confirmation.message}
                  </p>
                  
                  {confirmation.details && (
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {confirmation.details}
                      </p>
                    </div>
                  )}

                  {/* Typing requirement */}
                  {confirmation.requireTyping && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Type <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-red-600 dark:text-red-400 font-mono text-xs">
                          {confirmation.requiredText}
                        </code> to confirm:
                      </p>
                      <input
                        type="text"
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        disabled={isLoading}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 ${
                          typedText === confirmation.requiredText
                            ? 'border-green-300 focus:ring-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                        }`}
                        placeholder={`Type "${confirmation.requiredText}" to continue`}
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    {confirmation.cancelText || 'Cancel'}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading || !canConfirm}
                    className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center space-x-2 ${typeConfig?.confirmBg}`}
                  >
                    {isLoading && (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{confirmation.confirmText || typeConfig?.confirmText || 'Confirm'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
}