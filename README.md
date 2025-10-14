# Flowin - Modern Team Task Management 🚀

A beautiful, modern task management application built with React, TypeScript, and Firebase. Flowin helps teams organize, track, and collaborate on projects with an intuitive Kanban board interface.

## ✨ Features

### 🎯 Core Features
- **Kanban Board**: Drag-and-drop task management with To Do, In Progress, and Done columns
- **Real-time Collaboration**: Live updates across all connected devices using Firestore
- **Project Management**: Create and manage multiple projects with team members
- **Task Management**: Create, edit, delete, and organize tasks with priorities, labels, and due dates
- **User Authentication**: Secure Firebase Authentication with email/password
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 🎨 UI/UX Features
- **Dark/Light Mode**: Beautiful theme switching with system preference detection
- **Smooth Animations**: Framer Motion powered animations throughout the app
- **Modern Design**: Clean, professional interface using Tailwind CSS
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Elegant loading indicators and skeleton screens

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **Firebase Integration**: Firestore database, Authentication, and Hosting
- **Real-time Sync**: Instant updates using Firestore real-time listeners
- **Security**: Comprehensive Firestore security rules
- **Performance Optimized**: Fast loading with code splitting

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, DnD Kit
**Backend**: Firebase (Auth, Firestore, Hosting), Firestore Security Rules
**Development**: ESLint, TypeScript, Hot Module Replacement

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account and project

### Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd flowin-app
   npm install
   ```

2. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database
   - Update `src/lib/firebase.ts` with your config

3. **Deploy Firestore Rules**
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📱 Usage

1. **Sign Up**: Create account with email/password
2. **Create Project**: Click "New Project" - choose from templates or create custom
3. **Add Tasks**: Use "Add Task" button or "+" on columns
4. **Organize**: Drag tasks between columns
5. **Collaborate**: Real-time updates across all devices

### Key Features
- **Drag & Drop**: Move tasks between To Do, In Progress, Done
- **Task Editing**: Click edit icon to modify tasks
- **Priorities**: Set Low, Medium, High, Urgent priorities
- **Labels**: Add custom labels for organization
- **Due Dates**: Set deadlines for better planning
- **Real-time**: See changes instantly across devices

## 🚀 Deployment

### Firebase Hosting
```bash
npm run deploy        # Build and deploy everything
npm run deploy:hosting # Deploy only hosting
npm run build         # Build for production
```

Your app will be live at `https://your-project-id.web.app`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Login, Register, Protected routes
│   ├── common/         # Toast notifications, shared components
│   ├── dashboard/      # Dashboard, Project management
│   └── kanban/         # Kanban board, Task cards, Modals
├── contexts/           # Auth and Theme contexts
├── lib/                # Firebase config and Firestore operations
└── types/              # TypeScript definitions
```

## 🔥 Firebase Configuration

The app uses comprehensive Firestore security rules:
- Users can only access their own data
- Project members can read/write project tasks
- Real-time updates are secured per user permissions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 🐛 Troubleshooting

**Firebase Index Errors**: Click the console link to create required indexes
**Auth Issues**: Ensure Email/Password provider is enabled in Firebase
**Build Errors**: Clear node_modules: `rm -rf node_modules && npm install`

## 📝 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using React, TypeScript, and Firebase**
