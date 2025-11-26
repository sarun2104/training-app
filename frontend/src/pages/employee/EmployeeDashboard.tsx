import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your learning dashboard</p>
        </div>
        <NotificationBell />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/employee/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-4">
              <Award className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">My Profile</h3>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Courses */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No courses assigned
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Contact your administrator to get assigned to courses.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course: any) => (
              <Link key={course.course_id} to={`/employee/courses/${course.course_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.course_name || course.title}
                      </h3>
                      {course.due_date && (
                        <div className="mt-2 text-xs text-orange-600 font-medium">
                          Due: {new Date(course.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          course.status === 'completed' ? 'bg-green-100 text-green-800' :
                          course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          course.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status === 'in_progress' ? 'In Progress' :
                           course.status === 'completed' ? 'Completed' :
                           course.status === 'failed' ? 'Failed' :
                           'Not Started'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
