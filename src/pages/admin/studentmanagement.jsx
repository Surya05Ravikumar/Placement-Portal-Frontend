import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, Download, Upload, Plus, Eye, Edit2, Trash2,
  Briefcase, ChevronDown, ChevronRight, X, AlertCircle, RefreshCw, Loader2,
  MessageSquare, CheckCircle2, XCircle, Award, FileText, Mail, Phone
} from 'lucide-react';
import DeleteModal from '../../components/common/DeleteModal';
import EmptyState from '../../components/common/emptystate';
import { ToastContainer, useToast } from '../../components/common/Toast';

import { useAdmin } from '../../context/AdminContext';
import { useOutletContext } from 'react-router-dom';

const StudentManagement = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: errorToast } = useToast();
  const { selectedBatch, setSelectedBatch, batchOptions } = useAdmin();
  const { searchQuery: globalSearchQuery } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedBatchLocal, setSelectedBatchLocal] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [cgpaRange, setCgpaRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Generic Delete State
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    itemName: '',
    warningText: '',
    onConfirm: () => { }
  });

  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?batch=${selectedBatch}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  const getPlacementStatusBadge = (status) => {
    const configs = {
      placed: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-500', label: 'Placed' },
      shortlisted: { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', label: 'Shortlisted' },
      applied: { bg: 'bg-purple-100 dark:bg-purple-500/15', text: 'text-purple-700 dark:text-purple-400', label: 'Applied' },
      eligible: { bg: 'bg-gray-100 dark:bg-slate-700/50', text: 'text-gray-700 dark:text-slate-300', label: 'Eligible' },
      not_eligible: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400', label: 'Not Eligible' }
    };
    const config = configs[status] || configs.eligible;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getResumeStatusIcon = (status) => {
    return status === 'uploaded' ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const filteredStudents = students.filter(student => {
    const finalSearchQuery = globalSearchQuery || searchQuery;
    const matchesSearch = student.name.toLowerCase().includes(finalSearchQuery.toLowerCase()) ||
      (student.registerNumber && student.registerNumber.toLowerCase().includes(finalSearchQuery.toLowerCase())) ||
      student.email.toLowerCase().includes(finalSearchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
    const matchesBatch = selectedBatchLocal === 'all' || student.year === selectedBatchLocal;
    const matchesStatus = selectedStatus === 'all' || student.placementStatus === selectedStatus;

    return matchesSearch && matchesDepartment && matchesBatch && matchesStatus;
  });

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      errorToast('No students to export.');
      return;
    }

    const headers = ['Register Number', 'Name', 'Email', 'Phone', 'Department', 'Batch', 'CGPA', 'Gender', 'Date of Birth', 'Stream', 'Placement Status', 'Placed Company', 'Package LPA'];

    const csvRows = filteredStudents.map(student => {
      const row = [
        `"${student.registerNumber || ''}"`,
        `"${student.name || ''}"`,
        `"${student.email || ''}"`,
        `"${student.phone || ''}"`,
        `"${student.department || ''}"`,
        `"${student.year || ''}"`,
        `"${student.cgpa || ''}"`,
        `"${student.gender || ''}"`,
        `"${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : ''}"`,
        `"${student.stream || ''}"`,
        `"${student.placementStatus || ''}"`,
        `"${student.placedCompany || ''}"`,
        `"${student.package || ''}"`
      ];
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Students exported successfully!');
  };

  return (
    <div className="min-h-screen bg-transparent">
      

      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            label="Total Students"
            value={students.length.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            label="Eligible Students"
            value={students.filter(s => s.placementStatus !== 'not_eligible').length.toLocaleString()}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
          <SummaryCard
            label="Students Placed"
            value={students.filter(s => s.placementStatus === 'placed').length.toLocaleString()}
            icon={<Award className="w-5 h-5" />}
            color="purple"
          />
          <SummaryCard
            label="Resume Uploaded"
            value={`${students.length > 0 ? (students.filter(s => s.resumes?.length > 0).length / students.length * 100).toFixed(0) : 0}%`}
            icon={<FileText className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, student ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:bg-[#020617] dark:border-slate-700 dark:text-[#E2E8F0] dark:placeholder-slate-500 dark:focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Quick Filters */}
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[160px] transition-colors"
              >
                <option value="all">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-[#E2E8F0] dark:hover:bg-[#273549] rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-[#E2E8F0] dark:hover:bg-[#273549] rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Batch</label>
                  <div className="relative">
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="appearance-none pr-10 w-full px-3 py-2 bg-white dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="overall">All Batches</option>
                      {batchOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="dark:bg-slate-800">{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none pr-10 w-full px-3 py-2 bg-white dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="placed">Placed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="applied">Applied</option>
                      <option value="eligible">Eligible</option>
                      <option value="not_eligible">Not Eligible</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">CGPA Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={cgpaRange.min}
                      onChange={(e) => setCgpaRange({ ...cgpaRange, min: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={cgpaRange.max}
                      onChange={(e) => setCgpaRange({ ...cgpaRange, max: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Resume Status</label>
                  <div className="relative">
                    <select className="appearance-none pr-10 w-full px-3 py-2 bg-white dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All</option>
                      <option value="uploaded">Uploaded</option>
                      <option value="not_uploaded">Not Uploaded</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g., React, Python"
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button className="px-4 py-2 border border-gray-300 dark:border-slate-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 rounded-lg font-medium transition-colors">
                  Clear Filters
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-[#020617] rounded-xl shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    CGPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    DOB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student._id} className="bg-white dark:bg-[#020617] hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-all duration-300">
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-[#CBD5F5]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-[#F1F5F9]">{student.registerNumber}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-[#F1F5F9]">{student.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-500">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded text-xs font-medium`}>
                          {student.department || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 dark:text-[#CBD5F5]">
                        {student.year || 'N/A'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-[#CBD5F5]">{student.cgpa || '0.00'}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 dark:text-[#CBD5F5]">
                        {student.gender || 'Male'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 dark:text-[#CBD5F5]">
                        {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {(student.skills || []).slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-700 rounded text-xs">
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))}
                          {(student.skills || []).length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              +{(student.skills || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getResumeStatusIcon(student.resumes?.length > 0 ? 'uploaded' : 'not_uploaded')}
                          <span className={`text-xs font-medium ${student.resumes?.length > 0 ? 'text-gray-600 dark:text-green-500' : 'text-gray-600 dark:text-red-500'}`}>
                            {student.resumes?.length > 0 ? 'Uploaded' : 'Not Uploaded'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getPlacementStatusBadge(student.placementStatus)}
                        {student.placementStatus === 'placed' && (
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{student.placedCompany}</p>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900 dark:text-[#CBD5F5]">{student.applicationsCount || 0}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate('/admin/messages', { state: { studentId: student.registerNumber } })}
                            className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                            title="Message Student"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(student);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalConfig({
                                isOpen: true,
                                itemName: student.name,
                                warningText: 'This will remove the student\'s record permanently.',
                                onConfirm: async () => {
                                  try {
                                    await fetch(`${import.meta.env.VITE_API_URL}/api/users/${student._id}`, { method: 'DELETE' });
                                    fetchStudents();
                                    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
                                  } catch (err) {
                                    console.error('Error deleting student:', err);
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
                    <td colSpan="11" className="px-6 py-8 text-center">
                      <EmptyState title="No Students Found" message="Try adjusting your filters or search query." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredStudents.length}</span> of{' '}
              <span className="font-semibold">{students.length}</span> students
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingStudent(null);
            fetchStudents();
            success('Student updated successfully!');
          }}
          onError={(msg) => errorToast(msg || 'Failed to update student')}
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStudents();
            success('Student created successfully!');
          }}
          onError={(msg) => errorToast(msg || 'Failed to create student')}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false);
            fetchStudents();
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div >
  );
};

// Summary Card Component
const SummaryCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-shadow h-fit">
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

// Student Detail Modal Component
export const StudentDetailModal = ({ student, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative border border-gray-100 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-inner uppercase">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-gray-600 dark:text-slate-400 font-medium">{student.registerNumber} • {student.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors group">
            <X className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300" />
          </button>
        </div>

        <div className="absolute top-24 right-6 flex gap-2">
            <button
                onClick={() => navigate('/admin/messages', { state: { studentId: student.registerNumber } })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
            >
                <MessageSquare className="w-3.5 h-3.5" /> Message Student
            </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-5 bg-gray-50 dark:bg-[#020617] rounded-xl border border-gray-100 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest mb-1.5">CGPA</p>
              <p className="font-bold text-gray-900 dark:text-white">{student.cgpa}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest mb-1.5">Gender</p>
              <p className="font-bold text-gray-900 dark:text-white">{student.gender || 'Male'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest mb-1.5">Date of Birth</p>
              <p className="font-bold text-gray-900 dark:text-white">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest mb-1.5">Pass Year</p>
              <span className="inline-flex px-2.5 py-1 rounded text-xs font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                {student.year}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest mb-1.5">Resume</p>
              <div className="flex items-center gap-1.5">
                {student.resumes?.length > 0 ? (
                  <span className="font-bold text-green-600 dark:text-green-500 flex items-center gap-1 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                  </span>
                ) : (
                  <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1 text-sm">
                    <XCircle className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest mb-1.5">Applications</p>
              <p className="font-bold text-gray-900 dark:text-white">{student.applicationsCount || 0} applied</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                Contact Details
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#020617] rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Email</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#020617] rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.phone}</p>
                  </div>
                </div>
              </div>
            </div>
 
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                Placement Status
              </h4>
              <div className="p-5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/30">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 capitalize flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {student.placementStatus}
                </p>
                {student.placementStatus === 'placed' && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-500/30">
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest mb-1.5">Company</p>
                    <p className="text-base text-blue-900 dark:text-blue-200 font-bold">{student.placedCompany}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-bold">LPA: {student.package}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddStudentModal = ({ onClose, onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    phone: '',
    department: 'CSE',
    year: '2024',
    cgpa: '',
    gender: 'Male',
    dateOfBirth: '',
    stream: 'B.E',
    placementStatus: 'eligible'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (resp.ok) onSuccess();
      else {
        const data = await resp.json();
        onError(data.message);
      }
    } catch (err) {
      console.error(err);
      onError('A network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col relative border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Student</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors group"><X className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter full name" />
          </div>
          <div className="space-y-4 col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Register Number <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.registerNumber} onChange={e => setFormData({ ...formData, registerNumber: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 20CS101" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="student@college.edu" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10-digit mobile number" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Department <span className="text-red-500">*</span></label>
            <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="CSE" className="dark:bg-slate-800">CSE</option>
              <option value="IT" className="dark:bg-slate-800">IT</option>
              <option value="ECE" className="dark:bg-slate-800">ECE</option>
              <option value="EEE" className="dark:bg-slate-800">EEE</option>
              <option value="MECH" className="dark:bg-slate-800">MECH</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Batch <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2024" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">CGPA <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" required value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 8.5" />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Male" className="dark:bg-slate-800">Male</option>
              <option value="Female" className="dark:bg-slate-800">Female</option>
              <option value="Other" className="dark:bg-slate-800">Other</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Placement Status <span className="text-red-500">*</span></label>
            <select required value={formData.placementStatus} onChange={e => setFormData({ ...formData, placementStatus: e.target.value })} className="w-full px-3 py-2 border dark:bg-[#020617] dark:border-slate-700 dark:text-slate-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="eligible" className="dark:bg-slate-800">Eligible</option>
              <option value="applied" className="dark:bg-slate-800">Applied</option>
              <option value="shortlisted" className="dark:bg-slate-800">Shortlisted</option>
              <option value="placed" className="dark:bg-slate-800">Placed</option>
            </select>
          </div>
          {formData.placementStatus === 'placed' && (
            <>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Placed Company <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.placedCompany} onChange={e => setFormData({ ...formData, placedCompany: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Package (LPA) <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.package} onChange={e => setFormData({ ...formData, package: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}
          <div className="col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 z-10">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BulkUploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else setError('Please select a valid CSV file.');
  };

  const processCSV = () => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, i) => { obj[header] = values[i]; });
            return obj;
          });
          resolve(data);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const jsonData = await processCSV();
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/users/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });
      if (resp.ok) onSuccess();
      else setError('Upload failed. Check console for details.');
    } catch {
      setError('Failed to process file.');
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors absolute right-4 top-4 group text-gray-400"><X className="w-5 h-5 group-hover:text-gray-600 dark:group-hover:text-slate-300" /></button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-50 dark:border-blue-900/20">
            <Upload className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload Students</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">Upload a CSV file with student details</p>
        </div>
        <div
          onClick={() => document.getElementById('csv').click()}
          className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 text-center bg-gray-50/50 dark:bg-[#020617]/50 hover:bg-gray-50 dark:hover:bg-[#020617] hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer transition-all group"
        >
          <input id="csv" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <FileText className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3 group-hover:text-blue-400 transition-colors" />
          <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{file ? file.name : 'Choose CSV file'}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-medium">or drag and drop here</p>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              const headers = "name,registerNumber,email,phone,department,year,cgpa,gender,dateOfBirth,placementStatus\n";
              const sample = "John Doe,21CSE001,john@example.com,9876543210,CSE,2024,8.5,Male,2002-01-01,eligible\n";
              const blob = new Blob([headers + sample], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sample_students.csv';
              a.click();
            }}
            className="text-blue-600 text-xs font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Download className="w-3 h-3" /> Download Sample CSV
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg font-bold text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
          <button onClick={handleUpload} disabled={!file || uploading} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95">
            {uploading ? 'Processing...' : 'Upload Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditStudentModal = ({ student, onClose, onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name || '',
    registerNumber: student.registerNumber || '',
    email: student.email || '',
    phone: student.phone || student.mobile || '',
    department: student.department || student.dept || 'CSE',
    year: student.year || student.batch || student.passingYear || '2024',
    cgpa: student.cgpa || student.gpa || '0.00',
    stream: student.stream || 'B.E',
    gender: student.gender || 'Male',
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
    placementStatus: student.placementStatus || 'eligible',
    placedCompany: student.placedCompany || '',
    package: student.package || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (resp.ok) onSuccess();
      else {
        const data = await resp.json();
        onError(data.message);
      }
    } catch (err) {
      console.error(err);
      onError('A network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col relative border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Student</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors group"><X className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Register Number <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.registerNumber} onChange={e => setFormData({ ...formData, registerNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
            <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none">
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CGPA <span className="text-red-500">*</span></label>
            <input type="number" required step="0.01" value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.stream} onChange={e => setFormData({ ...formData, stream: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
            <select required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placement Status <span className="text-red-500">*</span></label>
            <select required value={formData.placementStatus} onChange={e => setFormData({ ...formData, placementStatus: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="eligible">Eligible</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="placed">Placed</option>
            </select>
          </div>
          {formData.placementStatus === 'placed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placed Company <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.placedCompany} onChange={e => setFormData({ ...formData, placedCompany: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package (LPA) <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.package} onChange={e => setFormData({ ...formData, package: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}
          <div className="col-span-2 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 z-10 font-bold">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-bold">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentManagement;
