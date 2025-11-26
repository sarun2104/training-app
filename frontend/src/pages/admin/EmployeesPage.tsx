import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowLeft, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/admin.service';
import { User } from '@/types';
import { AssignCoursesModal } from '@/components/admin/AssignCoursesModal';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const employeesData = await adminService.getEmployees();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (employee: User) => {
    setSelectedEmployee({
      id: String(employee.id),
      name: employee.full_name,
    });
    setIsAssignModalOpen(true);
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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage employee course assignments</p>
        </div>
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
              No employees found in the system.
            </p>
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
                    {employee.department && (
                      <div className="flex items-center mt-2 text-gray-600">
                        <Building2 size={14} className="mr-1" />
                        <span className="text-xs">{employee.department}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAssignClick(employee)}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Assign Courses
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Courses Modal */}
      {selectedEmployee && (
        <AssignCoursesModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedEmployee(null);
          }}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
        />
      )}
    </div>
  );
};
