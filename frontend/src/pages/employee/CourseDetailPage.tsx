import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink, PlayCircle, FileQuestion, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employee.service';
import { Course } from '@/types';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const data = await employeeService.getCourseDetails(courseId!);
      console.log('Course details:', data);
      setCourse(data);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async () => {
    setStarting(true);
    try {
      await employeeService.startCourse(courseId!);
      alert('Course started! You can now access the study materials.');
      loadCourse();
    } catch (error) {
      console.error('Failed to start course:', error);
      alert('Failed to start course');
    } finally {
      setStarting(false);
    }
  };

  const handleTakeQuiz = () => {
    navigate(`/employee/courses/${courseId}/quiz`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Course not found</h3>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/employee/dashboard')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{(course as any).course_name || course.title}</h1>
                  {course.description && (
                    <p className="text-gray-600 mt-2">{course.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Study Resources */}
          <Card title="Study Resources">
            {course.links && course.links.length > 0 ? (
              <div className="space-y-3">
                {course.links.map((link) => (
                  <a
                    key={link.link_id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <ExternalLink className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{link.title}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No study resources available yet.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Course Actions */}
          <Card title="Course Actions">
            <div className="space-y-3">
              {course.status === 'assigned' && (
                <Button
                  className="w-full"
                  onClick={handleStartCourse}
                  loading={starting}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Course
                </Button>
              )}

              <Button
                className="w-full"
                variant="secondary"
                onClick={handleTakeQuiz}
                disabled={course.status === 'completed'}
              >
                <FileQuestion className="mr-2 h-5 w-5" />
                {course.status === 'completed' ? 'Quiz Completed' : course.status === 'failed' ? 'Retake Quiz' : 'Take Quiz'}
              </Button>
            </div>
          </Card>

          {/* Progress */}
          {course.progress !== undefined && (
            <Card title="Your Progress">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Completion</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {course.status && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Status
                      </span>
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
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
