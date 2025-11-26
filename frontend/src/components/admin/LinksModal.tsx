import React, { useEffect, useState } from 'react';
import { Plus, ExternalLink, Edit2, Trash2, Check, X, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminService } from '@/services/admin.service';

interface Link {
  link_id: string;
  link: string;
  link_label: string;
}

interface LinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

export const LinksModal: React.FC<LinksModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
}) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ link_label: '', link: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLinkData, setNewLinkData] = useState({ link_label: '', link: '' });

  useEffect(() => {
    if (isOpen) {
      loadLinks();
    }
  }, [isOpen, courseId]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const linksData = await adminService.getCourseLinks(courseId);
      setLinks(linksData);
    } catch (error) {
      console.error('Failed to load links:', error);
      alert('Failed to load course links');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLinkData.link_label.trim() || !newLinkData.link.trim()) {
      alert('Both label and URL are required');
      return;
    }

    setSaving(true);
    try {
      await adminService.addCourseLink(courseId, {
        link_label: newLinkData.link_label,
        link_url: newLinkData.link,
      });
      setNewLinkData({ link_label: '', link: '' });
      setIsAddingNew(false);
      loadLinks();
    } catch (error: any) {
      console.error('Failed to add link:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to add link';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (link: Link) => {
    setEditingLinkId(link.link_id);
    setEditFormData({ link_label: link.link_label, link: link.link });
  };

  const cancelEditing = () => {
    setEditingLinkId(null);
    setEditFormData({ link_label: '', link: '' });
  };

  const handleUpdateLink = async (linkId: string) => {
    if (!editFormData.link_label.trim() || !editFormData.link.trim()) {
      alert('Both label and URL are required');
      return;
    }

    setSaving(true);
    try {
      await adminService.updateCourseLink(linkId, {
        link_label: editFormData.link_label,
        link_url: editFormData.link,
      });
      setEditingLinkId(null);
      setEditFormData({ link_label: '', link: '' });
      loadLinks();
    } catch (error: any) {
      console.error('Failed to update link:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update link';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    setSaving(true);
    try {
      await adminService.deleteCourseLink(linkId);
      loadLinks();
    } catch (error: any) {
      console.error('Failed to delete link:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete link';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Links for "${courseName}"`}
      size="lg"
    >
      <div className="space-y-4">
        {/* AI Generate Button */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            disabled={true}
            className="relative overflow-hidden group"
            title="Coming soon: AI-powered link generation"
          >
            <Sparkles size={16} className="mr-2 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
              Generate Links with AI
            </span>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Existing Links */}
            {links.length === 0 && !isAddingNew ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No links yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding a reference link for this course.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.link_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    {editingLinkId === link.link_id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <Input
                          label="Label"
                          value={editFormData.link_label}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, link_label: e.target.value })
                          }
                          placeholder="e.g., Official Documentation"
                          disabled={saving}
                        />
                        <Input
                          label="URL"
                          value={editFormData.link}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, link: e.target.value })
                          }
                          placeholder="https://example.com"
                          disabled={saving}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={cancelEditing}
                            disabled={saving}
                          >
                            <X size={16} className="mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateLink(link.link_id)}
                            disabled={saving}
                          >
                            <Check size={16} className="mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer flex items-center group"
                              onClick={() => openLink(link.link)}
                            >
                              <span className="truncate">{link.link_label}</span>
                              <ExternalLink
                                size={14}
                                className="ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </h4>
                            <p
                              className="mt-1 text-xs text-gray-500 hover:text-primary-600 cursor-pointer truncate"
                              onClick={() => openLink(link.link)}
                              title={link.link}
                            >
                              {link.link}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                            <button
                              onClick={() => startEditing(link)}
                              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Edit link"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.link_id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete link"
                              disabled={saving}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Link Form */}
            {isAddingNew ? (
              <div className="border-2 border-dashed border-primary-300 rounded-lg p-4 bg-primary-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Link</h4>
                <div className="space-y-3">
                  <Input
                    label="Label"
                    value={newLinkData.link_label}
                    onChange={(e) =>
                      setNewLinkData({ ...newLinkData, link_label: e.target.value })
                    }
                    placeholder="e.g., Official Documentation"
                    required
                    disabled={saving}
                  />
                  <Input
                    label="URL"
                    value={newLinkData.link}
                    onChange={(e) => setNewLinkData({ ...newLinkData, link: e.target.value })}
                    placeholder="https://example.com"
                    required
                    disabled={saving}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewLinkData({ link_label: '', link: '' });
                      }}
                      disabled={saving}
                    >
                      <X size={16} className="mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddLink} disabled={saving}>
                      <Check size={16} className="mr-1" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setIsAddingNew(true)}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Add New Link
              </Button>
            )}
          </>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
