import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileQuestion,
  BarChart,
  FolderTree,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { adminService } from '@/services/admin.service';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    tracks: 0,
    subtracks: 0,
    courses: 0,
    employees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [tracks, subtracks, courses, employees] = await Promise.all([
        adminService.getTracks(),
        adminService.getSubTracks(),
        adminService.getCourses(),
        adminService.getEmployees(),
      ]);

      setStats({
        tracks: tracks.length,
        subtracks: subtracks.length,
        courses: courses.length,
        employees: Array.isArray(employees) ? employees.length : 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Tracks',
      description: 'Manage learning tracks',
      icon: FolderTree,
      link: '/admin/tracks',
      color: 'bg-blue-500',
      count: stats.tracks,
    },
    {
      title: 'SubTracks',
      description: 'Manage learning subtracks',
      icon: Layers,
      link: '/admin/subtracks',
      color: 'bg-purple-500',
      count: stats.subtracks,
    },
    {
      title: 'Courses',
      description: 'Manage courses and content',
      icon: BookOpen,
      link: '/admin/courses',
      color: 'bg-green-500',
      count: stats.courses,
    },
    {
      title: 'Questions',
      description: 'Manage quiz questions',
      icon: FileQuestion,
      link: '/admin/questions',
      color: 'bg-yellow-500',
    },
    {
      title: 'Employees',
      description: 'Manage employees',
      icon: Users,
      link: '/admin/employees',
      color: 'bg-red-500',
      count: stats.employees,
    },
    {
      title: 'Reports',
      description: 'View analytics and reports',
      icon: BarChart,
      link: '/admin/reports',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your learning management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.title} to={item.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    {item.title}
                    {item.count !== undefined && (
                      <span className="text-sm font-normal text-gray-500">
                        {loading ? '...' : item.count}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
