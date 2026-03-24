import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Building2, Camera, Trash2,
    Lock, Eye, EyeOff, Save, X, Edit2, Shield, Clock, CheckCircle2
} from 'lucide-react';

const AdminProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [profileData, setProfileData] = useState({
        fullName: 'Dr. Ramesh Kumar',
        designation: 'Chief Placement Officer',
        email: 'placement@college.edu.in',
        phone: '+91 98765 43210',
        department: 'Corporate Relations & Placement',
        officeLocation: 'Academic Block A, Suite 204',
        photo: null
    });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [loginHistory, setLoginHistory] = useState([
        { _id: '1', date: new Date('2026-03-13T10:30:00'), device: 'Chrome on Windows 11', location: 'Chennai, India', status: 'success', ip: '192.168.1.45' },
        { _id: '2', date: new Date('2026-03-12T15:45:00'), device: 'Safari on iPhone 15', location: 'Chennai, India', status: 'success', ip: '192.168.1.12' },
        { _id: '3', date: new Date('2026-03-11T09:20:00'), device: 'Chrome on Windows 11', location: 'Chennai, India', status: 'failed', ip: '192.168.1.45' }
    ]);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const storedUser = JSON.parse(userStr);
                
                // Fetch fresh data from backend
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/byEmail?email=${storedUser.email}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setProfileData({
                        fullName: data.name || '',
                        designation: data.designation || 'Placement Officer',
                        email: data.email || '',
                        phone: data.phone || '',
                        department: data.department || '',
                        officeLocation: data.officeLocation || 'Admin Block',
                        photo: data.photo || null
                    });
                    setTwoFactorEnabled(data.twoFactorEnabled || false);
                    setLoginHistory(data.loginHistory || []);
                }
            } catch (error) {
                console.error("Failed to fetch admin profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast('Please fill all password fields', 'error'); return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error'); return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                showToast('Password changed successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const err = await response.json();
                showToast(err.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            showToast('Error updating password', 'error');
        }
    };

    const handleToggle2FA = async () => {
        const newState = !twoFactorEnabled;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/toggle-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: newState })
            });
            if (response.ok) {
                setTwoFactorEnabled(newState);
                showToast(`2FA ${newState ? 'enabled' : 'disabled'} successfully!`);
            }
        } catch (error) {
            showToast('Failed to update 2FA settings', 'error');
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('File size must be under 2MB', 'error'); return; }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData({ ...profileData, photo: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const data = await response.json();
                showToast('Profile updated successfully!');
                setIsEditing(false);
                
                // Update local storage to reflect changes
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                showToast('Failed to update profile', 'error');
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            showToast('Error saving profile', 'error');
        }
    };


    const initials = profileData.fullName.split(' ').map(n => n[0]).join('');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-transparent flex flex-col font-inter">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-50 px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {toast.msg}
                </div>
            )}

            <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 p-8 flex flex-col items-center hover:shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-shadow relative">
                        <div className="absolute top-4 right-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Edit Profile"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Cancel"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                                        title="Save Changes"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            {profileData.photo ? (
                                <img
                                    src={profileData.photo}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 dark:border-slate-700 shadow-inner"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-blue-50 dark:border-slate-700 shadow-inner">
                                    {initials}
                                </div>
                            )}
                            {isEditing && (
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                </label>
                            )}
                        </div>

                        <div className="mt-6 text-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">{profileData.fullName}</h2>
                            <p className="text-gray-500 dark:text-[#94A3B8] text-sm font-medium">{profileData.designation}</p>
                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-[#1E40AF]/20 text-blue-700 dark:text-[#BFDBFE] rounded-full text-xs font-bold tracking-wider uppercase border border-transparent dark:border-blue-900/50">
                                Administrator
                            </div>
                        </div>

                        <div className="mt-8 w-full space-y-3">
                            {[
                                { icon: <Mail className="w-4 h-4" />, val: profileData.email },
                                { icon: <Phone className="w-4 h-4" />, val: profileData.phone },
                                { icon: <MapPin className="w-4 h-4" />, val: profileData.officeLocation },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#020617] rounded-lg border border-gray-100 dark:border-slate-800">
                                    <span className="text-blue-600">{item.icon}</span>
                                    <span className="text-sm text-gray-600 dark:text-[#CBD5F5] truncate">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Forms & Security */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Details Card */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-shadow">
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#020617]">
                            <h3 className="font-bold text-gray-900 dark:text-[#F1F5F9] flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                Personal Details
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Full Name', key: 'fullName', icon: <User className="w-4 h-4" />, type: 'text' },
                                { label: 'Designation', key: 'designation', icon: <Building2 className="w-4 h-4" />, type: 'text' },
                                { label: 'Email Address', key: 'email', icon: <Mail className="w-4 h-4" />, type: 'email' },
                                { label: 'Phone Number', key: 'phone', icon: <Phone className="w-4 h-4" />, type: 'tel' },
                                { label: 'Department', key: 'department', icon: <Building2 className="w-4 h-4" />, type: 'text' },
                                { label: 'Office Location', key: 'officeLocation', icon: <MapPin className="w-4 h-4" />, type: 'text' },
                            ].map(({ label, key, icon, type }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                {icon}
                                            </div>
                                            <input
                                                type={type}
                                                value={profileData[key]}
                                                onChange={e => setProfileData({ ...profileData, [key]: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#020617] border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-2.5 bg-gray-50/50 dark:bg-[#020617] rounded-lg border border-transparent dark:border-slate-800 font-medium text-gray-700 dark:text-[#CBD5F5]">
                                            <span className="text-blue-600">{icon}</span>
                                            <span className="text-sm">{profileData[key]}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-shadow">
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#020617]">
                            <h3 className="font-bold text-gray-900 dark:text-[#F1F5F9] flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600" />
                                Account Security
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            {/* Password Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Current Password', key: 'currentPassword', show: showPassword.current, toggle: () => setShowPassword({ ...showPassword, current: !showPassword.current }) },
                                    { label: 'New Password', key: 'newPassword', show: showPassword.new, toggle: () => setShowPassword({ ...showPassword, new: !showPassword.new }) },
                                    { label: 'Confirm Password', key: 'confirmPassword', show: showPassword.confirm, toggle: () => setShowPassword({ ...showPassword, confirm: !showPassword.confirm }) },
                                ].map(({ label, key, show, toggle }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                                        <div className="relative">
                                            <input
                                                type={show ? 'text' : 'password'}
                                                value={passwordData[key]}
                                                onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-[#020617] border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-[#E2E8F0] rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                            <button
                                                onClick={toggle}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <button
                                onClick={handleChangePassword}
                                className="px-6 py-2.5 bg-gray-900 dark:bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                            >
                                <Lock className="w-4 h-4" />
                                Update Security Credentials
                            </button>

                            <hr className="border-gray-100 dark:border-slate-800" />

                            {/* 2FA Section */}
                            <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-[#020617] rounded-xl border border-blue-100 dark:border-slate-800">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                        <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400 dark:text-[#64748B]'}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-[#F1F5F9]">Two-Factor Authentication</h4>
                                        <p className="text-gray-500 dark:text-[#94A3B8] text-xs mt-1">
                                            {twoFactorEnabled ? 'Your account is protected with 2FA.' : 'Add an extra layer of security to your account.'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggle2FA}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${twoFactorEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-600"}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${twoFactorEnabled ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log Card */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-shadow">
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#020617]">
                            <h3 className="font-bold text-gray-900 dark:text-[#F1F5F9] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                Login History
                            </h3>
                        </div>
                        <div className="p-8 space-y-4">
                            {loginHistory.length === 0 ? (
                                <p className="text-center text-gray-500 py-4 text-sm whitespace-pre-wrap">No login history recorded yet.</p>
                            ) : (
                                loginHistory.map((a, i) => (
                                    <div key={a._id || i} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${i === 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30' : 'bg-gray-50/50 dark:bg-[#0F172A] border-transparent dark:border-transparent hover:border-gray-200 dark:hover:border-slate-700'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]">{a.device}</p>
                                                <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">
                                                    {a.location || 'Unknown Location'} · {new Date(a.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                                {a.ip && <p className="text-[10px] text-gray-400 font-mono mt-0.5">IP: {a.ip}</p>}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${a.status === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                            {a.status || 'Success'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
