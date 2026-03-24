import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText, Download, Send, Eye, Calendar, Users, Building2,
    TrendingUp, Award, DollarSign, Clock, Filter, Mail, Bell,
    CheckCircle, XCircle, RefreshCw, Share2, AlertCircle
} from 'lucide-react';
import Modal from '../../components/common/Modal';

import { useAdmin } from '../../context/AdminContext';

const AdminReports = () => {
    const { selectedBatch, batchOptions } = useAdmin();
    const [activeTab, setActiveTab] = useState('generate');
    const [reportConfig, setReportConfig] = useState({
        type: '',
        startDate: '',
        endDate: '',
        month: '',
        companyName: '',
        departments: [],
        department: 'all', // legacy support
        batch: selectedBatch || 'all'
    });
    const [generatedReport, setGeneratedReport] = useState(null);
    const [circulationConfig, setCirculationConfig] = useState({
        sendTo: 'all',
        department: '',
        subject: '',
        message: ''
    });
    const [showCirculateModal, setShowCirculateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedHistoryReport, setSelectedHistoryReport] = useState(null);
    const [reportHistory, setReportHistory] = useState([]);

    const fetchData = async () => {
        try {
            const historyRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/history`);
            setReportHistory(historyRes.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setReportConfig(prev => ({ ...prev, batch: selectedBatch }));
    }, [selectedBatch]);


    const tabs = [
        { id: 'generate', label: 'Generate Report', icon: <FileText className="w-4 h-4" /> },
        { id: 'history', label: 'Report History', icon: <Clock className="w-4 h-4" /> }
    ];

    const handleGenerateReport = async () => {
        // Validation Based on Type
        if (!reportConfig.type || !reportConfig.batch) {
            alert('Please fill all required fields');
            return;
        }

        if (reportConfig.type === 'monthly' && !reportConfig.month) {
            alert('Please select a month');
            return;
        } else if (reportConfig.type === 'company' && !reportConfig.companyName.trim()) {
            alert('Please enter a company name');
            return;
        } else if (reportConfig.type === 'department' && reportConfig.departments.length === 0) {
            alert('Please select at least one department');
            return;
        } else if ((reportConfig.type === 'weekly' || reportConfig.type === 'custom' || reportConfig.type === '') && (!reportConfig.startDate || !reportConfig.endDate)) {
            alert('Please fill start date and end date');
            return;
        }

        if (reportConfig.type !== 'monthly' && reportConfig.type !== 'company' && reportConfig.type !== 'department') {
            const start = new Date(reportConfig.startDate);
            const end = new Date(reportConfig.endDate);
            const minDate = new Date('1990-01-01');
            const currDate = new Date();

            if (start < minDate || end < minDate) {
                alert('Dates cannot be before 1990');
                return;
            }

            if (start > currDate || end > currDate) {
                alert('Dates cannot be in the future');
                return;
            }

            if (end < start) {
                alert('End date cannot be before start date');
                return;
            }

            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 365) {
                alert('Date range must be within 365 days');
                return;
            }
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/reports/generate`, {
                title: `${reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
                type: reportConfig.type
            }, {
                headers: {
                    'x-user-id': JSON.parse(localStorage.getItem('user'))?.email || 'admin-bypass'
                }
            });

            const stats = response.data.stats;
            const newReport = {
                summary: {
                    totalStudents: stats.totalStudents || 0,
                    eligibleStudents: stats.eligibleStudents || 0,
                    studentsPlaced: stats.placedStudents || 0,
                    placementRate: stats.placementRate || 0
                },
                weeklyHighlights: {
                    companiesVisited: stats.companiesCount || 0,
                    studentsSelected: stats.placedStudents || 0,
                    highestPackage: stats.highestPackage || '0 LPA',
                    averagePackage: stats.averagePackage || '0 LPA'
                },
                companyWise: stats.companyWise || [],
                departmentWise: stats.departmentWise || []
            };

            setGeneratedReport(newReport);
            fetchData(); // Refresh history
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report");
        }
    };

    const handleCirculateReport = () => {
        if (!circulationConfig.sendTo || !circulationConfig.subject || !circulationConfig.message) {
            alert('Please fill all circulation fields');
            return;
        }
        alert('Report circulated successfully!');
        setShowCirculateModal(false);
        setActiveTab('history');
    };

    const getStatusBadge = (status) => {
        const configs = {
            sent: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-500', label: 'Sent' },
            draft: { bg: 'bg-gray-100 dark:bg-slate-700/50', text: 'text-gray-700 dark:text-slate-300', label: 'Draft' },
            scheduled: { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', label: 'Scheduled' }
        };
        const config = configs[status] || { bg: 'bg-gray-100 dark:bg-slate-700/50', text: 'text-gray-700 dark:text-slate-300', label: status || 'Unknown' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const handleDownloadPDF = () => {
        if (!generatedReport) {
            alert('Please generate a report first');
            return;
        }
        window.print();
    };

    const handleDownloadExcel = () => {
        if (!generatedReport) {
            alert('Please generate a report first');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

        // Summary
        csvContent += "Placement Summary\n";
        csvContent += "Total Students,Eligible Students,Students Placed,Placement Rate\n";
        csvContent += `${generatedReport.summary.totalStudents},${generatedReport.summary.eligibleStudents},${generatedReport.summary.studentsPlaced},${generatedReport.summary.placementRate}%\n\n`;

        // Weekly Highlights
        csvContent += "Weekly Highlights\n";
        csvContent += "Companies Visited,Students Selected,Highest Package (LPA),Average Package (LPA)\n";
        csvContent += `${generatedReport.weeklyHighlights.companiesVisited},${generatedReport.weeklyHighlights.studentsSelected},${generatedReport.weeklyHighlights.highestPackage},${generatedReport.weeklyHighlights.averagePackage}\n\n`;

        // Company Wise
        csvContent += "Company-wise Selections\n";
        csvContent += "Company,Role,Students Selected\n";
        generatedReport.companyWise.forEach(item => {
            const role = item.role.includes(',') ? `"${item.role}"` : item.role;
            const company = item.company.includes(',') ? `"${item.company}"` : item.company;
            csvContent += `${company},${role},${item.selected}\n`;
        });
        csvContent += "\n";

        // Department Wise
        csvContent += "Department-wise Placement\n";
        csvContent += "Department,Students Placed,Total Students,Placement %\n";
        generatedReport.departmentWise.forEach(item => {
            csvContent += `${item.department},${item.placed},${item.total},${Math.round((item.placed / item.total) * 100)}%\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Placement_Report_${reportConfig.startDate || 'Range'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadHistoryPDF = (report) => {
        if (!report) return;

        // Determine type based on history record
        let typeVal = 'custom';
        const typeStr = (report.type || '').toLowerCase();
        if (typeStr.includes('weekly')) typeVal = 'weekly';
        else if (typeStr.includes('monthly')) typeVal = 'monthly';
        else if (typeStr.includes('department')) typeVal = 'department';
        else if (typeStr.includes('company')) typeVal = 'company';

        // Set config to render the report
        setReportConfig({
            type: typeVal,
            startDate: report.dateGenerated,
            endDate: report.dateGenerated,
            month: report.dateGenerated.substring(0, 7),
            companyName: '',
            departments: [],
            department: 'all',
            batch: 'all'
        });

        setGeneratedReport({
            summary: { 
                totalStudents: report.stats?.totalStudents || 0, 
                eligibleStudents: report.stats?.eligibleStudents || 0, 
                studentsPlaced: report.stats?.placedStudents || 0, 
                placementRate: report.stats?.placementRate || 0 
            },
            weeklyHighlights: { 
                companiesVisited: report.stats?.companiesCount || 0, 
                studentsSelected: report.stats?.placedStudents || 0, 
                highestPackage: report.stats?.highestPackage || '0 LPA', 
                averagePackage: report.stats?.averagePackage || '0 LPA' 
            },
            companyWise: report.stats?.companyWise || [],
            departmentWise: report.stats?.departmentWise || []
        });
        setActiveTab('generate');
        setShowViewModal(false);

        // Wait for DOM to update then trigger print
        setTimeout(() => {
            window.print();
        }, 500);
    };

    return (
        <div className="min-h-screen bg-transparent print:bg-white text-gray-900 dark:text-[#E2E8F0]">

            <div className="p-8 print:p-0">
                {/* Tabs */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden print:border-none print:rounded-none">
                    <div className="flex border-b border-gray-200 dark:border-slate-800 print:hidden">
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
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-8 print:p-0">
                        {/* Generate Report Tab */}
                        {activeTab === 'generate' && (
                            <div className="max-w-3xl mx-auto space-y-6 print:hidden">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-6">Generate New Report</h2>

                                <div className="grid grid-cols-1 gap-6">
                                    {/* Report Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                            Report Type *
                                        </label>
                                        <select
                                            value={reportConfig.type}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                let newConfig = { ...reportConfig, type: newType };

                                                if (newType === 'weekly') {
                                                    const today = new Date();
                                                    const currentDay = today.getDay();
                                                    // Calculate Monday of current week
                                                    const startOfWeek = new Date(today);
                                                    startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

                                                    // Calculate Sunday of current week
                                                    const endOfWeek = new Date(startOfWeek);
                                                    endOfWeek.setDate(startOfWeek.getDate() + 6);

                                                    newConfig.startDate = startOfWeek.toISOString().split('T')[0];
                                                    // Don't let end date be in the future
                                                    newConfig.endDate = endOfWeek > today ? today.toISOString().split('T')[0] : endOfWeek.toISOString().split('T')[0];
                                                }

                                                setReportConfig(newConfig);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Report Type</option>
                                            <option value="weekly">Weekly Placement Report</option>
                                            <option value="monthly">Monthly Placement Report</option>
                                            <option value="company">Company-wise Report</option>
                                            <option value="department">Department-wise Report</option>
                                            <option value="custom">Custom Date Range Report</option>
                                        </select>
                                    </div>

                                    {/* Date Range / Month */}
                                    {reportConfig.type === 'monthly' ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                    Select Month *
                                                </label>
                                                <input
                                                    type="month"
                                                    value={reportConfig.month}
                                                    onChange={(e) => setReportConfig({ ...reportConfig, month: e.target.value })}
                                                    max={new Date().toISOString().slice(0, 7)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ) : reportConfig.type !== 'company' && reportConfig.type !== 'department' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                    Start Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={reportConfig.startDate}
                                                    onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                                                    min="1990-01-01"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    disabled={reportConfig.type === 'weekly'}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                    End Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={reportConfig.endDate}
                                                    onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                                                    min={reportConfig.startDate || "1990-01-01"}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    disabled={reportConfig.type === 'weekly'}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-slate-800"
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Filters */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {reportConfig.type === 'company' ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                    Company Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reportConfig.companyName}
                                                    onChange={(e) => setReportConfig({ ...reportConfig, companyName: e.target.value })}
                                                    placeholder="e.g. TCS, Infosys"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        ) : reportConfig.type === 'department' ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                    Departments *
                                                </label>
                                                <div className="grid grid-cols-2 gap-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] rounded-lg p-3">
                                                    {['CSE', 'IT', 'ECE', 'EEE', 'MECH'].map(dept => (
                                                        <label key={dept} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={reportConfig.departments.includes(dept)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setReportConfig({ ...reportConfig, departments: [...reportConfig.departments, dept] });
                                                                    } else {
                                                                        setReportConfig({ ...reportConfig, departments: reportConfig.departments.filter(d => d !== dept) });
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-[#E2E8F0]">{dept}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                    Department *
                                                </label>
                                                <select
                                                    value={reportConfig.department}
                                                    onChange={(e) => setReportConfig({ ...reportConfig, department: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="all">All Departments</option>
                                                    <option value="cse">CSE</option>
                                                    <option value="it">IT</option>
                                                    <option value="ece">ECE</option>
                                                    <option value="eee">EEE</option>
                                                    <option value="mech">MECH</option>
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                                Batch *
                                            </label>
                                            <select
                                                value={reportConfig.batch}
                                                onChange={(e) => setReportConfig({ ...reportConfig, batch: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option key="all" value="all">All Batches</option>
                                                {(batchOptions || []).map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Configuration Summary */}
                                    {reportConfig.type && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                                            <h3 className="font-semibold text-blue-900 mb-2">Report Configuration</h3>
                                            <div className="space-y-1 text-sm text-blue-700">
                                                <p><span className="font-medium">Type:</span> {reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} Report</p>
                                                {reportConfig.startDate && reportConfig.endDate && (
                                                    <p><span className="font-medium">Date Range:</span> {new Date(reportConfig.startDate).toLocaleDateString()} - {new Date(reportConfig.endDate).toLocaleDateString()}</p>
                                                )}
                                                <p><span className="font-medium">Department:</span> {reportConfig.department === 'all' ? 'All Departments' : reportConfig.department.toUpperCase()}</p>
                                                <p><span className="font-medium">Batch:</span> {reportConfig.batch === 'all' ? 'All Batches' : reportConfig.batch}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Generate Button */}
                                    <button
                                        onClick={handleGenerateReport}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Generate Report
                                    </button>
                                </div>

                                {/* In-line Preview */}
                                {generatedReport && (
                                    <div className="mt-12 w-full max-w-4xl mx-auto border-t border-gray-200 pt-8 print:mt-0 print:border-none print:pt-0">
                                        <div className="flex items-center justify-between mb-6 print:hidden">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Generated Report</h2>
                                            <div className="flex gap-3">
                                                <button onClick={handleDownloadPDF} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium flex items-center gap-2">
                                                    <Download className="w-4 h-4" />
                                                    Download PDF
                                                </button>
                                                <button onClick={handleDownloadExcel} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium flex items-center gap-2">
                                                    <Download className="w-4 h-4" />
                                                    Download Excel
                                                </button>
                                                <button
                                                    onClick={() => setShowCirculateModal(true)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Circulate Report
                                                </button>
                                            </div>
                                        </div>

                                        {/* Report Content */}
                                        <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-lg p-8 space-y-8">
                                            {/* Header */}
                                            <div className="text-center border-b border-gray-200 dark:border-slate-800 pb-6">
                                                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-2">Placement Report</h1>
                                                <p className="text-gray-600 dark:text-[#94A3B8]">
                                                    {reportConfig.startDate && reportConfig.endDate && (
                                                        `${new Date(reportConfig.startDate).toLocaleDateString()} - ${new Date(reportConfig.endDate).toLocaleDateString()}`
                                                    )}
                                                </p>
                                            </div>

                                            {/* Placement Summary */}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">Placement Summary</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <MetricCard label="Total Students" value={generatedReport.summary.totalStudents} icon={<Users />} color="blue" />
                                                    <MetricCard label="Eligible Students" value={generatedReport.summary.eligibleStudents} icon={<CheckCircle />} color="green" />
                                                    <MetricCard label="Students Placed" value={generatedReport.summary.studentsPlaced} icon={<Award />} color="purple" />
                                                    <MetricCard label="Placement Rate" value={`${generatedReport.summary.placementRate}%`} icon={<TrendingUp />} color="orange" />
                                                </div>
                                            </div>

                                            {/* Weekly Highlights */}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">Weekly Highlights</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <MetricCard label="Companies Visited" value={generatedReport.weeklyHighlights.companiesVisited} icon={<Building2 />} color="blue" />
                                                    <MetricCard label="Students Selected" value={generatedReport.weeklyHighlights.studentsSelected} icon={<Users />} color="green" />
                                                    <MetricCard label="Highest Package" value={`₹${generatedReport.weeklyHighlights.highestPackage} LPA`} icon={<DollarSign />} color="purple" />
                                                    <MetricCard label="Average Package" value={`₹${generatedReport.weeklyHighlights.averagePackage} LPA`} icon={<DollarSign />} color="orange" />
                                                </div>
                                            </div>

                                            {/* Company-wise Selections */}
                                            {reportConfig.type !== 'department' && (
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">
                                                        {reportConfig.type === 'company' && reportConfig.companyName
                                                            ? `Selections for ${reportConfig.companyName}`
                                                            : 'Company-wise Selections'}
                                                    </h3>
                                                    <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.No</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Students Selected</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                                                {generatedReport.companyWise
                                                                    .filter(item =>
                                                                        reportConfig.type !== 'company' ||
                                                                        !reportConfig.companyName ||
                                                                        item.company.toLowerCase().includes(reportConfig.companyName.toLowerCase())
                                                                    )
                                                                    .map((item, index) => (
                                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                                                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94A3B8]">{index + 1}</td>
                                                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#F1F5F9]">
                                                                                {reportConfig.type === 'company' && reportConfig.companyName ? reportConfig.companyName : item.company}
                                                                            </td>
                                                                            <td className="px-6 py-4 text-gray-700 dark:text-[#CBD5F5]">{item.role}</td>
                                                                            <td className="px-6 py-4 text-center font-semibold text-blue-600">{item.selected}</td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Department-wise Placement */}
                                            {reportConfig.type !== 'company' && (
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9] mb-4">Department-wise Placement</h3>
                                                    <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.No</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Students Placed</th>
                                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Students</th>
                                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Placement %</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                                                {generatedReport.departmentWise
                                                                    .filter(item =>
                                                                        reportConfig.type !== 'department' ||
                                                                        reportConfig.departments.length === 0 ||
                                                                        reportConfig.departments.includes(item.department)
                                                                    )
                                                                    .map((item, index) => (
                                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                                                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94A3B8]">{index + 1}</td>
                                                                            <td className="px-6 py-4">
                                                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                                                                    {item.department}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-center font-semibold text-green-600 dark:text-green-500">{item.placed}</td>
                                                                            <td className="px-6 py-4 text-center text-gray-700 dark:text-[#CBD5F5]">{item.total}</td>
                                                                            <td className="px-6 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                                                                                {Math.round((item.placed / item.total) * 100)}%
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



                        {/* Report History Tab */}
                        {activeTab === 'history' && (
                            <div className="space-y-6 print:hidden">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Report History</h2>
                                    <button className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        Filter
                                    </button>
                                </div>

                                <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.No</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Generated</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent To</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                            {reportHistory.map((report, index) => (
                                                <tr key={report._id || report.id} className="hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94A3B8]">{index + 1}</td>
                                                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#F1F5F9]">{report.title || report.name}</td>
                                                                                    <td className="px-6 py-4">
                                                                                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                                                                            {report.type}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#94A3B8]">{new Date(report.date || report.dateGenerated).toLocaleDateString()}</td>
                                                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-[#CBD5F5]">{report.sentTo || 'Generated'}</td>
                                                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-[#F1F5F9]">{report.recipients || report.stats?.totalStudents || 0}</td>
                                                    <td className="px-6 py-4">{getStatusBadge((report.status || 'sent').toLowerCase())}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setSelectedHistoryReport(report); setShowViewModal(true); }} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="View">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDownloadHistoryPDF(report)} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded" title="Download">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Circulate Report Modal */}
            <Modal isOpen={showCirculateModal} onClose={() => setShowCirculateModal(false)} title="Circulate Report">
                <div className="space-y-6">
                    {/* Send To Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Send To *
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar border border-gray-200 rounded-lg p-2">
                            <label className="flex items-center p-3 border border-transparent rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F172A] cursor-pointer">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="all"
                                    checked={circulationConfig.sendTo === 'all'}
                                    onChange={(e) => setCirculationConfig({ ...circulationConfig, sendTo: e.target.value })}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-[#F1F5F9]">All Students</p>
                                    <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Send to all registered students</p>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border border-transparent rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F172A] cursor-pointer">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="batch"
                                    checked={circulationConfig.sendTo === 'batch'}
                                    onChange={(e) => setCirculationConfig({ ...circulationConfig, sendTo: e.target.value })}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-[#F1F5F9]">Specific Batch</p>
                                    <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Send to students of a particular batch</p>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border border-transparent rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F172A] cursor-pointer">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="department"
                                    checked={circulationConfig.sendTo === 'department'}
                                    onChange={(e) => setCirculationConfig({ ...circulationConfig, sendTo: e.target.value })}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">Specific Department</p>
                                    <p className="text-sm text-gray-600">Send to students of a particular department</p>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border border-transparent rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="placed"
                                    checked={circulationConfig.sendTo === 'placed'}
                                    onChange={(e) => setCirculationConfig({ ...circulationConfig, sendTo: e.target.value })}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">Placed Students</p>
                                    <p className="text-sm text-gray-600">Send only to placed students</p>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border border-transparent rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="unplaced"
                                    checked={circulationConfig.sendTo === 'unplaced'}
                                    onChange={(e) => setCirculationConfig({ ...circulationConfig, sendTo: e.target.value })}
                                    className="mr-3"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">Unplaced Students</p>
                                    <p className="text-sm text-gray-600">Send only to unplaced students</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Department/Batch Selection */}
                    {(circulationConfig.sendTo === 'department' || circulationConfig.sendTo === 'batch') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                                {circulationConfig.sendTo === 'department' ? 'Select Department' : 'Select Batch'}
                            </label>
                            <select
                                value={circulationConfig.department}
                                onChange={(e) => setCirculationConfig({ ...circulationConfig, department: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select {circulationConfig.sendTo === 'department' ? 'Department' : 'Batch'}</option>
                                {circulationConfig.sendTo === 'department' ? (
                                    <>
                                        <option value="cse">CSE</option>
                                        <option value="it">IT</option>
                                        <option value="ece">ECE</option>
                                        <option value="eee">EEE</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    {/* Message Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            value={circulationConfig.subject}
                            onChange={(e) => setCirculationConfig({ ...circulationConfig, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Weekly Placement Update"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#E2E8F0] mb-2">
                            Message *
                        </label>
                        <textarea
                            value={circulationConfig.message}
                            onChange={(e) => setCirculationConfig({ ...circulationConfig, message: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                            placeholder="Dear Students..."
                        />
                    </div>

                    {/* Circulation Summary */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Circulation Summary
                        </h3>
                        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                            <p><span className="font-medium">Recipients:</span> {circulationConfig.sendTo.charAt(0).toUpperCase() + circulationConfig.sendTo.slice(1)}</p>
                            <p><span className="font-medium">Method:</span> Email & In-app Notification</p>
                            <p><span className="font-medium">Attachments:</span> Report PDF</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowCirculateModal(false)} className="px-6 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-[#E2E8F0] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#1E293B] flex-1">
                            Cancel
                        </button>
                        <button
                            onClick={handleCirculateReport}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex-1 flex flex-row items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Send Report
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View History Report Details Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Circulated Report Details">
                {selectedHistoryReport ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">{selectedHistoryReport.name || selectedHistoryReport.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                        {selectedHistoryReport.type}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-[#94A3B8]">{new Date(selectedHistoryReport.dateGenerated || selectedHistoryReport.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {getStatusBadge(selectedHistoryReport.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-[#020617] p-3 rounded-lg border border-gray-200 dark:border-slate-800">
                                <p className="text-sm text-gray-500 dark:text-[#94A3B8] mb-1">Sent To</p>
                                <p className="font-semibold text-gray-900 dark:text-[#F1F5F9]">{selectedHistoryReport.sentTo || 'Generated'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#020617] p-3 rounded-lg border border-gray-200 dark:border-slate-800">
                                <p className="text-sm text-gray-500 dark:text-[#94A3B8] mb-1">Recipients Count</p>
                                <p className="font-semibold text-gray-900 dark:text-[#F1F5F9]">{selectedHistoryReport.recipients || selectedHistoryReport.stats?.totalStudents || 0} Students</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                            <button onClick={() => handleDownloadHistoryPDF(selectedHistoryReport)} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg font-medium transition-colors border border-blue-200 dark:border-blue-800/30">
                                <Download className="w-5 h-5" />
                                Download PDF Attachment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-600">No details available.</div>
                )}
            </Modal>
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ label, value, icon, color = "blue" }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600'
    };

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-shadow h-fit">
            <div className={`w-12 h-12 shrink-0 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center text-white`}>
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );
};

export default AdminReports;