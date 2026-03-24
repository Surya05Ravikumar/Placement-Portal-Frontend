import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Building2, FileText, Target, AwardIcon
} from 'lucide-react';
import StudentProfileCard from '../../components/student/studentprofile';
import HighlightText from '../../components/common/HighlightText';
import { MetricCard } from '../../components/student/metriccard';
import { CompanyPreviewItem } from '../../components/student/companypreview';
import { ApplicationStatusItem } from '../../components/student/applicationstatus';
import { SectionHeader } from '../../components/student/sectionheader';

// Unused static skills constant removed to use dynamic user skills from backend.

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const PlacementDashboard = () => {
  const { searchQuery } = useOutletContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({});
  const [skills, setSkills] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOffers: { count: 0, companies: [], status: 'unplaced' },
    companiesAttended: 0,
    applications: { total: 0, shortlisted: 0 }
  });
  const [upcomingCompanies, setUpcomingCompanies] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const loggedInUser = JSON.parse(userStr);
        const regNo = loggedInUser.registerNumber || '20CS101'; // Fallback for safety

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const [userRes, companiesRes, appsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/byReg/${regNo}`),
          axios.get(`${API_URL}/api/companies`),
          axios.get(`${API_URL}/api/applications/user/${regNo}`)
        ]);

        const user = userRes.data;
        const allCompanies = companiesRes.data;
        const userApps = appsRes.data;

        setStudentData({
          name: user.name,
          registerNumber: user.registerNumber,
          department: user.department,
          year: user.year,
          cgpa: user.cgpa ? Number(user.cgpa).toFixed(1) : '0.0',
          stream: user.stream || 'N/A',
          placed: userApps.some(app => app.status === 'Selected') || user.placementStatus === 'placed',
          placementStatus: user.placementStatus || 'eligible',
          placedCompany: user.placedCompany || 'N/A',
          package: user.package || 'N/A',
          activityPoints: user.activityPoints?.total || 0,
          certificationCount: user.certifications?.length || 0,
          resumes: user.resumes || []
        });
        setSkills(user.skills || []);

        const shortlistedCount = userApps.filter(a => a.status === 'Shortlisted').length;
        const selectedApps = userApps.filter(a => a.status === 'Selected');

        setMetrics({
          totalOffers: {
            count: selectedApps.length,
            companies: selectedApps.map(a => a.companyName),
            status: selectedApps.length > 0 ? 'placed' : 'unplaced'
          },
          companiesAttended: userApps.length,
          applications: {
            total: userApps.length,
            shortlisted: shortlistedCount
          }
        });

        const now = new Date();
        const normalize = (str) => str?.toString().trim().toUpperCase() || '';
        const userDeptNormalized = normalize(user.department);
        const userPoints = Number(user.activityPoints?.total || 0);
        const userCGPA = parseFloat(user.cgpa) || 0;

        const upcoming = allCompanies.filter(c => {
          const deadline = new Date(c.applicationDeadline || c.deadline);
          const isUpcomingOrOngoing = deadline > now && (c.status === 'upcoming' || c.status === 'ongoing');

          if (!isUpcomingOrOngoing) return false;

          // Check if already applied
          const hasApplied = userApps.some(app => app.company === c._id || app.companyName === c.name);
          if (hasApplied) return false;

          // Eligibility Filters
          const isBranchEligible = !userDeptNormalized || !c.eligibleBranches || c.eligibleBranches.length === 0 ||
            c.eligibleBranches.some(b => normalize(b) === userDeptNormalized || normalize(b) === 'ALL');
          const hasEnoughPoints = Number(c.requiredPoints || 0) === 0 || userPoints >= Number(c.requiredPoints || 0);
          const hasEnoughCGPA = parseFloat(c.minCGPA || 0) <= 0 || userCGPA >= parseFloat(c.minCGPA || 0);

          return isBranchEligible && hasEnoughPoints && hasEnoughCGPA;
        });

        setUpcomingCompanies(upcoming.map(c => ({
          id: c._id,
          company: c.name,
          logo: c.logo,
          role: c.jobRoles?.[0]?.role || 'Various Roles',
          deadline: new Date(c.applicationDeadline || c.deadline).toLocaleDateString()
        })));

        setRecentApplications(userApps.slice(0, 5).map(app => ({
          id: app._id,
          company: app.companyName,
          status: app.status.toLowerCase()
        })));

        setLoading(false);
      } catch (error) {
        console.error("Dashboard DB fetch error", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B1220] transition-colors"><div className="text-xl font-bold text-gray-600 dark:text-slate-400 animate-pulse">Loading Dashboard...</div></div>;

  // Filter functions
  const filteredUpcoming = upcomingCompanies.filter(item =>
    item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = recentApplications.filter(item =>
    item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // New Search Logic including Metrics, Overview, and Profile
  const metricsData = [
    {
      id: 'total-offers',
      title: "Total Offers",
      mainValue: String(metrics.totalOffers.count).padStart(2, '0'),
      subtext: "From different companies",
      icon: <AwardIcon className="w-6 h-6" />,
      variant: "green"
    },
    {
      id: 'companies-attended',
      title: "Companies Attended",
      mainValue: String(metrics.companiesAttended).padStart(2, '0'),
      subtext: "Interviews / tests attended",
      icon: <Building2 className="w-6 h-6" />,
      variant: "orange"
    },
    {
      id: 'applications',
      title: "Applications",
      mainValue: String(metrics.applications.total).padStart(2, '0'),
      subtext: `${metrics.applications.shortlisted} Shortlisted`,
      icon: <FileText className="w-6 h-6" />,
      variant: "purple"
    }
  ];

  const filteredMetrics = metricsData.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subtext.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatStatus = (status) => {
    if (!status) return 'Eligible';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const placementOverviewData = studentData.placed ? [
    { label: "Status", value: 'Placed 🎉' },
    { label: "Company", value: studentData.placedCompany },
    { label: "Package", value: studentData.package },
    { label: "Activity Points", value: studentData.activityPoints }
  ] : [
    { label: "Status", value: formatStatus(studentData.placementStatus) },
    { label: "CGPA", value: studentData.cgpa },
    { label: "Stream", value: studentData.stream },
    { label: "Activity Points", value: studentData.activityPoints }
  ];

  const filteredPlacementOverview = placementOverviewData.filter(p =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.value).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showProfile = !searchQuery ||
    Object.values(studentData).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase())) ||
    skills.some(skill => skill.name.toLowerCase().includes(searchQuery.toLowerCase()));



  const handleResumeDelete = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        const regNo = studentData.registerNumber || JSON.parse(localStorage.getItem('user'))?.registerNumber;
        await axios.delete(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`}/api/users/${regNo}/resumes/${resumeId}`);
        // Refresh local state
        setStudentData(prev => ({
          ...prev,
          resumes: prev.resumes.filter(r => (r._id || r.id).toString() !== resumeId.toString())
        }));
        alert("Resume deleted successfully");
      } catch (err) {
        console.error("Delete failed", err.response?.data || err);
        alert("Failed to delete resume: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>


      {/* Dashboard Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-5 items-start">
          {/* Left/Center Column - Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top 3 Metric Cards */}
            {filteredMetrics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                {filteredMetrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    title={metric.title}
                    mainValue={metric.mainValue}
                    subtext={metric.subtext}
                    icon={metric.icon}
                    variant={metric.variant}
                    searchQuery={searchQuery}
                    onClick={() => {
                      if (metric.id === 'total-offers') navigate('/applications');
                      if (metric.id === 'companies-attended') navigate('/companies');
                      if (metric.id === 'applications') navigate('/applications');
                    }}
                  />
                ))}
              </div>
            )}

            {/* Placement Status Overview */}
            {filteredPlacementOverview.length > 0 && (
              <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors shadow-sm dark:shadow-black/20">
                <SectionHeader
                  icon={<Target className="w-6 h-6 text-blue-600 dark:text-blue-500" />}
                  title="Placement Status Overview"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredPlacementOverview.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-slate-800 transition-colors">
                      <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                        <HighlightText text={item.label} highlight={searchQuery} />
                      </p>
                      <p className="text-gray-900 dark:text-white font-black uppercase tracking-tight text-sm">
                        <HighlightText text={String(item.value)} highlight={searchQuery} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Eligible Companies */}
            <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors shadow-sm dark:shadow-black/20">
              <SectionHeader
                icon={<Building2 className="w-6 h-6 text-blue-600 dark:text-blue-500" />}
                title="Upcoming Eligible Companies"
                action={{
                  label: 'View all companies',
                  onClick: () => navigate('/companies')
                }}
              />
              <div className="space-y-3">
                {filteredUpcoming.length > 0 ? (
                  filteredUpcoming.map((company, index) => (
                    <CompanyPreviewItem
                      key={index}
                      company={company.company}
                      logo={company.logo}
                      role={company.role}
                      deadline={company.deadline}
                      onAction={() => navigate(`/companies/${company.id}/apply`)}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No companies found</p>
                )}
              </div>
            </div>

            {/* Application Status Tracker */}
            <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors shadow-sm dark:shadow-black/20">
              <SectionHeader
                icon={<FileText className="w-6 h-6 text-blue-600 dark:text-blue-500" />}
                title="Application Status Tracker"
                action={{
                  label: 'View all',
                  onClick: () => navigate('/applications')
                }}
              />
              <div className="space-y-2">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app, index) => (
                    <ApplicationStatusItem
                      key={app.id || index}
                      company={app.company}
                      status={app.status}
                      searchQuery={searchQuery}
                      onClick={() => navigate(`/applications/${app.id}`)}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No applications found</p>
                )}
              </div>
            </div>


          </div>

          {/* Right Sidebar Column */}
          {showProfile && (
            <div className="space-y-4 sticky top-9">
              <StudentProfileCard
                student={studentData}
                skills={skills}
                searchQuery={searchQuery}
                onResumeDelete={handleResumeDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;