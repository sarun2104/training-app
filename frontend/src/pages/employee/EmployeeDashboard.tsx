import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Award, ArrowRight, Sparkles, Play, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { employeeService } from '@/services/employee.service';
import { Course } from '@/types';
import { NotificationBell } from '@/components/employee/NotificationBell';

export const EmployeeDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await employeeService.getAssignedCourses();
      console.log('Loaded courses:', data);
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: courses.length,
    completed: courses.filter((c) => c.status === 'completed').length,
    inProgress: courses.filter((c) => c.status === 'in_progress').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statusConfig = {
    completed: { 
      label: 'Completed', 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      icon: CheckCircle,
    },
    in_progress: { 
      label: 'In Progress', 
      bg: 'bg-amber-50', 
      text: 'text-amber-600',
      border: 'border-amber-100',
      icon: Play,
    },
    failed: { 
      label: 'Failed', 
      bg: 'bg-red-50', 
      text: 'text-red-600',
      border: 'border-red-100',
      icon: Target,
    },
    not_started: { 
      label: 'Not Started', 
      bg: 'bg-gray-50', 
      text: 'text-apple-gray-5',
      border: 'border-gray-100',
      icon: Clock,
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-apple">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-caption font-medium text-primary-600 uppercase tracking-wide">
                  My Dashboard
                </span>
              </div>
              <h1 className="text-headline text-apple-gray-6 mb-2">
                Keep learning
              </h1>
              <p className="text-body-large text-apple-gray-4 max-w-xl">
                Continue your journey and unlock new skills.
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Progress Overview */}
        <Card variant="gradient" padding="none" className="mb-8 overflow-hidden animate-slide-up">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Completion Ring */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      className="text-apple-gray-2"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${completionRate * 2.64} 264`}
                      strokeLinecap="round"
                      className="text-primary-500 transition-all duration-1000 ease-apple"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-title-2 text-apple-gray-6">{completionRate}%</span>
                      <p className="text-mini text-apple-gray-4">Complete</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="lg:col-span-3 grid grid-cols-3 gap-5">
                <div className="text-center lg:text-left p-4 bg-white/50 rounded-apple">
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-blue-100 rounded-apple mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-title-1 text-apple-gray-6">{stats.total}</p>
                  <p className="text-caption text-apple-gray-4">Total Courses</p>
                </div>

                <div className="text-center lg:text-left p-4 bg-white/50 rounded-apple">
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-amber-100 rounded-apple mb-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-title-1 text-apple-gray-6">{stats.inProgress}</p>
                  <p className="text-caption text-apple-gray-4">In Progress</p>
                </div>

                <div className="text-center lg:text-left p-4 bg-white/50 rounded-apple">
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-emerald-100 rounded-apple mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-title-1 text-apple-gray-6">{stats.completed}</p>
                  <p className="text-caption text-apple-gray-4">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Link to="/employee/profile">
            <Card variant="default" hover padding="none" className="group">
              <div className="p-5 flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-apple shadow-apple">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-title-3 font-semibold text-apple-gray-6 flex items-center gap-2">
                    My Profile
                    <ArrowRight className="h-4 w-4 text-apple-gray-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-body text-apple-gray-4">View your achievements and progress</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/employee/capstones">
            <Card variant="default" hover padding="none" className="group">
              <div className="p-5 flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-apple shadow-apple">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-title-3 font-semibold text-apple-gray-6 flex items-center gap-2">
                    Capstone Projects
                    <ArrowRight className="h-4 w-4 text-apple-gray-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-body text-apple-gray-4">Explore hands-on projects</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Courses Section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-title-1 text-apple-gray-6">My Courses</h2>
          <Link 
            to="/employee/courses" 
            className="text-body font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="default" padding="none">
                <div className="p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-apple-gray-2 rounded-apple" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-apple-gray-2 rounded w-3/4" />
                      <div className="h-4 bg-apple-gray-2 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card variant="default" padding="none">
            <div className="text-center py-14 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-apple-gray-1 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-apple-gray-4" />
              </div>
              <h3 className="text-title-3 font-semibold text-apple-gray-6 mb-2">
                No courses assigned yet
              </h3>
              <p className="text-body text-apple-gray-4 max-w-sm mx-auto">
                Contact your administrator to get assigned to learning tracks and courses.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 6).map((course: any, index: number) => {
              const status = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.not_started;
              const StatusIcon = status.icon;
              
              return (
                <Link 
                  key={course.course_id} 
                  to={`/employee/courses/${course.course_id}`}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card variant="default" hover padding="none" className="h-full group">
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-apple shadow-apple">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-title-3 font-semibold text-apple-gray-6 truncate group-hover:text-primary-600 transition-colors">
                            {course.course_name || course.title}
                          </h3>
                          {course.due_date && (
                            <p className="text-caption text-apple-orange font-medium mt-1">
                              Due: {new Date(course.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${status.bg} ${status.text} border ${status.border} rounded-full text-caption font-medium`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-apple-gray-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
