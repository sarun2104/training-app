# Learning Management System - Frontend

Modern, responsive React frontend for the Learning Management System with complete admin and employee workflows.

## Features

### Authentication
- ✅ Login with JWT token management
- ✅ Role-based access control (Admin/Employee)
- ✅ Automatic token refresh
- ✅ Secure logout

### Admin Features
- ✅ **Dashboard** - Overview of system statistics
- ✅ **Track Management** - Create and manage learning tracks
- ✅ **SubTrack Management** - Organize tracks into subtracks
- ✅ **Course Management** - Create courses with study materials
- ✅ **Study Resources** - Add links to external resources
- ✅ **Question Bank** - Create and manage quiz questions
- ✅ **Employee Management** - Create employees and manage assignments
- ✅ **Assignments** - Assign tracks and courses to employees
- ✅ **Reports** - View employee progress and analytics

### Employee Features
- ✅ **Dashboard** - Personal learning overview
- ✅ **Course Catalog** - View all assigned courses
- ✅ **Course Details** - Access study materials and resources
- ✅ **Quizzes** - Take course quizzes with instant results
- ✅ **Progress Tracking** - Monitor course completion
- ✅ **Profile** - View personal training profile

## Tech Stack

- **React 18.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components (Navbar)
│   │   └── ui/              # UI components (Button, Input, Card, Modal)
│   ├── contexts/            # React contexts (AuthContext)
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── TracksPage.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   └── EmployeesPage.tsx
│   │   ├── employee/        # Employee pages
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   ├── CourseDetailPage.tsx
│   │   │   └── QuizPage.tsx
│   │   └── Login.tsx        # Login page
│   ├── services/            # API services
│   │   ├── api.ts           # Axios client configuration
│   │   ├── auth.service.ts  # Authentication API
│   │   ├── admin.service.ts # Admin API
│   │   └── employee.service.ts # Employee API
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   VITE_API_URL=http://localhost:8000
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Usage

### Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Employee:**
- Username: `employee`
- Password: `employee123`

### Admin Workflow

1. **Login** as admin
2. **Create Tracks** - Define learning paths
3. **Create SubTracks** - Organize tracks
4. **Create Courses** - Add courses to subtracks
5. **Add Study Resources** - Link external resources
6. **Create Questions** - Build quiz question bank
7. **Create Employees** - Add employee accounts
8. **Assign Courses/Tracks** - Assign learning to employees

### Employee Workflow

1. **Login** as employee
2. **View Dashboard** - See assigned courses
3. **Browse Courses** - Explore course catalog
4. **Access Course** - View course details and resources
5. **Start Course** - Begin learning
6. **Take Quiz** - Complete course assessment
7. **Track Progress** - Monitor completion

## API Integration

### Authentication

The app uses JWT tokens for authentication:

```typescript
// Login
const response = await authService.login({ username, password });

// Access protected endpoints
const courses = await employeeService.getAssignedCourses();
```

### Request Interceptor

All API requests automatically include the JWT token:

```typescript
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

401 errors automatically redirect to login:

```typescript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Components

### UI Components

**Button**
```tsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

**Input**
```tsx
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter username"
  required
/>
```

**Card**
```tsx
<Card title="Card Title">
  <p>Card content</p>
</Card>
```

**Modal**
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

### Layout Components

**Navbar**
```tsx
<Navbar /> // Automatically shows user info and logout
```

## State Management

### Authentication Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAdmin, isEmployee } = useAuth();

  // Access current user
  console.log(user);

  // Check role
  if (isAdmin) {
    // Admin-specific code
  }
}
```

## Routing

### Protected Routes

```tsx
<PrivateRoute role="admin">
  <AdminDashboard />
</PrivateRoute>
```

### Navigation

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/employee/courses');
```

## Styling

### Tailwind CSS

Custom theme colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... up to 900
      },
    },
  },
}
```

### Custom Classes

```tsx
<div className="bg-primary-600 text-white rounded-lg p-4">
  Content
</div>
```

## TypeScript

### Type Definitions

All API responses are typed:

```typescript
interface Course {
  course_id: number;
  title: string;
  description: string;
  subtrack_id: number;
  links?: StudyLink[];
}
```

### Type Safety

```typescript
// API service methods are fully typed
const courses: Course[] = await employeeService.getAssignedCourses();
```

## Performance

### Code Splitting

React Router automatically code-splits routes

### Production Build

- Minified JavaScript
- Optimized CSS
- Tree-shaking
- Asset optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the backend CORS settings include:

```python
ALLOWED_ORIGINS=http://localhost:3000
```

### API Connection

Verify the API URL in `.env`:

```env
VITE_API_URL=http://localhost:8000
```

### Build Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Hot Module Replacement

Vite provides instant HMR - changes appear immediately

### TypeScript Errors

Run type checking:

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Future Enhancements

- [ ] Notifications system
- [ ] File upload for course materials
- [ ] Video integration
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Real-time updates (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Bulk operations
- [ ] Export reports (PDF/Excel)

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Same as the main project.

## Support

For issues or questions, please contact the development team or create an issue in the repository.
