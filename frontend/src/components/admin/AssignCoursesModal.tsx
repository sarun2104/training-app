import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, Loader, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/admin.service';
import { CourseWithHierarchy, AssignedCourse } from '@/types';

interface AssignCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

export const AssignCoursesModal: React.FC<AssignCoursesModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
}) => {
  const [courses, setCourses] = useState<CourseWithHierarchy[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState<string | null>(null);
  const [dueDateMap, setDueDateMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, employeeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, assignedData] = await Promise.all([
        adminService.getCourses(),
        adminService.getEmployeeAssignedCourses(employeeId),
      ]);
      setCourses(coursesData);
      setAssignedCourses(assignedData);
      setDueDateMap({}); // Reset due dates after assignment
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (courseId: string) => {
    const dueDate = dueDateMap[courseId];
    setAssigning(courseId);
    try {
      await adminService.assignCourseToEmployee(employeeId, courseId, dueDate);
      await loadData(); // Reload to update assigned courses
    } catch (error: any) {
      console.error('Failed to assign course:', error);
      alert(error.response?.data?.detail || 'Failed to assign course');
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (courseId: string) => {
    if (!confirm('Are you sure you want to remove this course assignment?')) {
      return;
    }

    setUnassigning(courseId);
    try {
      await adminService.unassignCourseFromEmployee(employeeId, courseId);
      await loadData(); // Reload to update assigned courses
    } catch (error: any) {
      console.error('Failed to unassign course:', error);
      alert(error.response?.data?.detail || 'Failed to unassign course');
    } finally {
      setUnassigning(null);
    }
  };

  const isAssigned = (courseId: string) => {
    return assignedCourses.some((ac) => ac.course_id === courseId);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) =>
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group courses by track
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    course.subtracks.forEach((subtrack) => {
      const trackName = subtrack.track_name || 'Unassigned';
      if (!acc[trackName]) {
        acc[trackName] = {};
      }
      const subtrackName = subtrack.subtrack_name || 'Unassigned';
      if (!acc[trackName][subtrackName]) {
        acc[trackName][subtrackName] = [];
      }
      if (!acc[trackName][subtrackName].some((c) => c.course_id === course.course_id)) {
        acc[trackName][subtrackName].push(course);
      }
    });
    return acc;
  }, {} as Record<string, Record<string, CourseWithHierarchy[]>>);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Courses to ${employeeName}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Already Assigned Courses Section */}
        {assignedCourses.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              Already Assigned Courses ({assignedCourses.length})
            </h3>
            <div className="space-y-2">
              {assignedCourses.map((course) => (
                <div
                  key={course.course_id}
                  className="flex items-start justify-between text-sm"
                >
                  <div className="flex items-start flex-1">
                    <CheckCircle size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-900">{course.course_name}</div>
                      {course.track_name && course.subtrack_name && (
                        <div className="text-xs text-green-700">
                          {course.track_name} &gt; {course.subtrack_name}
                        </div>
                      )}
                      {course.due_date && (
                        <div className="text-xs text-green-600 mt-1">
                          Due: {new Date(course.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUnassign(course.course_id)}
                    disabled={unassigning === course.course_id}
                    loading={unassigning === course.course_id}
                    className="ml-2"
                  >
                    <X size={14} className="mr-1" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Available Courses */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-primary-600" size={32} />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? 'No courses match your search' : 'No courses available'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {Object.entries(groupedCourses).map(([trackName, subtracks]) => (
                  <div key={trackName} className="p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">{trackName}</h3>
                    {Object.entries(subtracks).map(([subtrackName, coursesInSubtrack]) => (
                      <div key={subtrackName} className="ml-4 mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{subtrackName}</h4>
                        <div className="space-y-2 ml-4">
                          {coursesInSubtrack.map((course) => {
                            const assigned = isAssigned(course.course_id);
                            return (
                              <div
                                key={course.course_id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  assigned
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-white border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="flex items-center flex-1">
                                  <span className={`text-sm ${assigned ? 'text-green-900 font-medium' : 'text-gray-900'}`}>
                                    {course.course_name}
                                  </span>
                                </div>
                                {!assigned && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="date"
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                      value={dueDateMap[course.course_id] || ''}
                                      onChange={(e) => setDueDateMap({ ...dueDateMap, [course.course_id]: e.target.value })}
                                      placeholder="Due date"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAssign(course.course_id)}
                                      disabled={assigning === course.course_id}
                                      loading={assigning === course.course_id}
                                    >
                                      Assign
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
