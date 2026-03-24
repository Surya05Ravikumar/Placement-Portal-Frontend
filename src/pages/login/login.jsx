import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, GraduationCap, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import studentImage from '../../assets/download (3).png';
import logoImage from '../../assets/logo.png';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showRegistration, setShowRegistration] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [registrationForm, setRegistrationForm] = useState({
        name: '',
        registerNumber: '',
        department: '',
        year: '2024',
        mobile: '',
        cgpa: '',
        stream: '',
        dateOfBirth: '',
        gender: ''
    });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Fetch user info from Google
                const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                
                if (!googleRes.ok) {
                    throw new Error('Failed to fetch user info from Google');
                }
                
                const userInfo = await googleRes.json();
                console.log('[Login] Google User Info:', userInfo);

                // Verify user existence in DB
                const dbRes = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/users/byEmail?email=${encodeURIComponent(userInfo.email)}`
                );

                if (dbRes.ok) {
                    const dbUser = await dbRes.json();
                    
                    // Check user status
                    if (dbUser.status === 'pending') {
                        alert('Your registration request is pending admin approval.');
                        setLoading(false);
                        return;
                    }
                    if (dbUser.status === 'rejected') {
                        alert('Your access request has been rejected. Please contact the administrator.');
                        setLoading(false);
                        return;
                    }

                    console.log('[Login] DB user found:', dbUser.name);
                    localStorage.setItem('user', JSON.stringify(dbUser));
                    
                    // Proceed with login...
                    try {
                        await fetch(`${import.meta.env.VITE_API_URL}/api/users/${dbUser._id}/login-event`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                deviceInfo: navigator.userAgent.includes('Windows') ? 'Chrome on Windows' : 'Browser',
                                locationInfo: 'Unknown',
                                status: 'success'
                            })
                        });
                    } catch (e) { console.warn(e); }

                    if (userInfo.email === import.meta.env.VITE_ADMIN_EMAIL) {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                } else {
                    // User not found - check for @bitsathy.ac.in
                    if (userInfo.email.toLowerCase().endsWith('@bitsathy.ac.in')) {
                        setPendingEmail(userInfo.email);
                        setRegistrationForm(prev => ({ ...prev, name: userInfo.name || '' }));
                        setShowRegistration(true);
                    } else {
                        const error = await dbRes.json().catch(() => ({}));
                        alert(`Access Denied: ${error.message || 'Only @bitsathy.ac.in emails are allowed.'} (Status: ${dbRes.status})`);
                    }
                }
            } catch (error) {
                console.error('Login Error details:', error);
                alert(`Login failed: ${error.message || 'Please try again.'}`);
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google Login Error:', error);
            alert('Google login failed. Please check your connection.');
            setLoading(false);
        },
    });

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...registrationForm, email: pendingEmail })
            });
            const data = await resp.json();
            if (resp.ok) {
                alert(data.message);
                setShowRegistration(false);
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('A network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-500">
            {/* Main Container */}
            <div className="w-full items-center justify-center max-w-6xl bg-white dark:bg-[#020617] rounded-3xl overflow-hidden shadow-2xl dark:shadow-black/50 border border-transparent dark:border-slate-800 transition-all duration-300">
                <div className="grid items-center justify-center grid-cols-1 lg:grid-cols-2 min-h-[600px]">

                    {/* Left Side - Image Section */}
                    <div className="h-full relative bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-800 p-12 flex flex-col items-center justify-center overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-10 right-10 w-20 h-20 bg-orange-400 dark:bg-orange-500 rounded-full opacity-70 animate-pulse"></div>
                        <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-300 dark:bg-blue-400 rounded-full opacity-50 blur-xl"></div>
                        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white dark:bg-slate-200 rounded-full opacity-30 blur-md"></div>

                        {/* Content */}
                        <div className="relative z-10 text-center">
                            <div className="mb-8">
                                <h2 className="text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                                    Start your career journey,
                                    <br />
                                    explore opportunities!
                                </h2>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <img
                                    src={studentImage}
                                    alt="Student with laptop"
                                    className="relative w-full h-full object-cover rounded-3xl border-4 border-white/30 dark:border-slate-700/50 shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Right Side - Login Section */}
                    <div className="p-12 flex flex-col items-center justify-center bg-white dark:bg-[#020617] transition-colors duration-300">
                        {/* Logo/Brand */}
                        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-800 p-2 border border-gray-100 dark:border-slate-700 shadow-sm">
                                    <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-[#E2E8F0]">Training and Placement</h1>
                            </div>
                        </div>

                        {/* Welcome Text */}
                        <div className="flex flex-col mb-10 items-center justify-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Welcome Back!</h2>
                            <p className="text-gray-500 dark:text-slate-400 font-medium">Sign in to continue your placement journey</p>
                        </div>



                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full mb-8 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-2xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md dark:shadow-black/20"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-blue-600 dark:text-blue-400">Signing in...</span>
                                </div>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-base font-bold">Sign in with Google</span>
                                    <ArrowRight className="w-5 h-5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-blue-500" />
                                </>
                            )}
                        </button>

                        {/* Info Text */}
                        <div className="text-center mb-8">
                            <p className="text-sm text-gray-500 dark:text-slate-500 font-medium">
                                Use your college Google account to sign in
                            </p>
                        </div>



                        {/* Footer */}
                        <div className="text-center mt-auto">
                            <p className="text-[10px] text-gray-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                                © 2026 PlacementHub • ALL RIGHTS RESERVED
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 hide-scrollbar">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Register Account</h3>
                                    <p className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mt-1">{pendingEmail}</p>
                                </div>
                                <button onClick={() => setShowRegistration(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                        value={registrationForm.name}
                                        onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Register Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                        value={registrationForm.registerNumber}
                                        onChange={(e) => setRegistrationForm({ ...registrationForm, registerNumber: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Department</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium cursor-pointer"
                                            value={registrationForm.department}
                                            onChange={(e) => setRegistrationForm({ ...registrationForm, department: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                            <option value="ECE">ECE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="MECH">MECH</option>
                                            <option value="CIVIL">CIVIL</option>
                                            <option value="AIDS">AI & DS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Batch</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="2024"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                            value={registrationForm.year}
                                            onChange={(e) => setRegistrationForm({ ...registrationForm, year: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* New Fields: CGPA, Stream */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">CGPA</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            required
                                            placeholder="8.5"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                            value={registrationForm.cgpa}
                                            onChange={(e) => setRegistrationForm({ ...registrationForm, cgpa: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Stream</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="B.E"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                            value={registrationForm.stream}
                                            onChange={(e) => setRegistrationForm({ ...registrationForm, stream: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* New Fields: DOB, Gender */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                            value={registrationForm.dateOfBirth}
                                            onChange={(e) => setRegistrationForm({ ...registrationForm, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Gender</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium cursor-pointer"
                                            value={registrationForm.gender}
                                            onChange={(e) => setRegistrationForm({ ...registrationForm, gender: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-xl outline-none transition-all dark:text-white font-medium"
                                        value={registrationForm.mobile}
                                        onChange={(e) => setRegistrationForm({ ...registrationForm, mobile: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            Request Access
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;