import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  GraduationCap,
  Mail,
  Phone,
  Globe,
  Code,
  FileText,
  Lock,
  Edit2,
  CheckCircle,
  Building2,
  Calendar,
  Award,
  ArrowLeft,
  Save,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentProfilePage = () => {
  const { id } = useParams();
  const { user, canManage, isStudent, refreshUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    skills: '',
    phone: '',
    resumeUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    // Admin editable fields
    cgpa: '',
    activeBacklogs: '',
    totalBacklogs: '',
    department: '',
    isPlaced: false,
    placedPackage: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        const s = res.data.student;
        setStudent(s);
        setApplications(res.data.applications || []);
        setFormData({
          skills: Array.isArray(s.skills) ? s.skills.join(', ') : '',
          phone: s.phone || '',
          resumeUrl: s.resumeUrl || '',
          linkedinUrl: s.linkedinUrl || '',
          githubUrl: s.githubUrl || '',
          cgpa: s.cgpa || '',
          activeBacklogs: s.activeBacklogs || 0,
          totalBacklogs: s.totalBacklogs || 0,
          department: s.department || '',
          isPlaced: s.isPlaced || false,
          placedPackage: s.placedPackage || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        skills: formData.skills,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
      };

      // Only include admin fields if canManage
      if (canManage) {
        payload.cgpa = Number(formData.cgpa);
        payload.activeBacklogs = Number(formData.activeBacklogs);
        payload.totalBacklogs = Number(formData.totalBacklogs);
        payload.department = formData.department;
        payload.isPlaced = formData.isPlaced;
        payload.placedPackage = formData.placedPackage ? Number(formData.placedPackage) : null;
      }

      const res = await api.patch(`/students/${student._id}`, payload);
      if (res.data.success) {
        toast.success('Profile details updated successfully.');
        setIsEditing(false);
        fetchProfile();
        refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." size="large" />;
  if (!student) return <div className="p-8 text-center text-slate-500">Student not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={canManage ? '/students' : '/dashboard'}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Link>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {student.user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {student.user?.name}
                </h1>
                {student.isPlaced ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Placed ({student.placedPackage} LPA)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    Seeking Placement
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                <span className="font-mono font-semibold text-slate-700">{student.prn}</span>
                <span>•</span>
                <span>{student.department}</span>
                <span>•</span>
                <span>Batch of {student.graduationYear}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center self-start sm:self-auto cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Academic KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">CGPA (Merit)</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              {Number(student.cgpa).toFixed(2)} / 10.0
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Active Backlogs</p>
            <p className={`text-sm font-bold mt-0.5 ${student.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {student.activeBacklogs} backlogs
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Career Backlogs</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {student.totalBacklogs || 0}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Academic Standing</p>
            <p className="text-sm font-semibold text-blue-700 mt-0.5">
              {student.academicYear || 'Final Year'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form / View Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editable or Display Details */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">
              {isEditing ? 'Update Profile Details' : 'Student Information'}
            </h3>
            {isStudent && (
              <span className="text-[11px] text-slate-400 flex items-center">
                <Lock className="w-3 h-3 mr-1" /> Academic metrics locked by TPO
              </span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resume Link URL</label>
                  <input
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Administrative section (only editable by TPO / Admin) */}
              {canManage && (
                <div className="pt-4 border-t border-slate-200 space-y-3 bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Administrative Fields (TPO / Admin Only)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Active Backlogs</label>
                      <input
                        type="number"
                        value={formData.activeBacklogs}
                        onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Placed Status</label>
                      <select
                        value={formData.isPlaced}
                        onChange={(e) => setFormData({ ...formData, isPlaced: e.target.value === 'true' })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                      >
                        <option value="false">Unplaced</option>
                        <option value="true">Placed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Technical Skills & Competencies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills?.length > 0 ? (
                    student.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 font-medium rounded-lg border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No skills listed yet.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {student.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {student.user?.email}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3">
                {student.resumeUrl && (
                  <a
                    href={student.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> View Resume
                  </a>
                )}
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> LinkedIn
                  </a>
                )}
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <Code className="w-3.5 h-3.5 mr-1.5 text-slate-800" /> GitHub
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Applications history */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-3">
            Applications ({applications.length})
          </h3>
          {applications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No placement drive applications submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {app.drive?.jobTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {app.drive?.company?.name} • {app.drive?.salaryPackage} LPA
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
