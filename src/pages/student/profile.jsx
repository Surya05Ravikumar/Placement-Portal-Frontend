import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, Phone, Calendar, Award, Briefcase, FileText, Plus, Download,
  Upload, Eye, CheckCircle2, TrendingUp, Zap, Star, Code, Code2, Layers,
  MapPin, Building2, X, Trash2, Edit3, Clock
} from 'lucide-react';
import profileImage from '../../assets/rajkumarprofile.avif';

const ProfileModern = () => {
  const fileInputRef = React.useRef(null);
  const certPhotoInputRef = React.useRef(null);

  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [viewImageObj, setViewImageObj] = useState(null);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', image: '' });
  const [profileData, setProfileData] = useState({});
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [activityPoints, setActivityPoints] = useState({ total: 0, max: 150, badgeLevel: 'Bronze', remaining: 150 });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }
        const loggedInUser = JSON.parse(userStr);
        const regNo = loggedInUser.registerNumber || '20CS101';

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/users/byReg/${regNo}`);
        const data = response.data;

        setProfileData(data);
        setSkills(data.skills || []);
        setCertifications(data.certifications || []);
        setResumes(data.resumes || []);

        if (data.activityPoints) {
          const totalPoints = data.activityPoints.total || 0;
          let max = 50;
          let badgeLevel = 'Bronze';

          if (totalPoints >= 200) { max = 200; badgeLevel = 'Diamond'; }
          else if (totalPoints >= 150) { max = 200; badgeLevel = 'Platinum'; }
          else if (totalPoints >= 100) { max = 150; badgeLevel = 'Gold'; }
          else if (totalPoints >= 50) { max = 100; badgeLevel = 'Silver'; }
          else { max = 50; badgeLevel = 'Bronze'; }

          const remaining = max > totalPoints ? max - totalPoints : 0;

          setActivityPoints({ total: totalPoints, max, badgeLevel, remaining });
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B1220]">
        <div className="text-xl font-bold text-gray-600 dark:text-slate-400 animate-pulse uppercase tracking-widest">Loading Profile...</div>
      </div>
    );
  }

  const getLevelConfig = (level) => {
    const configs = {
      basic: { 
        bg: 'bg-orange-50 dark:bg-orange-100', 
        text: 'text-orange-700 dark:text-orange-800', 
        border: 'border-orange-200 dark:border-orange-300' 
      },
      intermediate: { 
        bg: 'bg-blue-50 dark:bg-blue-100', 
        text: 'text-blue-700 dark:text-blue-800', 
        border: 'border-blue-200 dark:border-blue-300' 
      },
      advanced: { 
        bg: 'bg-green-50 dark:bg-green-100', 
        text: 'text-green-700 dark:text-green-800', 
        border: 'border-green-200 dark:border-green-300' 
      }
    };
    return configs[level];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bronze': return 'bg-orange-600';
      case 'Silver': return 'bg-gray-400';
      case 'Gold': return 'bg-yellow-500';
      case 'Platinum': return 'bg-blue-600';
      case 'Diamond': return 'bg-indigo-600';
      default: return 'bg-blue-600';
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const initials = profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1220] flex flex-col font-sans transition-colors duration-300">


      <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Info Card */}
                    <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-100 dark:border-slate-800 p-8 flex flex-col items-center hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-500 group overflow-hidden relative">
                        {/* Decorative background for avatar */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 dark:from-blue-500/10 dark:to-indigo-600/10 -z-0"></div>
                        
                        <div className="relative z-10">
                            <div className="relative group/avatar">
                                {profileData.photo ? (
                                    <img src={profileData.photo} alt="Profile" className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105" />
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black border-4 border-white dark:border-slate-900 shadow-2xl group-hover/avatar:scale-105 transition-transform duration-500">
                                        {initials}
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center relative z-10 w-full">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">{profileData.name}</h2>
                            <p className="text-blue-600 dark:text-blue-400 font-black tracking-[0.2em] text-[10px] uppercase mt-3">{profileData.registerNumber}</p>
                            
                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
                                    <p className="text-[8px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-[10px] font-black text-gray-700 dark:text-slate-300 uppercase">Student</p>
                                </div>
                                <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
                                    <p className="text-[8px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1">Year</p>
                                    <p className="text-[10px] font-black text-gray-700 dark:text-slate-300 uppercase">{profileData.year || '4th'} Year</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 w-full space-y-3 relative z-10">
                            <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-transparent dark:border-slate-800/50 transition-all hover:border-blue-500/20 group/field">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover/field:scale-110 transition-transform">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-slate-300 truncate font-bold tracking-tight">{profileData.email}</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-transparent dark:border-slate-800/50 transition-all hover:border-blue-500/20 group/field">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover/field:scale-110 transition-transform">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-slate-300 font-bold tracking-tight">{profileData.phone}</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-transparent dark:border-slate-800/50 transition-all hover:border-blue-500/20 group/field">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover/field:scale-110 transition-transform">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-slate-300 font-bold tracking-tight">{profileData.department}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Points Card */}
                    <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-100 dark:border-slate-800 p-8 hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-500/20"></div>
                        
                        <h3 className="text-xs font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            Activity Progress
                        </h3>
                        
                        <div className="text-center mb-8 relative z-10">
                            <div className={`w-32 h-32 mx-auto mb-6 ${getBadgeColor(activityPoints.badgeLevel)} rounded-3xl flex items-center justify-center text-white rotate-3 shadow-xl shadow-blue-500/20 transition-transform group-hover:rotate-0 duration-500`}>
                                <div className="text-center -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <p className="text-4xl font-black leading-none">{activityPoints.total}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-80">POINTS</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 ${getBadgeColor(activityPoints.badgeLevel)} text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20`}>
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                {activityPoints.badgeLevel} Tier
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                                <span>Next Milestone</span>
                                <span>{activityPoints.total} / {activityPoints.max}</span>
                            </div>
                            <div className="h-2.5 bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden border border-gray-100 dark:border-slate-800/50 p-0.5">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${(activityPoints.total / activityPoints.max) * 100}%` }}></div>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 dark:text-slate-600 font-bold uppercase tracking-tight">
                                {activityPoints.remaining} points needed for higher tier
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/50 text-center transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm group/stat">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3 shadow-inner group-hover/stat:rotate-12 transition-transform">
                                    <Star className="w-5 h-5" />
                                </div>
                                <p className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{profileData.rank || 'N/A'}</p>
                                <p className="text-[9px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-widest">Global Rank</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/50 text-center transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm group/stat">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-3 shadow-inner group-hover/stat:rotate-12 transition-transform">
                                    <Award className="w-5 h-5" />
                                </div>
                                <p className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{profileData.selectedCount || 0}</p>
                                <p className="text-[9px] text-gray-400 dark:text-slate-400 font-black uppercase tracking-widest">Offers</p>
                            </div>
                        </div>
                    </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.1em]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                Skills
              </h3>
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {skills?.length > 0 ? (
                skills.map((skill, index) => {
                  const levelCfg = getLevelConfig(skill.level || 'basic');
                  return (
                    <span
                      key={index}
                      className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${levelCfg?.bg || 'bg-blue-50'} ${levelCfg?.text || 'text-blue-700'} ${levelCfg?.border || 'border-blue-200'}`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {skill.name}
                    </span>
                  );
                })
              ) : (
                <div className="w-full py-8 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                  <Code className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">No skills added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.1em]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                Personal Information
              </h3>
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="CGPA" value={profileData.cgpa ? Number(profileData.cgpa).toFixed(1) : '0.0'} icon={<Star className="w-4 h-4" />} />
              <InfoField label="Stream" value={profileData.stream} icon={<Layers className="w-4 h-4" />} />
              <InfoField label="Date of Birth" value={formatDate(profileData.dateOfBirth)} icon={<Calendar className="w-4 h-4" />} />
              <InfoField label="Gender" value={profileData.gender} icon={<User className="w-4 h-4" />} />
            </div>
          </div>

          {/* Certifications Card */}
          <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                  <Award className="w-4 h-4" />
                </div>
                Certifications
              </h3>
              <button
                onClick={() => setShowAddCertModal(true)}
                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert._id || cert.id} className="p-4 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900/50 hover:border-blue-100 dark:hover:border-blue-500/20 transition-all flex items-start gap-4 group">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-center p-2 shadow-inner cursor-pointer group-hover:scale-105 transition-transform" onClick={() => setViewImageObj(cert)}>
                    {cert.image ? <img src={cert.image} alt={cert.name} className="w-full h-full object-contain" /> : <Award className="w-6 h-6 text-gray-200 dark:text-slate-700" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{cert.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 font-medium">{cert.issuer}</p>
                    <div className="flex gap-4 text-[10px] text-gray-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                      <span>Issued: {formatDate(cert.issueDate)}</span>
                      {cert.expiryDate && <span>Expires: {formatDate(cert.expiryDate)}</span>}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                  <FileText className="w-4 h-4" />
                </div>
                Resume Manager
              </h3>
            </div>
            
            <div className="space-y-6 relative z-10">
              {resumes.length > 0 ? (
                resumes.map((resume) => {
                  const resumeId = resume._id || resume.id;
                  return (
                    <div key={resumeId} className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900/50 dark:to-slate-900/30 rounded-3xl border border-gray-100 dark:border-slate-800/50 flex flex-col md:flex-row items-center gap-6 group/resume transition-all hover:border-blue-500/30 shadow-sm relative">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this resume?')) {
                            try {
                              const regNo = profileData.registerNumber;
                              const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${regNo}/resumes/${resumeId}`);
                              setResumes(res.data.resumes);
                              alert("Resume deleted successfully");
                            } catch (err) {
                              console.error("Delete failed", err);
                              alert("Failed to delete resume");
                            }
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 opacity-0 group-hover/resume:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover/resume:scale-110 transition-transform duration-300">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="flex-1 text-center md:text-left min-w-0">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Active Resume</p>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate border-b border-transparent group-hover/resume:border-current inline-block">
                          {resume.name}
                        </h4>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                          <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {formatDate(resume.uploadedDate)}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Layers className="w-3 h-3" /> {resume.size}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                          <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all active:scale-90">
                              <Download className="w-4 h-4" />
                          </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50/50 dark:bg-slate-900/10 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-4 opacity-30" />
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">No resumes uploaded yet</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const base64Content = reader.result;
                      const regNo = profileData.registerNumber;
                      const resumePayload = {
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        fileData: base64Content
                      };
                      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${regNo}/resumes`, resumePayload);
                      setResumes(res.data.resumes);
                      alert("Resume uploaded successfully!");
                    };
                    reader.readAsDataURL(file);
                  } catch (err) {
                    console.error("Resume upload failed", err);
                    alert("Upload failed.");
                  }
                }}
              />
              <button 
                onClick={handleUploadClick}
                className="w-full py-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group/upload relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-400 group-hover/upload:text-blue-500 dark:group-hover/upload:text-blue-400 transition-colors shadow-inner">
                        <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] group-hover/upload:text-blue-600 dark:group-hover/upload:text-blue-400 transition-colors">Upload Enhanced Version</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
              <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">Add Certification</h3>
              <button onClick={() => setShowAddCertModal(false)} className="text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-4 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5">Certification Name</label>
                <input type="text" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} placeholder="e.g. AWS Certified Developer" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5">Issuer</label>
                <input type="text" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" value={newCert.issuer} onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5">Issue Date</label>
                  <input type="date" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" value={newCert.issueDate} onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5">Expiry Date</label>
                  <input type="date" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" value={newCert.expiryDate} onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5">Credential ID</label>
                <input type="text" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" value={newCert.credentialId} onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })} placeholder="e.g. AWS-123456" />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5">Certificate Image</label>
                <div
                  onClick={() => certPhotoInputRef.current.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all overflow-hidden"
                >
                  {newCert.image ? (
                    <img src={newCert.image} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-300 dark:text-slate-700 mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest">Click to upload image</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={certPhotoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewCert({ ...newCert, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    const regNo = profileData.registerNumber;
                    const res = await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`}/api/users/${regNo}/certifications`, newCert);
                    setCertifications(res.data.certifications);
                    setShowAddCertModal(false);
                    setNewCert({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', image: '' });
                  } catch (e) {
                    console.error("Failed to add cert", e);
                  }
                }}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4 active:scale-95"
                disabled={!newCert.name || !newCert.issuer || !newCert.issueDate}
              >
                Save Certification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImageObj && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setViewImageObj(null)}>
          <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform"><X className="w-8 h-8" /></button>
          <img src={viewImageObj.image} alt={viewImageObj.name} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border-4 border-white/10" />
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          currentData={profileData}
          onClose={() => setShowEditProfileModal(false)}
          onSave={async (updatedData) => {
            try {
              const res = await axios.put(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`}/api/users/${profileData._id}`, updatedData);
              setProfileData(res.data);
              setShowEditProfileModal(false);
            } catch (error) {
              console.error("Failed to update profile", error);
            }
          }}
        />
      )}
    </div>
  );
};

