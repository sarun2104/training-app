import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ExternalLink, 
  PlayCircle, 
  FileQuestion, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employee.service';
import { Course } from '@/types';

// Status configuration for consistent styling
const statusConfig = {
  assigned: {
    label: 'Not Started',
    icon: Clock,
    gradient: 'from-gray-500 to-slate-600',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200'
  },
  in_progress: {
    label: 'In Progress',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  }
};

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
      loadCourse();
    } catch (error) {
      console.error('Failed to start course:', error);
    } finally {
      setStarting(false);
    }
  };

  const handleTakeQuiz = () => {
    navigate(`/employee/courses/${courseId}/quiz`);
  };

  const status = course?.status ? statusConfig[course.status as keyof typeof statusConfig] : statusConfig.assigned;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
            <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
          </div>
          <p className="text-apple-gray-4 text-body">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card variant="elevated" className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">Course not found</h3>
          <p className="text-body text-apple-gray-4 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline" onClick={() => navigate('/employee/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/employee/courses')}
          className="group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Courses
        </Button>
      </div>

      {/* Hero Section */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Card variant="gradient" className="overflow-hidden">
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Course Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${status.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                
                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium ${status.bg} ${status.text} ${status.border} border`}>
                      <status.icon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                  <h1 className="text-display-2 font-semibold text-apple-gray-6 mb-3">
                    {(course as any).course_name || course.title}
                  </h1>
                  {course.description && (
                    <p className="text-body-large text-apple-gray-4 max-w-2xl">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Study Resources */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-title-3 font-semibold text-apple-gray-6">Study Resources</h2>
                    <p className="text-mini text-apple-gray-4">{course.links?.length || 0} resources available</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {course.links && course.links.length > 0 ? (
                  <div className="space-y-3">
                    {course.links.map((link, index) => (
                      <a
                        key={link.link_id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-3 rounded-lg border border-apple-gray-2 bg-white hover:border-apple-blue/30 hover:bg-blue-50/50 transition-all duration-300"
                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                            <ExternalLink className="w-4 h-4 text-apple-gray-4 group-hover:text-apple-blue transition-colors" />
                          </div>
                          <span className="font-medium text-apple-gray-6 group-hover:text-apple-blue transition-colors">
                            {link.title}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-apple-gray-3 group-hover:text-apple-blue transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <LinkIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-body text-apple-gray-4">No study resources available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Course Actions */}
          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-body font-semibold text-apple-gray-6">Actions</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.status === 'assigned' && (
                    <Button
                      className="w-full justify-center"
                      onClick={handleStartCourse}
                      loading={starting}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Start Course
                    </Button>
                  )}

                  <Button
                    className="w-full justify-center"
                    variant={course.status === 'completed' ? 'secondary' : 'outline'}
                    onClick={handleTakeQuiz}
                    disabled={course.status === 'completed'}
                  >
                    <FileQuestion className="w-5 h-5 mr-2" />
                    {course.status === 'completed' ? 'Quiz Completed' : course.status === 'failed' ? 'Retake Quiz' : 'Take Quiz'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Card */}
          {course.progress !== undefined && (
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Card variant="elevated">
                <CardHeader>
                  <h2 className="text-title-3 font-semibold text-apple-gray-6">Your Progress</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Circular Progress */}
                    <div className="flex justify-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-apple-gray-2"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - (course.progress || 0) / 100)}`}
                            className="transition-all duration-1000 ease-out"
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-headline font-bold text-apple-gray-6">{course.progress}%</span>
                            <span className="block text-mini text-apple-gray-4">Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {course.status && (
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.border} border`}>
                          <status.icon className={`w-4 h-4 ${status.text}`} />
                          <span className={`text-body font-medium ${status.text}`}>{status.label}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
