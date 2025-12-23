import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  User,
  Briefcase,
  Award,
  Sparkles,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
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

      const updated = await employeeService.updateProfileDetails(profileData);
      setProfile(updated);
      setEditing(false);
      setNewPrimarySkill('');
      setNewSecondarySkill('');
      setNewProject('');
      setNewCertification('');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for managing lists
  const addPrimarySkill = () => {
    const trimmedSkill = newPrimarySkill.trim();
    if (!trimmedSkill || editPrimarySkills.includes(trimmedSkill)) return;
    setEditPrimarySkills([...editPrimarySkills, trimmedSkill]);
    setNewPrimarySkill('');
  };

  const removePrimarySkill = (index: number) => {
    setEditPrimarySkills(editPrimarySkills.filter((_, i) => i !== index));
  };

  const addSecondarySkill = () => {
    const trimmedSkill = newSecondarySkill.trim();
    if (!trimmedSkill || editSecondarySkills.includes(trimmedSkill)) return;
    setEditSecondarySkills([...editSecondarySkills, trimmedSkill]);
    setNewSecondarySkill('');
  };

  const removeSecondarySkill = (index: number) => {
    setEditSecondarySkills(editSecondarySkills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    const trimmedProject = newProject.trim();
    if (!trimmedProject || editPastProjects.includes(trimmedProject)) return;
    setEditPastProjects([...editPastProjects, trimmedProject]);
    setNewProject('');
  };

  const removeProject = (index: number) => {
    setEditPastProjects(editPastProjects.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    const trimmedCert = newCertification.trim();
    if (!trimmedCert || editCertifications.includes(trimmedCert)) return;
    setEditCertifications([...editCertifications, trimmedCert]);
    setNewCertification('');
  };

  const removeCertification = (index: number) => {
    setEditCertifications(editCertifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-apple-gray-2"></div>
            <div className="absolute inset-0 rounded-full border-4 border-apple-blue border-t-transparent animate-spin"></div>
          </div>
          <p className="text-apple-gray-4 text-body">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/employee/dashboard')}
          className="group self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>
        {!editing ? (
          <Button onClick={handleEdit} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Brief Profile */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-title-2 font-semibold text-apple-gray-6">Brief Profile</h2>
                <p className="text-caption text-apple-gray-4">3-4 sentences about your professional background</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={editBriefProfile}
                onChange={(e) => setEditBriefProfile(e.target.value)}
                rows={4}
                placeholder="Describe your professional background, experience, and expertise..."
              />
            ) : (
              <p className="text-body text-apple-gray-5 whitespace-pre-line leading-relaxed">
                {profile?.brief_profile || 'No profile description added yet.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Primary Skills */}
        <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-title-2 font-semibold text-apple-gray-6">Primary Skills</h2>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newPrimarySkill}
                    onChange={(e) => setNewPrimarySkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrimarySkill())}
                    placeholder="Add a primary skill..."
                    className="flex-1"
                  />
                  <Button onClick={addPrimarySkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editPrimarySkills.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-body font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => removePrimarySkill(index)}
                        className="hover:text-purple-900 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editPrimarySkills.length === 0 && (
                    <p className="text-caption text-apple-gray-4">No primary skills added yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.primary_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-body font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {(!profile?.primary_skills || profile.primary_skills.length === 0) && (
                  <p className="text-body text-apple-gray-4">No primary skills added yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secondary Skills */}
        <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-title-2 font-semibold text-apple-gray-6">Secondary Skills</h2>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSecondarySkill}
                    onChange={(e) => setNewSecondarySkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondarySkill())}
                    placeholder="Add a secondary skill..."
                    className="flex-1"
                  />
                  <Button onClick={addSecondarySkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editSecondarySkills.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-body font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => removeSecondarySkill(index)}
                        className="hover:text-emerald-900 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editSecondarySkills.length === 0 && (
                    <p className="text-caption text-apple-gray-4">No secondary skills added yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.secondary_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-body font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {(!profile?.secondary_skills || profile.secondary_skills.length === 0) && (
                  <p className="text-body text-apple-gray-4">No secondary skills added yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Projects */}
        <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-title-2 font-semibold text-apple-gray-6">Past Projects</h2>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
                    placeholder="Add a past project..."
                    className="flex-1"
                  />
                  <Button onClick={addProject} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {editPastProjects.map((project, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray-1 group">
                      <span className="w-2 h-2 mt-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex-shrink-0"></span>
                      <span className="flex-1 text-body text-apple-gray-6">{project}</span>
                      <button
                        onClick={() => removeProject(index)}
                        className="p-1 text-apple-gray-4 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                  {editPastProjects.length === 0 && (
                    <p className="text-caption text-apple-gray-4">No past projects added yet.</p>
                  )}
                </ul>
              </div>
            ) : (
              <ul className="space-y-2">
                {profile?.past_projects.map((project, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray-1">
                    <span className="w-2 h-2 mt-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex-shrink-0"></span>
                    <span className="text-body text-apple-gray-6">{project}</span>
                  </li>
                ))}
                {(!profile?.past_projects || profile.past_projects.length === 0) && (
                  <p className="text-body text-apple-gray-4">No past projects added yet.</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-title-2 font-semibold text-apple-gray-6">Certifications</h2>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    placeholder="Add a certification..."
                    className="flex-1"
                  />
                  <Button onClick={addCertification} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {editCertifications.map((cert, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray-1 group">
                      <Award className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span className="flex-1 text-body text-apple-gray-6">{cert}</span>
                      <button
                        onClick={() => removeCertification(index)}
                        className="p-1 text-apple-gray-4 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                  {editCertifications.length === 0 && (
                    <p className="text-caption text-apple-gray-4">No certifications added yet.</p>
                  )}
                </ul>
              </div>
            ) : (
              <ul className="space-y-2">
                {profile?.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray-1">
                    <Award className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                    <span className="text-body text-apple-gray-6">{cert}</span>
                  </li>
                ))}
                {(!profile?.certifications || profile.certifications.length === 0) && (
                  <p className="text-body text-apple-gray-4">No certifications added yet.</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
