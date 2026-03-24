import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Building2, Globe, MapPin, User, Mail, Phone,
    Users, CheckCircle, XCircle, FileText, Calendar, DollarSign,
    Edit2, Download, Eye, Plus, Trash2, Filter, Search,
    Clock, Briefcase, Award, TrendingUp, Target, Upload, X, ChevronDown
} from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StudentDetailModal } from './studentmanagement';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/emptystate';
import DeleteModal from '../../components/common/DeleteModal';
import Timeline from '../../components/common/Timeline';

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddRoundModal, setShowAddRoundModal] = useState(false);
    const [showEditRoundModal, setShowEditRoundModal] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedStudentForUpdate, setSelectedStudentForUpdate] = useState(null);
    const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [rounds, setRounds] = useState([]);
    const [clearedRoundFilter, setClearedRoundFilter] = useState('All');
    const [roundSearchQuery, setRoundSearchQuery] = useState('');
    const [roundDeptFilter, setRoundDeptFilter] = useState('All');

    const [deleteModalConfig, setDeleteModalConfig] = useState({
        isOpen: false,
        itemName: '',
        warningText: '',
        onConfirm: () => { }
    });

    const [company, setCompany] = useState(null);
    const [driveDetails, setDriveDetails] = useState(null);
    const [applicantsData, setApplicantsData] = useState([]);
    const [stats, setStats] = useState({ total: 0, shortlisted: 0, selected: 0, rejected: 0, inProgress: 0 });
    
    // Multi-select state
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [companyRes, appsRes, statsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/companies/${id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/applications/company/${id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/applications/stats/company/${id}`)
            ]);

            const companyData = companyRes.data;
            const logoUrl = companyData.logo && (companyData.logo.startsWith('http') || companyData.logo.startsWith('/'))
                ? companyData.logo
                : `https://logo.clearbit.com/${companyData.name?.replace(/\s+/g, '').toLowerCase()}.com`;

            setCompany({
                ...companyData,
                logo: logoUrl,
            });
            setStats(statsRes.data);

            setDriveDetails({
                roles: companyData.jobRoles?.map(r => r.role).join(', ') || 'N/A',
                description: companyData.jobRoles?.[0]?.description || companyData.description,
                location: companyData.location,
                workMode: companyData.jobRoles?.[0]?.workMode || 'onsite',
                package: companyData.jobRoles?.[0]?.package || 'N/A',
                bonus: companyData.jobRoles?.[0]?.bonus || 'N/A',
                bond: companyData.jobRoles?.[0]?.bond || 'N/A',
                eligibility: {
                    departments: companyData.eligibleBranches || [],
                    minCGPA: companyData.minCGPA || 0,
                    backlogs: companyData.allowedBacklogs || 0,
                    passingYear: companyData.passingYear || 2026,
                    requiredPoints: companyData.requiredPoints || 75
                },
                timeline: {
                    applicationStart: companyData.applicationStart,
                    applicationDeadline: companyData.applicationDeadline,
                    driveDate: companyData.driveDate
                }
            });

            // Filter out duplicate applications based on studentId (register number)
            const uniqueApps = [];
            const seenRegNos = new Set();
            
            appsRes.data.forEach(app => {
                const regNo = app.userRegisterNumber || app.user?.registerNumber;
                if (!seenRegNos.has(regNo)) {
                    seenRegNos.add(regNo);
                    
                    const roundFields = {};
                    for (let i = 1; i <= 10; i++) {
                        const key = `round${i}`;
                        if (app[key] !== undefined) roundFields[key] = app[key];
                    }
                    
                    uniqueApps.push({
                        id: app._id?.toString(),
                        _id: app._id?.toString(),
                        name: app.user?.name || app.userRegisterNumber || 'Unknown Student',
                        registerNo: regNo,
                        studentId: regNo,
                        department: app.user?.department || 'N/A',
                        batch: app.user?.passingYear || '2026',
                        cgpa: app.user?.cgpa || 0,
                        resume: app.resume,
                        appliedDate: app.appliedDate,
                        status: app.status || 'Applied',
                        email: app.user?.email || 'N/A',
                        phone: app.user?.phone || 'N/A',
                        finalResult: app.finalResult,
                        ...roundFields
                    });
                }
            });

            setApplicantsData(uniqueApps);

            setRounds(companyData.rounds?.map((round, i) => ({
                id: i + 1,
                name: round.name || round,
                venue: round.venue || 'Same College',
                order: i + 1,
                date: companyData.driveDate, // Placeholder
                description: `Round ${i + 1} of selection process.`
            })) || []);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching company details:", err);
            setError("Failed to load company details");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-bold">Loading Company Details...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
    if (!company) return <div className="p-8 text-center text-gray-500 font-bold">Company not found</div>;

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';

            const patchRes = await axios.patch(`${import.meta.env.VITE_API_URL}/api/applications/${applicationId}/status`, {
                status: newStatus
            }, {
                headers: { 'x-user-id': userId }
            });

            // Merge the updated application document (which now includes populated rounds)
            setApplicantsData(prevData => prevData.map(student =>
                student.id === applicationId ? { ...student, ...patchRes.data, status: newStatus } : student
            ));

            // Refresh stats
            const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/stats/company/${id}`);
            setStats(statsRes.data);

        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleViewStudent = async (student) => {
        try {
            // student.studentId is registerNumber in Applicants tab, result.registerNo in Rounds tab
            const regNo = student.studentId || student.registerNo || student.registerNumber;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/byReg/${regNo}`);
            setSelectedStudent(res.data);
            setShowStudentModal(true);
        } catch (err) {
            console.error("Failed to fetch live student details:", err);
            // Fallback to local data if fetch fails
            setSelectedStudent(student);
            setShowStudentModal(true);
        }
    };

    // Round results
    const roundResults = [
        {
            studentId: 1,
            name: 'Rajesh Kumar',
            registerNo: '20CS101',
            department: 'CSE',
            round1: 'pass',
            round2: 'pass',
            round3: 'pending',
            finalResult: 'pending'
        },
        {
            studentId: 2,
            name: 'Priya Sharma',
            registerNo: '20IT102',
            department: 'IT',
            round1: 'pass',
            round2: 'pending',
            round3: 'pending',
            finalResult: 'pending'
        },
        {
            studentId: 3,
            name: 'Amit Patel',
            registerNo: '20CSE103',
            department: 'CSE',
            round1: 'fail',
            round2: 'n/a',
            round3: 'n/a',
            finalResult: 'rejected'
        }
    ];

    // Selected students
    // Analytics data
    const deptData = Object.entries(
        applicantsData.reduce((acc, app) => {
            const dept = app.department || 'Unknown';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {})
    ).map(([dept, count]) => ({ dept, applicants: count }));

    const selectionData = Object.entries(
        applicantsData.filter(app => app.status === 'selected').reduce((acc, app) => {
            const dept = app.department || 'Unknown';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value], i) => ({
        name,
        value,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
    }));

    if (selectionData.length === 0) {
        selectionData.push({ name: 'None Selected', value: 1, color: '#e5e7eb' });
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
        { id: 'drive', label: 'Drive Details', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" /> },
        { id: 'rounds', label: 'Rounds', icon: <Target className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
    ];

    const getStatusBadge = (status) => {
        const configs = {
            eligible: { bg: 'bg-gray-100 dark:bg-slate-700/50', text: 'text-gray-700 dark:text-slate-300', label: 'Eligible' },
            applied: { bg: 'bg-blue-50 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', label: 'Applied' },
            shortlisted: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', label: 'Shortlisted' },
            'in-progress': { bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-700 dark:text-yellow-500', label: 'In Progress' },
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-700 dark:text-yellow-500', label: 'Pending' },
            selected: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-500', label: 'Selected' },
            rejected: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-500', label: 'Rejected' },
        };
        // Normalise to lowercase so 'Shortlisted' and 'shortlisted' both match
        const config = configs[status?.toLowerCase?.()]
            || { bg: 'bg-gray-100 dark:bg-slate-700/50', text: 'text-gray-500 dark:text-slate-400', label: status || 'Unknown' };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border border-current opacity-90`}>
                {config.label}
            </span>
        );
    };

    const getRoundBadge = (status) => {
        if (status === 'pass') return <span className="px-2.5 py-1 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-500 rounded text-xs font-semibold border border-green-200 dark:border-green-500/30">Pass</span>;
        if (status === 'fail') return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-500 rounded text-xs font-semibold border border-red-200 dark:border-red-500/30">Fail</span>;
        if (status === 'pending') return <span className="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-500 rounded text-xs font-semibold border border-yellow-200 dark:border-yellow-500/30">Pending</span>;
        return <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 rounded text-xs font-semibold border border-gray-200 dark:border-slate-600">N/A</span>;
    };

    const handleAddRound = async (roundData) => {
        const newRoundIndex = rounds.length + 1; // e.g. 4 if there were 3 rounds
        const newRound = {
            id: newRoundIndex,
            name: roundData.name || roundData,
            venue: roundData.venue || 'Same College',
            date: roundData.date || null,
            description: roundData.description || '',
            order: newRoundIndex
        };
        const updatedRounds = [...rounds, newRound];
        setRounds(updatedRounds);

        // Initialize all existing applicants' new round key to 'pending' in local state
        const newRoundKey = `round${newRoundIndex}`;
        setApplicantsData(prev => prev.map(app => ({
            ...app,
            [newRoundKey]: app[newRoundKey] || 'pending'
        })));

        // Persist the updated round list to the backend
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';
            await axios.put(`${import.meta.env.VITE_API_URL}/api/companies/${id}`, {
                rounds: updatedRounds.map(r => ({ name: r.name, venue: r.venue }))
            }, {
                headers: { 'x-user-id': userId }
            });
        } catch (err) {
            console.error('Failed to save new round:', err);
        }

        setShowAddRoundModal(false);
    };

    const handleEditRound = async (updatedRound) => {
        try {
            const updatedRounds = rounds.map(r =>
                r.id === updatedRound.id ? { ...r, ...updatedRound } : r
            );
            setRounds(updatedRounds);
            // Persist the updated names to backend
            const roundData = updatedRounds.map(r => ({ name: r.name, venue: r.venue }));
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';
            await axios.put(`${import.meta.env.VITE_API_URL}/api/companies/${id}`, { rounds: roundData }, {
                headers: { 'x-user-id': userId }
            });
            setShowEditRoundModal(false);
            setEditingRound(null);
        } catch (err) {
            console.error('Failed to update round:', err);
            alert('Failed to update round. Please try again.');
        }
    };

    const handleDeleteRound = (round) => {
        setDeleteModalConfig({
            isOpen: true,
            itemName: round.name,
            warningText: 'This will remove the round permanently.',
            onConfirm: async () => {
                try {
                    const updatedRounds = rounds.filter(r => r.id !== round.id);
                    setRounds(updatedRounds);
                    
                    const roundData = updatedRounds.map(r => ({ name: r.name, venue: r.venue }));
                    const userStr = localStorage.getItem('user');
                    const user = userStr ? JSON.parse(userStr) : null;
                    const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';
                    
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/companies/${id}`, { rounds: roundData }, {
                        headers: { 'x-user-id': userId }
                    });
                    
                    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error('Failed to delete round:', err);
                    alert('Failed to delete round. Please try again.');
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <button
                        onClick={() => navigate('/admin/companies')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Companies
                    </button>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-slate-700 p-3 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-lg overflow-hidden shrink-0">
                                <img 
                                    src={company.logo || (company.website ? `https://logo.clearbit.com/${company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}` : '')} 
                                    alt={company.name} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=020617&color=fff&size=128&bold=true`;
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
                                <p className="text-gray-600 dark:text-slate-400 mt-1">{company.industry}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/admin/companies/edit/${id}`)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Company
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                        <div className="px-6 border-b border-gray-200 dark:border-slate-700">
                            <div className="flex gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                        </div>
                    </div>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="p-6 space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label="Total Applicants" value={stats.total} icon={<Users />} color="blue" />
                            <StatCard label="In Progress" value={stats.inProgress} icon={<Clock />} color="yellow" />
                            <StatCard label="Shortlisted" value={stats.shortlisted} icon={<Target />} color="purple" />
                            <StatCard label="Selected" value={stats.selected} icon={<Award />} color="green" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Company Information */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company Information</h2>
                                <div className="space-y-4">
                                    <InfoRow icon={<Globe className="w-4 h-4" />} label="Website" value={company.website} link />
                                    <InfoRow icon={<Building2 className="w-4 h-4" />} label="Industry" value={company.industry} />
                                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={company.location} />
                                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Headquarters" value={company.headquarters} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Description</p>
                                        <p className="text-sm text-gray-700 dark:text-slate-300">{company.description}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Drive Timeline */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <Timeline 
                                    applicationStart={driveDetails.timeline.applicationStart}
                                    applicationDeadline={driveDetails.timeline.applicationDeadline}
                                    driveDate={driveDetails.timeline.driveDate}
                                />
                            </div>


                        </div>
                    </div>
                )}

                {/* Drive Details Tab */}
                {activeTab === 'drive' && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Job Details */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Job Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Job Role</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{driveDetails.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Description</p>
                                        <p className="text-sm text-gray-700 dark:text-slate-300">{driveDetails.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Location</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{driveDetails.location}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Work Mode</p>
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold border border-green-200 dark:border-green-500/30">
                                                {driveDetails.workMode}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compensation */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Compensation</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">CTC / Package</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-500">₹{driveDetails.package}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Bonus / Incentives</p>
                                        <p className="text-sm text-gray-700 dark:text-slate-300">{driveDetails.bonus}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Bond</p>
                                        <p className="text-sm text-gray-700 dark:text-slate-300">{driveDetails.bond}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Eligibility Criteria */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Eligibility Criteria</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Eligible Departments</p>
                                        <div className="flex flex-wrap gap-2">
                                            {driveDetails.eligibility.departments.map(dept => (
                                                <span key={dept} className="px-3 py-1 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-500/30">
                                                    {dept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Minimum CGPA</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{driveDetails.eligibility.minCGPA}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Allowed Backlogs</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{driveDetails.eligibility.backlogs}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Passing Year</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{driveDetails.eligibility.passingYear}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Required Points</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{driveDetails.eligibility.requiredPoints}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <Timeline 
                                    applicationStart={driveDetails.timeline.applicationStart}
                                    applicationDeadline={driveDetails.timeline.applicationDeadline}
                                    driveDate={driveDetails.timeline.driveDate}
                                />
                            </div>
                        </div>


                    </div>
                )}

                {/* Applications Tab */}
                {
                    activeTab === 'applications' && (
                        <div className="p-6 space-y-6">
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <StatCard label="Total Applications" value={stats.total} icon={<Users />} color="blue" />
                                <StatCard label="In Progress" value={stats.inProgress} icon={<Clock />} color="yellow" />
                                <StatCard label="Selected" value={stats.selected} icon={<CheckCircle />} color="green" />
                                <StatCard label="Rejected" value={stats.rejected} icon={<XCircle />} color="red" />
                            </div>

                            {/* Filters */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <select className="appearance-none pr-10 px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                                            <option className="dark:bg-slate-800">All Departments</option>
                                            <option className="dark:bg-slate-800">CSE</option>
                                            <option className="dark:bg-slate-800">IT</option>
                                            <option className="dark:bg-slate-800">ECE</option>
                                            <option className="dark:bg-slate-800">EEE</option>
                                            <option className="dark:bg-slate-800">MECH</option>
                                            <option className="dark:bg-slate-800">CIVIL</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select className="appearance-none pr-10 px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                                            <option className="dark:bg-slate-800">All Statuses</option>
                                            <option className="dark:bg-slate-800">Applied</option>
                                            <option className="dark:bg-slate-800">In Progress</option>
                                            <option className="dark:bg-slate-800">Shortlisted</option>
                                            <option className="dark:bg-slate-800">Selected</option>
                                            <option className="dark:bg-slate-800">Rejected</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Action Bar */}
                            {selectedApplicants.length > 0 && (
                                <div className="bg-blue-600 dark:bg-blue-900/40 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-blue-500/10 mb-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{selectedApplicants.length} students selected</p>
                                            <p className="text-blue-100 text-xs font-medium">Bulk update will apply to all selected</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedApplicants([])}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
                                        >
                                            Clear Selection
                                        </button>
                                        <button 
                                            onClick={() => setShowBulkUpdateModal(true)}
                                            className="px-4 py-2 bg-white text-blue-600 hover:bg-white/90 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Bulk Update Status
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Applications Table */}
                            <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden mt-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                                    <thead className="bg-gray-50 dark:bg-[#020617]">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left w-10">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedApplicants.length === applicantsData.length && applicantsData.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedApplicants(applicantsData.map(a => a.id));
                                                        else setSelectedApplicants([]);
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider w-16">#</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Student Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Register No</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Department</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">CGPA</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Resume</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-[#020617] divide-y divide-gray-100 dark:divide-slate-800">
                                        {applicantsData.map((student, index) => {
                                            const isSelected = selectedApplicants.includes(student.id);
                                            return (
                                                <tr key={student.id} className={`hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedApplicants(prev => [...prev, student.id]);
                                                                else setSelectedApplicants(prev => prev.filter(id => id !== student.id));
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-medium">{index + 1}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{student.name}</td>
                                                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-medium">{student.registerNo}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 rounded-md text-xs font-bold border border-blue-200 dark:border-blue-500/30">
                                                            {student.department}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-tight">{student.cgpa}</td>
                                                    <td className="px-6 py-4">
                                                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold flex items-center gap-1.5 transition-colors">
                                                            <FileText className="w-4 h-4" />
                                                            View
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2 items-center">
                                                            <button
                                                                onClick={() => handleViewStudent(student)}
                                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                                                                title="View Profile"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedStudentForUpdate(student);
                                                                    setShowUpdateStatusModal(true);
                                                                }}
                                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                                Update
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* Rounds Tab */}
                {
                    activeTab === 'rounds' && (
                        <div className="p-6 space-y-6">




                            {/* Filters and Actions */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <div className="flex gap-4 flex-1 flex-wrap">
                                    <div className="relative flex-1 min-w-[300px]">
                                        <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or reg no..."
                                            value={roundSearchQuery}
                                            onChange={(e) => setRoundSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="relative w-56">
                                        <select
                                            value={roundDeptFilter}
                                            onChange={(e) => setRoundDeptFilter(e.target.value)}
                                            className="appearance-none w-full pr-10 px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all cursor-pointer"
                                        >
                                            <option value="All">All Departments</option>
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Action Bar */}
                            {selectedApplicants.length > 0 && (
                                <div className="bg-blue-600 dark:bg-blue-900/40 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-blue-500/10 mb-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{selectedApplicants.length} students selected</p>
                                            <p className="text-blue-100 text-xs font-medium">Update results for all selected candidates</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedApplicants([])}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
                                        >
                                            Clear Selection
                                        </button>
                                        <button 
                                            onClick={() => setShowBulkUpdateModal(true)}
                                            className="px-4 py-2 bg-white text-blue-600 hover:bg-white/90 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Update Selection
                                        </button>
                                    </div>
                                </div>
                            )}

                             {/* Round Results Table */}
                            <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden mt-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left w-10">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedApplicants.length > 0 && applicantsData.filter(r => ['shortlisted', 'selected', 'in-progress', 'pending', 'rejected'].includes(r.status?.toLowerCase())).every(a => selectedApplicants.includes(a.id))}
                                                    onChange={(e) => {
                                                        const visible = applicantsData.filter(r => ['shortlisted', 'selected', 'in-progress', 'pending', 'rejected'].includes(r.status?.toLowerCase()));
                                                        if (e.target.checked) setSelectedApplicants(visible.map(a => a.id));
                                                        else setSelectedApplicants([]);
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider w-16">#</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Register No</th>
                                            {rounds.map(round => (
                                                <th key={round.id} className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                                                    {round.name}
                                                </th>
                                            ))}
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Final Result</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {applicantsData.filter(result => {
                                            const searchLower = roundSearchQuery.toLowerCase();
                                            const matchesSearch = result.name.toLowerCase().includes(searchLower) || result.registerNo.toLowerCase().includes(searchLower);
                                            const matchesDept = roundDeptFilter === 'All' || result.department === roundDeptFilter;

                                             // Only show applicants who have been approved for rounds or corrected
                                             const isApproved = ['shortlisted', 'selected', 'in-progress', 'pending', 'rejected'].includes(result.status?.toLowerCase());

                                            return matchesSearch && matchesDept && isApproved;
                                        }).map((result, index) => {
                                            const isSelected = selectedApplicants.includes(result.id);
                                            return (
                                                <tr key={result.studentId} className={`bg-white dark:bg-[#020617] hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors group ${isSelected ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedApplicants(prev => [...prev, result.id]);
                                                                else setSelectedApplicants(prev => prev.filter(id => id !== result.id));
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-medium">{index + 1}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{result.name}</td>
                                                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{result.registerNo}</td>
                                                {rounds.map((round, i) => {
                                                    const roundKey = `round${i + 1}`;
                                                    let roundStatus = result[roundKey];

                                                    // If this round has no explicit status, determine the fallback:
                                                    // - If the application has NO explicit round keys at all (true legacy data
                                                    //   accepted before auto-assign was added), fall back to pass/fail based on status.
                                                    // - If the application HAS some explicit round keys but THIS one is missing,
                                                    //   it means this round was added AFTER the student was processed → keep as pending.
                                                    if (!roundStatus) {
                                                        const hasAnyExplicitRoundKey = rounds.some((_, j) => !!result[`round${j + 1}`]);
                                                        if (!hasAnyExplicitRoundKey) {
                                                            // Pure legacy application — infer from overall status
                                                            if (result.status === 'Selected') roundStatus = 'pass';
                                                            else if (result.status === 'Rejected') roundStatus = 'fail';
                                                            else roundStatus = 'pending';
                                                        } else {
                                                            // New round added after this student was processed
                                                            roundStatus = 'pending';
                                                        }
                                                    }

                                                    return (
                                                        <td key={round.id} className="px-6 py-4 text-center">
                                                            {getRoundBadge(roundStatus)}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-4 text-center">
                                                    {(() => {
                                                        const status = result.status?.toLowerCase();
                                                        if (status === 'selected') return getStatusBadge('Selected');
                                                        if (status === 'rejected') return getStatusBadge('Rejected');
                                                        return getStatusBadge('Pending');
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewStudent(result)}
                                                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                                                            title="View Profile"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudentForUpdate(result);
                                                                setShowUpdateStatusModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95"
                                                        >
                                                            Update Status
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {/* Rounds Timeline */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                        Interview Timeline
                                    </h2>
                                    <button
                                        onClick={() => setShowAddRoundModal(true)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Round
                                    </button>
                                </div>

                                <div className="space-y-6 relative ml-2">
                                    {/* Vertical Line Connector */}
                                    {rounds.length > 0 && <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700 -z-10 opacity-50"></div>}

                                    {rounds.length > 0 ? (
                                        rounds.map((round, index) => (
                                            <div key={round.id} className="relative flex gap-6 group">
                                                {/* Timeline Node */}
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 border-4 border-white dark:border-slate-800 flex items-center justify-center -ml-px shadow-sm group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors z-10">
                                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </div>

                                                {/* Round Card */}
                                                <div className="flex-1 bg-gray-50 dark:bg-[#020617] rounded-xl p-5 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-md dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.1)] transition-all">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                                                                {index + 1}. {round.name}
                                                            </h3>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                                {round.date && (
                                                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                                                                        <Calendar className="w-3.5 h-3.5" />
                                                                        {new Date(round.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </p>
                                                                )}
                                                                <p className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                    Venue: {round.venue}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingRound(round);
                                                                    setShowEditRoundModal(true);
                                                                }}
                                                                className="p-2 text-gray-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                                title="Edit Round"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRound(round)}
                                                                className="p-2 text-gray-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Delete Round"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {round.description && (
                                                        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mt-2 font-medium">
                                                            {round.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState title="No Rounds Defined" message="Click the Add Round button to create the recruitment timeline." />
                                    )}
                                </div>
                            </div>
                        </div >
                    )
                }



                {/* Analytics Tab */}
                {
                    activeTab === 'analytics' && (
                        <div className="p-6 space-y-6">


                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Department-wise */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Applicants by Department</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={deptData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                            <XAxis dataKey="dept" tick={{ fill: 'var(--chart-text)' }} />
                                            <YAxis tick={{ fill: 'var(--chart-text)' }} />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--chart-bg)', borderColor: 'var(--chart-grid)', color: 'var(--chart-text)' }} />
                                            <Bar dataKey="applicants" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Selection Distribution */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Selection Distribution</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={selectionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {selectionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>


                            </div>
                        </div>
                    )
                }
            </div >

            {/* Add Round Modal */}
            < AddRoundModal
                isOpen={showAddRoundModal}
                onClose={() => setShowAddRoundModal(false)}
                onAdd={handleAddRound}
            />

            {/* Edit Round Modal */}
            <EditRoundModal
                isOpen={showEditRoundModal}
                onClose={() => {
                    setShowEditRoundModal(false);
                    setEditingRound(null);
                }}
                round={editingRound}
                onSave={handleEditRound}
            />

            {/* Student Detail Modal */}
            {
                showStudentModal && selectedStudent && (
                    <StudentDetailModal
                        student={selectedStudent}
                        onClose={() => {
                            setShowStudentModal(false);
                            setSelectedStudent(null);
                        }}
                    />
                )
            }

            {/* Bulk Update Status Modal */}
            <BulkUpdateStatusModal
                isOpen={showBulkUpdateModal}
                onClose={() => {
                    setShowBulkUpdateModal(false);
                    setSelectedApplicants([]);
                }}
                onSave={() => {
                    setShowBulkUpdateModal(false);
                    setSelectedApplicants([]);
                    fetchData();
                }}
                selectedIds={selectedApplicants}
                rounds={rounds}
                applicants={applicantsData}
            />

            {/* Update Status Modal */}
            <UpdateStatusModal
                isOpen={showUpdateStatusModal}
                onClose={() => {
                    setShowUpdateStatusModal(false);
                    setSelectedStudentForUpdate(null);
                }}
                onSave={() => {
                    setShowUpdateStatusModal(false);
                    setSelectedStudentForUpdate(null);
                    fetchData(); // re-fetch from backend to keep table in sync
                }}
                student={selectedStudentForUpdate}
                rounds={rounds}
            />

            <DeleteModal
                isOpen={deleteModalConfig.isOpen}
                onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={deleteModalConfig.onConfirm}
                itemName={deleteModalConfig.itemName}
                warningText={deleteModalConfig.warningText}
            />
                </div>
            </div>
        </div>
    );
};

// Components
const StatCard = ({ label, value, icon, color }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        red: 'from-red-500 to-red-600',
        yellow: 'from-yellow-400 to-yellow-500'
    };

    return (
        <div className="flex items-center gap-4 h-fit bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
            <div className={`w-12 h-12 shrink-0 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center text-white`}>
                {icon}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, color }) => {
    const colors = {
        green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/15',
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15',
        purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/15',
        orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/15'
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
        </div>
    );
};

const InfoRow = ({ icon, label, value, link }) => (
    <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 dark:bg-[#020617] rounded-lg border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-slate-500 uppercase font-bold tracking-wider">{label}</p>
            {link ? (
                <a href={value?.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all">
                    {value || 'N/A'}
                </a>
            ) : (
                <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{value || 'N/A'}</p>
            )}
        </div>
    </div>
);

const EditRoundModal = ({ isOpen, onClose, round, onSave }) => {
    const [roundName, setRoundName] = useState('');
    const [roundVenue, setRoundVenue] = useState('');
    const [roundDate, setRoundDate] = useState('');
    const [roundDescription, setRoundDescription] = useState('');

    useEffect(() => {
        if (round) {
            setRoundName(round.name || '');
            setRoundVenue(round.venue || '');
            setRoundDate(round.date ? new Date(round.date).toISOString().split('T')[0] : '');
            setRoundDescription(round.description || '');
        }
    }, [round]);

    const handleSubmit = () => {
        if (roundName.trim() && round) {
            onSave({ ...round, name: roundName, venue: roundVenue, date: roundDate, description: roundDescription });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Round" size="sm">
            <div className="space-y-4 p-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Round Name</label>
                    <input
                        type="text"
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        placeholder="e.g., Technical Interview"
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Venue</label>
                    <input
                        type="text"
                        value={roundVenue}
                        onChange={(e) => setRoundVenue(e.target.value)}
                        placeholder="e.g., Online, Hall A"
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                        type="date"
                        value={roundDate}
                        onChange={(e) => setRoundDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                        value={roundDescription}
                        onChange={(e) => setRoundDescription(e.target.value)}
                        placeholder="Topics covered..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const AddRoundModal = ({ isOpen, onClose, onAdd }) => {
    const [roundName, setRoundName] = useState('');
    const [roundVenue, setRoundVenue] = useState('');
    const [roundDate, setRoundDate] = useState('');
    const [roundDescription, setRoundDescription] = useState('');

    const handleSubmit = () => {
        if (roundName.trim()) {
            onAdd({ name: roundName, venue: roundVenue, date: roundDate, description: roundDescription });
            setRoundName('');
            setRoundVenue('');
            setRoundDate('');
            setRoundDescription('');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Round"
            size="sm"
        >
            <div className="space-y-4 p-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Round Name</label>
                    <input
                        type="text"
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        placeholder="e.g., Technical Interview"
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Venue</label>
                    <input
                        type="text"
                        value={roundVenue}
                        onChange={(e) => setRoundVenue(e.target.value)}
                        placeholder="e.g., Online, Hall A"
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                        type="date"
                        value={roundDate}
                        onChange={(e) => setRoundDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                        value={roundDescription}
                        onChange={(e) => setRoundDescription(e.target.value)}
                        placeholder="Topics covered..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Add Round
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const UpdateStatusModal = ({ isOpen, onClose, onSave, student, rounds }) => {
    // Local state for updating round statuses — dynamically built from actual rounds
    const [statusData, setStatusData] = useState({});
    // Track original values to only submit what changed
    const [originalData, setOriginalData] = useState({});

    // Initialize from student's existing DB values, for each round in this company
    React.useEffect(() => {
        if (student && rounds) {
            const initial = {};
            rounds.forEach((_, i) => {
                const key = `round${i + 1}`;
                // Use the actual DB value if it exists, otherwise default to 'pending' for display
                initial[key] = student[key] || 'pending';
            });
            initial.finalResult = student.finalResult || 'pending';
            setStatusData(initial);
            setOriginalData({ ...initial }); // snapshot to diff on save
        }
    }, [student, rounds]);

    // Validation logic for round sequence and final result
    React.useEffect(() => {
        if (!student || Object.keys(statusData).length === 0) return;

        let newStatusData = { ...statusData };
        let hasChanged = false;

        let shouldBeNA = false;
        let shouldBePending = false;
        let allPassed = true;
        let hasFailed = false;

        for (let i = 0; i < rounds.length; i++) {
            const roundKey = `round${i + 1}`;
            const currentVal = newStatusData[roundKey];

            if (shouldBeNA) {
                if (currentVal !== 'n/a') {
                    newStatusData[roundKey] = 'n/a';
                    hasChanged = true;
                }
                allPassed = false;
            } else if (shouldBePending) {
                if (currentVal !== 'pending') {
                    newStatusData[roundKey] = 'pending';
                    hasChanged = true;
                }
                allPassed = false;
            } else {
                if (currentVal === 'fail' || currentVal === 'n/a') {
                    shouldBeNA = true;
                    hasFailed = true;
                    allPassed = false;
                } else if (currentVal === 'pending') {
                    shouldBePending = true;
                    allPassed = false;
                }
            }
        }

        const expectedFinalResult = allPassed ? 'pass' : (hasFailed ? 'fail' : 'pending');
        if (newStatusData.finalResult !== expectedFinalResult) {
            newStatusData.finalResult = expectedFinalResult;
            hasChanged = true;
        }

        if (hasChanged) {
            setStatusData(newStatusData);
        }
    }, [statusData, rounds, student]);

    if (!student) return null;

    const handleSubmit = async () => {
        try {
            // Only send rounds that the admin actually changed vs what was originally in the DB
            const changedRoundsData = {};
            rounds.forEach((_, i) => {
                const key = `round${i + 1}`;
                if (statusData[key] !== undefined && statusData[key] !== originalData[key]) {
                    changedRoundsData[key] = statusData[key];
                }
            });

            // Compute final app status based on ALL current status values (not just changed)
            let finalAppStatus = student.status;
            if (statusData.finalResult === 'pass') {
                finalAppStatus = 'Selected';
            } else if (statusData.finalResult === 'fail') {
                finalAppStatus = 'Rejected';
            } else if (statusData.finalResult === 'pending') {
                finalAppStatus = 'Pending';
            }

            // Only include finalResult in payload if something changed
            if (Object.keys(changedRoundsData).length === 0 && finalAppStatus === student.status) {
                // Nothing changed — just close
                if (onSave) onSave();
                return;
            }

            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';

            await axios.patch(`${import.meta.env.VITE_API_URL}/api/applications/${student._id || student.id}/status`, {
                status: finalAppStatus,
                roundsData: changedRoundsData  // only the changed rounds
            }, {
                headers: { 'x-user-id': userId }
            });

            // Trigger parent to re-fetch data so table reflects updated round statuses
            if (onSave) onSave();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Error updating status. Please try again.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Update Status: ${student.name}`}
            size="md"
        >
            <div className="space-y-4 p-2">
                <div className="grid grid-cols-2 gap-4">
                    {rounds.map((round, index) => {
                        const roundKey = `round${index + 1}`;

                        // Check if previous round is passed
                        let isPrevPassed = true;
                        if (index > 0) {
                            const prevRoundKey = `round${index}`;
                            isPrevPassed = statusData[prevRoundKey] === 'pass';
                        }

                        const isDisabled = !isPrevPassed;

                        return (
                            <div key={round.id} className={isDisabled ? "opacity-60" : ""}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                    {round.name} {isDisabled && <span className="text-xs text-red-500 ml-1">(Locked)</span>}
                                </label>
                                <select
                                    value={statusData[roundKey] || 'pending'}
                                    onChange={(e) => setStatusData(prev => ({ ...prev, [roundKey]: e.target.value }))}
                                    disabled={isDisabled}
                                    className={`w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                    <option value="n/a">N/A</option>
                                </select>
                            </div>
                        );
                    })}

                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Generic components used in this file...

const BulkUpdateStatusModal = ({ isOpen, onClose, onSave, selectedIds, rounds, applicants }) => {
    const [selectedRound, setSelectedRound] = useState('final');
    const [status, setStatus] = useState('pass');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleBulkSave = async () => {
        setIsUpdating(true);
        try {
            const roundsData = {};
            let finalStatus = null;

            // Pre-validation for sequential rounds
            if (selectedRound.startsWith('round') && status === 'pass') {
                const roundNum = parseInt(selectedRound.replace('round', ''));
                
                if (roundNum > 1) {
                    // Check if any student needs earlier rounds updated to pass
                    const studentsNeedingAutoPass = selectedIds.filter(id => {
                        const app = applicants.find(a => a.id === id);
                        if (!app) return false;
                        for (let i = 1; i < roundNum; i++) {
                            if (app[`round${i}`] !== 'pass') return true;
                        }
                        return false;
                    });

                    if (studentsNeedingAutoPass.length > 0) {
                        if (window.confirm(`${studentsNeedingAutoPass.length} students haven't passed one or more previous rounds. Should I mark all preceding rounds as 'Pass' for them to continue?`)) {
                            // Mark all previous rounds as pass in the payload
                            for (let i = 1; i < roundNum; i++) {
                                roundsData[`round${i}`] = 'pass';
                            }
                        } else {
                            // User refused to auto-pass, but we can't skip rounds per requirements
                            alert(`Bulk update cancelled. You must pass previous rounds first or choose 'Yes' to auto-pass them.`);
                            setIsUpdating(false);
                            return;
                        }
                    }
                }
            }

            if (selectedRound === 'final') {
                if (status === 'pass') {
                    // To set Final Success, they MUST pass all rounds
                    finalStatus = 'Selected';
                    // Auto-pass ALL rounds if the user confirms
                    const rCount = rounds?.length || 5;
                    const needsPass = selectedIds.some(id => {
                        const app = applicants.find(a => a.id === id);
                        for(let i=1; i<=rCount; i++) if(app[`round${i}`] !== 'pass') return true;
                        return false;
                    });

                    if (needsPass) {
                        if (window.confirm(`Setting final result to 'Selected' requires all rounds to be passed. Mark all rounds as 'Pass' for the selected students?`)) {
                            for (let i = 1; i <= rCount; i++) roundsData[`round${i}`] = 'pass';
                        } else {
                            alert('Update cancelled. Selected status requires all rounds to be passed.');
                            setIsUpdating(false);
                            return;
                        }
                    }
                }
                else if (status === 'fail') finalStatus = 'Rejected';
                else finalStatus = 'Pending';
            } else {
                roundsData[selectedRound] = status;
            }

            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';

            await axios.patch(`${import.meta.env.VITE_API_URL}/api/applications/bulk-status`, {
                ids: selectedIds,
                status: finalStatus,
                roundsData: roundsData
            }, {
                headers: { 'x-user-id': userId }
            });

            if (onSave) onSave();
        } catch (err) {
            console.error('Failed to bulk update:', err);
            alert('Error updating status. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Bulk Update: ${selectedIds.length} Students`}
            size="sm"
        >
            <div className="space-y-4 p-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Select Field to Update</label>
                    <select
                        value={selectedRound}
                        onChange={(e) => setSelectedRound(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                        {rounds.map((r, i) => (
                            <option key={r.id} value={`round${i + 1}`}>{r.name}</option>
                        ))}
                        <option value="final">Final Placement Result</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                        <option value="pass">{selectedRound === 'final' ? 'Select (Placed)' : 'Pass'}</option>
                        <option value="fail">{selectedRound === 'final' ? 'Reject' : 'Fail'}</option>
                        <option value="pending">Pending</option>
                        {selectedRound !== 'final' && <option value="n/a">N/A</option>}
                    </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBulkSave}
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isUpdating ? 'Updating...' : 'Update All'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CompanyDetail;