import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowLeft, Building2, Mail, AtSign, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/admin.service';
import { User } from '@/types';
import { AssignCoursesModal } from '@/components/admin/AssignCoursesModal';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter employees based on search
  const filteredEmployees = employees.filter((employee) => {
    const query = searchQuery.toLowerCase();
    return (
      employee.full_name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.username.toLowerCase().includes(query) ||
      (employee.department && employee.department.toLowerCase().includes(query))
    );
  });

  // Generate avatar colors based on name
  const getAvatarGradient = (name: string) => {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <div className="w-11 h-11 rounded-apple-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-title-1 font-semibold text-apple-gray-6">Employees</h1>
              <p className="text-body text-apple-gray-4">
                {employees.length} team member{employees.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Input
          variant="filled"
          icon={<Search className="w-5 h-5" />}
          placeholder="Search by name, email, username, or department..."
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
            <p className="text-apple-gray-4 text-body">Loading employees...</p>
          </div>
        </div>
      ) : employees.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No employees yet</h3>
            <p className="text-body text-apple-gray-4">Employees will appear here once they register.</p>
          </div>
        </Card>
      ) : filteredEmployees.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No results found</h3>
            <p className="text-body text-apple-gray-4">No employees match "{searchQuery}"</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((employee, index) => (
            <Card 
              key={employee.id} 
              variant="elevated"
              hover
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 + index * 0.03}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-apple-lg bg-gradient-to-br ${getAvatarGradient(employee.full_name)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <span className="text-white font-semibold text-body">
                      {getInitials(employee.full_name)}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title-3 font-semibold text-apple-gray-6 truncate">
                      {employee.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-apple-gray-4" />
                      <span className="text-caption text-apple-gray-4 truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AtSign className="w-3.5 h-3.5 text-apple-gray-4" />
                      <span className="text-caption text-apple-gray-4">{employee.username}</span>
                    </div>
                    {employee.department && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-apple-gray-1 text-mini text-apple-gray-5">
                          <Building2 className="w-3 h-3" />
                          {employee.department}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action */}
                <div className="mt-4 pt-3 border-t border-apple-gray-2">
                  <Button
                    className="w-full justify-center"
                    variant="outline"
                    onClick={() => handleAssignClick(employee)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredEmployees.length > 0 && (
        <div className="mt-5 text-center">
          <p className="text-caption text-apple-gray-4">
            Showing {filteredEmployees.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </p>
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
