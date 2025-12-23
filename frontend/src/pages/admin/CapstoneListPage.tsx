import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Clock, Tag, ChevronRight, Search, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/admin.service';
import { CapstoneListItem } from '@/types';

export const CapstoneListPage: React.FC = () => {
  const navigate = useNavigate();
  const [capstones, setCapstones] = useState<CapstoneListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCapstones();
  }, []);

  const loadCapstones = async () => {
    try {
      const data = await adminService.getCapstones();
      setCapstones(data);
    } catch (error) {
      console.error('Failed to load capstones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapstoneClick = (capstoneId: string) => {
    navigate(`/admin/capstones/${capstoneId}`);
  };

  // Filter capstones based on search
  const filteredCapstones = capstones.filter((capstone) => {
    const query = searchQuery.toLowerCase();
    return (
      capstone.capstone_name.toLowerCase().includes(query) ||
      (capstone.tags && capstone.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  // Gradient colors for cards
  const cardGradients = [
    'from-orange-500 to-amber-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-emerald-500 to-green-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-teal-600',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Button */}
      <div className="mb-8">
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
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-display-2 font-semibold text-apple-gray-6">Capstone Projects</h1>
            <p className="text-body text-apple-gray-4">
              {capstones.length} project{capstones.length !== 1 ? 's' : ''} to demonstrate mastery
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Input
          variant="filled"
          icon={<Search className="w-5 h-5" />}
          placeholder="Search capstones by name or tags..."
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
            <p className="text-apple-gray-4 text-body">Loading capstones...</p>
          </div>
        </div>
      ) : capstones.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Award className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No capstones found</h3>
            <p className="text-body text-apple-gray-4">No capstone projects available yet.</p>
          </div>
        </Card>
      ) : filteredCapstones.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No results found</h3>
            <p className="text-body text-apple-gray-4">No capstones match "{searchQuery}"</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapstones.map((capstone, index) => (
            <Card
              key={capstone.capstone_id}
              variant="elevated"
              hover
              className="cursor-pointer group animate-slide-up overflow-hidden"
              style={{ animationDelay: `${0.1 + index * 0.03}s` }}
              onClick={() => handleCapstoneClick(capstone.capstone_id)}
            >
              {/* Gradient top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${cardGradients[index % cardGradients.length]}`}></div>
              
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cardGradients[index % cardGradients.length]} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title-3 font-semibold text-apple-gray-6 mb-3 group-hover:text-apple-blue transition-colors line-clamp-2">
                      {capstone.capstone_name}
                    </h3>

                    {/* Duration */}
                    <div className="flex items-center gap-1.5 text-caption text-apple-gray-4 mb-3">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{capstone.duration_weeks} weeks</span>
                    </div>

                    {/* Tags */}
                    {capstone.tags && capstone.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {capstone.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-apple-gray-1 text-mini font-medium text-apple-gray-5"
                          >
                            <Sparkles className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {capstone.tags.length > 3 && (
                          <span className="inline-block px-2 py-1 rounded-lg bg-apple-gray-1 text-mini text-apple-gray-4">
                            +{capstone.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-apple-gray-3 group-hover:text-apple-blue group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredCapstones.length > 0 && (
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-caption text-apple-gray-4">
            Showing {filteredCapstones.length} of {capstones.length} capstone{capstones.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};
