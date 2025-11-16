import React, { useEffect, useState } from 'react';
import { Plus, Users, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { User, Track, Course } from '@/types';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [assignmentType, setAssignmentType] = useState<'track' | 'course'>('track');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [employeesData, tracksData, coursesData] = await Promise.all([
        adminService.getEmployees(),
        adminService.getTracks(),
        adminService.getCourses(),
      ]);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setTracks(tracksData);
      setCourses(coursesData);
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
      await adminService.createEmployee(formData);
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', full_name: '' });
      loadData();
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      alert(error.response?.data?.detail || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignment = async (itemId: number) => {
    if (!selectedEmployee) return;

    setSaving(true);
    try {
      if (assignmentType === 'track') {
        await adminService.assignTrack({
          user_id: selectedEmployee,
          track_id: itemId,
        });
      } else {
        await adminService.assignCourse({
          user_id: selectedEmployee,
          course_id: itemId,
        });
      }
      setIsAssignModalOpen(false);
      setSelectedEmployee(null);
      alert('Assignment successful!');
    } catch (error) {
      console.error('Failed to assign:', error);
      alert('Failed to assign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage employees and assignments</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Create Employee
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new employee.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Create Employee
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <div>
                <div className="flex items-start">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {employee.full_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{employee.email}</p>
                    <p className="text-gray-500 text-xs mt-1">@{employee.username}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedEmployee(employee.id);
                      setIsAssignModalOpen(true);
                    }}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Assign
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Employee"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="John Doe"
            required
          />
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="johndoe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Secure password"
            required
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Assign to Employee"
      >
        <div className="space-y-4">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${
                assignmentType === 'track'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setAssignmentType('track')}
            >
              Tracks
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                assignmentType === 'course'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setAssignmentType('course')}
            >
              Courses
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {assignmentType === 'track' ? (
              tracks.map((track) => (
                <div
                  key={track.track_id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{track.name}</h4>
                      <p className="text-sm text-gray-600">{track.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignment(track.track_id)}
                      loading={saving}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              courses.map((course) => (
                <div
                  key={course.course_id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignment(course.course_id)}
                      loading={saving}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
