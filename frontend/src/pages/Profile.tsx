import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';
import { UserProfile, UpdateProfileRequest } from '../types';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { RoleBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  GraduationCap,
  Mail,
  ShieldCheck,
  Server,
  LogOut,
  User as UserIcon,
  Phone,
  MapPin,
  Camera,
  KeyRound,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  School,
  Lock,
  Upload,
  ImageIcon,
  Check,
  AlertCircle,
} from '../components/Icons';

// Curated high-resolution avatar presets
const AVATAR_PRESETS = [
  {
    category: 'Students',
    items: [
      { id: 's1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', label: 'Alex (Student)' },
      { id: 's2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', label: 'Sarah (Student)' },
      { id: 's3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', label: 'David (Student)' },
      { id: 's4', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', label: 'Maya (Student)' },
    ],
  },
  {
    category: 'Faculty & Teachers',
    items: [
      { id: 't1', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', label: 'Prof. Davis' },
      { id: 't2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', label: 'Dr. Rostova' },
      { id: 't3', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80', label: 'Dr. Marcus' },
      { id: 't4', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80', label: 'Prof. Chloe' },
    ],
  },
  {
    category: 'Administrators & Leaders',
    items: [
      { id: 'a1', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', label: 'Admin Leader' },
      { id: 'a2', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', label: 'Chief Director' },
      { id: 'a3', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80', label: 'Academic Dean' },
      { id: 'a4', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80', label: 'Systems Head' },
    ],
  },
];

type ActiveTab = 'overview' | 'edit' | 'avatar' | 'security' | 'preferences';

export const Profile: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Edit Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Fetch full profile with live metrics
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 1000 * 60 * 2,
  });

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || user?.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setBio(profile.bio || '');
      setAddress(profile.address || '');
      setDepartment(profile.department || '');
      setSelectedAvatarUrl(profile.avatarUrl || user?.avatarUrl || null);
    } else if (user) {
      setFullName(user.fullName || '');
      setSelectedAvatarUrl(user.avatarUrl || null);
    }
  }, [profile, user]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (updated) => {
      toast.success('Profile updated successfully!');
      updateUserProfile({
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
        phoneNumber: updated.phoneNumber,
        bio: updated.bio,
        address: updated.address,
        department: updated.department,
      });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      setActiveTab('overview');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile.');
    },
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: () => profileApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('overview');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to change password.');
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    updateMutation.mutate({
      fullName: fullName.trim(),
      avatarUrl: selectedAvatarUrl,
      phoneNumber: phoneNumber.trim() || null,
      bio: bio.trim() || null,
      address: address.trim() || null,
      department: department.trim() || null,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    passwordMutation.mutate();
  };

  // Handle local image file upload & base64 conversion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedAvatarUrl(base64);
      toast.success('Photo loaded! Remember to save changes.');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setSelectedAvatarUrl(url);
    toast.success('Avatar selected! Click "Save Changes" to apply.');
  };

  const handleApplyCustomUrl = () => {
    if (!customAvatarInput.trim()) return;
    setSelectedAvatarUrl(customAvatarInput.trim());
    setCustomAvatarInput('');
    toast.success('Custom avatar applied! Click "Save Changes" to confirm.');
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatarUrl(null);
    toast.info('Avatar removed. Click "Save Changes" to confirm.');
  };

  if (!user) return null;

  const currentAvatar = selectedAvatarUrl || profile?.avatarUrl || user.avatarUrl;
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner & Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl">
        {/* Cover Background Graphic */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Member
            </span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & Main Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl ring-4 ring-slate-900 overflow-hidden bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-2xl flex items-center justify-center font-extrabold text-4xl text-white">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('avatar')}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-slate-900/90 text-slate-200 hover:text-cyan-400 border border-slate-700/80 shadow-lg hover:scale-105 transition-all"
                  title="Change Profile Picture"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                    {profile?.fullName || user.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <ShieldCheck size={13} />
                    Verified
                  </span>
                </div>
                <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail size={14} className="text-slate-500" />
                    {user.email}
                  </span>
                  {(profile?.phoneNumber || phoneNumber) && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} className="text-slate-500" />
                        {profile?.phoneNumber || phoneNumber}
                      </span>
                    </>
                  )}
                  {(profile?.address || address) && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-500" />
                        {profile?.address || address}
                      </span>
                    </>
                  )}
                </p>
                {profile?.department && (
                  <p className="text-xs text-indigo-400 font-medium">
                    {profile.department} {profile.className ? `• ${profile.className}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end pt-2 sm:pt-0">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Camera size={15} />}
                onClick={() => setActiveTab('avatar')}
              >
                Change Photo
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserIcon size={15} />}
                onClick={() => setActiveTab('edit')}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-6 border-b border-slate-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeTab === 'edit'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon size={16} />
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('avatar')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeTab === 'avatar'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera size={16} />
              Avatar & Photo
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound size={16} />
              Security & Password
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeTab === 'preferences'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={16} />
              Preferences
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details & About */}
          <div className="md:col-span-2 space-y-6">
            {/* About / Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  About & Biography
                </CardTitle>
                <CardDescription>Personal bio, research interests, or academic goals.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.bio ? (
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm leading-relaxed relative">
                    <span className="text-2xl text-cyan-500/30 font-serif absolute top-2 left-3">“</span>
                    <p className="pl-4 italic">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
                    <p className="text-sm text-slate-400 mb-3">No biography added yet.</p>
                    <Button variant="secondary" size="sm" onClick={() => setActiveTab('edit')}>
                      Add Bio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal & Academic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-400" />
                  Academic & Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <UserIcon size={14} className="text-cyan-400" />
                      <span>Full Legal Name</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {profile?.fullName || user.fullName}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Mail size={14} className="text-purple-400" />
                      <span>Institutional Email</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200 truncate block">
                      {user.email}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Phone size={14} className="text-emerald-400" />
                      <span>Contact Number</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {profile?.phoneNumber || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <MapPin size={14} className="text-rose-400" />
                      <span>Location / Campus</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {profile?.address || 'Not specified'}
                    </span>
                  </div>

                  {user.role === 'Student' && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <School size={14} className="text-cyan-400" />
                        <span>Enrolled Classroom</span>
                      </div>
                      <span className="text-sm font-semibold text-cyan-300">
                        {profile?.className || 'Classroom assigned'}
                      </span>
                    </div>
                  )}

                  {user.role === 'Teacher' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                          <BookOpen size={14} className="text-cyan-400" />
                          <span>Teaching Allocations</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile?.assignedSubjectNames && profile.assignedSubjectNames.length > 0 ? (
                            profile.assignedSubjectNames.map((subj) => (
                              <span
                                key={subj}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                              >
                                {subj}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Allocations assigned by Admin</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Role Metrics & Status */}
          <div className="space-y-6">
            {/* Live Role Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  Role Activity
                </CardTitle>
                <CardDescription>Real-time system telemetry & stats.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === 'Student' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total Assignments</span>
                      <span className="text-base font-bold text-slate-100">
                        {profile?.totalAssignments ?? 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Submissions Done</span>
                      <span className="text-base font-bold text-emerald-400">
                        {profile?.completedSubmissions ?? 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Pending Tasks</span>
                      <span className="text-base font-bold text-amber-400">
                        {profile?.pendingSubmissions ?? 0}
                      </span>
                    </div>
                  </>
                )}

                {user.role === 'Teacher' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Created Coursework</span>
                      <span className="text-base font-bold text-slate-100">
                        {profile?.totalAssignments ?? 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Classes Taught</span>
                      <span className="text-base font-bold text-indigo-400">
                        {profile?.assignedClassesCount ?? 1}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Pending Reviews</span>
                      <span className="text-base font-bold text-amber-400">
                        {profile?.pendingSubmissions ?? 0}
                      </span>
                    </div>
                  </>
                )}

                {user.role === 'Admin' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total Users</span>
                      <span className="text-base font-bold text-cyan-400">
                        {profile?.totalStudentsCount ?? 'Active'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Active Classes</span>
                      <span className="text-base font-bold text-purple-400">
                        {profile?.assignedClassesCount ?? 'Configured'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Security Guard</span>
                      <span className="text-xs font-bold text-emerald-400">RBAC Active</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Session Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock size={18} className="text-emerald-400" />
                  Session & Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Account ID</span>
                  <span className="font-mono text-slate-300 truncate max-w-[150px]">
                    {user.userId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Authentication</span>
                  <span className="text-emerald-400 font-semibold">JWT Bearer (8h)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Permissions</span>
                  <span className="text-cyan-400 font-semibold">Server Enforced</span>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    leftIcon={<LogOut size={15} />}
                    onClick={logout}
                  >
                    Sign Out Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon size={20} className="text-cyan-400" />
              Edit Profile Details
            </CardTitle>
            <CardDescription>
              Update your public information, contact details, and biography.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Preview & Quick Change */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shrink-0 shadow-md">
                  {selectedAvatarUrl ? (
                    <img
                      src={selectedAvatarUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-200 block">Profile Picture</span>
                  <p className="text-xs text-slate-400">
                    Choose from preset gallery or upload a custom photo.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Camera size={14} />}
                  onClick={() => setActiveTab('avatar')}
                >
                  Pick Photo
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="opacity-70 cursor-not-allowed bg-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Campus / Location
                  </label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, State, or Campus"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Department / Academic Track
                  </label>
                  <Input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Biography / Summary
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a short introduction about your academic goals, research interests, or background..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('overview')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateMutation.isPending}
                  leftIcon={<CheckCircle size={16} />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: AVATAR & PHOTO GALLERY */}
      {activeTab === 'avatar' && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Camera size={20} className="text-cyan-400" />
                  Profile Photo & Avatar Gallery
                </CardTitle>
                <CardDescription>
                  Upload your own photo or choose from curated professional portraits.
                </CardDescription>
              </div>
              {selectedAvatarUrl && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveAvatar}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload File / Custom URL Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              {/* Local File Upload */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Upload size={14} className="text-cyan-400" />
                  Upload From Computer
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  <div className="p-2.5 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 transition-colors">
                    <Camera size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Click to select an image
                  </span>
                  <span className="text-[11px] text-slate-500">
                    PNG, JPG, or WEBP up to 2MB
                  </span>
                </button>
              </div>

              {/* Custom Image URL */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-indigo-400" />
                  Paste Image URL
                </span>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApplyCustomUrl}
                    disabled={!customAvatarInput.trim()}
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  You can paste any public image link from Unsplash, Gravatar, or GitHub.
                </p>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-6 pt-2">
              {AVATAR_PRESETS.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {group.items.map((preset) => {
                      const isSelected = selectedAvatarUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`relative group rounded-2xl overflow-hidden border-2 transition-all p-1 text-left ${
                            isSelected
                              ? 'border-cyan-400 ring-4 ring-cyan-500/20 bg-cyan-500/10 scale-105'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-900/60 hover:scale-102'
                          }`}
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-slate-800 relative">
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 p-1 rounded-full bg-cyan-500 text-slate-950 font-bold shadow-lg">
                                <Check size={14} />
                              </div>
                            )}
                          </div>
                          <span className="block mt-2 text-xs font-semibold text-slate-300 px-1 truncate">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {selectedAvatarUrl ? '✓ Photo chosen. Click save to persist.' : 'Using default initials.'}
              </span>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setActiveTab('overview')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  isLoading={updateMutation.isPending}
                  onClick={handleSaveProfile}
                  leftIcon={<CheckCircle size={16} />}
                >
                  Save Photo Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Change Password Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock size={20} className="text-rose-400" />
                  Change Account Password
                </CardTitle>
                <CardDescription>
                  Ensure your account is protected with a secure password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Current Password <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      New Password <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Confirm New Password <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Re-type your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {newPassword && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Password Strength:</span>
                        <span className={newPassword.length >= 8 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                          {newPassword.length >= 8 ? 'Strong' : 'Moderate'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            newPassword.length >= 8 ? 'w-full bg-emerald-400' : 'w-1/2 bg-amber-400'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <Button variant="ghost" type="button" onClick={() => setActiveTab('overview')}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={passwordMutation.isPending}
                      leftIcon={<KeyRound size={16} />}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Security Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-cyan-400" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <CheckCircle size={14} /> Account Protected
                </span>
                <p className="text-[11px] text-emerald-400/80">
                  Password hashes are cryptographically protected with BCrypt (cost factor 11).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-slate-300">
                <span className="font-semibold block text-slate-200">Role Enforcement</span>
                <p className="text-[11px] text-slate-400">
                  Backend API enforces claim authorization on all endpoints. Client routing is UX only.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-slate-300">
                <span className="font-semibold block text-slate-200">Session Validity</span>
                <p className="text-[11px] text-slate-400">
                  Your JWT Bearer token expires 8 hours after issuance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: PREFERENCES */}
      {activeTab === 'preferences' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles size={20} className="text-cyan-400" />
              Portal Preferences & Alerts
            </CardTitle>
            <CardDescription>
              Configure system alerts, sound effects, and display options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Email Notifications</span>
                <span className="text-xs text-slate-400">
                  Receive email updates for new assignment publications and submissions.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailAlerts(!emailAlerts);
                  toast.info(emailAlerts ? 'Email alerts disabled' : 'Email alerts enabled');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  emailAlerts ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    emailAlerts ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Deadline Countdown Reminders</span>
                <span className="text-xs text-slate-400">
                  Show visual urgency badges when assignment deadlines are under 24 hours.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssignmentReminders(!assignmentReminders);
                  toast.info(assignmentReminders ? 'Reminders disabled' : 'Reminders enabled');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  assignmentReminders ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    assignmentReminders ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Interactive Sound & Confetti</span>
                <span className="text-xs text-slate-400">
                  Celebrate successful assignment submissions with animations.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSoundEffects(!soundEffects);
                  toast.info(soundEffects ? 'Celebration effects muted' : 'Celebration effects enabled');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  soundEffects ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    soundEffects ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="primary" onClick={() => {
                toast.success('Preferences saved successfully!');
                setActiveTab('overview');
              }}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
