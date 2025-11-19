import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      alert('Failed to load tree structure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning Structure Overview</h1>
        <p className="text-gray-600 mt-2">
          Explore the complete hierarchy of tracks, subtracks, and courses
        </p>
      </div>

      <TreeView data={treeData} loading={loading} />
    </div>
  );
};
