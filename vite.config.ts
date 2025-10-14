import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['framer-motion', '@headlessui/react'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'icons': ['lucide-react'],
          'toast': ['react-hot-toast'],
          // App chunks
          'dashboard': [
            './src/components/dashboard/Dashboard.tsx',
            './src/components/dashboard/DashboardHome.tsx',
            './src/components/dashboard/Header.tsx',
            './src/components/dashboard/Sidebar.tsx',
            './src/components/dashboard/SettingsPage.tsx',
            './src/components/dashboard/TeamPage.tsx',
            './src/components/dashboard/ProjectBoard.tsx'
          ],
          'kanban': [
            './src/components/kanban/KanbanBoard.tsx',
            './src/components/kanban/KanbanColumn.tsx',
            './src/components/kanban/TaskCard.tsx',
            './src/components/kanban/TaskModal.tsx'
          ],
          'contexts': [
            './src/contexts/AuthContext.tsx',
            './src/contexts/ThemeContext.tsx',
            './src/contexts/SearchContext.tsx',
            './src/contexts/NotificationContext.tsx',
            './src/contexts/ConfirmationContext.tsx',
            './src/contexts/MobileContext.tsx'
          ]
        }
      }
    },
    // Increase chunk size warning limit to 1000kb since we're optimizing
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging in production
    sourcemap: false,
    // Optimize for production (uses esbuild by default)
    minify: true
  }
})
