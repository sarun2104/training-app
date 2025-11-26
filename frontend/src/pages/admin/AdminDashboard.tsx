import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileQuestion,
  BarChart,
  FolderTree,
  Layers,
  Eye,
  Award,
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
      const [tracksTree, courses, employees] = await Promise.all([
        adminService.getTracksTree(),
        adminService.getCourses(),
        adminService.getEmployees(),
      ]);

      const totalSubtracks = tracksTree.reduce((sum, track) => sum + track.subtracks.length, 0);

      setStats({
        tracks: tracksTree.length,
        subtracks: totalSubtracks,
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
      title: 'Structure Overview',
      description: 'View complete hierarchy of tracks, subtracks, and courses',
      icon: Eye,
      link: '/admin/tree-view',
      color: 'bg-purple-500',
    },
    {
      title: 'Tracks & SubTracks',
      description: `Manage learning tracks (${stats.tracks}) and subtracks (${stats.subtracks})`,
      icon: FolderTree,
      link: '/admin/tracks',
      color: 'bg-blue-500',
      count: stats.tracks + stats.subtracks,
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
      title: 'Capstone',
      description: 'Manage capstone projects',
      icon: Award,
      link: '/admin/capstones',
      color: 'bg-orange-500',
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
