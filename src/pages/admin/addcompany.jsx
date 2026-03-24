import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Building2, Globe, MapPin, User, Mail, Phone,
    Briefcase, DollarSign, Calendar, FileText, Upload, Plus,
    X, CheckCircle, AlertCircle, GraduationCap, Target, Trash2
} from 'lucide-react';
import Timeline from '../../components/common/Timeline';

const AddCompany = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(isEditMode);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Company Information
        companyName: '',
        industry: '',
        website: '',
        location: '',
        headquarters: '',
        description: '',
        logo: null,

        // Job Details
        jobRoles: [{
            role: '',
            description: '',
            location: '',
            workMode: 'onsite',
            package: '',
            bonus: '',
            bond: ''
        }],

        // Eligibility
        eligibleDepartments: [],
        minCGPA: '',
        allowedBacklogs: '',
        passingYear: '',
        requiredPoints: '75', // Default points

        // Timeline
        applicationStart: '',
        applicationDeadline: '',
        driveDate: '',
        maxApplications: '',
        applicationStartTBD: false,
        applicationDeadlineTBD: false,
        driveDateTBD: false,

        // Rounds
        rounds: [
            { name: 'Aptitude Test', venue: '' },
            { name: 'Technical Interview', venue: '' },
            { name: 'HR Interview', venue: '' }
        ]
    });

    const [unlimitedApps, setUnlimitedApps] = useState(true);
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setUnlimitedApps(settings.enableOpenApps);
        }
    }, []);

    // Fetch existing company data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchCompany = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/companies/${id}`);
                    const c = response.data;

                    const formatDateTimeLocal = (dateString) => {
                        if (!dateString) return '';
                        const d = new Date(dateString);
                        return d.toISOString().slice(0, 16);
                    };
                    const formatDate = (dateString) => {
                        if (!dateString) return '';
                        const d = new Date(dateString);
                        return d.toISOString().split('T')[0];
                    };

                    setFormData({
                        companyName: c.name || '',
                        industry: c.industry || '',
                        website: c.website || '',
                        location: c.location || '',
                        headquarters: c.headquarters || '',
                        description: c.description || '',
                        logo: c.logo || null,
                        jobRoles: c.jobRoles && c.jobRoles.length > 0 ? c.jobRoles : [{
                            role: '', description: '', location: '', workMode: 'onsite', package: '', bonus: '', bond: ''
                        }],
                        eligibleDepartments: c.eligibleBranches || [],
                        minCGPA: c.minCGPA || '',
                        allowedBacklogs: c.allowedBacklogs || '',
                        passingYear: c.passingYear || '',
                        requiredPoints: c.requiredPoints || '',
                        applicationStart: c.applicationStart ? formatDateTimeLocal(c.applicationStart) : '',
                        applicationDeadline: c.applicationDeadline ? formatDateTimeLocal(c.applicationDeadline) : '',
                        driveDate: c.driveDate ? formatDate(c.driveDate) : '',
                        applicationStartTBD: !c.applicationStart,
                        applicationDeadlineTBD: !c.applicationDeadline,
                        driveDateTBD: !c.driveDate,
                        maxApplications: c.maxApplications && c.maxApplications !== Infinity ? c.maxApplications : '',
                        rounds: c.rounds && c.rounds.length > 0 ? c.rounds : [
                            { name: 'Aptitude Test', venue: '' },
                            { name: 'Technical Interview', venue: '' },
                            { name: 'HR Interview', venue: '' }
                        ]
                    });

                    if (c.maxApplications && c.maxApplications !== Infinity) {
                        setUnlimitedApps(false);
                    }
                } catch (error) {
                    console.error("Error fetching company:", error);
                    alert("Failed to load company details");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCompany();
        }
    }, [id, isEditMode]);

    const [errors, setErrors] = useState({});
    const [newRound, setNewRound] = useState({ name: '', venue: '' });

    const steps = [
        { id: 1, name: 'Company Info', icon: <Building2 className="w-5 h-5" /> },
        { id: 2, name: 'Job Details', icon: <Briefcase className="w-5 h-5" /> },
        { id: 3, name: 'Eligibility', icon: <Target className="w-5 h-5" /> },
        { id: 4, name: 'Timeline & Rounds', icon: <Calendar className="w-5 h-5" /> }
    ];

    const departments = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
    const industries = ['IT / Software', 'Core Engineering', 'Finance', 'Consulting', 'Manufacturing', 'Healthcare'];
    const workModes = ['onsite', 'hybrid', 'remote'];

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleDepartmentToggle = (dept) => {
        const current = formData.eligibleDepartments;
        if (current.includes(dept)) {
            handleChange('eligibleDepartments', current.filter(d => d !== dept));
        } else {
            handleChange('eligibleDepartments', [...current, dept]);
        }
    };

    const handleAddRound = () => {
        if (newRound.name.trim()) {
            handleChange('rounds', [...formData.rounds, { ...newRound, name: newRound.name.trim() }]);
            setNewRound({ name: '', venue: '' });
        }
    };

    const handleRemoveRound = (index) => {
        const updated = formData.rounds.filter((_, i) => i !== index);
        handleChange('rounds', updated);
    };

    const handleJobRoleChange = (index, field, value) => {
        const updatedRoles = [...formData.jobRoles];
        updatedRoles[index] = { ...updatedRoles[index], [field]: value };
        handleChange('jobRoles', updatedRoles);
    };

    const handleAddJobRole = (e) => {
        if (e) e.preventDefault();
        handleChange('jobRoles', [
            ...formData.jobRoles,
            { role: '', description: '', location: '', workMode: 'onsite', package: '', bonus: '', bond: '' }
        ]);
    };

    const handleRemoveJobRole = (index) => {
        const updatedRoles = formData.jobRoles.filter((_, i) => i !== index);
        handleChange('jobRoles', updatedRoles);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File size should not exceed 2MB');
                return;
            }
            handleChange('logo', file);
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
            if (!formData.industry) newErrors.industry = 'Industry is required';
            if (!formData.website.trim()) newErrors.website = 'Website is required';
            if (!formData.location.trim()) newErrors.location = 'Location is required';
            if (!formData.description.trim()) newErrors.description = 'Description is required';
        }

        if (step === 2) {
            if (formData.jobRoles.length === 0) newErrors.jobRoles = 'At least one job role is required';
            formData.jobRoles.forEach((job, index) => {
                if (!job.role.trim()) newErrors[`jobRole_${index}`] = 'Job role is required';
                if (!job.description.trim()) newErrors[`jobDescription_${index}`] = 'Job description is required';
                if (!job.location.trim()) newErrors[`jobLocation_${index}`] = 'Job location is required';
                if (!job.package.trim()) newErrors[`jobPackage_${index}`] = 'Package is required';
            });
        }

        if (step === 3) {
            if (formData.eligibleDepartments.length === 0) newErrors.eligibleDepartments = 'Select at least one department';
            if (!formData.minCGPA) newErrors.minCGPA = 'Minimum CGPA is required';
            if (formData.allowedBacklogs === '') newErrors.allowedBacklogs = 'Allowed backlogs is required';
            if (!formData.passingYear) newErrors.passingYear = 'Passing year is required';
            if (!formData.requiredPoints) newErrors.requiredPoints = 'Required points are required';
        }

        if (step === 4) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!formData.applicationStartTBD) {
                if (!formData.applicationStart) {
                    newErrors.applicationStart = 'Application start date is required';
                } else {
                    const start = new Date(formData.applicationStart);
                    if (start < today) {
                        newErrors.applicationStart = 'Start date cannot be in the past';
                    }
                }
            }

            if (!formData.applicationDeadlineTBD) {
                if (!formData.applicationDeadline) {
                    newErrors.applicationDeadline = 'Application deadline is required';
                } else {
                    const deadline = new Date(formData.applicationDeadline);
                    if (deadline < today) {
                        newErrors.applicationDeadline = 'Deadline cannot be in the past';
                    }
                    if (!formData.applicationStartTBD && formData.applicationStart) {
                        const start = new Date(formData.applicationStart);
                        if (deadline <= start) {
                            newErrors.applicationDeadline = 'Deadline must be after start date';
                        }
                    }
                }
            }

            if (!formData.driveDateTBD) {
                if (!formData.driveDate) {
                    newErrors.driveDate = 'Placement drive date is required';
                } else {
                    const drive = new Date(formData.driveDate);
                    if (drive < today) {
                        newErrors.driveDate = 'Drive date cannot be in the past';
                    }
                    if (!formData.applicationDeadlineTBD && formData.applicationDeadline) {
                        const deadline = new Date(formData.applicationDeadline);
                        if (drive < deadline) {
                            newErrors.driveDate = 'Drive date must be on or after deadline';
                        }
                    }
                }
            }

            if (!unlimitedApps && !formData.maxApplications) {
                newErrors.maxApplications = 'Max application count is required when unlimited is off';
            }
            if (formData.rounds.length === 0) newErrors.rounds = 'Add at least one recruitment round';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (validateStep(currentStep)) {
            setIsSubmitting(true);
            try {
                // Convert logo to base64 if it exists
                let logoBase64 = null;
                if (formData.logo instanceof File) {
                    logoBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(formData.logo);
                    });
                }

                const companyData = {
                    name: formData.companyName,
                    industry: formData.industry,
                    website: formData.website,
                    location: formData.location,
                    headquarters: formData.headquarters,
                    description: formData.description,
                    logo: logoBase64,
                    jobRoles: formData.jobRoles,
                    eligibleBranches: formData.eligibleDepartments,
                    minCGPA: parseFloat(formData.minCGPA),
                    allowedBacklogs: parseInt(formData.allowedBacklogs),
                    passingYear: parseInt(formData.passingYear),
                    requiredPoints: parseInt(formData.requiredPoints),
                    applicationStart: formData.applicationStartTBD ? null : formData.applicationStart,
                    applicationDeadline: formData.applicationDeadlineTBD ? null : formData.applicationDeadline,
                    driveDate: formData.driveDateTBD ? null : formData.driveDate,
                    maxApplications: formData.maxApplications === '' ? 999999 : parseInt(formData.maxApplications),
                    rounds: formData.rounds
                };

                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user ? (user._id || user.id || user.email) : null;

                const method = isEditMode ? 'PUT' : 'POST';
                const url = isEditMode ? `${import.meta.env.VITE_API_URL}/api/companies/${id}` : `${import.meta.env.VITE_API_URL}/api/companies`;

                // Ensure a fallback userId for admin operations
                const finalUserId = userId || 'admin-bypass';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': finalUserId
                    },
                    body: JSON.stringify(companyData)
                });

                if (response.ok) {
                    setShowSuccessModal(true);
                } else {
                    const error = await response.json();
                    console.error('Backend error:', error);
                    alert(`Submission Failed: ${error.message || 'Unknown server error'}`);
                }
            } catch (err) {
                console.error('Submission error:', err);
                alert(`Failed to ${isEditMode ? 'update' : 'create'} company. Please try again.`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            {/* Form Content */}
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <button
                        onClick={() => navigate('/admin/companies')}
                        className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white mb-6 group transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Companies
                    </button>

                    {/* Progress Steps */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${currentStep > step.id
                                                    ? 'bg-green-600 text-white shadow-green-200 dark:shadow-none'
                                                    : currentStep === step.id
                                                        ? 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none'
                                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.icon}
                                            </div>
                                            <p className={`mt-2 text-sm font-bold ${currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-500'
                                                }`}>
                                                {step.name}
                                            </p>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200 dark:bg-slate-700'
                                                }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">

                        {/* Step 1: Company Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Company Information</h2>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Company Logo</label>
                                    <div className="flex items-center gap-4">
                                        {formData.logo ? (
                                            <div className="w-20 h-20 rounded-lg border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                                                <img
                                                    src={URL.createObjectURL(formData.logo)}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center bg-gray-50 dark:bg-[#020617]/50">
                                                <Building2 className="w-8 h-8 text-gray-400 dark:text-slate-600" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg font-bold cursor-pointer flex items-center gap-2 w-fit transition-colors">
                                                <Upload className="w-4 h-4" />
                                                Upload Logo
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Max 2MB, PNG/JPG</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                            Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.companyName}
                                            onChange={(e) => handleChange('companyName', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.companyName ? 'border-red-300' : 'border-gray-300 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., Microsoft"
                                        />
                                        {errors.companyName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.companyName}</p>}
                                    </div>

                                    {/* Industry */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                            Industry *
                                        </label>
                                        <select
                                            value={formData.industry}
                                            onChange={(e) => handleChange('industry', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.industry ? 'border-red-300' : 'border-gray-300 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                        >
                                            <option value="">Select Industry</option>
                                            {industries.map(ind => (
                                                <option key={ind} value={ind}>{ind}</option>
                                            ))}
                                        </select>
                                        {errors.industry && <p className="text-red-500 text-xs mt-1 font-medium">{errors.industry}</p>}
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                            Website *
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => handleChange('website', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.website ? 'border-red-300' : 'border-gray-300 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="https://company.com"
                                        />
                                        {errors.website && <p className="text-red-500 text-xs mt-1 font-medium">{errors.website}</p>}
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => handleChange('location', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.location ? 'border-red-300' : 'border-gray-300 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., Bangalore, India"
                                        />
                                        {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>}
                                    </div>

                                    {/* Headquarters */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                            Headquarters
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.headquarters}
                                            onChange={(e) => handleChange('headquarters', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="e.g., Redmond, Washington, USA"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                            Company Description *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.description ? 'border-red-300' : 'border-gray-300 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all`}
                                            placeholder="Brief description about the company..."
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Job Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Job Details</h2>
                                {errors.jobRoles && <p className="text-red-500 text-sm mb-4 font-medium">{errors.jobRoles}</p>}

                                {formData.jobRoles.map((job, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-[#020617]/50 border border-gray-200 dark:border-slate-700 rounded-xl p-6 relative">
                                        {formData.jobRoles.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveJobRole(index)}
                                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                        <h3 className="text-lg font-extrabold text-blue-600 dark:text-blue-500 mb-6 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5" /> Role {index + 1}
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Job Role *</label>
                                                <input
                                                    type="text"
                                                    value={job.role}
                                                    onChange={(e) => handleJobRoleChange(index, 'role', e.target.value)}
                                                    className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors[`jobRole_${index}`] ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                    placeholder="e.g., Software Development Engineer"
                                                />
                                                {errors[`jobRole_${index}`] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[`jobRole_${index}`]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Job Description *</label>
                                                <textarea
                                                    value={job.description}
                                                    onChange={(e) => handleJobRoleChange(index, 'description', e.target.value)}
                                                    className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors[`jobDescription_${index}`] ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all`}
                                                    placeholder="Detailed job description..."
                                                />
                                                {errors[`jobDescription_${index}`] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[`jobDescription_${index}`]}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Job Location *</label>
                                                    <input
                                                        type="text"
                                                        value={job.location}
                                                        onChange={(e) => handleJobRoleChange(index, 'location', e.target.value)}
                                                        className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors[`jobLocation_${index}`] ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                        placeholder="e.g., Bangalore"
                                                    />
                                                    {errors[`jobLocation_${index}`] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[`jobLocation_${index}`]}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Work Mode *</label>
                                                    <select
                                                        value={job.workMode}
                                                        onChange={(e) => handleJobRoleChange(index, 'workMode', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#020617] border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    >
                                                        {workModes.map(mode => (
                                                            <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
                                            <h4 className="text-md font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-500" /> Compensation details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">CTC (LPA) *</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={job.package}
                                                        onChange={(e) => handleJobRoleChange(index, 'package', e.target.value)}
                                                        className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors[`jobPackage_${index}`] ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                        placeholder="e.g., 12.0"
                                                    />
                                                    {errors[`jobPackage_${index}`] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[`jobPackage_${index}`]}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Bonus (LPA)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={job.bonus}
                                                        onChange={(e) => handleJobRoleChange(index, 'bonus', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#020617] border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        placeholder="e.g., 2.0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Bond (Years)</label>
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        value={job.bond}
                                                        onChange={(e) => handleJobRoleChange(index, 'bond', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#020617] border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        placeholder="e.g., 2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddJobRole}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 bg-white dark:bg-[#020617]/30 hover:bg-blue-50 dark:hover:bg-blue-500/5 active:scale-[0.99]"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Another Role
                                </button>
                            </div>
                        )}

                        {/* Step 3: Eligibility */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Eligibility Criteria</h2>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">Eligible Departments *</label>
                                    <div className="flex flex-wrap gap-3">
                                        {departments.map(dept => (
                                            <button
                                                key={dept}
                                                type="button"
                                                onClick={() => handleDepartmentToggle(dept)}
                                                className={`px-4 py-2 rounded-lg font-bold transition-all ${formData.eligibleDepartments.includes(dept) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.eligibleDepartments && <p className="text-red-500 text-xs mt-2 font-medium">{errors.eligibleDepartments}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Min CGPA *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.minCGPA}
                                            onChange={(e) => handleChange('minCGPA', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.minCGPA ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., 7.5"
                                        />
                                        {errors.minCGPA && <p className="text-red-500 text-xs mt-1 font-medium">{errors.minCGPA}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Allowed Backlogs *</label>
                                        <input
                                            type="number"
                                            value={formData.allowedBacklogs}
                                            onChange={(e) => handleChange('allowedBacklogs', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.allowedBacklogs ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., 0"
                                        />
                                        {errors.allowedBacklogs && <p className="text-red-500 text-xs mt-1 font-medium">{errors.allowedBacklogs}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Passing Year *</label>
                                        <input
                                            type="number"
                                            value={formData.passingYear}
                                            onChange={(e) => handleChange('passingYear', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.passingYear ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., 2026"
                                        />
                                        {errors.passingYear && <p className="text-red-500 text-xs mt-1 font-medium">{errors.passingYear}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Required Points *</label>
                                        <input
                                            type="number"
                                            value={formData.requiredPoints}
                                            onChange={(e) => handleChange('requiredPoints', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.requiredPoints ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., 75"
                                        />
                                        {errors.requiredPoints && <p className="text-red-500 text-xs mt-1 font-medium">{errors.requiredPoints}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Timeline & Rounds */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Timeline & Rounds</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Application Start Date *</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.applicationStartTBD}
                                                    onChange={(e) => handleChange('applicationStartTBD', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TBD</span>
                                            </label>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={formData.applicationStart}
                                            disabled={formData.applicationStartTBD}
                                            onChange={(e) => handleChange('applicationStart', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.applicationStart ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:[color-scheme:dark] disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-slate-900/50`}
                                        />
                                        {errors.applicationStart && <p className="text-red-500 text-xs mt-1 font-medium">{errors.applicationStart}</p>}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Application Deadline *</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.applicationDeadlineTBD}
                                                    onChange={(e) => handleChange('applicationDeadlineTBD', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TBD</span>
                                            </label>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={formData.applicationDeadline}
                                            disabled={formData.applicationDeadlineTBD}
                                            onChange={(e) => handleChange('applicationDeadline', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.applicationDeadline ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:[color-scheme:dark] disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-slate-900/50`}
                                        />
                                        {errors.applicationDeadline && <p className="text-red-500 text-xs mt-1 font-medium">{errors.applicationDeadline}</p>}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Placement Drive Date *</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.driveDateTBD}
                                                    onChange={(e) => handleChange('driveDateTBD', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TBD</span>
                                            </label>
                                        </div>
                                        <input
                                            type="date"
                                            value={formData.driveDate}
                                            disabled={formData.driveDateTBD}
                                            onChange={(e) => handleChange('driveDate', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.driveDate ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:[color-scheme:dark] disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-slate-900/50`}
                                        />
                                        {errors.driveDate && <p className="text-red-500 text-xs mt-1 font-medium">{errors.driveDate}</p>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Timeline Preview</h3>
                                    <div className="bg-gray-50 dark:bg-[#020617]/50 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
                                        <Timeline 
                                            applicationStart={formData.applicationStartTBD ? null : formData.applicationStart}
                                            applicationDeadline={formData.applicationDeadlineTBD ? null : formData.applicationDeadline}
                                            driveDate={formData.driveDateTBD ? null : formData.driveDate}
                                        />
                                    </div>
                                </div>

                                {!unlimitedApps && (
                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Max Applications *</label>
                                        <input
                                            type="number"
                                            value={formData.maxApplications}
                                            onChange={(e) => handleChange('maxApplications', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-[#020617] border ${errors.maxApplications ? 'border-red-300' : 'border-gray-200 dark:border-slate-700'} dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                            placeholder="e.g., 100"
                                        />
                                        {errors.maxApplications && <p className="text-red-500 text-xs mt-1 font-medium">{errors.maxApplications}</p>}
                                    </div>
                                )}

                                <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recruitment Rounds</h3>
                                    <div className="space-y-3 mb-6">
                                        {formData.rounds.map((round, index) => (
                                            <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl relative">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRound(index)}
                                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-1">Round Name</label>
                                                        <input
                                                            type="text"
                                                            value={round.name}
                                                            onChange={(e) => {
                                                                const updated = [...formData.rounds];
                                                                updated[index].name = e.target.value;
                                                                handleChange('rounds', updated);
                                                            }}
                                                            className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-blue-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-1">Venue</label>
                                                        <input
                                                            type="text"
                                                            value={round.venue}
                                                            onChange={(e) => {
                                                                const updated = [...formData.rounds];
                                                                updated[index].venue = e.target.value;
                                                                handleChange('rounds', updated);
                                                            }}
                                                            placeholder="e.g., Online, Hall 7, Zoom"
                                                            className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-blue-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-[#020617]/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Add New Round</h4>
                                        <div className="flex flex-col md:flex-row gap-3">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Round Name</label>
                                                <input
                                                    type="text"
                                                    value={newRound.name}
                                                    onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                                                    placeholder="e.g., Technical Interview"
                                                    className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Venue</label>
                                                <input
                                                    type="text"
                                                    value={newRound.venue}
                                                    onChange={(e) => setNewRound({ ...newRound, venue: e.target.value })}
                                                    placeholder="e.g., Hall A, Virtual"
                                                    className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddRound}
                                                    className="px-6 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg font-bold transition-colors w-full md:w-auto"
                                                >
                                                    Add Round
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.rounds && <p className="text-red-500 text-xs mt-2 font-medium">{errors.rounds}</p>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-8 border-t border-gray-100 dark:border-slate-700 mt-8">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? () => navigate('/admin/companies') : handlePrevious}
                                className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                            >
                                {currentStep === 1 ? 'Cancel' : 'Previous'}
                            </button>
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                                >
                                    Continue
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Company' : 'Create Company')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center animate-in zoom-in duration-300 border border-gray-100 dark:border-slate-700">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h3>
                        <p className="text-gray-600 dark:text-slate-400 mb-8 font-medium">Company has been {isEditMode ? 'updated' : 'added'} successfully to the portal.</p>
                        <button
                            onClick={() => navigate('/admin/companies')}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                        >
                            Go to Companies
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCompany;