import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderTree, Edit2, ChevronRight, ChevronDown, ArrowLeft, Layers, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { adminService } from '@/services/admin.service';
import { TrackWithSubtracks, SubTrack } from '@/types';

type ModalMode = 'create-track' | 'edit-track' | 'create-subtrack' | 'edit-subtrack' | null;

interface FormData {
  name: string;
  trackId?: string;
}

export const TracksSubtracksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tracksTree, setTracksTree] = useState<TrackWithSubtracks[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [formData, setFormData] = useState<FormData>({ name: '' });
  const [saving, setSaving] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string>('');

  useEffect(() => {
    loadTracksTree();
  }, []);

  const loadTracksTree = async () => {
    try {
      const data = await adminService.getTracksTree();
      setTracksTree(data);
      // Auto-expand all tracks by default
      setExpandedTracks(new Set(data.map(t => t.track_id)));
    } catch (error) {
      console.error('Failed to load tracks tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrack = (trackId: string) => {
    const newExpanded = new Set(expandedTracks);
    if (newExpanded.has(trackId)) {
      newExpanded.delete(trackId);
    } else {
      newExpanded.add(trackId);
    }
    setExpandedTracks(newExpanded);
  };

  const openModal = (mode: ModalMode, itemId?: string, name?: string, parentTrackId?: string) => {
    setModalMode(mode);
    setEditingId(itemId || '');
    setFormData({
      name: name || '',
      trackId: (mode === 'create-subtrack' || mode === 'edit-subtrack') ? (parentTrackId || itemId) : undefined,
    });
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData({ name: '' });
    setEditingId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (modalMode === 'create-track') {
        await adminService.createTrack({ track_name: formData.name });
      } else if (modalMode === 'edit-track') {
        await adminService.updateTrack(editingId, { track_name: formData.name });
      } else if (modalMode === 'create-subtrack') {
        await adminService.createSubTrack({
          subtrack_name: formData.name,
          track_id: formData.trackId!,
        });
      } else if (modalMode === 'edit-subtrack') {
        await adminService.updateSubTrack(editingId, {
          subtrack_name: formData.name,
          track_id: formData.trackId!,
        });
      }

      closeModal();
      loadTracksTree();
    } catch (error: any) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create-track':
        return 'Create New Track';
      case 'edit-track':
        return 'Edit Track';
      case 'create-subtrack':
        return 'Create New SubTrack';
      case 'edit-subtrack':
        return 'Edit SubTrack';
      default:
        return '';
    }
  };

  // Track gradient colors based on index
  const trackGradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-green-600',
    'from-purple-500 to-violet-600',
    'from-orange-500 to-amber-600',
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-display-2 font-semibold text-apple-gray-6">Tracks & SubTracks</h1>
              <p className="text-body text-apple-gray-4">
                {tracksTree.length} tracks, {tracksTree.reduce((acc, t) => acc + t.subtracks.length, 0)} subtracks
              </p>
            </div>
          </div>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Button onClick={() => openModal('create-track')}>
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
      ) : tracksTree.length === 0 ? (
        <Card variant="elevated" className="animate-scale-in">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FolderTree className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-title-1 font-semibold text-apple-gray-6 mb-2">No tracks yet</h3>
            <p className="text-body text-apple-gray-4 mb-6">Get started by creating your first track.</p>
            <Button onClick={() => openModal('create-track')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Track
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tracksTree.map((track, index) => (
            <Card 
              key={track.track_id} 
              variant="elevated" 
              className="overflow-hidden animate-slide-up"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              {/* Track Header */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-apple-gray-1 to-white border-b border-apple-gray-2">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => toggleTrack(track.track_id)}
                    className="p-2 hover:bg-apple-gray-2 rounded-xl transition-colors mr-3"
                  >
                    {expandedTracks.has(track.track_id) ? (
                      <ChevronDown className="w-5 h-5 text-apple-gray-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-apple-gray-5" />
                    )}
                  </button>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trackGradients[index % trackGradients.length]} flex items-center justify-center mr-4`}>
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-title-2 font-semibold text-apple-gray-6">
                      {track.track_name}
                    </h3>
                    <p className="text-caption text-apple-gray-4">
                      {track.subtracks.length} subtrack{track.subtracks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('create-subtrack', track.track_id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add SubTrack
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal('edit-track', track.track_id, track.track_name)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Subtracks List */}
              {expandedTracks.has(track.track_id) && (
                <CardContent className="bg-white">
                  {track.subtracks.length === 0 ? (
                    <div className="text-center py-8">
                      <GitBranch className="w-8 h-8 mx-auto mb-2 text-apple-gray-3" />
                      <p className="text-body text-apple-gray-4">
                        No subtracks yet. Add one to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {track.subtracks.map((subtrack) => (
                        <div
                          key={subtrack.subtrack_id}
                          className="group flex items-center justify-between p-4 rounded-xl bg-apple-gray-1 hover:bg-apple-gray-2 border border-transparent hover:border-apple-gray-3 transition-all duration-200"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${trackGradients[index % trackGradients.length]} mr-3 flex-shrink-0`}></div>
                            <span className="text-body font-medium text-apple-gray-6 truncate">
                              {subtrack.subtrack_name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openModal(
                                'edit-subtrack',
                                subtrack.subtrack_id,
                                subtrack.subtrack_name,
                                track.track_id
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalMode !== null} onClose={closeModal} title={getModalTitle()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={modalMode?.includes('track') && !modalMode.includes('subtrack') ? 'Track Name' : 'SubTrack Name'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={
              modalMode === 'create-track' || modalMode === 'edit-track'
                ? 'e.g., Foundational'
                : 'e.g., Python'
            }
            required
            autoFocus
          />

          <ModalFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {modalMode?.startsWith('create') ? 'Create' : 'Update'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};
