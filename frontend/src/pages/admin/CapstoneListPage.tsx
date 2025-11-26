import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Clock, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/admin.service';
import { CapstoneListItem } from '@/types';

export const CapstoneListPage: React.FC = () => {
  const navigate = useNavigate();
  const [capstones, setCapstones] = useState<CapstoneListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapstones();
  }, []);

  const loadCapstones = async () => {
    try {
      const data = await adminService.getCapstones();
      setCapstones(data);
    } catch (error) {
      console.error('Failed to load capstones:', error);
      alert('Failed to load capstones');
    } finally {
      setLoading(false);
    }
  };

  const handleCapstoneClick = (capstoneId: string) => {
    navigate(`/admin/capstones/${capstoneId}`);
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Capstone Projects</h1>
        <p className="text-gray-600 mt-2">
          Browse and select capstone projects to demonstrate mastery
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : capstones.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No capstones found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No capstone projects available yet
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capstones.map((capstone) => (
            <Card
              key={capstone.capstone_id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCapstoneClick(capstone.capstone_id)}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Award className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {capstone.capstone_name}
                    </h3>

                    {/* Duration */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{capstone.duration_weeks} weeks</span>
                    </div>

                    {/* Tags */}
                    {capstone.tags && capstone.tags.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Tag className="h-4 w-4 mr-1" />
                          <span>Tags:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {capstone.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {capstone.tags.length > 4 && (
                            <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              +{capstone.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && capstones.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {capstones.length} capstone project{capstones.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
