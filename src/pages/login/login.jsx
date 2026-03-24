import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, GraduationCap } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import studentImage from '../../assets/download (3).png';
import logoImage from '../../assets/logo.png';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
                    console.log('[Login] DB user found:', dbUser.name);

                    // Store DB record and proceed
                    localStorage.setItem('user', JSON.stringify(dbUser));
                    
                    // Record login event
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
                    } catch (e) {
                        console.warn('[Login] Failed to record login event:', e);
                    }

                    // Redirect
                    if (userInfo.email === import.meta.env.VITE_ADMIN_EMAIL) {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                } else {
                    const error = await dbRes.json().catch(() => ({}));
                    alert(`Access Denied: ${error.message || 'Your email is not registered in the system.'} (Status: ${dbRes.status})`);
                }
            } catch (error) {
                console.error('Login Error:', error);
                alert('Login failed. Please try again.');
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
        </div>

    );
};

export default Login;