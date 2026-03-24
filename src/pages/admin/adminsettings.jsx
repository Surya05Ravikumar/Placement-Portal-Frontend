import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Bell, Lock, Shield, Settings as SettingsIcon,
  CheckCircle2, Mail, Smartphone, Save,
  Users2, Building2, UserCheck, Wrench, Layers,
  ChevronRight, Eye, EyeOff, RotateCcw
} from 'lucide-react';

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('student');
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin Settings State
  const [settings, setSettings] = useState({
    allowIneligible: false,
    allowMultipleApps: false,
    enableFCFS: true,
    enableOpenApps: false,
    autoCloseDrive: true,
    notifyNewCompany: true,
    notifyAccepted: true,
    notifyResult: true,
    autoMarkPlaced: true,
    requireResume: true,
    allowEditProfile: true,
    allowWithdraw: true,
    maintenanceMode: false,
  });

  const sections = [
    { id: 'student', label: 'Registration', icon: <Users2 className="w-5 h-5" /> },
    { id: 'appmode', label: 'App Mode', icon: <Layers className="w-5 h-5" /> },
    { id: 'drive', label: 'Company Drive', icon: <Building2 className="w-5 h-5" /> },
    { id: 'notify', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'status', label: 'Student Status', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'docs', label: 'Verification', icon: <Shield className="w-5 h-5" /> },
    { id: 'system', label: 'System', icon: <Wrench className="w-5 h-5" /> },
  ];

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`);
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/settings`, settings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-inter">

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Save Success Message */}
          {saveMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
              <p className="text-green-800 dark:text-green-400 font-medium">{saveMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === section.id
                        ? 'bg-blue-50 dark:bg-[#020617] text-blue-600 dark:text-[#3B82F6] font-semibold'
                        : 'text-gray-600 dark:text-[#94A3B8] hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                        }`}
                    >
                      {section.icon}
                      <span className="text-sm">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">

                {/* Registration Section */}
                {activeSection === 'student' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Registration Settings</h2>
                        <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Manage player registration and eligibility</p>
                      </div>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">Allow Ineligible Students</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Students who don't meet criteria can still submit applications</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.allowIneligible}
                          onChange={(e) => updateSetting('allowIneligible', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">Allow Multiple Applications</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Students can apply to further companies even if selected</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.allowMultipleApps}
                          onChange={(e) => updateSetting('allowMultipleApps', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* App Mode Section */}
                {activeSection === 'appmode' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Application Mode</h2>
                      <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Configure global application behavior</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">Allow Unlimited Applications</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">No cap on total student applications per drive</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.enableOpenApps}
                          onChange={(e) => updateSetting('enableOpenApps', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Drive Section */}
                {activeSection === 'drive' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Company Drive</h2>
                      <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Manage company-specific drive settings</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">Auto-Close After Deadline</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Automatically stop accepting applications after deadline</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.autoCloseDrive}
                          onChange={(e) => updateSetting('autoCloseDrive', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notify' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Notifications</h2>
                      <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Manage portal-wide alerts and updates</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">New Company Alerts</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Notify students when new drives are posted</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifyNewCompany}
                          onChange={(e) => updateSetting('notifyNewCompany', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Status Section */}
                {activeSection === 'status' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Student Status</h2>
                      <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Configure automated status updates</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">Auto-Mark as Placed</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Students are automatically marked as placed upon selection</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.autoMarkPlaced}
                          onChange={(e) => updateSetting('autoMarkPlaced', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                {activeSection === 'docs' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">Document Verification</h2>
                      <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Configure document upload requirements</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#E2E8F0]">Require Valid Resume</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Students must have a verified resume to apply</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.requireResume}
                          onChange={(e) => updateSetting('requireResume', e.target.checked)}
                          className="w-5 h-5 text-blue-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* System Section */}
                {activeSection === 'system' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F1F5F9]">System Controls</h2>
                      <p className="text-gray-600 dark:text-[#94A3B8] text-sm mt-1">Portal-wide management settings</p>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020617] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0F172A] transition-colors border border-transparent dark:border-slate-800 group">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-red-500 dark:text-red-500">Maintenance Mode</p>
                          <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Disable student access for maintenance</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                          className="w-5 h-5 text-red-600 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
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
    </div>
  );
};

export default AdminSettings;
