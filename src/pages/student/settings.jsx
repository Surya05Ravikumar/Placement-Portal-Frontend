import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Lock, Eye, EyeOff,
  Moon, Sun, Globe, Shield, Mail, Smartphone, Save,
  CheckCircle2, AlertCircle, Filter
} from 'lucide-react';


const Settings = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [saveMessage, setSaveMessage] = useState('');

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newCompanyAlerts: true,
    applicationUpdates: true,
    deadlineReminders: true,
    placementCellMessages: true,
    weeklyDigest: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'placement-cell', // 'public', 'placement-cell', 'private'
    showEmail: false,
    showPhone: false,
    showResume: true
  });

  // Security Settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: 'light', // 'light', 'dark', 'system'
    language: 'en',
    fontSize: 'medium' // 'small', 'medium', 'large'
  });

  // Email Preferences
  const [emailPrefs, setEmailPrefs] = useState({
    dailyDigest: false,
    weeklyReport: true,
    monthlyNewsletter: false,
    companyRecommendations: true
  });

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Sun className="w-5 h-5" /> },
    { id: 'email', label: 'Email Preferences', icon: <Mail className="w-5 h-5" /> }
  ];



  const handlePasswordChange = () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      alert('Please fill all password fields');
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (security.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // console.log('Changing password...');
    setSaveMessage('Password changed successfully!');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300">


      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Save Success Message */}
          {saveMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl flex items-center gap-3 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-300 font-bold uppercase tracking-tight text-sm">{saveMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
                <nav className="space-y-1.5">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black shadow-sm border border-blue-100 dark:border-blue-500/20'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 border border-transparent'
                        }`}
                    >
                      <div className={`${activeSection === section.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors'}`}>
                        {section.icon}
                      </div>
                      <span className="text-sm uppercase tracking-widest">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm transition-colors animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Notification Settings</h2>
                      <p className="text-gray-500 dark:text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest text-[10px]">Manage how you receive notifications</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Notification Channels */}
                    <div>
                      <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Notification Channels</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-500/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors shadow-sm">
                              <Mail className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">Email Notifications</p>
                              <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Receive updates via email</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.emailNotifications}
                            onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700"
                          />
                        </label>

                        <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-500/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors shadow-sm">
                              <Bell className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">Push Notifications</p>
                              <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Receive browser notifications</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.pushNotifications}
                            onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Notification Types */}
                    <div className="pt-4">
                      <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">What to notify me about</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'newCompanyAlerts', label: 'New Company Alerts' },
                          { id: 'applicationUpdates', label: 'Application Updates' },
                          { id: 'deadlineReminders', label: 'Deadline Reminders' },
                          { id: 'placementCellMessages', label: 'Placement Cell Messages' }
                        ].map((type) => (
                          <label key={type.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 group">
                            <span className="text-gray-700 dark:text-slate-300 font-bold uppercase tracking-tight text-xs">{type.label}</span>
                            <input
                              type="checkbox"
                              checked={notifications[type.id]}
                              onChange={(e) => setNotifications({ ...notifications, [type.id]: e.target.checked })}
                              className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy */}
              {activeSection === 'privacy' && (
                <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm transition-all animate-in fade-in slide-in-from-right-4">
                  <div className="mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Privacy Settings</h2>
                    <p className="text-gray-500 dark:text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest text-[10px]">Control who can see your information</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border-2 border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 cursor-pointer transition-all shadow-sm">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="placement-cell"
                        checked={privacy.profileVisibility === 'placement-cell'}
                        onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                        className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">Placement Cell Only</p>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 rounded">Recommended</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Only placement cell administrators and authorized companies can view your detailed profile.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm transition-all animate-in fade-in slide-in-from-right-4">
                  <div className="mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Settings</h2>
                    <p className="text-gray-500 dark:text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest text-[10px]">Manage your password and security preferences</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={security.currentPassword}
                              onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              {showCurrentPassword ?
                                <EyeOff className="w-4 h-4 text-gray-400 dark:text-slate-600" /> :
                                <Eye className="w-4 h-4 text-gray-400 dark:text-slate-600" />
                              }
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={security.newPassword}
                              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              {showNewPassword ?
                                <EyeOff className="w-4 h-4 text-gray-400 dark:text-slate-600" /> :
                                <Eye className="w-4 h-4 text-gray-400 dark:text-slate-600" />
                              }
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-slate-600 font-bold uppercase tracking-tight mt-1.5">Must be at least 8 characters long</p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={security.confirmPassword}
                              onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              {showConfirmPassword ?
                                <EyeOff className="w-4 h-4 text-gray-400 dark:text-slate-600" /> :
                                <Eye className="w-4 h-4 text-gray-400 dark:text-slate-600" />
                              }
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handlePasswordChange}
                          className="w-full md:w-auto px-8 py-3.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-5 shadow-sm transition-colors">
                      <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-3 uppercase tracking-tight text-sm">Password Requirements</h4>
                      <ul className="text-xs text-blue-800/70 dark:text-blue-400/70 space-y-2 font-medium">
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> At least 8 characters long</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> Contains uppercase and lowercase letters</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> Contains at least one number</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> Contains at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeSection === 'appearance' && (
                <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm transition-all animate-in fade-in slide-in-from-right-4">
                  <div className="mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Appearance</h2>
                      <p className="text-gray-500 dark:text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest text-[10px]">Customize how the portal looks</p>
                    </div>

                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Theme</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <label className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${appearance.theme === 'light'
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10 shadow-md ring-4 ring-blue-500/10'
                          : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:border-blue-200 dark:hover:border-slate-700 active:scale-95'
                          }`}>
                          <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={appearance.theme === 'light'}
                            onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                            className="sr-only"
                          />
                          <Sun className={`w-10 h-10 ${appearance.theme === 'light' ? 'text-blue-600 dark:text-blue-400 animate-in spin-in-180 duration-500' : 'text-gray-400 dark:text-slate-600 group-hover:text-amber-500 transition-colors'}`} />
                          <p className={`font-black uppercase tracking-widest text-[10px] ${appearance.theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-500'}`}>Light Mode</p>
                          {appearance.theme === 'light' && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />}
                        </label>

                        <label className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${appearance.theme === 'dark'
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10 shadow-md ring-4 ring-blue-500/10'
                          : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:border-blue-200 dark:hover:border-slate-700 active:scale-95'
                          }`}>
                          <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={appearance.theme === 'dark'}
                            onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                            className="sr-only"
                          />
                          <Moon className={`w-10 h-10 ${appearance.theme === 'dark' ? 'text-blue-600 dark:text-blue-400 animate-in slide-in-from-top-4 duration-500' : 'text-gray-400 dark:text-slate-600 group-hover:text-indigo-400 transition-colors'}`} />
                          <p className={`font-black uppercase tracking-widest text-[10px] ${appearance.theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-500'}`}>Dark Mode</p>
                          {appearance.theme === 'dark' && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />}
                        </label>
                      </div>
                    </div>


                  </div>
                </div>
              )}

              {/* Email Preferences */}
              {activeSection === 'email' && (
                <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm transition-all animate-in fade-in slide-in-from-right-4">
                  <div className="mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Email Preferences</h2>
                    <p className="text-gray-500 dark:text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest text-[10px]">Manage your email subscriptions</p>
                  </div>

                  <div className="space-y-4">

                    <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-500/20 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 group">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Monthly Newsletter</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Placement tips and success stories</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.monthlyNewsletter}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, monthlyNewsletter: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </label>

                    <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-500/20 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 group">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Company Recommendations</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Get personalized company suggestions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.companyRecommendations}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, companyRecommendations: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;