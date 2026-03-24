import React, { useState, useEffect } from 'react';
import {
  Users, Briefcase, FileText, TrendingUp, Calendar,
  DollarSign, Award, AlertCircle, Plus, Upload,
  Bell, Activity, ChevronRight, Building2, GraduationCap,
  Target, Clock, CheckCircle2, XCircle, Eye, MapPin
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 border border-gray-100 dark:border-slate-800 rounded-xl shadow-2xl">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">
              {entry.name}: <span className="text-gray-900 dark:text-white">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { selectedBatch, setSelectedBatch, batchOptions = [] } = useAdmin();
  const [stats, setStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    yetToPlace: 0,
    companiesCount: 0,
    highestPackage: '0 LPA',
    totalApplications: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [packageData, setPackageData] = useState([]);
  const [upcomingDrives, setUpcomingDrives] = useState([]);

  const fetchData = async () => {
    try {
      // Fetch Overview Stats with batch filter
      const statsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/overview?batch=${selectedBatch}`);
      const statsData = await statsResp.json();
      setStats(statsData.stats);
      setMonthlyData(statsData.monthlyData || []);
      setPackageData(statsData.packageData || []);

      // Fetch Upcoming Companies
      const companiesResp = await fetch(`${import.meta.env.VITE_API_URL}/api/companies?batch=${selectedBatch}`);
      const companiesData = await companiesResp.json();
      const upcoming = companiesData
        .filter(c => c.status === 'upcoming' || c.status === 'ongoing')
        .slice(0, 3)
        .map(c => ({
          id: c._id,
          company: c.name,
          role: c.jobRoles?.[0]?.role || 'Various Roles',
          date: c.driveDate || c.createdAt,
          deadline: c.applicationDeadline,
          departments: c.eligibleBranches || [],
          registered: c.applicationsCount || 0,
          package: c.jobRoles?.[0]?.package ? `${c.jobRoles[0].package} LPA` : null,
          location: c.jobRoles?.[0]?.location || c.location,
          logo: c.name.charAt(0)
        }));
      setUpcomingDrives(upcoming);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="p-8">
        {/* Overview Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Students Placed"
            value={stats?.placedStudents || 0}
            subtext={`${stats?.yetToPlace || 0} yet to place`}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            trend="+0%"
          />
          <StatCard
            title="Highest Package"
            value={stats?.highestPackage || '0 LPA'}
            subtext="Across all roles"
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            trend="+0%"
          />
          <StatCard
            title="Applications Submitted"
            value={stats?.totalApplications || 0}
            subtext="Live portal data"
            icon={<FileText className="w-6 h-6" />}
            color="orange"
            trend="+0%"
          />
          <StatCard
            title="Companies Visited"
            value={stats?.companiesCount || 0}
            subtext="Total active drives"
            icon={<Briefcase className="w-6 h-6" />}
            color="purple"
            trend="+0%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Placement Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Placement Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="month" interval={0} tick={{ fill: 'var(--chart-text)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--chart-text)' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
                <Legend />
                <Line type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={3} name="Placements" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Package Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Package Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={packageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="range" tick={{ fill: 'var(--chart-text)' }} />
                <YAxis tick={{ fill: 'var(--chart-text)' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-grid)', opacity: 0.1 }} />
                <Bar dataKey="count" fill="#f59e0b" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Drives Section */}
        <UpcomingDrivesSection upcomingDrives={upcomingDrives} />
      </div>
    </div>
  );
};

const UpcomingDrivesSection = ({ upcomingDrives = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-slate-700 overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-900/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Upcoming Drives
          </h2>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drives List */}
      <div className="p-6">
        {upcomingDrives.length > 0 ? (
          <div className="space-y-4">
            {upcomingDrives.map((drive) => (
              <div
                key={drive.id}
                onClick={() => navigate(`/admin/companies/${drive.id}`)}
                className="group border-2 border-gray-100 dark:border-slate-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all cursor-pointer bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                    {drive.logo}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{drive.company}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm mb-3">{drive.role}</p>
                        
                        {/* Departments & Package */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {drive.departments.map((dept) => (
                            <span key={dept} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                              {dept}
                            </span>
                          ))}
                          {drive.package && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-500 rounded-full text-xs font-semibold flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ₹{drive.package}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Registration Count */}
                      <div className="text-right flex-shrink-0">
                        <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                            <Users className="w-4 h-4" />
                            <span className="font-bold text-lg">{drive.registered}</span>
                          </div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Registered</p>
                        </div>
                      </div>
                    </div>

                    {/* Date Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Drive Date</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(drive.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Deadline</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(drive.deadline).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {drive.location && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                          <span className="text-sm text-gray-700 dark:text-slate-300">{drive.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Upcoming Drives</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">There are no placement drives scheduled at the moment.</p>
            <button
              onClick={() => navigate('/admin/companies/add')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Schedule New Drive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, subtext, icon, color, trend }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center text-white shadow-md`}>
          {icon}
        </div>
        {trend && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-500 rounded-full text-xs font-semibold">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400">{title}</p>
      <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{subtext}</p>
    </div>
  );
};

export default AdminDashboard;
