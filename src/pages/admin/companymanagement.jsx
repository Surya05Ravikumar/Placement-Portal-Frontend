import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search, Filter, Plus, Download, Eye, Edit2, Trash2,
  Building2, Calendar, Users, DollarSign, CheckCircle,
  XCircle, Clock, ChevronDown, Upload
} from 'lucide-react';
import DeleteModal from '../../components/common/DeleteModal';
import EmptyState from '../../components/common/emptystate';
import { ToastContainer, useToast } from '../../components/common/Toast';
import { useAdmin } from '../../context/AdminContext';

const AdminCompanies = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: errorToast } = useToast();
  const { selectedBatch } = useAdmin();
  const { searchQuery: globalSearchQuery } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const [editingCompany, setEditingCompany] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generic Delete State
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    itemName: '',
    warningText: '',
    onConfirm: () => { }
  });

  const [companies, setCompanies] = useState([]);

  const fetchCompanies = async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/companies?batch=${selectedBatch}`);
      const data = await resp.json();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, [selectedBatch]);

  const getStatusBadge = (status) => {
    const configs = {
      upcoming: { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', label: 'Upcoming', icon: <Clock className="w-3 h-3" /> },
      ongoing: { bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-700 dark:text-yellow-500', label: 'Ongoing', icon: <Clock className="w-3 h-3" /> },
      completed: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-500', label: 'Completed', icon: <CheckCircle className="w-3 h-3" /> }
    };
    const config = configs[status] || { bg: 'bg-gray-100 dark:bg-slate-700/50', text: 'text-gray-700 dark:text-slate-300', label: status || 'Unknown', icon: <Clock className="w-3 h-3" /> };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} flex items-center gap-1.5 w-fit border border-current opacity-90`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const filteredCompanies = (companies || []).filter(company => {
    const name = company?.name || '';
    const industry = company?.industry || '';
    const status = company?.status || '';

    const finalSearchQuery = globalSearchQuery || searchQuery;
    const matchesSearch = name.toLowerCase().includes(finalSearchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || industry === selectedIndustry;
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIndustry, selectedStatus, selectedYear]);

  return (
    <div className="min-h-screen bg-transparent">

      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Companies"
            value={companies.length.toLocaleString()}
            icon={<Building2 />}
            color="blue"
          />
          <StatCard
            label="Active Drives"
            value={companies.filter(c => c.status === 'ongoing').length.toLocaleString()}
            icon={<Calendar />}
            color="green"
          />
          <StatCard
            label="Upcoming Drives"
            value={companies.filter(c => c.status === 'upcoming').length.toLocaleString()}
            icon={<Clock />}
            color="purple"
          />
          <StatCard
            label="Completed Drives"
            value={companies.filter(c => c.status === 'completed').length.toLocaleString()}
            icon={<CheckCircle />}
            color="orange"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:bg-[#020617] dark:border-slate-700 dark:text-[#E2E8F0] dark:placeholder-slate-500 dark:focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Industry Filter */}
            <div className="relative">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="appearance-none pr-10 px-4 py-2.5 bg-white border border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] transition-colors"
              >
                <option value="all">All Industries</option>
                <option value="IT">IT / Software</option>
                <option value="Core">Core Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Consulting">Consulting</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-[#E2E8F0] dark:hover:bg-[#273549] rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-auto">
              <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-[#E2E8F0] dark:hover:bg-[#273549] rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => navigate('/admin/companies/add')}
                className="px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Drive Status</label>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none w-full pr-10 px-4 py-2.5 bg-white dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all" className="dark:bg-slate-800">All Status</option>
                      <option value="upcoming" className="dark:bg-slate-800">Upcoming</option>
                      <option value="ongoing" className="dark:bg-slate-800">Ongoing</option>
                      <option value="completed" className="dark:bg-slate-800">Completed</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Drive Year</label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="appearance-none w-full pr-10 px-4 py-2.5 bg-white dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all" className="dark:bg-slate-800">All Years</option>
                      <option value="2026" className="dark:bg-slate-800">2026</option>
                      <option value="2025" className="dark:bg-slate-800">2025</option>
                      <option value="2024" className="dark:bg-slate-800">2024</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Min Package (LPA)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5.0"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedYear('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Companies Table */}
        <div className="bg-white dark:bg-[#020617] rounded-xl shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                <tr className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Job Role(s)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Package</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Drive Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Selected</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {currentCompanies.length > 0 ? (
                  currentCompanies.map((company, index) => (
                    <tr key={company._id || index} className="bg-white dark:bg-[#020617] hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-all duration-300">
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-[#CBD5F5]">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 dark:hover:bg-slate-800 transition-colors" onClick={() => navigate(`/admin/companies/${company._id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-slate-700 p-2 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
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
                            <p className="font-semibold text-gray-900 dark:text-[#F1F5F9] group-hover:text-blue-600 transition-colors">{company.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-[#1E40AF] dark:text-[#BFDBFE] rounded text-xs font-medium">
                          {company.industry}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          {(company.jobRoles || []).map((role, idx) => (
                            <p key={idx} className="text-sm text-gray-700 dark:text-[#CBD5F5]">{role.role}</p>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 dark:text-[#CBD5F5]">₹{company.jobRoles?.[0]?.package || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#CBD5F5]">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {company.driveDate ? new Date(company.driveDate).toLocaleDateString() : 'TBD'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900 dark:text-[#CBD5F5]">{company.applicationsCount || 0}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-green-600 dark:text-[#22C55E]">{company.selectedCount || 0}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getStatusBadge(company.status)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/companies/${company._id}`)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/companies/edit/${company._id}`)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalConfig({
                                isOpen: true,
                                itemName: company.name,
                                warningText: 'This will remove the company\'s record permanently.',
                                onConfirm: async () => {
                                  try {
                                    const userStr = localStorage.getItem('user');
                                    const user = userStr ? JSON.parse(userStr) : null;
                                    const userId = user ? (user._id || user.id || user.email) : 'admin-bypass';

                                    const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/companies/${company._id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'x-user-id': userId
                                      }
                                    });
                                    if (resp.ok) {
                                      setCompanies(companies.filter(c => (c._id || c.id) !== (company._id || company.id)));
                                      success('Company deleted successfully!');
                                    } else {
                                      const data = await resp.json();
                                      errorToast(data.message || 'Failed to delete company');
                                    }
                                    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
                                  } catch (err) {
                                    console.error('Error deleting company:', err);
                                    errorToast('A network error occurred');
                                  }
                                }
                              });
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center">
                      <EmptyState title="No Companies Found" message="Try adjusting your filters or search query." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-sm font-medium transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-sm font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalConfig.onConfirm}
        itemName={deleteModalConfig.itemName}
        warningText={deleteModalConfig.warningText}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-shadow h-fit">
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

// Edit Company Modal Component
export const EditCompanyModal = ({ company, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...company });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/companies/${company._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (resp.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative border border-gray-100 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Company</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors group">
            <XCircle className="w-6 h-6 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="IT">IT</option>
                  <option value="Core">Core</option>
                  <option value="Finance">Finance</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Package</label>
                <input
                  type="text"
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Drive Date</label>
                <input
                  type="date"
                  value={formData.driveDate}
                  onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#020617] border border-gray-300 dark:border-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCompanies;