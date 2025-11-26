import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employee.service';
import { EmployeeProfileDetails } from '@/types';

export const EmployeeProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployeeProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editBriefProfile, setEditBriefProfile] = useState('');
  const [editPrimarySkills, setEditPrimarySkills] = useState<string[]>([]);
  const [editSecondarySkills, setEditSecondarySkills] = useState<string[]>([]);
  const [editPastProjects, setEditPastProjects] = useState<string[]>([]);
  const [editCertifications, setEditCertifications] = useState<string[]>([]);

  // New item inputs
  const [newPrimarySkill, setNewPrimarySkill] = useState('');
  const [newSecondarySkill, setNewSecondarySkill] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await employeeService.getProfileDetails();
      setProfile(data);
      initializeEditState(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeEditState = (data: EmployeeProfileDetails) => {
    setEditBriefProfile(data.brief_profile || '');
    setEditPrimarySkills([...data.primary_skills]);
    setEditSecondarySkills([...data.secondary_skills]);
    setEditPastProjects([...data.past_projects]);
    setEditCertifications([...data.certifications]);
  };

  const handleEdit = () => {
    if (profile) {
      initializeEditState(profile);
    }
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setNewPrimarySkill('');
    setNewSecondarySkill('');
    setNewProject('');
    setNewCertification('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        brief_profile: editBriefProfile,
        primary_skills: editPrimarySkills,
        secondary_skills: editSecondarySkills,
        past_projects: editPastProjects,
        certifications: editCertifications,
      };

      console.log('Saving profile data:', profileData);
      const updated = await employeeService.updateProfileDetails(profileData);
      console.log('Profile updated successfully:', updated);

      setProfile(updated);
      setEditing(false);
      setNewPrimarySkill('');
      setNewSecondarySkill('');
      setNewProject('');
      setNewCertification('');

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for managing lists
  const addPrimarySkill = () => {
    const trimmedSkill = newPrimarySkill.trim();
    if (!trimmedSkill) {
      alert('Please enter a skill before adding.');
      return;
    }
    if (editPrimarySkills.includes(trimmedSkill)) {
      alert('This skill is already added.');
      return;
    }
    setEditPrimarySkills([...editPrimarySkills, trimmedSkill]);
    setNewPrimarySkill('');
  };

  const removePrimarySkill = (index: number) => {
    setEditPrimarySkills(editPrimarySkills.filter((_, i) => i !== index));
  };

  const addSecondarySkill = () => {
    const trimmedSkill = newSecondarySkill.trim();
    if (!trimmedSkill) {
      alert('Please enter a skill before adding.');
      return;
    }
    if (editSecondarySkills.includes(trimmedSkill)) {
      alert('This skill is already added.');
      return;
    }
    setEditSecondarySkills([...editSecondarySkills, trimmedSkill]);
    setNewSecondarySkill('');
  };

  const removeSecondarySkill = (index: number) => {
    setEditSecondarySkills(editSecondarySkills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    const trimmedProject = newProject.trim();
    if (!trimmedProject) {
      alert('Please enter a project description before adding.');
      return;
    }
    if (editPastProjects.includes(trimmedProject)) {
      alert('This project is already added.');
      return;
    }
    setEditPastProjects([...editPastProjects, trimmedProject]);
    setNewProject('');
  };

  const removeProject = (index: number) => {
    setEditPastProjects(editPastProjects.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    const trimmedCert = newCertification.trim();
    if (!trimmedCert) {
      alert('Please enter a certification before adding.');
      return;
    }
    if (editCertifications.includes(trimmedCert)) {
      alert('This certification is already added.');
      return;
    }
    setEditCertifications([...editCertifications, trimmedCert]);
    setNewCertification('');
  };

  const removeCertification = (index: number) => {
    setEditCertifications(editCertifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/employee/dashboard')}>
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Button>
        {!editing ? (
          <Button onClick={handleEdit}>
            <Edit2 size={20} className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleCancel}>
              <X size={20} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save size={20} className="mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Brief Profile */}
        <Card>
          <div className="flex items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Brief Profile</h2>
              <p className="text-sm text-gray-600">3-4 sentences about your professional background</p>
            </div>
          </div>
          {editing ? (
            <textarea
              value={editBriefProfile}
              onChange={(e) => setEditBriefProfile(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your professional background, experience, and expertise..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {profile?.brief_profile || 'No profile description added yet.'}
            </p>
          )}
        </Card>

        {/* Primary Skills */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Skills</h2>
          {editing ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newPrimarySkill}
                  onChange={(e) => setNewPrimarySkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPrimarySkill()}
                  placeholder="Add a primary skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button onClick={addPrimarySkill}>
                  <Plus size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editPrimarySkills.map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => removePrimarySkill(index)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {editPrimarySkills.length === 0 && (
                  <p className="text-gray-500 text-sm">No primary skills added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.primary_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {(!profile?.primary_skills || profile.primary_skills.length === 0) && (
                <p className="text-gray-500">No primary skills added yet.</p>
              )}
            </div>
          )}
        </Card>

        {/* Secondary Skills */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Secondary Skills</h2>
          {editing ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSecondarySkill}
                  onChange={(e) => setNewSecondarySkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSecondarySkill()}
                  placeholder="Add a secondary skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button onClick={addSecondarySkill}>
                  <Plus size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editSecondarySkills.map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => removeSecondarySkill(index)}
                      className="ml-2 hover:text-green-900"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {editSecondarySkills.length === 0 && (
                  <p className="text-gray-500 text-sm">No secondary skills added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.secondary_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {(!profile?.secondary_skills || profile.secondary_skills.length === 0) && (
                <p className="text-gray-500">No secondary skills added yet.</p>
              )}
            </div>
          )}
        </Card>

        {/* Past Projects */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Projects</h2>
          {editing ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                  placeholder="Add a past project..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button onClick={addProject}>
                  <Plus size={20} />
                </Button>
              </div>
              <ul className="space-y-2">
                {editPastProjects.map((project, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-1 text-gray-700">• {project}</span>
                    <button
                      onClick={() => removeProject(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
                {editPastProjects.length === 0 && (
                  <p className="text-gray-500 text-sm">No past projects added yet.</p>
                )}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2">
              {profile?.past_projects.map((project, index) => (
                <li key={index} className="text-gray-700">
                  • {project}
                </li>
              ))}
              {(!profile?.past_projects || profile.past_projects.length === 0) && (
                <p className="text-gray-500">No past projects added yet.</p>
              )}
            </ul>
          )}
        </Card>

        {/* Certifications */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
          {editing ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  placeholder="Add a certification..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button onClick={addCertification}>
                  <Plus size={20} />
                </Button>
              </div>
              <ul className="space-y-2">
                {editCertifications.map((cert, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-1 text-gray-700">• {cert}</span>
                    <button
                      onClick={() => removeCertification(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
                {editCertifications.length === 0 && (
                  <p className="text-gray-500 text-sm">No certifications added yet.</p>
                )}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2">
              {profile?.certifications.map((cert, index) => (
                <li key={index} className="text-gray-700">
                  • {cert}
                </li>
              ))}
              {(!profile?.certifications || profile.certifications.length === 0) && (
                <p className="text-gray-500">No certifications added yet.</p>
              )}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
