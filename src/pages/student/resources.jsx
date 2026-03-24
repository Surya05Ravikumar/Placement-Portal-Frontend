import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import {
  FileText, Video, Link as LinkIcon, Download, Eye, Plus,
  BookOpen, Award, Copy,
  Clock, ChevronDown
} from 'lucide-react';
import TabSwitcher from '../../components/common/tabswitcher';
import EmptyState from '../../components/common/emptystate';

import Modal from '../../components/common/Modal';
import HighlightText from '../../components/common/HighlightText';
import { ToastContainer, useToast } from '../../components/common/Toast';

// Mock data moved to backend API
const Resources = () => {
  const { searchQuery } = useOutletContext();
  const { toasts, removeToast, success, error: errorToast, info } = useToast({ maxCount: 1 });
  const [activeTab, setActiveTab] = useState('web-dev');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [allResources, setAllResources] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [tabs, setTabs] = useState([]);

  const [requestForm, setRequestForm] = useState({
    stack: '',
    customStack: '',
    topic: '',
    description: '',
    note: ''
  });

  // Tabs will be generated dynamically from backend stacks

  // Mock data - Replace with actual API call


  useEffect(() => {
    const fetchResources = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const regNum = user?.registerNumber;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const [resResponse, reqResponse, stacksResponse] = await Promise.all([
          axios.get(`${API_URL}/api/resources`),
          axios.get(`${API_URL}/api/resources/requests${regNum ? `?userRegisterNumber=${regNum}` : ''}`),
          axios.get(`${API_URL}/api/resources/stacks`)
        ]);
        setAllResources(resResponse.data);
        setMyRequests(reqResponse.data);
        
        // Generate tabs from stacks
        const dynamicTabs = stacksResponse.data.map(stack => ({
          id: stack.name,
          label: stack.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          count: stack.resourceCount
        }));
        setTabs(dynamicTabs);
        
        // Set first tab as active if none set
        if (dynamicTabs.length > 0 && activeTab === 'web-dev') {
          setActiveTab(dynamicTabs[0].id);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      const studentDept = user?.department;

      let filtered = allResources.filter(resource => {
        // 1. Filter by Stack
        if (resource.stack !== activeTab) return false;

        // 2. Filter by Visibility
        const isPublic = !resource.visibility || resource.visibility === 'public';
        const isTargeted = resource.visibility === 'department' && 
                          resource.departments && 
                          resource.departments.includes(studentDept);

        return isPublic || isTargeted;
      });

      if (searchQuery) {
        filtered = filtered.filter(resource =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setResources(filtered);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, allResources]);

  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'article':
      case 'documentation':
        return <FileText className="w-8 h-8 text-rose-500 dark:text-rose-400" />;
      case 'video':
        return <Video className="w-8 h-8 text-sky-500 dark:text-sky-400" />;
      case 'link':
      case 'github':
        return <LinkIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />;
      case 'course':
        return <BookOpen className="w-8 h-8 text-violet-500 dark:text-violet-400" />;
      default:
        return <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.registerNumber) {
        errorToast('User authentication error. Please login again.');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resources/requests`, {
        userRegisterNumber: user.registerNumber,
        topic: requestForm.topic,
        stack: requestForm.stack === 'other' ? requestForm.customStack : requestForm.stack,
        description: requestForm.description,
        note: requestForm.note
      });

      setMyRequests([response.data, ...myRequests]);

      success('Resource request submitted successfully!');
      setShowRequestModal(false);
      setRequestForm({ stack: '', customStack: '', topic: '', description: '', note: '' });
      // Switch to My Requests view to show the new request
      setShowMyRequests(true);
    } catch (error) {
      console.error("Error submitting resource request:", error);
      errorToast('Failed to submit request.');
    }
  };

  const getFullUrl = (url) => {
    if (!url || url === '#') return '';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
  };

  const handleDownload = (resource) => {
    const url = getFullUrl(resource.url);
    if (!url) {
      errorToast('No valid URL found for this resource.');
      return;
    }

    info('Download started...');

    // Force download using a hidden anchor tag
    const link = document.createElement('a');
    link.href = url;
    // Extract filename from URL or use title
    const fileName = resource.title ? `${resource.title.replace(/\s+/g, '_')}.${resource.type}` : 'resource';
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (url) => {
    const fullUrl = getFullUrl(url);
    if (!fullUrl) {
      errorToast('No valid link found to copy.');
      return;
    }
    navigator.clipboard.writeText(fullUrl);
    success('Link copied to clipboard!');
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      case 'Pending':
      default:
        return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300">


      <div className="p-8">
        {/* Header - Tabs & Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {!showMyRequests ? (
            <TabSwitcher
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => {
                setLoading(true);
                setActiveTab(id);
              }}
            />
          ) : (
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              My Requests
            </h2>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowMyRequests(!showMyRequests)}
              className={`shrink-0 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-200 flex items-center gap-2 border shadow-sm ${showMyRequests
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                : 'bg-white dark:bg-[#020617] text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900'
                }`}
            >
              <Clock className="w-4 h-4" />
              {showMyRequests ? 'Back to Resources' : 'Track Requests'}
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="shrink-0 px-6 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Request a Resource
            </button>
          </div>
        </div>

        {/* Resources Grid or Requests List */}
        {showMyRequests ? (
          myRequests.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-16 h-16" />}
              title="No Requests Found"
              message="You haven't requested any resources yet."
              action={{
                label: 'Request Resource',
                onClick: () => setShowRequestModal(true)
              }}
            />
          ) : (
            <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">S.No</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Topic</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                    {myRequests.map((request, index) => (
                      <tr key={request._id || request.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 dark:text-slate-600">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{request.topic}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 max-w-xs truncate font-medium" title={request.description}>
                          {request.description}
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{request.stack}</td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-500">{formatDate(request.date || request.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : loading ? (
          <div className="p-12 text-center bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto"></div>
            <p className="mt-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="No Resources Available"
            message="No resources found for this category. Check back later or request a new resource."
            action={{
              label: 'Request Resource',
              onClick: () => setShowRequestModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div
                key={resource._id || resource.id}
                className="bg-white dark:bg-[#020617] rounded-[2rem] border border-gray-100 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-2xl dark:hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden group flex flex-col shadow-sm relative"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                
                <div className="p-8 flex flex-col h-full relative z-10">
                  {/* Resource Icon & Type */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      {getResourceIcon(resource.type)}
                    </div>
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-500/20 shadow-sm transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                      {resource.type}
                    </span>
                  </div>
 
                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-tight min-h-[3.5rem]">
                    <HighlightText text={resource.title} highlight={searchQuery} />
                  </h3>
 
                  {/* Metadata */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-center text-gray-400 dark:text-slate-600 border border-gray-100 dark:border-slate-800">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">{formatDate(resource.uploadDate)}</span>
                    </div>
                    {resource.size && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] shrink-0">Storage:</span>
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{resource.size}</span>
                      </div>
                    )}
                  </div>
 
                  {/* Actions */}
                  <div className="mt-auto pt-8 border-t border-gray-50 dark:border-slate-800/50 flex gap-3">
                    {resource.type === 'pdf' ? (
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex-1 h-12 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 group/btn"
                      >
                        <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                        Download
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCopyLink(resource.url)}
                        className="flex-1 h-12 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 group/btn"
                      >
                        <Copy className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        Copy Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Resource Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request a Resource"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowRequestModal(false)}
              className="px-6 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestSubmit}
              className="px-6 py-2.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Submit Request
            </button>
          </>
        }
      >
        <form onSubmit={handleRequestSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Stack / Category *
            </label>
            <div className="relative">
              <select
                value={requestForm.stack}
                onChange={(e) => setRequestForm({ ...requestForm, stack: e.target.value })}
                className="appearance-none pr-10 w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                required
              >
                <option value="" className="bg-white dark:bg-slate-900">Select a category</option>
                <option value="web-dev" className="bg-white dark:bg-slate-900">Web Development</option>
                <option value="core" className="bg-white dark:bg-slate-900">Core CS</option>
                <option value="java" className="bg-white dark:bg-slate-900">Java</option>
                <option value="aptitude" className="bg-white dark:bg-slate-900">Aptitude</option>
                <option value="hr" className="bg-white dark:bg-slate-900">HR & Soft Skills</option>
                <option value="other" className="bg-white dark:bg-slate-900">Other / New Topic</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-600 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {requestForm.stack === 'other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Specify New Category / Stack *
              </label>
              <input
                type="text"
                value={requestForm.customStack}
                onChange={(e) => setRequestForm({ ...requestForm, customStack: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                placeholder="e.g., Cloud Computing, Machine Learning"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={requestForm.topic}
              onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
              placeholder="e.g., React Hooks Tutorial"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Description *
            </label>
            <textarea
              value={requestForm.description}
              onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-28 resize-none text-sm font-medium custom-scrollbar"
              placeholder="Describe what kind of resource you need..."
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Additional Note (Optional)
            </label>
            <textarea
              value={requestForm.note}
              onChange={(e) => setRequestForm({ ...requestForm, note: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24 resize-none text-sm font-medium custom-scrollbar"
              placeholder="Any additional information..."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-blue-800 dark:text-blue-400 flex gap-2">
              <strong className="shrink-0 font-black uppercase tracking-tighter">Status:</strong> 
              <span className="font-medium">Your request will be reviewed by the placement cell and resources will be added if approved.</span>
            </p>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>

  );
};

export default Resources;