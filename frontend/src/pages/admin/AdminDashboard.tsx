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
  ArrowRight,
  Sparkles,
  TrendingUp,
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
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
    },
    {
      title: 'Tracks & SubTracks',
      description: `Manage learning tracks and subtracks`,
      icon: FolderTree,
      link: '/admin/tracks',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      count: stats.tracks + stats.subtracks,
    },
    {
      title: 'Courses',
      description: 'Manage courses and content',
      icon: BookOpen,
      link: '/admin/courses',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      count: stats.courses,
    },
    {
      title: 'Questions',
      description: 'Manage quiz questions',
      icon: FileQuestion,
      link: '/admin/questions',
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'Capstone Projects',
      description: 'Manage capstone projects',
      icon: Award,
      link: '/admin/capstones',
      gradient: 'from-rose-500 to-pink-500',
      bgLight: 'bg-rose-50',
    },
    {
      title: 'Employees',
      description: 'Manage employees and assignments',
      icon: Users,
      link: '/admin/employees',
      gradient: 'from-indigo-500 to-blue-500',
      bgLight: 'bg-indigo-50',
      count: stats.employees,
    },
    {
      title: 'Reports & Analytics',
      description: 'View insights and analytics',
      icon: BarChart,
      link: '/admin/reports',
      gradient: 'from-fuchsia-500 to-purple-500',
      bgLight: 'bg-fuchsia-50',
    },
  ];

  const statCards = [
    { label: 'Total Tracks', value: stats.tracks, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Employees', value: stats.employees, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-apple">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-caption font-medium text-primary-600 uppercase tracking-wide">
              Admin Dashboard
            </span>
          </div>
          <h1 className="text-headline text-apple-gray-6 mb-2">
            Welcome back
          </h1>
          <p className="text-body-large text-apple-gray-4 max-w-2xl">
            Manage your learning platform with ease. Create courses, track progress, and empower your team.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {statCards.map((stat, index) => (
            <Card 
              key={stat.label} 
              variant="glass" 
              padding="none"
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-5 flex items-center gap-4">
                <div className={`p-3 ${stat.bg} rounded-apple`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-mini font-medium text-apple-gray-4 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-title-2 text-apple-gray-6">
                    {loading ? (
                      <span className="inline-block w-10 h-6 bg-apple-gray-2 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className="ml-auto">
                  <TrendingUp className="h-4 w-4 text-apple-green" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions Label */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-title-1 text-apple-gray-6">Quick Actions</h2>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item, index) => (
            <Link 
              key={item.title} 
              to={item.link}
              className="animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 50}ms` }}
            >
              <Card 
                variant="default" 
                hover 
                padding="none"
                className="h-full group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-apple shadow-apple`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    {item.count !== undefined && (
                      <span className="px-2.5 py-1 bg-apple-gray-1 rounded-full text-caption font-semibold text-apple-gray-5">
                        {loading ? '...' : item.count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-title-3 font-semibold text-apple-gray-6 mb-1 flex items-center gap-2">
                    {item.title}
                    <ArrowRight 
                      className="h-4 w-4 text-apple-gray-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
                    />
                  </h3>
                  <p className="text-body text-apple-gray-4 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-10 text-center">
          <p className="text-caption text-apple-gray-4">
            Need help? Check out the documentation or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};
