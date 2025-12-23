import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Play, Target, ArrowRight, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { employeeService } from '@/services/employee.service';
import { Course } from '@/types';

export const EmployeeCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await employeeService.getAssignedCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    completed: { 
      label: 'Completed', 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
    },
    in_progress: { 
      label: 'In Progress', 
      bg: 'bg-amber-50', 
      text: 'text-amber-600',
      border: 'border-amber-100',
      icon: Play,
      gradient: 'from-amber-500 to-orange-500',
    },
    failed: { 
      label: 'Failed', 
      bg: 'bg-red-50', 
      text: 'text-red-600',
      border: 'border-red-100',
      icon: Target,
      gradient: 'from-red-500 to-rose-500',
    },
    not_started: { 
      label: 'Not Started', 
      bg: 'bg-gray-50', 
      text: 'text-apple-gray-5',
      border: 'border-gray-100',
      icon: Clock,
      gradient: 'from-gray-400 to-gray-500',
    },
  };

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = (course.course_name || course.title || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: courses.length,
    not_started: courses.filter((c: any) => !c.status || c.status === 'not_started').length,
    in_progress: courses.filter((c: any) => c.status === 'in_progress').length,
    completed: courses.filter((c: any) => c.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="mb-5 animate-slide-up">
          <h1 className="text-title-1 text-apple-gray-6 mb-1">My Courses</h1>
          <p className="text-body text-apple-gray-4">
            Continue your learning journey with these courses
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <Card variant="glass" padding="none">
            <div className="p-3 flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={16} />}
                  variant="filled"
                />
              </div>
              
              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'not_started', label: 'Not Started' },
                  { key: 'completed', label: 'Completed' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`px-3 py-1.5 rounded-full text-mini font-medium transition-all duration-200 ${
                      statusFilter === filter.key
                        ? 'bg-primary-600 text-white shadow-apple'
                        : 'bg-apple-gray-1 text-apple-gray-5 hover:bg-apple-gray-2'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-1 opacity-70">
                      ({statusCounts[filter.key as keyof typeof statusCounts] || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} variant="default" padding="none">
                <div className="p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-apple-gray-2 rounded-apple" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-apple-gray-2 rounded w-3/4" />
                      <div className="h-3 bg-apple-gray-2 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card variant="default" padding="none">
            <div className="text-center py-12 px-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-apple-gray-1 rounded-full mb-4">
                <BookOpen className="h-7 w-7 text-apple-gray-4" />
              </div>
              <h3 className="text-body font-semibold text-apple-gray-6 mb-1">
                {courses.length === 0 ? 'No courses assigned yet' : 'No courses match your search'}
              </h3>
              <p className="text-caption text-apple-gray-4 max-w-sm mx-auto">
                {courses.length === 0 
                  ? 'Contact your administrator to get assigned to learning tracks and courses.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course: any, index: number) => {
              const status = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.not_started;
              const StatusIcon = status.icon;
              
              return (
                <Link 
                  key={course.course_id} 
                  to={`/employee/courses/${course.course_id}`}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index % 6) * 50}ms` }}
                >
                  <Card variant="default" hover padding="none" className="h-full group">
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2.5 bg-gradient-to-br ${status.gradient} rounded-apple shadow-apple`}>
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body font-semibold text-apple-gray-6 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {course.course_name || course.title}
                          </h3>
                          {course.due_date && (
                            <p className="text-mini text-apple-orange font-medium mt-0.5">
                              Due: {new Date(course.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${status.bg} ${status.text} border ${status.border} rounded-full text-mini font-medium`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-apple-gray-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
