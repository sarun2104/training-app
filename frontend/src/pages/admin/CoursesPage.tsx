import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Link as LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { Course, SubTrack } from '@/types';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subtracks, setSubtracks] = useState<SubTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subtrack_id: '',
  });
  const [linkData, setLinkData] = useState({ url: '', title: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, subtracksData] = await Promise.all([
        adminService.getCourses(),
        adminService.getSubTracks(),
      ]);
      setCourses(coursesData);
      setSubtracks(subtracksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminService.createCourse({
        ...formData,
        subtrack_id: parseInt(formData.subtrack_id),
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', subtrack_id: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setSaving(true);
    try {
      await adminService.addStudyLink({
        course_id: selectedCourse,
        ...linkData,
      });
      setIsLinkModalOpen(false);
      setLinkData({ url: '', title: '' });
      setSelectedCourse(null);
    } catch (error) {
      console.error('Failed to add link:', error);
      alert('Failed to add study link');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Manage courses and learning materials</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Create Course
        </Button>
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
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Create Course
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.course_id}>
              <div>
                <div className="flex items-start">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">{course.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedCourse(course.course_id);
                      setIsLinkModalOpen(true);
                    }}
                  >
                    <LinkIcon size={16} className="mr-2" />
                    Add Resource
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Course"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Introduction to FastAPI"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Course description..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SubTrack
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.subtrack_id}
              onChange={(e) =>
                setFormData({ ...formData, subtrack_id: e.target.value })
              }
              required
            >
              <option value="">Select a subtrack</option>
              {subtracks.map((st) => (
                <option key={st.subtrack_id} value={st.subtrack_id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Study Link Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setSelectedCourse(null);
        }}
        title="Add Study Resource"
      >
        <form onSubmit={handleAddLink} className="space-y-4">
          <Input
            label="Resource Title"
            value={linkData.title}
            onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
            placeholder="e.g., FastAPI Documentation"
            required
          />
          <Input
            label="URL"
            type="url"
            value={linkData.url}
            onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
            placeholder="https://example.com"
            required
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsLinkModalOpen(false);
                setSelectedCourse(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Add Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
