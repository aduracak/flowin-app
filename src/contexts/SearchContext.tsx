import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserProjects } from '../lib/firestore';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Local type definitions for search
interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'task';
  projectId?: string;
  projectName?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string[];
  dueDate?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchableItem[];
  isSearching: boolean;
  recentSearches: string[];
  clearSearch: () => void;
  searchSuggestions: string[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<SearchableItem[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flowin-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('flowin-recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Load all projects and tasks for search
  useEffect(() => {
    if (!user) {
      setAllItems([]);
      return;
    }

    const loadSearchableData = async () => {
      try {
        setIsSearching(true);
        const items: SearchableItem[] = [];

        // Load projects
        const projects = await getUserProjects(user.id);
        projects.forEach(project => {
          items.push({
            id: project.id,
            title: project.name,
            description: project.description,
            type: 'project',
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          });
        });

        // Set up real-time listener for tasks across all user projects
        const unsubscribers: (() => void)[] = [];

        for (const project of projects) {
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('projectId', '==', project.id),
            orderBy('updatedAt', 'desc')
          );

          const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            // Remove old tasks for this project
            const filteredItems = items.filter(item => 
              !(item.type === 'task' && item.projectId === project.id)
            );

            // Add new tasks for this project
            snapshot.docs.forEach(doc => {
              const taskData = doc.data();
              
              // Helper function to convert date fields safely
              const convertDate = (dateField: any) => {
                if (!dateField) return undefined;
                if (dateField.toDate && typeof dateField.toDate === 'function') {
                  return dateField.toDate();
                }
                if (dateField instanceof Date) {
                  return dateField;
                }
                if (typeof dateField === 'string') {
                  return new Date(dateField);
                }
                return undefined;
              };
              
              filteredItems.push({
                id: doc.id,
                title: taskData.title,
                description: taskData.description,
                type: 'task',
                projectId: project.id,
                projectName: project.name,
                status: taskData.status,
                priority: taskData.priority,
                assignedTo: taskData.assignedTo,
                dueDate: convertDate(taskData.dueDate),
                tags: taskData.tags,
                createdAt: convertDate(taskData.createdAt) || new Date(),
                updatedAt: convertDate(taskData.updatedAt) || new Date(),
              });
            });

            setAllItems([...filteredItems]);
          });

          unsubscribers.push(unsubscribe);
        }

        // Cleanup function
        return () => {
          unsubscribers.forEach(unsubscribe => unsubscribe());
        };
      } catch (error) {
        console.error('Error loading searchable data:', error);
      } finally {
        setIsSearching(false);
      }
    };

    loadSearchableData();
  }, [user]);

  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);
    
    // Debounce search
    const searchTimeout = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      
      // Search through all items
      const results = allItems.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descriptionMatch = item.description?.toLowerCase().includes(query);
        const projectNameMatch = item.projectName?.toLowerCase().includes(query);
        const statusMatch = item.status?.toLowerCase().includes(query);
        const priorityMatch = item.priority?.toLowerCase().includes(query);
        const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(query));
        
        return titleMatch || descriptionMatch || projectNameMatch || 
               statusMatch || priorityMatch || tagsMatch;
      }).slice(0, 20); // Limit to 20 results
      
      setSearchResults(results);
      
      // Generate suggestions based on partial matches
      const suggestions = Array.from(new Set(
        allItems
          .filter(item => 
            item.title.toLowerCase().startsWith(query) ||
            item.tags?.some(tag => tag.toLowerCase().startsWith(query))
          )
          .map(item => item.title)
          .concat(
            allItems
              .flatMap(item => item.tags || [])
              .filter(tag => tag.toLowerCase().startsWith(query))
          )
      )).slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, allItems]);

  // Add to recent searches when user performs a search
  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() && !recentSearches.includes(query.trim())) {
      const newRecentSearches = [query.trim(), ...recentSearches.slice(0, 9)];
      setRecentSearches(newRecentSearches);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
  };

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    searchResults,
    isSearching,
    recentSearches,
    clearSearch,
    searchSuggestions,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}