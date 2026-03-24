import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BookOpen, Plus, Edit2, Trash2, Eye, X, Search, Filter,
    Download, Upload, CheckCircle, XCircle, Clock, TrendingUp,
    AlertCircle, FileText, Video, Link as LinkIcon, Github,
    Users, Target, Award, Zap
} from 'lucide-react';
import DeleteModal from '../../components/common/DeleteModal';
import EmptyState from '../../components/common/emptystate';

const AdminResources = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [showAddStackModal, setShowAddStackModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [showEditResourceModal, setShowEditResourceModal] = useState(false);
    const [selectedStack, setSelectedStack] = useState(null);
    const [showEditStackModal, setShowEditStackModal] = useState(false);
    const [loading, setLoading] = useState(false); // Kept it but initialized to false since it's used in fetchData

    // Generic Delete State
    const [deleteModalConfig, setDeleteModalConfig] = useState({
        isOpen: false,
        itemName: '',
        warningText: '',
        onConfirm: () => { }
    });

    const [stats, setStats] = useState({
        totalResources: 0,
        totalStacks: 0,
        pendingRequests: 0,
        topStack: 'Loading...'
    });

    const [stacks, setStacks] = useState([]);
    const [resources, setResources] = useState([]);
    const [requests, setRequests] = useState([]);
    const [analytics, setAnalytics] = useState({
        popularResources: [],
        requestedStacks: [],
        typeDistribution: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, stacksRes, resourcesRes, requestsRes, analyticsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/resources/stats`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/resources/stacks`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/resources`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/resources/requests`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/resources/analytics`)
            ]);
            setStats(statsRes.data);
            setStacks(stacksRes.data);
            setResources(resourcesRes.data);
            setRequests(requestsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error("Error fetching admin resources data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddResource = async (formData) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/resources`, formData);
            await fetchData();
            setActiveTab('all');
            return true;
        } catch (error) {
            console.error("Error adding resource:", error);
            throw error;
        }
    };

    const handleUpdateResource = async (id, formData) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/resources/${id}`, formData);
            fetchData();
            setShowEditResourceModal(false);
        } catch (error) {
            console.error("Error updating resource:", error);
            alert("Failed to update resource");
        }
    };

    const handleDeleteResource = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/resources/${id}`);
            fetchData();
            setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error("Error deleting resource:", error);
            alert("Failed to delete resource");
        }
    };

    // handleAddStack removed as it was unused and just alerted

    const handleUpdateRequestStatus = async (id, status) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/resources/requests/${id}`, { status });
            fetchData();
        } catch (error) {
            console.error("Error updating request status:", error);
        }
    };


    const popularResources = [
        { title: 'System Design Interview', views: 187, downloads: 45 },
        { title: 'React Complete Guide 2024', views: 145, downloads: 38 },
        { title: 'DSA Practice Problems', views: 98, downloads: 52 }
    ];

    const tabs = [
        { id: 'all', label: 'All Resources', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'add', label: 'Add Resource', icon: <Plus className="w-4 h-4" /> },
        { id: 'requests', label: 'Resource Requests', icon: <AlertCircle className="w-4 h-4" />, badge: 8 },
        { id: 'stacks', label: 'Stack Management', icon: <Target className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
    ];

    const getTypeIcon = (type) => {
        const icons = {
            video: <Video className="w-4 h-4" />,
            article: <FileText className="w-4 h-4" />,
            course: <BookOpen className="w-4 h-4" />,
            documentation: <FileText className="w-4 h-4" />,
            github: <Github className="w-4 h-4" />
        };
        return icons[type] || <LinkIcon className="w-4 h-4" />;
    };

    const getDifficultyBadge = (difficulty) => {
        const configs = {
            beginner: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-500', label: 'Beginner' },
            intermediate: { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', label: 'Intermediate' },
            advanced: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400', label: 'Advanced' }
        };
        const config = configs[difficulty] || configs.beginner;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const configs = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-700 dark:text-yellow-500', label: 'Pending' },
            approved: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-500', label: 'Approved' },
            rejected: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400', label: 'Rejected' },
            added: { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', label: 'Resource Added' }
        };
        const config = configs[(status || 'pending').toLowerCase()] || configs.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-[#E2E8F0]">

            {/* Stats */}
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Resources" value={stats.totalResources} icon={<BookOpen />} color="blue" />
                    <StatCard label="Total Stacks" value={stats.totalStacks} icon={<Target />} color="green" />
                    <StatCard label="Pending Requests" value={stats.pendingRequests} icon={<Clock />} color="orange" />
                    <StatCard label="Top Stack" value={stats.topStack} icon={<Award />} color="purple" />
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden mb-8 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                    <div className="flex border-b border-gray-200 dark:border-slate-800">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-6 py-3 font-medium text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-[#020617] dark:border-[#3B82F6] dark:text-[#3B82F6]'
                                    : 'border-transparent text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F1F5F9] hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.badge && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* All Resources Tab */}
                        {activeTab === 'all' && (
                            <div className="space-y-6">
                                {/* Filters */}
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search resources..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <select 
                                        className="px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => {/* handle stack filter */}}
                                    >
                                        <option key="all-stacks" value="all">All Stacks</option>
                                        {stacks.map(stack => (
                                            <option key={stack._id || stack.id || stack.name} value={stack.name}>{stack.name}</option>
                                        ))}
                                    </select>
                                    <select className="px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option key="all-diff" value="all">All Difficulty</option>
                                        <option key=" beginner" value="beginner">Beginner</option>
                                        <option key="intermediate" value="intermediate">Intermediate</option>
                                        <option key="advanced" value="advanced">Advanced</option>
                                    </select>
                                    <select className="px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option key="all-types" value="all">All Types</option>
                                        <option key="video" value="video">Video</option>
                                        <option key="article" value="article">Article</option>
                                        <option key="course" value="course">Course</option>
                                    </select>
                                </div>

                                {/* Resources Grid (Aligned with Student UI) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {resources.length > 0 ? (
                                        resources.map((resource) => (
                                            <div
                                                key={resource._id || resource.id}
                                                className="bg-white dark:bg-[#020617] rounded-[2rem] border border-gray-100 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-2xl dark:hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden group flex flex-col shadow-sm relative h-[400px]"
                                            >
                                                {/* Decorative background element */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

                                                <div className="p-8 flex flex-col h-full relative z-10">
                                                    {/* Resource Icon & Type */}
                                                    <div className="flex items-start justify-between mb-8">
                                                        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 text-blue-600 dark:text-blue-400">
                                                            {getTypeIcon(resource.type)}
                                                        </div>
                                                        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-500/20 shadow-sm">
                                                            {resource.type}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-tight min-h-[3.5rem]">
                                                        {resource.title}
                                                    </h3>

                                                    {/* Metadata */}
                                                    <div className="space-y-4 mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-center text-gray-400 dark:text-slate-600 border border-gray-100 dark:border-slate-800">
                                                                <Clock className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">{new Date(resource.uploadDate || resource.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-[10px] font-black uppercase tracking-widest">
                                                                {resource.stack}
                                                            </span>
                                                            {getDifficultyBadge(resource.difficulty || 'beginner')}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-slate-800/50 flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedResource(resource);
                                                                setShowEditResourceModal(true);
                                                            }}
                                                            className="flex-1 h-12 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 group/btn"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteModalConfig({
                                                                    isOpen: true,
                                                                    itemName: resource.title,
                                                                    warningText: 'This action cannot be undone.',
                                                                    onConfirm: () => handleDeleteResource(resource._id || resource.id)
                                                                });
                                                            }}
                                                            className="w-12 h-12 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 transition-all hover:shadow-md hover:-translate-y-1"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12">
                                            <EmptyState title="No Resources Found" message="Try adjusting your filters or add a new resource." />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Add Resource Tab */}
                        {activeTab === 'add' && (
                            <AddResourceForm
                                onClose={() => setActiveTab('all')}
                                onAdd={handleAddResource}
                                stacks={stacks}
                            />
                        )}

                        {/* Resource Requests Tab */}
                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.No</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stack</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                            {requests.length > 0 ? (
                                                requests.map((request, index) => (
                                                    <tr key={request._id || request.id} className="hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94A3B8]">{index + 1}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#F1F5F9]">{request.studentName || 'Student'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                                                {request.department || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                                                {request.stack}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-[#CBD5F5]">{request.topic}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#94A3B8]">{new Date(request.date || request.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                {request.status.toLowerCase() === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleUpdateRequestStatus(request._id, 'Approved')}
                                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateRequestStatus(request._id, 'Rejected')}
                                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => setActiveTab('add')}
                                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                                                                >
                                                                    Add Resource
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-8 text-center">
                                                        <EmptyState title="No Requests Found" message="There are no pending resource requests at the moment." />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Stack Management Tab */}
                        {activeTab === 'stacks' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">Technology Stacks</h2>
                                    <button
                                        onClick={() => setShowAddStackModal(true)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Stack
                                    </button>
                                </div>

                                <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.No</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stack Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource Count</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                            {stacks.length > 0 ? (
                                                stacks.map((stack, index) => (
                                                    <tr key={stack.id} className="hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94A3B8]">{index + 1}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#F1F5F9]">{stack.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#94A3B8]">{stack.resourceCount} resources</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-end gap-2">                                                                 <button
                                                                    onClick={() => {
                                                                        setSelectedStack(stack);
                                                                        setShowEditStackModal(true);
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-[#94A3B8] rounded transition-colors" title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setDeleteModalConfig({
                                                                            isOpen: true,
                                                                            itemName: stack.name,
                                                                            warningText: 'This will also remove all its associated resources. This action cannot be undone.',
                                                                            onConfirm: () => {
                                                                                setStacks(stacks.filter(s => s.id !== stack.id));
                                                                                setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors" title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center">
                                                        <EmptyState title="No Stacks Found" message="There are no technology stacks available. Try adding one." />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">Popular Resources</h2>
                                    <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                                {analytics.popularResources.length > 0 ? analytics.popularResources.map((resource, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                                                        <td className="px-6 py-4">
                                                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                                                {index + 1}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#F1F5F9]">{resource.title}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-[#CBD5F5]">{resource.views}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-[#CBD5F5]">{resource.downloads}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-[#94A3B8]">
                                                            No popular resources found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-6">
                                        <h3 className="font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">Most Requested Stacks</h3>
                                        <div className="space-y-3">
                                            {analytics.requestedStacks.length > 0 ? analytics.requestedStacks.map((reqStack, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-[#CBD5F5] capitalize">{reqStack.stack}</span>
                                                    <span className="font-semibold text-blue-600">{reqStack.count} requests</span>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-gray-500">No requests recorded yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-6">
                                        <h3 className="font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">Resource Type Distribution</h3>
                                        <div className="space-y-3">
                                            {analytics.typeDistribution.length > 0 ? analytics.typeDistribution.map((td, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-[#CBD5F5] capitalize">{td.type}s</span>
                                                    <span className="font-semibold text-purple-600">{td.percentage}%</span>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-gray-500">No resources available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Stack Modal */}
            {showAddStackModal && (
                <AddStackModal
                    onClose={() => setShowAddStackModal(false)}
                    onAdd={(newStack) => setStacks([...stacks, { id: Date.now(), name: newStack, resourceCount: 0, icon: '🌟' }])}
                />
            )}

            {/* Edit Modals */}
            {showEditResourceModal && selectedResource && (
                <EditResourceModal
                    resource={selectedResource}
                    stacks={stacks}
                    onClose={() => {
                        setShowEditResourceModal(false);
                        setSelectedResource(null);
                    }}
                    onSave={(updated) => handleUpdateResource(updated._id || updated.id, updated)}
                />
            )}
            {showEditStackModal && selectedStack && (
                <EditStackModal
                    stack={selectedStack}
                    onClose={() => {
                        setShowEditStackModal(false);
                        setSelectedStack(null);
                    }}
                    onSave={() => {
                        // For now we don't have a dedicated stack update
                        alert("Stack updated locally. Please update resources manually to reflect changes.");
                        setShowEditStackModal(false);
                        setSelectedStack(null);
                    }}
                />
            )}
            <DeleteModal
                isOpen={deleteModalConfig.isOpen}
                onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={deleteModalConfig.onConfirm}
                itemName={deleteModalConfig.itemName}
                warningText={deleteModalConfig.warningText}
            />
        </div>
    );
};

// Components
const StatCard = ({ label, value, icon, color }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600'
    };

    return (
        <div className="flex items-center gap-4 h-fit bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-shadow">
            <div className={`w-12 h-12 shrink-0 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center text-white`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate" title={value}>{value}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 truncate" title={label}>{label}</p>
            </div>
        </div>
    );
};

const AddResourceForm = ({ onClose, onAdd, stacks = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        stack: 'web-dev',
        type: 'video',
        difficulty: 'beginner',
        url: '',
        description: '',
        tags: '',
        note: '',
        visibility: 'public',
        departments: [],
        file: null
    });
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let finalUrl = formData.url;

            // If there's a file, upload it first
            if (formData.file) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', formData.file);
                const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, uploadFormData);
                finalUrl = uploadRes.data.url;
            }

            if (onAdd) {
                await onAdd({ ...formData, url: finalUrl });
                alert('Resource added successfully!');
            }
        } catch (error) {
            console.error('Error adding resource:', error);
            alert('Failed to add resource. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Resource Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., React Complete Guide 2024"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Technical Stack *</label>
                    <select
                        value={formData.stack}
                        onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Stack</option>
                        {stacks.map(stack => (
                            <option key={stack._id || stack.id || stack.name} value={stack.name}>{stack.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Resource Type *</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="video">Video</option>
                        <option value="article">Article</option>
                        <option value="course">Course</option>
                        <option value="documentation">Documentation</option>
                        <option value="github">GitHub Repo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Difficulty Level *</label>
                    <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Resource URL (Optional if uploading file)</label>
                    <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Upload File (PDF/Docs/Video)</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-gray-100 dark:border-slate-700 dark:hover:border-slate-600 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PPT, DOCS or MP4 (MAX. 50MB)</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    {formData.file && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {formData.file.name}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of the resource..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Tags</label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="react, javascript, frontend"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Visibility *</label>
                    <select
                        value={formData.visibility}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="public">Public (All Students)</option>
                        <option value="department">Specific Department</option>
                    </select>
                </div>

                {formData.visibility === 'department' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-3">Select Target Departments *</label>
                        <div className="flex flex-wrap gap-2">
                            {['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA', 'MCA'].map(dept => {
                                const isSelected = formData.departments.includes(dept);
                                return (
                                    <button
                                        key={dept}
                                        type="button"
                                        onClick={() => {
                                            const newDepts = isSelected
                                                ? formData.departments.filter(d => d !== dept)
                                                : [...formData.departments, dept];
                                            setFormData({ ...formData, departments: newDepts });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                                            isSelected
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-blue-500/50'
                                        }`}
                                    >
                                        {dept}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.departments.length === 0 && (
                            <p className="mt-2 text-xs text-red-500 font-medium">Please select at least one department.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#1E293B]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                            Uploading...
                        </>
                    ) : (
                        'Add Resource'
                    )}
                </button>
            </div>
        </form>
    );
};