const InfoField = ({ label, value, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border border-transparent dark:border-slate-800 transition-all font-bold text-gray-700 dark:text-slate-300 shadow-sm active:scale-[0.99]">
      <span className="text-blue-600 dark:text-blue-500">{icon}</span>
      <span className="text-sm tracking-tight">{value || 'Not provided'}</span>
    </div>
  </div>
);

const EditProfileModal = ({ currentData, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...currentData });
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0B1220] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0B1220] shadow-sm z-10 transition-colors">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            Edit Profile Information
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">CGPA</label>
              <input type="number" step="0.1" min="0" max="10" value={formData.cgpa || ''} onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value).toFixed(1) })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="10-digit mobile number" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Gender</label>
              <select value={formData.gender || ''} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
                <option value="" className="bg-white dark:bg-slate-900">Select Gender</option>
                <option value="Male" className="bg-white dark:bg-slate-900">Male</option>
                <option value="Female" className="bg-white dark:bg-slate-900">Female</option>
                <option value="Other" className="bg-white dark:bg-slate-900">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Date of Birth</label>
              <input type="date" value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Stream</label>
              <input type="text" value={formData.stream || ''} onChange={(e) => setFormData({ ...formData, stream: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g., B.E, B.Tech" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">LinkedIn URL</label>
              <input type="url" value={formData.linkedin || ''} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="https://linkedin.com/in/yourprofile" />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Manage Skills</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="new-skill-name"
                  placeholder="Skill name (e.g. React)"
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <select 
                  id="new-skill-level"
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button 
                  type="button"
                  onClick={() => {
                    const name = document.getElementById('new-skill-name').value;
                    const level = document.getElementById('new-skill-level').value;
                    if (name) {
                      const newSkills = [...(formData.skills || []), { name, level }];
                      setFormData({ ...formData, skills: newSkills });
                      document.getElementById('new-skill-name').value = '';
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all active:scale-95"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.skills?.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl group">
                    <span className="text-xs font-bold dark:text-slate-300 uppercase tracking-tight">{skill.name}</span>
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-60">{skill.level}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const newSkills = formData.skills.filter((_, i) => i !== index);
                        setFormData({ ...formData, skills: newSkills });
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 transition-colors">
            <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm">Cancel</button>
            <button onClick={() => onSave(formData)} className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModern;
