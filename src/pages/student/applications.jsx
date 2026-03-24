import React, { useState, useEffect, useMemo, memo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Calendar, Building2 } from 'lucide-react';
import TabSwitcher from '../../components/common/tabswitcher';
import StatusBadge from '../../components/common/statusbadge';
import EmptyState from '../../components/common/emptystate';
import CompanyLogo from '../../components/common/CompanyLogo';

// --- Memoized Table Row for Maximum Performance ---
const ApplicationRow = memo(({ app, index, navigate, getStatusInfo, onViewDetails }) => {
  return (
    <tr
      onClick={() => navigate(`/applications/${app._id}`)}
      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group border-b border-gray-100 dark:border-slate-800"
    >
      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 dark:text-slate-500">
        {index + 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <CompanyLogo 
            logo={app.displayLogo} 
            name={app.displayCompanyName} 
            className="w-10 h-10" 
            iconSize="w-5 h-5"
          />
          <div className="ml-3">
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {app.displayCompanyName}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 font-medium">
        {app.displayRole}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
        {app.displayPackage}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <span className="text-sm font-medium">{app.displayDate}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 font-bold uppercase tracking-tight">
        {app.currentRound || 'Applied'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge
          {...getStatusInfo(app.status)}
          size="sm"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(app._id);
          }}
          className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all font-bold text-xs uppercase tracking-wider flex items-center gap-1 ml-auto border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </td>
    </tr>
  );
});

const Applications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Status mapping for the badge
  const getStatusInfo = useMemo(() => (status) => {
    const statusMap = {
      'applied': { status: 'applied', label: 'Applied' },
      'shortlisted': { status: 'shortlisted', label: 'Shortlisted' },
      'interviewed': { status: 'interviewed', label: 'Interviewed' },
      'in-progress': { status: 'in-progress', label: 'In Progress' },
      'pending': { status: 'pending', label: 'Pending' },
      'selected': { status: 'selected', label: 'Selected' },
      'rejected': { status: 'rejected', label: 'Rejected' }
    };
    return statusMap[status?.toLowerCase()] || statusMap['applied'];
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const loggedInUser = JSON.parse(userStr);
        const regNo = loggedInUser.registerNumber || '20CS101';

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/user/${regNo}`);

        // PRE-PROCESS DATA FOR PERFORMANCE
        const processedApps = response.data.map(app => {
          const isPopulated = app.company && typeof app.company === 'object';
          
          // Role selection: prioritize app level, then company jobRoles
          const displayRole = app.role || (isPopulated ? app.company.jobRoles?.[0]?.role : 'Various Roles');
          
          // Package calculation: prioritize company's jobRole (Base + Bonus)
            const pkgValue = (() => {
                if (app.company?.jobRoles?.[0]) {
                    return app.company.jobRoles[0].package;
                }
                return app.package || 'TBD';
            })();
          
          return {
            ...app,
            displayCompanyName: app.companyName,
            displayLogo: isPopulated ? app.company.logo : (app.companyName?.charAt(0) || '?'),
            displayRole: displayRole,
            displayPackage: pkgValue && pkgValue !== 'N/A' 
              ? (isNaN(pkgValue) ? pkgValue : `₹${parseFloat(pkgValue).toLocaleString()}`) 
              : 'N/A',
            displayDate: new Date(app.appliedDate).toLocaleDateString(),
            // Cache lowercase status for faster filtering
            statusLower: app.status?.toLowerCase() || 'applied'
          };
        });

        setAllApplications(processedApps);
      } catch (error) {
        console.error("Failed fetching apps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [navigate]);

  // Handle tab change - reset to page 1
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  // Consolidate tab counts, filtering, and PAGINATION logic into useMemo
  const { paginatedApplications, stats, tabData, totalPages } = useMemo(() => {
    // 1. Calculate stats for ALL applications
    const totalApps = allApplications.length;
    const inProgressApps = allApplications.filter(a => ['in-progress', 'applied', 'shortlisted', 'interviewed', 'pending'].includes(a.statusLower)).length;
    const selectedApps = allApplications.filter(a => a.statusLower === 'selected').length;
    const rejectedApps = allApplications.filter(a => a.statusLower === 'rejected').length;

    // 2. Filter applications based on activeTab
    let filtered = allApplications;
    if (activeTab !== 'all') {
      filtered = allApplications.filter(app => {
        if (activeTab === 'in-progress') {
          return ['in-progress', 'applied', 'shortlisted', 'interviewed', 'pending'].includes(app.statusLower);
        }
        return app.statusLower === activeTab;
      });
    }

    // 3. Paginate the filtered results
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    const tabs = [
      { id: 'all', label: 'All Applications', count: totalApps },
      { id: 'in-progress', label: 'In Progress', count: inProgressApps },
      { id: 'selected', label: 'Selected', count: selectedApps },
      { id: 'rejected', label: 'Rejected', count: rejectedApps }
    ];

    return {
      paginatedApplications: paginated,
      stats: { totalApps, inProgressApps, selectedApps, rejectedApps },
      tabData: tabs,
      totalPages: totalPages === 0 ? 1 : totalPages
    };
  }, [activeTab, allApplications, currentPage]);

  const handleViewDetails = (id) => {
    navigate(`/applications/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0B1220] transition-colors duration-300">
      <div className="p-8">
        {/* Summary Stats */}
        {allApplications.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.totalApps} icon={<FileText />} color="blue" />
            <StatCard label="In Progress" value={stats.inProgressApps} icon={<Building2 />} color="yellow" />
            <StatCard label="Selected" value={stats.selectedApps} icon={<Building2 />} color="green" />
            <StatCard label="Rejected" value={stats.rejectedApps} icon={<Building2 />} color="red" />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <TabSwitcher
            tabs={tabData}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Loading applications...</p>
            </div>
          ) : paginatedApplications.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-16 h-16" />}
              title="No Applications"
              message="You haven't applied to any companies in this category."
              action={activeTab !== 'all' ? null : {
                label: 'Browse Companies',
                onClick: () => navigate('/companies')
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                    <tr>
                      {['S.No', 'Company', 'Role', 'Package', 'Date', 'Current Round', 'Status', 'Action'].map((head) => (
                        <th key={head} className={`px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest ${head === 'Action' ? 'text-right' : ''}`}>
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#020617] divide-y divide-gray-100 dark:divide-slate-800">
                    {paginatedApplications.map((app, index) => (
                      <ApplicationRow
                        key={app._id}
                        app={app}
                        index={(currentPage - 1) * itemsPerPage + index}
                        navigate={navigate}
                        getStatusInfo={getStatusInfo}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                  Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = memo(({ label, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    yellow: 'bg-yellow-50 dark:bg-amber-500/10 text-yellow-600 dark:text-amber-400 border-yellow-100 dark:border-amber-500/20',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
  };

  return (
    <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4 transition-all hover:shadow-lg dark:hover:shadow-blue-900/10 group cursor-default">
      <div className={`w-12 h-12 rounded-xl border ${colors[color]} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">{value}</p>
        <p className="text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest text-[10px]">{label}</p>
      </div>
    </div>
  );
});


export default Applications;