const AddStackModal = ({ onClose, onAdd }) => {
    const [stackName, setStackName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onAdd) onAdd(stackName);
        alert('Stack added successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">Add New Stack</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <X className="w-5 h-5 text-gray-600 dark:text-[#94A3B8]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Stack Name</label>
                        <input
                            type="text"
                            value={stackName}
                            onChange={(e) => setStackName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Flutter Development"
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Add Stack
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditResourceModal = ({ resource, onClose, onSave, stacks = [] }) => {
    const [formData, setFormData] = useState({ 
        ...resource,
        visibility: resource.visibility || 'public',
        departments: resource.departments || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        alert('Resource updated successfully!');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">Edit Resource</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <X className="w-5 h-5 text-gray-600 dark:text-[#94A3B8]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Resource Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Technical Stack *</label>
                            <select
                                value={formData.stack}
                                onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Stack</option>
                                {stacks.map(stack => (
                                    <option key={stack._id || stack.id || stack.name} value={stack.name}>{stack.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Resource Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="video">Video</option>
                                <option value="article">Article</option>
                                <option value="course">Course</option>
                                <option value="documentation">Documentation</option>
                                <option value="github">GitHub Repo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Difficulty Level *</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Resource Link *</label>
                            <input
                                type="url"
                                value={formData.url || ''}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Visibility *</label>
                            <select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="public">Public (All Students)</option>
                                <option value="department">Specific Department</option>
                            </select>
                        </div>

                        {formData.visibility === 'department' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-3">Target Departments *</label>
                                <div className="flex flex-wrap gap-2">
                                    {['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA', 'MCA'].map(dept => {
                                        const isSelected = formData.departments.includes(dept);
                                        return (
                                            <button
                                                key={dept}
                                                type="button"
                                                onClick={() => {
                                                    const newDepts = isSelected
                                                        ? formData.departments.filter(d => d !== dept)
                                                        : [...formData.departments, dept];
                                                    setFormData({ ...formData, departments: newDepts });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${
                                                    isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-blue-500/50'
                                                }`}
                                            >
                                                {dept}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditStackModal = ({ stack, onClose, onSave }) => {
    const [stackName, setStackName] = useState(stack.name);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...stack, name: stackName });
        alert('Stack updated successfully!');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">Edit Stack</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <X className="w-5 h-5 text-gray-600 dark:text-[#94A3B8]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">Stack Name</label>
                        <input
                            type="text"
                            value={stackName}
                            onChange={(e) => setStackName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminResources;