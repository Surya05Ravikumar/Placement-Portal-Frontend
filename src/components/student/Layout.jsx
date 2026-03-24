import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../common/SideNav';
import Header from '../common/Header';
import {
    Home,
    Building2,
    FileText,
    BookOpen,
    MessageSquare,
    User,
    Settings,
} from 'lucide-react';

import axios from 'axios';
 
const Layout = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentName, setStudentName] = useState('');
    const location = useLocation();
 
    const user = JSON.parse(localStorage.getItem('user') || '{}');
 
    React.useEffect(() => {
        const fetchStudentName = async () => {
            if (user.registerNumber) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/byReg/${user.registerNumber}`);
                    if (res.data && res.data.name) {
                        setStudentName(res.data.name);
                        // Also sync back to localStorage if it's different/placeholder
                        if (user.name !== res.data.name) {
                            const updatedUser = { ...user, name: res.data.name };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching student name for layout:", err);
                }
            }
        };
        fetchStudentName();
    }, [user.registerNumber]);

    const mainMenuItems = [
        { path: '/', icon: <Home className="w-5 h-5 shrink-0" />, label: 'Dashboard' },
        { path: '/companies', icon: <Building2 className="w-5 h-5 shrink-0" />, label: 'Companies' },
        { path: '/applications', icon: <FileText className="w-5 h-5 shrink-0" />, label: 'Applications' },
        { path: '/resources', icon: <BookOpen className="w-5 h-5 shrink-0" />, label: 'Resources' },
        { path: '/messages', icon: <MessageSquare className="w-5 h-5 shrink-0" />, label: 'Messages' },
    ];

    const bottomMenuItems = [
        { path: '/settings', icon: <Settings className="w-5 h-5 shrink-0" />, label: 'Settings' },
        { path: '/profile', icon: <User className="w-5 h-5 shrink-0" />, label: 'Profile' },
    ];

    // Route to Title Mapping
    const getHeaderInfo = (pathname) => {
        // Dynamic routes handling (e.g., /companies/123)
        if (pathname.startsWith('/companies/')) {
            if (pathname.includes('/apply')) return { title: 'Apply for Company', subtitle: 'Submit your application' };
            return { title: 'Company Details', subtitle: 'View company information' };
        }
        if (pathname.startsWith('/applications/')) return { title: 'Application Details', subtitle: 'Track your application' };

        switch (pathname) {
            case '/':
                return { title: 'Dashboard', subtitle: null }; // Subtitle handles "Welcome back" logic in Header if null
            case '/companies':
                return { title: 'Companies', subtitle: 'Explore and apply to companies' };
            case '/applications':
                return { title: 'Applications', subtitle: 'Track your application status' };
            case '/resources':
                return { title: 'Resources', subtitle: 'Study materials and preparation guides' };
            case '/messages':
                return { title: 'Messages', subtitle: 'Communications from placement cell' };
            case '/profile':
                return { title: 'My Profile', subtitle: 'Manage your professional profile' };
            case '/settings':
                return { title: 'Settings', subtitle: 'Manage your account preferences' };
            default:
                return { title: 'Placement Portal', subtitle: '' };
        }
    };

    const { title, subtitle } = getHeaderInfo(location.pathname);

    // Toggle for mobile menu
    const handleMenuClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0B1220] overflow-hidden transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                mainMenuItems={mainMenuItems}
                bottomMenuItems={bottomMenuItems}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <Header
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={handleMenuClick}
                    onSearch={setSearchQuery}
                    studentName={studentName || user.name}
                />

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    {/* Pass searchQuery to Outlet context so pages can use it */}
                    <Outlet context={{ searchQuery, isExpanded }} />
                </div>
            </div>
        </div>
    );
};

export default Layout;
