import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network } from 'lucide-react';
import { TreeView } from '@/components/admin/TreeView';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/admin.service';

interface Course {
  course_id: string;
  course_name: string;
}

interface Subtrack {
  subtrack_id: string;
  subtrack_name: string;
  courses: Course[];
}

interface Track {
  track_id: string;
  track_name: string;
  subtracks: Subtrack[];
}

export const TreeViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreeData();
  }, []);

  const loadTreeData = async () => {
    try {
      const data = await adminService.getCompleteTree();
      setTreeData(data);
    } catch (error) {
      console.error('Failed to load tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count totals for stats
  const totalTracks = treeData.length;
  const totalSubtracks = treeData.reduce((acc, t) => acc + t.subtracks.length, 0);
  const totalCourses = treeData.reduce(
    (acc, t) => acc + t.subtracks.reduce((sacc, s) => sacc + s.courses.length, 0),
    0
  );

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
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <Network className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-display-2 font-semibold text-apple-gray-6">Learning Structure</h1>
            <p className="text-body text-apple-gray-4">
              Explore the complete hierarchy of tracks, subtracks, and courses
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        {!loading && (
          <div className="flex flex-wrap gap-3 mt-4" style={{ animationDelay: '0.1s' }}>
            <div className="px-4 py-2 rounded-xl bg-apple-gray-1 border border-apple-gray-2">
              <span className="text-title-3 font-semibold text-apple-gray-6">{totalTracks}</span>
              <span className="text-body text-apple-gray-4 ml-2">Tracks</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-apple-gray-1 border border-apple-gray-2">
              <span className="text-title-3 font-semibold text-apple-gray-6">{totalSubtracks}</span>
              <span className="text-body text-apple-gray-4 ml-2">SubTracks</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-apple-gray-1 border border-apple-gray-2">
              <span className="text-title-3 font-semibold text-apple-gray-6">{totalCourses}</span>
              <span className="text-body text-apple-gray-4 ml-2">Courses</span>
            </div>
          </div>
        )}
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <TreeView data={treeData} loading={loading} />
      </div>
    </div>
  );
};
