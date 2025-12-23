import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Search, FileQuestion, ChevronRight, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/admin.service';

interface CourseWithSubtracks {
  course_id: string;
  course_name: string;
  subtracks: Array<{
    subtrack_id: string;
    subtrack_name: string;
    track_id: string;
    track_name: string;
  }>;
}

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithSubtracks[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    if (course.course_name.toLowerCase().includes(query)) return true;
    if (course.subtracks.some(st => st.subtrack_name.toLowerCase().includes(query))) return true;
    if (course.subtracks.some(st => st.track_name.toLowerCase().includes(query))) return true;
    return false;
  });

  const handleCourseClick = (courseId: string, courseName: string) => {
    navigate(`/admin/questions/${courseId}`, { state: { courseName } });
  };

  // Course card gradient colors
  const getCardGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-green-600',
      'from-purple-500 to-violet-600',
      'from-orange-500 to-amber-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-teal-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
            <FileQuestion className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-display-2 font-semibold text-apple-gray-6">Questions by Course</h1>
            <p className="text-body text-apple-gray-4">
              Select a course to manage its quiz questions
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Input
          variant="filled"
          icon={<Search className="w-5 h-5" />}
          placeholder="Search courses by name, track, or subtrack..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
              <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
            </div>
            <p className="text-apple-gray-4 text-body">Loading courses...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No courses found</h3>
            <p className="text-body text-apple-gray-4">
              {searchQuery ? `No courses match "${searchQuery}"` : 'No courses available'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <Card
              key={course.course_id}
              variant="elevated"
              hover
              className="cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${0.1 + index * 0.03}s` }}
              onClick={() => handleCourseClick(course.course_id, course.course_name)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCardGradient(course.course_name)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title-3 font-semibold text-apple-gray-6 mb-2 group-hover:text-apple-blue transition-colors line-clamp-2">
                      {course.course_name}
                    </h3>
                    
                    {course.subtracks.length > 0 && (
                      <div className="space-y-1.5">
                        {course.subtracks.slice(0, 2).map((st, idx) => (
                          <div key={`${st.subtrack_id}-${idx}`} className="flex items-center gap-1 text-caption text-apple-gray-4">
                            <Tag className="w-3 h-3" />
                            <span className="truncate">{st.track_name} → {st.subtrack_name}</span>
                          </div>
                        ))}
                        {course.subtracks.length > 2 && (
                          <span className="text-mini text-apple-gray-3">
                            +{course.subtracks.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-apple-gray-3 group-hover:text-apple-blue group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredCourses.length > 0 && (
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-caption text-apple-gray-4">
            Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};
