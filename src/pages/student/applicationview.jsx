import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, Calendar, MapPin, DollarSign,
    CheckCircle2, Clock, XCircle, AlertCircle, FileText,
    User, Mail, Phone, Award, Download, Eye, Briefcase,
    Target, TrendingUp, Upload
} from 'lucide-react';

import StatusBadge from '../../components/common/statusbadge';
import CompanyLogo from '../../components/common/CompanyLogo';

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    const getTimelineIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'error':
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'upcoming':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'info':
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            try {
                // Actual API call to record upload (mock binary push for now)
                await axios.post(`${import.meta.env.VITE_API_URL}/api/applications/${id}/experience`);

                setApplication(prev => ({
                    ...prev,
                    submittedData: { ...prev.submittedData, experienceUploaded: true, experienceFileName: file.name }
                }));
            } catch (error) {
                console.error("Upload error", error);
                alert("Upload failed.");
            }
        } else if (file) {
            alert("Please upload a PDF file.");
        }
    };

    useEffect(() => {
        const fetchApplicationInfo = async () => {
            try {
                // Fetch the specific application
                const appRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/${id}`);
                const appData = appRes.data;

                if (!appData) {
                    setLoading(false);
                    return;
                }

                // Fetch the company info for logo/package (Optional)
                let companyData = {};
                try {
                    if (appData.company) {
                        const companyRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/companies/${appData.company}`);
                        companyData = companyRes.data;
                    }
                } catch (cErr) {
                    console.warn("Company data fetch failed", cErr);
                }

                // Fetch the user info for the submitted data breakdown (Optional)
                let userData = {};
                try {
                    if (appData.user) {
                        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${appData.user}`);
                        userData = userRes.data;
                    }
                } catch (uErr) {
                    console.warn("User data fetch failed", uErr);
                }

                // Map rounds from company configuration + results from dynamic round fields
                const companyRounds = companyData.rounds || [];
                const formattedProgress = [];

                // 1. Initial Application Status
                formattedProgress.push({
                    round: "Application Submitted",
                    status: "completed",
                    date: appData.appliedDate,
                    description: "Your application has been received.",
                    icon: getTimelineIcon('success')
                });

                // 2. Map rounds (round1, round2...)
                companyRounds.forEach((round, index) => {
                    const roundName = typeof round === 'object' ? round.name : round;
                    const roundVenue = typeof round === 'object' ? round.venue : null;
                    const roundKey = `round${index + 1}`;
                    const result = appData[roundKey]; // 'pass', 'fail', or undefined

                    let status = 'pending';
                    let type = 'pending';
                    let description = `Status: ${roundName}`;

                    if (result === 'pass') {
                        status = 'completed';
                        type = 'success';
                        description = "Result: Passed";
                    } else if (result === 'fail') {
                        status = 'failed';
                        type = 'error';
                        description = "Result: Not Selected";
                    } else if (appData.status === 'In-Progress' && appData.currentRound === roundName) {
                        status = 'in-progress';
                        type = 'info';
                        description = "Ongoing Evaluation";
                    }

                    formattedProgress.push({
                        round: roundName,
                        venue: roundVenue,
                        status: status,
                        date: null,
                        description: description,
                        icon: getTimelineIcon(type)
                    });
                });

                // 3. Final Result if applicable
                if (appData.status === 'Selected' || appData.status === 'Rejected') {
                    formattedProgress.push({
                        round: "Final Decision",
                        status: appData.status === 'Selected' ? 'completed' : 'failed',
                        date: appData.lastUpdate,
                        description: appData.status === 'Selected' ? "Selected" : "Rejected",
                        icon: getTimelineIcon(appData.status === 'Selected' ? 'success' : 'error')
                    });
                }

                // Find the resume used for this application
                const usedResume = userData.resumes?.find(r => (r._id || r.id) === appData.resume);
                const resumeName = usedResume ? usedResume.name : (appData.resume === 'New Upload (Pending)' ? 'Newly Uploaded Resume' : 'Primary Resume');
                const resumeDate = usedResume ? usedResume.uploadedDate : appData.appliedDate;

                setApplication({
                    id: appData._id,
                    applicationId: `APP-${appData._id.substring(Math.max(0, appData._id.length - 6)).toUpperCase()}`,

                    // Company Details
                    company: {
                        id: companyData._id || appData.company,
                        name: companyData.name || appData.companyName || 'Unknown Company',
                        logo: companyData.logo || appData.companyName?.charAt(0) || '?',
                        role: appData.role || companyData.jobRoles?.[0]?.role || 'SDE',
                        package: companyData.jobRoles?.[0]?.package || appData.package || 'TBD',
                        location: companyData.location || 'Remote',
                        type: companyData.jobType || appData.jobType || 'Full Time'
                    },

                    // Application Info
                    appliedDate: appData.appliedDate,
                    currentRound: appData.currentRound || 'N/A',
                    status: (appData.status || 'Applied').toLowerCase(),

                    // Application Progress
                    progress: formattedProgress,

                    // Submitted Data
                    submittedData: {
                        // Spread additionalInfo first if it exists
                        ...(appData.additionalInfo || {}),

                        // Personal (Fallback to userData if not in additionalInfo)
                        fullName: appData.additionalInfo?.fullName || userData.name || 'Student',
                        registerNumber: appData.additionalInfo?.registerNumber || userData.registerNumber || appData.userRegisterNumber,
                        email: appData.additionalInfo?.email || userData.email || '',
                        phone: appData.additionalInfo?.phone || userData.phone || '',
                        dateOfBirth: appData.additionalInfo?.dateOfBirth || userData.dateOfBirth,
                        gender: appData.additionalInfo?.gender || userData.gender,

                        // Academic
                        department: appData.additionalInfo?.department || userData.department || '',
                        year: appData.additionalInfo?.year || userData.year || '',
                        cgpa: appData.additionalInfo?.cgpa || userData.cgpa || '',
                        stream: appData.additionalInfo?.stream || userData.stream || '',
                        backlogs: appData.additionalInfo?.backlogs !== undefined ? appData.additionalInfo.backlogs : (userData.backlogs || 0),

                        // Resume info
                        resumeName: resumeName,
                        resumeUploadDate: resumeDate,

                        // Experience Upload status
                        experienceUploaded: appData.experienceUploaded,
                        experienceFileName: 'Interview_Experience.pdf'
                    }
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching application details:", err);
                setLoading(false);
            }
        };

        fetchApplicationInfo();
    }, [id]);

    if (loading) {
        return (
            <div>
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div>
                <div className="p-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
                        <button
                            onClick={() => navigate('/applications')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Back to Applications
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-8 h-8 text-green-600" />;
            case 'current':
            case 'in-progress':
                return <Clock className="w-8 h-8 text-blue-600 animate-pulse" />;
            case 'pending':
                return <Clock className="w-8 h-8 text-gray-400" />;
            case 'failed':
                return <XCircle className="w-8 h-8 text-red-600" />;
            default:
                return <AlertCircle className="w-8 h-8 text-gray-400" />;
        }
    };



    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };



    return (
        <div className="min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300">


            <div className="p-8 max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/applications')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white mb-6 uppercase tracking-tighter font-black text-xs transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Applications
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Info Card */}
                        <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <CompanyLogo 
                                        logo={application.company.logo} 
                                        name={application.company.name} 
                                        className="w-16 h-16" 
                                        iconSize="w-8 h-8"
                                    />
                                    <div>
                                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{application.company.name}</h1>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mt-1">{application.company.role}</p>
                                    </div>
                                </div>
                                <StatusBadge
                                    status={application.status}
                                    label={application.currentRound}
                                    size="lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Location</span>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-slate-200">{application.company.location}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Package</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-green-600 dark:text-green-500 leading-none">₹</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-slate-200">{application.company.package}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Type</span>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-slate-200 uppercase">{application.company.type}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Applied On</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-slate-200">{formatDate(application.appliedDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Progress Tracker */}
                        <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                Application Progress
                            </h2>

                            <div className="space-y-6">
                                {application.progress.map((step, index) => (
                                    <div key={index} className="relative">
                                        {/* Connector Line */}
                                        {index < application.progress.length - 1 && (
                                            <div className={`absolute left-5 top-14 w-0.5 h-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-100 dark:bg-slate-800'
                                                }`}></div>
                                        )}

                                        <div className="flex gap-6">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${step.status === 'completed' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-500' :
                                                step.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-500 scale-110 shadow-blue-500/20' :
                                                    'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-600'
                                                }`}>
                                                {getStatusIcon(step.status)}
                                            </div>

                                            <div className="flex-1 pb-10">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className={`text-lg font-black uppercase tracking-tight ${step.status === 'completed' ? 'text-gray-900 dark:text-white' :
                                                                step.status === 'in-progress' ? 'text-blue-600 dark:text-blue-400' :
                                                                    'text-gray-400 dark:text-slate-600'
                                                                }`}>
                                                                {step.round}
                                                            </h3>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${step.status === 'completed' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' :
                                                                step.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                                                                    'bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-500 border-gray-200 dark:border-slate-800'
                                                                }`}>
                                                                {step.status.replace('-', ' ')}
                                                            </span>
                                                        </div>
                                                        {step.venue && (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
                                                                <MapPin className="w-3.5 h-3.5 text-blue-500/70" />
                                                                {step.venue}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {step.date && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-slate-500 bg-gray-50 dark:bg-slate-900 px-3 py-1 rounded-xl border border-gray-100 dark:border-slate-800 uppercase tracking-widest shadow-sm">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDate(step.date)}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm font-medium">{step.description || 'Details will be shared soon.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submitted Data */}
                        <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-100 dark:border-blue-500/20 shadow-inner">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Application Record</h2>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Submitted on {formatDate(application.appliedDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 shadow-sm">
                                    <Target className="w-3.5 h-3.5" />
                                    <span>Verified Submission</span>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="mb-10">
                                <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                        <input type="text" value={application.submittedData.fullName || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Register Number</label>
                                        <input type="text" value={application.submittedData.registerNumber || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email</label>
                                        <input type="email" value={application.submittedData.email || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                                        <input type="tel" value={application.submittedData.phone || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Details */}
                            <div className="mb-10">
                                <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Academic Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Department</label>
                                        <input type="text" value={application.submittedData.department || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">CGPA</label>
                                        <input type="text" value={application.submittedData.cgpa || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Stream</label>
                                        <input type="text" value={application.submittedData.stream || ''} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Active Backlogs</label>
                                        <input type="number" value={application.submittedData.backlogs || 0} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="mb-10">
                                <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Technical Skills</h3>
                                <div>
                                    <textarea value={application.submittedData.skills || 'No skills listed'} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm h-28 resize-none custom-scrollbar" />
                                </div>
                            </div>

                            {/* Projects & Experience */}
                            {(application.submittedData.projects || application.submittedData.internshipExperience) && (
                                <div className="mb-10">
                                    <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Projects & Experience</h3>
                                    <div className="space-y-6">
                                        {application.submittedData.projects && (
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Projects</label>
                                                <textarea value={application.submittedData.projects} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm h-32 resize-none custom-scrollbar" />
                                            </div>
                                        )}
                                        {application.submittedData.internshipExperience && (
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Internship Experience</label>
                                                <textarea value={application.submittedData.internshipExperience} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm h-32 resize-none custom-scrollbar" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Professional Intent */}
                            {(application.submittedData.whyThisCompany || application.submittedData.expectedSalary) && (
                                <div className="mb-10">
                                    <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Professional Intent</h3>
                                    <div className="space-y-6">
                                        {application.submittedData.whyThisCompany && (
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Why do you want to join this company?</label>
                                                <textarea value={application.submittedData.whyThisCompany} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm h-32 resize-none custom-scrollbar" />
                                            </div>
                                        )}
                                        {application.submittedData.expectedSalary && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Applied Role</label>
                                                    <input type="text" value={application.company.role} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Applied Package</label>
                                                    <input type="text" value={application.company.package} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Expected Salary (LPA)</label>
                                                    <input type="text" value={application.submittedData.expectedSalary} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Notice Period</label>
                                                    <input type="text" value={application.submittedData.noticePeriod || '0 days'} readOnly className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 cursor-not-allowed text-gray-900 dark:text-white font-bold text-sm" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}



                            {/* Resume */}
                            <div className="mb-10">
                                <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Attached Resume</h3>
                                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-red-100 dark:border-red-500/10 flex items-center justify-center shadow-inner">
                                            <FileText className="w-6 h-6 text-red-600 dark:text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">{application.submittedData.resumeName}</p>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Uploaded: {formatDate(application.submittedData.resumeUploadDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button className="px-5 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Share Experience Upload */}
                            {application.status === 'selected' && (
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mb-6 border-b border-gray-100 dark:border-slate-800 pb-3">Share Your Experience</h3>
                                    <div className="flex items-center justify-between p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-sm">
                                        <div>
                                            <p className="font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight text-sm">Upload Interview Experience</p>
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300/70 mt-1">Help your juniors by sharing your interview journey in a PDF.</p>
                                        </div>
                                        {application.submittedData.experienceUploaded ? (
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-xl border border-green-200 dark:border-green-500/20 shadow-sm">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="font-bold text-xs uppercase tracking-widest">
                                                    {application.submittedData.experienceFileName || 'Uploaded successfully'}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-sm flex items-center gap-2 "
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload PDF
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6 lg:sticky lg:top-20 h-fit">
                        {/* Timeline */}
                        <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                Activity Timeline
                            </h3>

                            <div className="space-y-4">
                                {application.progress.map((event, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex-shrink-0 pt-0.5">
                                            {getTimelineIcon(event.status)}
                                        </div>
                                        <div className="pb-4 border-b border-gray-50 dark:border-slate-800/50 flex-1 last:border-0">
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{event.round}</p>
                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mt-1 opacity-70">{new Date(event.date || application.appliedDate).toLocaleDateString()}</p>
                                            <p className="text-xs font-medium text-gray-500 dark:text-slate-500 mt-2 line-clamp-2">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Steps (Hidden while dynamically fetching missing feature fields) */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;

