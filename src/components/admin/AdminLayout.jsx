import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../common/SideNav';
import Header from '../common/Header';
import {
    LayoutDashboard,
    Users,
    Building2,
    BookOpen,
    MessageSquare,
    FileText,
    Settings,
    User,
    GraduationCap,
    Sun,
    Moon,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const { selectedBatch, setSelectedBatch, batchOptions } = useAdmin();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [adminName, setAdminName] = useState(user.name || '');

    useEffect(() => {
        const fetchAdminName = async () => {
            if (user._id) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`);
                    if (res.data && res.data.name) {
                        setAdminName(res.data.name);
                        if (user.name !== res.data.name) {
                            const updatedUser = { ...user, name: res.data.name };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching admin name for layout:", err);
                }
            }
        };
        fetchAdminName();
    }, [user._id]);


    const getHeaderInfo = (pathname) => {
        if (pathname.startsWith('/admin/companies/')) {
            if (pathname.includes('/edit')) return { title: 'Edit Company', subtitle: 'Update company details' };
            if (pathname.includes('/add')) return { title: 'Add Company', subtitle: 'Onboard a new company' };
            return { title: 'Company Management', subtitle: 'Detailed view and management' };
        }

        switch (pathname) {
            case '/admin/dashboard': return { title: 'Admin Dashboard', subtitle: 'Overview of placement statistics' };
            case '/admin/students': return { title: 'Student Management', subtitle: 'Manage student records and eligibility' };
            case '/admin/companies': return { title: 'Company Management', subtitle: 'Overview of recruiting partners' };
            case '/admin/resources': return { title: 'Admin Resources', subtitle: 'Manage preparation materials' };
            case '/admin/messages': return { title: 'Admin Messages', subtitle: 'Communications with students' };
            case '/admin/reports': return { title: 'Placement Reports', subtitle: 'Generate and view placement metrics' };
            case '/admin/settings': return { title: 'Admin Settings', subtitle: 'System preferences' };
            case '/admin/profile': return { title: 'Admin Profile', subtitle: 'Your professional credentials' };
            default: return { title: 'Placement Portal', subtitle: 'Admin' };
        }
    };

    const { title, subtitle } = getHeaderInfo(location.pathname);

    const mainMenuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" />, label: 'Dashboard' },
        { path: '/admin/students', icon: <Users className="w-5 h-5 shrink-0" />, label: 'Students' },
        { path: '/admin/companies', icon: <Building2 className="w-5 h-5 shrink-0" />, label: 'Companies' },
        { path: '/admin/resources', icon: <BookOpen className="w-5 h-5 shrink-0" />, label: 'Resources' },
        { path: '/admin/messages', icon: <MessageSquare className="w-5 h-5 shrink-0" />, label: 'Messages' },
        { path: '/admin/reports', icon: <FileText className="w-5 h-5 shrink-0" />, label: 'Reports' },
    ];

    const bottomMenuItems = [
        { path: '/admin/settings', icon: <Settings className="w-5 h-5 shrink-0" />, label: 'Settings' },
        { path: '/admin/profile', icon: <User className="w-5 h-5 shrink-0" />, label: 'Profile' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0B1220] overflow-hidden print:h-auto print:block print:overflow-visible">
            <div className="print:hidden">
                <AdminSidebar
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                    mainMenuItems={mainMenuItems}
                    bottomMenuItems={bottomMenuItems}
                />
            </div>

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'} print:ml-0 print:block print:overflow-visible print:w-full`}>
                <div className="print:hidden">
                    <Header
                        title={title}
                        subtitle={subtitle}
                        onMenuClick={() => setIsExpanded(!isExpanded)}
                        onSearch={setSearchQuery}
                        showSearch={false}
                        showUserInfo={false}
                        studentName={user.name || "Administrator"}
                        role="Admin"
                    >
                        {/* Batch Selection moved here for global access */}
                        <div className="hidden lg:flex items-center gap-3 bg-gray-50 dark:bg-[#020617] p-1.5 rounded-xl border border-gray-200 dark:border-slate-800 ml-4">
                            <div className="flex items-center gap-2 px-3 text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                                <GraduationCap className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Batch</span>
                            </div>
                            <div className="flex gap-1">
                                {batchOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedBatch(option.value)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                                            selectedBatch === option.value
                                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-500 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/20 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Header>
                </div>
                <div className="flex-1 overflow-auto print:overflow-visible p-8 dark:bg-slate-900 border-t border-l border-gray-200 dark:border-slate-800 shadow-inner">
                    <Outlet context={{ searchQuery, isExpanded }} />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
