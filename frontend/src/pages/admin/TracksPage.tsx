import React, { useEffect, useState } from 'react';
import { Plus, FolderTree, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { Track } from '@/types';

// Track gradient colors
const trackGradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-green-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-600',
];

export const TracksPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await adminService.getTracks();
      setTracks(data);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminService.createTrack(formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      loadTracks();
    } catch (error) {
      console.error('Failed to create track:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-display-2 font-semibold text-apple-gray-6">Learning Tracks</h1>
              <p className="text-body text-apple-gray-4">{tracks.length} tracks available</p>
            </div>
          </div>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Track
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
              <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
            </div>
            <p className="text-apple-gray-4 text-body">Loading tracks...</p>
          </div>
        </div>
      ) : tracks.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FolderTree className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No tracks yet</h3>
            <p className="text-body text-apple-gray-4 mb-6">Get started by creating your first learning track.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Track
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track, index) => (
            <Card 
              key={track.track_id} 
              variant="elevated" 
              hoverable
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${trackGradients[index % trackGradients.length]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title-2 font-semibold text-apple-gray-6 mb-1">
                      {track.name}
                    </h3>
                    <p className="text-body text-apple-gray-4 line-clamp-2">{track.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Track"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Track Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Python Development"
            required
          />
          <div>
            <label className="block text-body font-medium text-apple-gray-6 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 border border-apple-gray-2 rounded-xl bg-white text-body text-apple-gray-6 
                         placeholder:text-apple-gray-3 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue
                         transition-all duration-200 resize-none"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Track description..."
              required
            />
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Track
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};
