import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit2, Tag, Search, Check, X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SubtrackSelector } from '@/components/admin/SubtrackSelector';
import { adminService } from '@/services/admin.service';

interface SubtrackInfo {
  subtrack_id: string;
  subtrack_name: string;
  track_id: string;
  track_name: string;
}

interface CourseWithSubtracks {
  course_id: string;
  course_name: string;
  subtracks: SubtrackInfo[];
}

interface SubtrackWithTrack {
  subtrack_id: string;
  subtrack_name: string;
  track_id: string;
  track_name: string;
}

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithSubtracks[]>([]);
  const [tracksTree, setTracksTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubtrackSelectorOpen, setIsSubtrackSelectorOpen] = useState(false);
  const [isEditSubtracksOpen, setIsEditSubtracksOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithSubtracks | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [formData, setFormData] = useState({
    course_name: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, tracksData] = await Promise.all([
        adminService.getCourses(),
        adminService.getTracksTree(),
      ]);
      setCourses(coursesData);
      setTracksTree(tracksData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses;
    }

    const query = searchQuery.toLowerCase();
    return courses.filter((course) => {
      // Search in course name
      if (course.course_name.toLowerCase().includes(query)) {
        return true;
      }
      // Search in subtrack names
      if (course.subtracks.some(st => st.subtrack_name.toLowerCase().includes(query))) {
        return true;
      }
      // Search in track names
      if (course.subtracks.some(st => st.track_name.toLowerCase().includes(query))) {
        return true;
      }
      return false;
    });
  }, [courses, searchQuery]);

  // Flatten tracks tree to get all subtracks with track info
  const getAllSubtracks = (): SubtrackWithTrack[] => {
    const subtracks: SubtrackWithTrack[] = [];
    tracksTree.forEach((track) => {
      track.subtracks.forEach((subtrack: any) => {
        subtracks.push({
          subtrack_id: subtrack.subtrack_id,
          subtrack_name: subtrack.subtrack_name,
          track_id: track.track_id,
          track_name: track.track_name,
        });
      });
    });
    return subtracks;
  };

  const handleCreateCourse = async (subtrackId: string) => {
    if (!formData.course_name.trim()) {
      alert('Please enter a course name');
      return;
    }

    setSaving(true);
    try {
      await adminService.createCourse({
        course_name: formData.course_name,
        parent_id: subtrackId,
        parent_type: 'subtrack',
      });
      setIsCreateModalOpen(false);
      setIsSubtrackSelectorOpen(false);
      setFormData({ course_name: '' });
      loadData();
    } catch (error: any) {
      console.error('Failed to create course:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create course';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAddToSubtrack = async (subtrackId: string) => {
    if (!selectedCourse) return;

    setSaving(true);
    try {
      await adminService.addCourseToSubtrack(selectedCourse.course_id, subtrackId);
      setIsEditSubtracksOpen(false);
      setSelectedCourse(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to add course to subtrack:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to add course to subtrack';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const startEditingCourse = (course: CourseWithSubtracks) => {
    setEditingCourseId(course.course_id);
    setEditCourseName(course.course_name);
  };

  const cancelEditingCourse = () => {
    setEditingCourseId(null);
    setEditCourseName('');
  };

  const saveCourseName = async (courseId: string) => {
    if (!editCourseName.trim()) {
      alert('Course name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await adminService.updateCourse(courseId, { course_name: editCourseName });
      setEditingCourseId(null);
      setEditCourseName('');
      loadData();
    } catch (error: any) {
      console.error('Failed to update course:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update course';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ course_name: '' });
    setIsCreateModalOpen(true);
  };

  const openEditSubtracks = (course: CourseWithSubtracks) => {
    setSelectedCourse(course);
    setIsEditSubtracksOpen(true);
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">
            Manage courses and assign them to multiple subtracks
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={20} className="mr-2" />
          Create Course
        </Button>
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
      ) : courses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new course.
            </p>
            <div className="mt-6">
              <Button onClick={openCreateModal}>
                <Plus size={20} className="mr-2" />
                Create Course
              </Button>
            </div>
          </div>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No courses match your search query "{searchQuery}"
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SubTracks & Tracks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.course_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          {editingCourseId === course.course_id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editCourseName}
                                onChange={(e) => setEditCourseName(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                                disabled={saving}
                              />
                              <button
                                onClick={() => saveCourseName(course.course_id)}
                                className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                                disabled={saving}
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={cancelEditingCourse}
                                className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                                disabled={saving}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {course.course_name}
                              </span>
                              <button
                                onClick={() => startEditingCourse(course)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.subtracks.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {course.subtracks.map((st, index) => (
                            <div
                              key={`${st.subtrack_id}-${index}`}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs bg-blue-50 border border-blue-200"
                            >
                              <Tag className="h-3 w-3 text-blue-600 mr-1" />
                              <span className="font-medium text-blue-900">{st.subtrack_name}</span>
                              <span className="mx-1 text-blue-400">·</span>
                              <span className="text-blue-600">{st.track_name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          Not assigned to any subtrack
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditSubtracks(course)}
                      >
                        <Plus size={14} className="mr-1" />
                        Add to SubTrack
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
      )}

      {/* Create Course Modal - Step 1: Enter Course Name */}
      <Modal
        isOpen={isCreateModalOpen && !isSubtrackSelectorOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Course"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsSubtrackSelectorOpen(true);
          }}
          className="space-y-4"
        >
          <Input
            label="Course Name"
            value={formData.course_name}
            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
            placeholder="e.g., Introduction to FastAPI"
            required
            autoFocus
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              After entering the course name, you'll select which subtrack this course belongs
              to.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Next: Select SubTrack</Button>
          </div>
        </form>
      </Modal>

      {/* SubTrack Selector for Creating Course */}
      <SubtrackSelector
        isOpen={isSubtrackSelectorOpen}
        onClose={() => {
          setIsSubtrackSelectorOpen(false);
          setIsCreateModalOpen(false);
        }}
        subtracks={getAllSubtracks()}
        onSelect={handleCreateCourse}
        title="Select SubTrack for New Course"
      />

      {/* SubTrack Selector for Adding Course to Additional Subtracks */}
      <SubtrackSelector
        isOpen={isEditSubtracksOpen}
        onClose={() => {
          setIsEditSubtracksOpen(false);
          setSelectedCourse(null);
        }}
        subtracks={getAllSubtracks()}
        onSelect={handleAddToSubtrack}
        selectedSubtracks={selectedCourse?.subtracks.map((st) => st.subtrack_id) || []}
        title={`Add "${selectedCourse?.course_name}" to SubTrack`}
      />
    </div>
  );
};
