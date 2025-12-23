import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit2, Tag, Search, Check, X, ArrowLeft, Link, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { SubtrackSelector } from '@/components/admin/SubtrackSelector';
import { LinksModal } from '@/components/admin/LinksModal';
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
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
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
      if (course.course_name.toLowerCase().includes(query)) {
        return true;
      }
      if (course.subtracks.some(st => st.subtrack_name.toLowerCase().includes(query))) {
        return true;
      }
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

  const openLinksModal = (course: CourseWithSubtracks) => {
    setSelectedCourse(course);
    setIsLinksModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="mb-6">
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-apple-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-title-1 font-semibold text-apple-gray-6">Courses</h1>
              <p className="text-body text-apple-gray-4">
                {courses.length} course{courses.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
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
      ) : courses.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No courses yet</h3>
            <p className="text-body text-apple-gray-4 mb-6">Get started by creating your first course.</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No results found</h3>
            <p className="text-body text-apple-gray-4">No courses match "{searchQuery}"</p>
          </div>
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-apple-gray-1 border-b border-apple-gray-2">
                  <th className="px-4 py-3 text-left text-mini font-semibold text-apple-gray-5 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-4 py-3 text-left text-mini font-semibold text-apple-gray-5 uppercase tracking-wider">
                    SubTracks & Tracks
                  </th>
                  <th className="px-4 py-3 text-right text-mini font-semibold text-apple-gray-5 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-gray-2">
                {filteredCourses.map((course, index) => (
                  <tr 
                    key={course.course_id} 
                    className="hover:bg-apple-gray-1 transition-colors"
                    style={{ animationDelay: `${0.2 + index * 0.02}s` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          {editingCourseId === course.course_id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editCourseName}
                                onChange={(e) => setEditCourseName(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-apple-gray-3 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent text-body"
                                autoFocus
                                disabled={saving}
                              />
                              <button
                                onClick={() => saveCourseName(course.course_id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                disabled={saving}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditingCourse}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                disabled={saving}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="text-body font-medium text-apple-gray-6">
                                {course.course_name}
                              </span>
                              <button
                                onClick={() => startEditingCourse(course)}
                                className="p-1 rounded text-apple-gray-3 hover:text-apple-gray-5 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {course.subtracks.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {course.subtracks.map((st, idx) => (
                            <div
                              key={`${st.subtrack_id}-${idx}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200"
                            >
                              <Tag className="w-3 h-3 text-blue-600" />
                              <span className="text-mini font-medium text-blue-900">{st.subtrack_name}</span>
                              <span className="text-blue-400">·</span>
                              <span className="text-mini text-blue-600">{st.track_name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-caption text-apple-gray-4 italic">
                          Not assigned to any subtrack
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openLinksModal(course)}
                        >
                          <Link className="w-4 h-4 mr-1" />
                          Links
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditSubtracks(course)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to SubTrack
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-apple-gray-1 border-t border-apple-gray-2">
            <p className="text-mini text-apple-gray-4">
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
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-body text-blue-800">
              After entering the course name, you'll select which subtrack this course belongs to.
            </p>
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Next: Select SubTrack</Button>
          </ModalFooter>
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

      {/* Links Modal */}
      {selectedCourse && (
        <LinksModal
          isOpen={isLinksModalOpen}
          onClose={() => {
            setIsLinksModalOpen(false);
            setSelectedCourse(null);
          }}
          courseId={selectedCourse.course_id}
          courseName={selectedCourse.course_name}
        />
      )}
    </div>
  );
};
