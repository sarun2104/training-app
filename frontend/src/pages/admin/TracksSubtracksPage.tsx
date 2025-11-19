import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderTree, Edit2, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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
      alert('Failed to load tracks. Please try again.');
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
      const errorMessage = error.response?.data?.detail || 'Failed to save. Please try again.';
      alert(errorMessage);
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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tracks & SubTracks</h1>
          <p className="text-gray-600 mt-2">Organize technical training paths: Foundational, GenAI, Data Engineering, and DevOps</p>
        </div>
        <Button onClick={() => openModal('create-track')}>
          <Plus size={20} className="mr-2" />
          Create Track
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : tracksTree.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tracks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new track.
            </p>
            <div className="mt-6">
              <Button onClick={() => openModal('create-track')}>
                <Plus size={20} className="mr-2" />
                Create Track
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tracksTree.map((track) => (
            <Card key={track.track_id} className="overflow-hidden">
              {/* Track Header */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => toggleTrack(track.track_id)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors mr-2"
                  >
                    {expandedTracks.has(track.track_id) ? (
                      <ChevronDown className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-blue-600" />
                    )}
                  </button>
                  <FolderTree className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {track.track_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {track.subtracks.length} subtrack{track.subtracks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal('create-subtrack', track.track_id)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add SubTrack
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal('edit-track', track.track_id, track.track_name)}
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Subtracks List */}
              {expandedTracks.has(track.track_id) && (
                <div className="p-4 bg-white">
                  {track.subtracks.length === 0 ? (
                    <p className="text-gray-500 text-sm italic py-4 text-center">
                      No subtracks yet. Click "Add SubTrack" to create one.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {track.subtracks.map((subtrack) => (
                        <div
                          key={subtrack.subtrack_id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {subtrack.subtrack_name}
                            </span>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              openModal(
                                'edit-subtrack',
                                subtrack.subtrack_id,
                                subtrack.subtrack_name,
                                track.track_id
                              )
                            }
                            className="ml-2 flex-shrink-0"
                          >
                            <Edit2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalMode !== null} onClose={closeModal} title={getModalTitle()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={modalMode?.includes('track') ? 'Track Name' : 'SubTrack Name'}
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {modalMode?.startsWith('create') ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
