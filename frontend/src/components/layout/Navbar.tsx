import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, GraduationCap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) return null;
    
    return segments.slice(1).map((segment, index) => {
      const title = segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      return (
        <span key={segment} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-apple-gray-4 mx-2" />
          <span className="text-apple-gray-5">{title}</span>
        </span>
      );
    });
  };

  return (
    <nav className="sticky top-0 z-40 w-full">
      {/* Glass morphism navbar */}
      <div className="bg-white/80 backdrop-blur-apple border-b border-apple-gray-2/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo & Breadcrumb */}
            <div className="flex items-center">
              <Link 
                to={isAdmin ? '/admin' : '/employee'} 
                className="flex items-center gap-2.5 group"
              >
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-apple group-hover:shadow-apple-md transition-all duration-300">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-title-3 text-apple-gray-6 hidden sm:block">
                  NeuLearn
                </span>
              </Link>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center ml-2 text-body">
                {getBreadcrumb()}
              </div>
            </div>

            {/* Right side - User info & Actions */}
            <div className="flex items-center gap-4">
              {/* User profile pill */}
              <div className="flex items-center gap-3 px-4 py-2 bg-apple-gray-1 rounded-full">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-body font-medium text-apple-gray-6 leading-tight">
                    {user?.full_name}
                  </p>
                  <p className="text-caption text-apple-gray-4 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Logout button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-apple-gray-5 hover:text-apple-red hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
