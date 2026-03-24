import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, FileText, CheckCircle2, Eye, X, AlertCircle } from 'lucide-react';

import Modal from '../../components/common/Modal';
import { ToastContainer, useToast } from '../../components/common/Toast';
import CompanyLogo from '../../components/common/CompanyLogo';
import Timeline from '../../components/common/Timeline';

const ApplyCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: errorToast } = useToast();
  const [company, setCompany] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resume selection
  const [resumeOption, setResumeOption] = useState('existing');
  const [selectedResume, setSelectedResume] = useState('');
  const [newResume, setNewResume] = useState(null);

  // Application form - Initialized as empty, will be filled from profile
  const [formData, setFormData] = useState({
    fullName: '',
    registerNumber: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    year: '',
    cgpa: '',
    stream: '',
    backlogs: 0,
    currentAddress: '',
    permanentAddress: '',
    skills: '',
    projects: '',
    internshipExperience: '',
    whyThisCompany: '',
    expectedSalary: '',
    noticePeriod: '0 days',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    preferredLocation: '',
    willingToRelocate: 'yes'
  });

  const [declaration, setDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);

  const [errors, setErrors] = useState({});

  const [existingResumes, setExistingResumes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const loggedInUser = JSON.parse(userStr);
        const regNo = loggedInUser.registerNumber || '20CS101';

        const [companyRes, userRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/companies/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/byReg/${regNo}`)
        ]);

        setCompany(companyRes.data);
        const userData = userRes.data;
        setCurrentUser(userData);

        setFormData(prev => ({
          ...prev,
          fullName: userData.name || '',
          registerNumber: userData.registerNumber || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: userData.gender || '',
          department: userData.department || '',
          year: userData.year || '',
          cgpa: userData.cgpa || '',
          stream: userData.stream || '',
          backlogs: userData.backlogs || 0,
          currentAddress: userData.address || '',
          permanentAddress: userData.address || '',
          skills: (userData.skills || []).map(s => s.name).join(', ')
        }));

        setExistingResumes(userData.resumes || []);
        if (userData.resumes?.length > 0) {
          const primary = userData.resumes.find(r => r.primary) || userData.resumes[0];
          setSelectedResume(primary._id || primary.id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching apply data:", error);
        errorToast('Failed to load application data');
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, errorToast]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 2 * 1024 * 1024) {
        errorToast('File size should not exceed 2MB');
        return;
      }
      setNewResume(file);
    } else {
      errorToast('Please upload a PDF file');
    }
  };



  const validateForm = () => {
    const newErrors = {};

    // Only basic validation for Resume and Declaration now
    if (resumeOption === 'existing' && !selectedResume) {
      newErrors.resume = 'Please select a resume';
    } else if (resumeOption === 'new' && !newResume) {
      newErrors.resume = 'Please upload a resume';
    }

    if (!declaration) {
      newErrors.declaration = 'You must accept the declaration to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      errorToast('Please fill all required fields correctly');
      return;
    }

    setSubmitting(true);

    try {
      let finalResumeId = selectedResume;
      let finalResumeName = '';

      // If new resume, upload it to player profile first
      if (resumeOption === 'new' && newResume) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(newResume);
        });

        const base64Content = await base64Promise;
        const resumePayload = {
          name: newResume.name,
          size: (newResume.size / 1024).toFixed(1) + ' KB',
          fileData: base64Content
        };

        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.registerNumber}/resumes`, resumePayload);
        const addedResume = uploadRes.data.resumes[uploadRes.data.resumes.length - 1];
        finalResumeId = addedResume._id || addedResume.id;
        finalResumeName = addedResume.name;
      } else if (resumeOption === 'existing') {
        const selectedObj = existingResumes.find(r => (r._id || r.id) === selectedResume);
        finalResumeName = selectedObj?.name || 'Resume';
      }

      const applicationData = {
        companyId: company._id,
        userId: currentUser._id,
        userRegisterNumber: formData.registerNumber,
        companyName: company.name,
        role: company.jobRoles?.[0]?.role || 'SDE',
        package: parseFloat(company.jobRoles?.[0]?.package) || 0,
        status: 'Applied',
        appliedDate: new Date(),
        currentRound: 'Application Review',
        resumeName: finalResumeName,
        resumeId: finalResumeId,
        additionalInfo: formData
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/applications`, applicationData);

      setSubmitting(false);
      success('Application submitted successfully!');
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    } catch (error) {
      console.error("Application submission error:", error);
      errorToast(error.response?.data?.message || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Back Button */}
                <button
                    onClick={() => navigate(`/companies/${id}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white mb-6 uppercase tracking-tighter font-black text-xs transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                {/* Company Info */}
                {company && (
                    <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
                        <div className="flex items-center gap-5">
                            <CompanyLogo 
                                logo={company.logo} 
                                name={company.name} 
                                className="w-16 h-16" 
                                iconSize="w-8 h-8"
                            />
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{company.name}</h1>
                                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mt-1">{company.jobRoles?.[0]?.role || 'SDE'}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    <span>₹{company.jobRoles?.[0]?.package || 'TBD'} LPA</span>
                                    <span className="opacity-30">•</span>
                                    <span>{company.industry}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                {company && (
                    <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
                        <Timeline 
                            applicationStart={company.applicationStart}
                            applicationDeadline={company.applicationDeadline}
                            driveDate={company.driveDate}
                        />
                    </div>
                )}

        <form onSubmit={handleSubmit}>
                    {/* Resume Selection */}
                    <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            Select Application Resume
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 group shadow-sm ${resumeOption === 'existing' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 dark:border-blue-500/50' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900'}`}>
                                <input
                                    type="radio"
                                    name="resumeOption"
                                    value="existing"
                                    checked={resumeOption === 'existing'}
                                    onChange={(e) => setResumeOption(e.target.value)}
                                    className="mt-1 w-4 h-4 text-blue-600"
                                />
                                <div className="flex-1">
                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">Existing Resume</p>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">From your profile</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 group shadow-sm ${resumeOption === 'new' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 dark:border-blue-500/50' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900'}`}>
                                <input
                                    type="radio"
                                    name="resumeOption"
                                    value="new"
                                    checked={resumeOption === 'new'}
                                    onChange={(e) => setResumeOption(e.target.value)}
                                    className="mt-1 w-4 h-4 text-blue-600"
                                />
                                <div className="flex-1">
                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">New Upload</p>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Specific for this role</p>
                                </div>
                            </label>
                        </div>

                        {/* Existing Resume Selection */}
                        {resumeOption === 'existing' && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Choose from profile:</p>
                                {existingResumes.map((resume) => {
                                    const resumeId = resume._id || resume.id;
                                    const isSelected = selectedResume === resumeId;
                                    return (
                                        <label
                                            key={resumeId}
                                            className={`flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 group shadow-sm ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="selectedResume"
                                                    value={resumeId}
                                                    checked={isSelected}
                                                    onChange={() => setSelectedResume(resumeId)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`font-black uppercase tracking-tight text-sm ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-500'}`}>{resume.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest mt-1">
                                                        {new Date(resume.uploadedDate).toLocaleDateString()} • {resume.size}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewResume(resume)}
                                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Preview
                                            </button>
                                        </label>
                                    );
                                })}
                {existingResumes.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    No resumes found in your profile. Please upload a new one below.
                  </p>
                )}
              </div>
            )}

            {/* New Resume Upload */}
            {resumeOption === 'new' && (
              <div>
                <label className="block">
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${errors.resume ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'}`}>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${errors.resume ? 'text-red-400' : 'text-gray-400'}`} />
                    <p className={`font-medium mb-1 ${errors.resume ? 'text-red-700' : 'text-gray-700'}`}>
                      {newResume ? newResume.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">PDF only, max 2MB</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </label>
                {errors.resume && <p className="text-sm text-red-500 mt-2 font-medium text-center">{errors.resume}</p>}
                                {newResume && (
                                    <div className="mt-6 p-5 bg-green-50/50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-green-600 shadow-inner">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-green-900 dark:text-green-400 uppercase tracking-tight text-sm">{newResume.name}</p>
                                            <p className="text-[10px] font-black text-green-700/60 dark:text-green-500/60 uppercase tracking-widest mt-1">{(newResume.size / 1024).toFixed(2)} KB • Ready for upload</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewResume(null)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Personal Details */}
                    <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
                        <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-8 border-b border-gray-100 dark:border-slate-800/50 pb-4">Personal Information (Verified)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input type="text" value={formData.fullName} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Register Number</label>
                                <input type="text" value={formData.registerNumber} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input type="email" value={formData.email} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                                <input type="tel" value={formData.phone} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Date of Birth</label>
                                <input type="date" value={formData.dateOfBirth} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Gender</label>
                                <input type="text" value={formData.gender} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm uppercase" />
                            </div>
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
                        <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-8 border-b border-gray-100 dark:border-slate-800/50 pb-4">Academic Background (Verified)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Department</label>
                                <input type="text" value={formData.department} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Academic Year</label>
                                <input type="text" value={formData.year} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Current CGPA</label>
                                <input type="text" value={formData.cgpa} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-green-600 dark:text-green-500 font-black text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Stream / Specialization</label>
                                <input type="text" value={formData.stream} readOnly className="w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Active Backlogs</label>
                                <input type="number" value={formData.backlogs} readOnly className={`w-full px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed font-black text-sm ${formData.backlogs > 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`} />
                            </div>
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className={`bg-white dark:bg-[#020617] rounded-xl p-8 border transition-all duration-300 mb-8 shadow-sm ${errors.declaration ? 'border-red-500 bg-red-50/50 dark:bg-red-500/5' : 'border-gray-100 dark:border-slate-800'}`}>
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={declaration}
                                onChange={(e) => {
                                    setDeclaration(e.target.checked);
                                    if (errors.declaration) setErrors({ ...errors, declaration: '' });
                                }}
                                className="mt-1.5 w-5 h-5 text-blue-600 rounded-lg border-gray-300 dark:border-slate-700"
                            />
                            <div>
                                <p className={`font-black uppercase tracking-tight text-sm ${errors.declaration ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}>Final Declaration *</p>
                                <p className={`text-xs font-medium mt-2 leading-relaxed ${errors.declaration ? 'text-red-700/70 dark:text-red-400/70' : 'text-gray-500 dark:text-slate-500'}`}>
                                    I hereby declare that all the information provided above is true and correct to the best of my knowledge.
                                    I understand that any false information may lead to rejection of my application or termination of employment.
                                </p>
                                {errors.declaration && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-3 animate-pulse">{errors.declaration}</p>}
                            </div>
                        </label>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl p-6 mb-8 flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-[0.2em] mb-2">Final Checklist:</p>
                            <ul className="text-xs font-bold text-blue-700/70 dark:text-blue-400/60 space-y-1 mt-3">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                                    Review all auto-filled information
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                                    Double-check your resume selection
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                                    Ensure declaration is signed
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 mb-12">
                        <button
                            type="button"
                            onClick={() => navigate('/companies')}
                            className="flex-1 px-8 py-4 border-2 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-slate-900 transition-all active:scale-95"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] px-8 py-4 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
        </form>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
        title={previewResume ? `Preview: ${previewResume.name}` : "Resume Preview"}
        size="lg"
        className="no-scrollbar"
      >
        <div className="h-[70vh]">
          {previewResume?.fileData ? (
             <iframe
               src={previewResume.fileData}
               className="w-full h-full rounded-lg"
               title="Resume Preview"
             />
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No preview available for this resume</p>
            </div>
          )}
        </div>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ApplyCompany;
