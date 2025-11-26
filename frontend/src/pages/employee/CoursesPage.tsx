import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { employeeService } from '@/services/employee.service';
import { Course } from '@/types';

export const EmployeeCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">All your assigned courses</p>
      </div>

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
          {courses.map((course: any) => (
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : course.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : course.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
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
  );
};
