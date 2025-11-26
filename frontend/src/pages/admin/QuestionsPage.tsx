import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
      alert('Failed to load courses');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Questions by Course</h1>
        <p className="text-gray-600 mt-2">
          Select a course to manage its questions
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search courses by name, track, or subtrack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? `No courses match "${searchQuery}"` : 'No courses available'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.course_id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course.course_id, course.course_name)}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.course_name}
                    </h3>
                    {course.subtracks.length > 0 && (
                      <div className="space-y-1">
                        {course.subtracks.slice(0, 2).map((st, index) => (
                          <p key={`${st.subtrack_id}-${index}`} className="text-xs text-gray-500">
                            {st.track_name} → {st.subtrack_name}
                          </p>
                        ))}
                        {course.subtracks.length > 2 && (
                          <p className="text-xs text-gray-400">
                            +{course.subtracks.length - 2} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
