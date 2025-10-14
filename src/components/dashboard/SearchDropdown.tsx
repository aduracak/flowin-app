import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  Folder,
  CheckSquare,
  X,
  ArrowRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDropdown({ isOpen, onClose }: SearchDropdownProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    recentSearches,
    clearSearch,
    searchSuggestions,
  } = useSearch();
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleItemClick = (item: any) => {
    if (item.type === 'project') {
      navigate(`/dashboard/projects/${item.id}`);
    } else {
      navigate(`/dashboard/projects/${item.projectId}`);
    }
    onClose();
    clearSearch();
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchResults.length + searchSuggestions.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < searchResults.length) {
            handleItemClick(searchResults[selectedIndex]);
          } else if (selectedIndex < searchResults.length + searchSuggestions.length) {
            const suggestionIndex = selectedIndex - searchResults.length;
            handleSuggestionClick(searchSuggestions[suggestionIndex]);
          } else {
            const recentIndex = selectedIndex - searchResults.length - searchSuggestions.length;
            handleRecentSearchClick(recentSearches[recentIndex]);
          }
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-blue-500';
      case 'todo':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        
        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Search Input */}
          <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, tasks, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-10 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  clearSearch();
                  inputRef.current?.focus();
                }}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching && (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            )}

            {/* Search Results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.map((item, index) => (
                  <motion.button
                    key={`result-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                      selectedIndex === index ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    {getTypeIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        {item.priority && (
                          <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                            <AlertCircle className="h-3 w-3" />
                          </span>
                        )}
                        {item.status && (
                          <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {item.projectName && (
                          <span className="flex items-center space-x-1">
                            <Folder className="h-3 w-3" />
                            <span>{item.projectName}</span>
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.dueDate)}</span>
                          </span>
                        )}
                        <span>{formatDate(item.updatedAt)}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {!isSearching && searchQuery && searchSuggestions.length > 0 && (
              <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
                {searchSuggestions.map((suggestion, index) => {
                  const suggestionIndex = searchResults.length + index;
                  return (
                    <button
                      key={`suggestion-${suggestion}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                        selectedIndex === suggestionIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Searches
                </div>
                {recentSearches.slice(0, 5).map((query, index) => {
                  const recentIndex = searchResults.length + searchSuggestions.length + index;
                  return (
                    <button
                      key={`recent-${query}`}
                      onClick={() => handleRecentSearchClick(query)}
                      className={`w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                        selectedIndex === recentIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{query}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!searchQuery && recentSearches.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Start typing to search</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Search across all your projects and tasks
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">↓</kbd>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">↵</kbd>
                  <span>to select</span>
                </span>
              </div>
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">esc</kbd>
                <span>to close</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}