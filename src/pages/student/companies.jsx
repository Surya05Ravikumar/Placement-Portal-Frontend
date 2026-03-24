import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, ExternalLink, Building2, Filter, Download, Upload, ChevronRight } from 'lucide-react';
import TabSwitcher from '../../components/common/tabswitcher';
import FilterSidebar from '../../components/common/FilterSidebar';
import StatusBadge from '../../components/common/statusbadge';
import EmptyState from '../../components/common/emptystate';
import Modal from '../../components/common/Modal';
import HighlightText from '../../components/common/HighlightText';
import CompanyLogo from '../../components/common/CompanyLogo';
import Timeline from '../../components/common/Timeline';
import { MapPin } from 'lucide-react';

// We will load companies from the API in the component
const Companies = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [allCompanies, setAllCompanies] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const loggedInUser = userStr ? JSON.parse(userStr) : null;
        const regNo = loggedInUser?.registerNumber;

        // console.log('[Companies] Logged in user from localStorage:', loggedInUser);
        console.log('[Companies] Register number:', regNo);

        const [companiesRes, appsRes, userRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`}/api/companies`).catch(() => ({ data: [] })),
          regNo != null ? axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`}/api/applications/user/${regNo}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          regNo != null ? axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`}/api/users/byReg/${regNo}`).catch(() => ({ data: null })) : Promise.resolve({ data: null })
        ]);

        // Use DB-fresh data from API; fall back to localStorage (clean DB data stored at login)
        const apiUser = userRes.data;
        const baseUser = apiUser || loggedInUser;

        const mergedUser = baseUser
          ? {
            ...baseUser,
            department: baseUser.department || baseUser.dept || '',
            cgpa: baseUser.cgpa || baseUser.gpa || '0.00',
            // CRITICAL: keep activityPoints as the FULL object {total, max, badgeLevel}
            // never reduce it to just .total (a number) — that breaks eligibility checks
            activityPoints:
              baseUser.activityPoints && typeof baseUser.activityPoints === 'object'
                ? baseUser.activityPoints
                : { total: Number(baseUser.activityPoints) || 0, max: 150, badgeLevel: 'Bronze' },
          }
          : null;

        console.log('[Companies] Eligibility data —',
          'dept:', mergedUser?.department,
          '| cgpa:', mergedUser?.cgpa,
          '| activityPoints:', mergedUser?.activityPoints?.total
        );

        setAllCompanies(companiesRes.data);
        setUserApplications(appsRes.data);
        setCurrentUser(mergedUser);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load placement data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [activeFilters, setActiveFilters] = useState({
    type: '',
    package: { min: '', max: '' },
    eligibility: ''
  });

  // Tabs configuration
  const tabs = [
    { id: 'all', label: 'All Companies', count: 15 },
    { id: 'upcoming', label: 'Upcoming', count: 8 },
    { id: 'passed', label: 'Passed', count: 7 }
  ];

  // Filter configuration
  const filters = [
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'IT', label: 'IT' },
        { value: 'Core', label: 'Core' }
      ]
    },
    {
      id: 'eligibility',
      label: 'Eligibility',
      type: 'select',
      options: [
        { value: 'eligible', label: 'Eligible' },
        { value: 'not-eligible', label: 'Not Eligible' }
      ]
    },
    {
      id: 'package',
      label: 'Package (LPA)',
      type: 'range'
    }
  ];


  useEffect(() => {
    const timeout = setTimeout(() => {
      let filtered = [...allCompanies];

      // Use the fetched currentUser data for eligibility checks
      const userDept = currentUser?.department || '';

      filtered = filtered.map(company => {
        // Calculate status based on applicationDeadline if not explicitly provided or if it's ongoing/upcoming
        let status = company.status || 'upcoming';
        if (company.applicationDeadline && new Date(company.applicationDeadline) < new Date() && status !== 'completed') {
          status = 'passed';
        }

        // For the student list view, we show the first job role's package and the list of roles
        const primaryRole = company.jobRoles?.[0] || {};
        const allRoles = company.jobRoles?.map(jr => jr.role).join(', ') || 'Various Roles';
        const displayPackage = primaryRole.package || 'TBD';

        // --- BRANCH CHECK ---
        // If user dept is unknown, give benefit of doubt (eligible)
        const normalize = (str) => str?.toString().trim().toUpperCase() || '';
        const userDeptNormalized = normalize(userDept);
        const isBranchEligible =
          !userDeptNormalized ||                          // if we don't know dept, pass
          !company.eligibleBranches ||
          company.eligibleBranches.length === 0 ||
          company.eligibleBranches.some(b => {
            const nb = normalize(b);
            return nb === userDeptNormalized || nb === 'ALL' || nb === 'ALL BRANCHES';
          });

        // --- ACTIVITY POINTS CHECK ---
        // Company schema has default 75. Only enforce if > 0.
        const userPoints = Number(currentUser?.activityPoints?.total || 0);
        const requiredPoints = Number(company.requiredPoints || 0);
        const hasEnoughPoints = requiredPoints === 0 || userPoints >= requiredPoints;

        // --- CGPA CHECK ---
        // Only enforce if company explicitly sets minCGPA > 0
        const userCGPA = parseFloat(currentUser?.cgpa) || 0;
        const minCGPA = parseFloat(company.minCGPA) || 0;
        const hasEnoughCGPA = minCGPA <= 0 || userCGPA >= minCGPA;

        // --- PASSING YEAR CHECK ---
        const userYear = Number(currentUser?.year || 0);
        const companyYear = Number(company.passingYear || 0);
        const hasMatchingYear = companyYear === 0 || userYear === companyYear;

        const isEligible = isBranchEligible && hasEnoughPoints && hasEnoughCGPA && hasMatchingYear;

        // Diagnostic message for why a student isn't eligible
        let eligibilityReasons = [];
        if (!isBranchEligible) eligibilityReasons.push(`Dept (${userDept}) not in eligible list.`);
        if (!hasEnoughPoints) eligibilityReasons.push(`Need ${requiredPoints} pts, you have ${userPoints}.`);
        if (!hasEnoughCGPA) eligibilityReasons.push(`Need ${minCGPA} CGPA, you have ${userCGPA}.`);
        if (!hasMatchingYear) eligibilityReasons.push(`Batch (${userYear}) does not match company requirement (${companyYear}).`);

        const eligibilityReason = isEligible ? 'You are eligible!' : eligibilityReasons.join(' ');

        // Map application status from real data
        const application = userApplications.find(a => a.company === company._id || a.companyName === company.name);

        return {
          ...company,
          role: allRoles,
          package: displayPackage,
          status: status,
          applicationStatus: application ? application.status.toLowerCase() : 'not-applied',
          eligible: isEligible,
          eligibilityReason: eligibilityReason,
          eligibilityPoints: requiredPoints,
          userPoints: userPoints,
          type: company.industry || 'Unknown' // Map industry to type
        };
      });

      // Apply search query
      if (searchQuery) {
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by tab
      if (activeTab === 'upcoming') {
        filtered = filtered.filter(c => c.status === 'upcoming' || c.status === 'ongoing');
      } else if (activeTab === 'passed') {
        filtered = filtered.filter(c => c.status === 'completed' || c.status === 'passed');
      }

      // Apply other filters (type, package, etc.)
      if (activeFilters.type) {
        filtered = filtered.filter(c => c.industry === activeFilters.type);
      }

      if (activeFilters.eligibility) {
        filtered = filtered.filter(c =>
          activeFilters.eligibility === 'eligible' ? c.eligible : !c.eligible
        );
      }

      if (activeFilters.package.min) {
        filtered = filtered.filter(c => {
          const val = parseFloat(c.package.toString().replace(/[^0-9.]/g, ''));
          return val >= parseFloat(activeFilters.package.min);
        });
      }

      if (activeFilters.package.max) {
        filtered = filtered.filter(c => {
          const val = parseFloat(c.package.toString().replace(/[^0-9.]/g, ''));
          return val <= parseFloat(activeFilters.package.max);
        });
      }

      setCompanies(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeTab, activeFilters, searchQuery, allCompanies, userApplications, currentUser]); // Depend on currentUser as well

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({
      type: '',
      package: { min: '', max: '' },
      eligibility: ''
    });
  };

  const getApplicationStatusBadge = (status) => {
    const statusMap = {
      'not-applied': { status: 'neutral', label: 'Not Applied' },
      'applied': { status: 'applied', label: 'Applied' },
      'in-progress': { status: 'in-progress', label: 'In Progress' },
      'selected': { status: 'selected', label: 'Selected' },
      'shortlisted': { status: 'shortlisted', label: 'Shortlisted' },
      'rejected': { status: 'rejected', label: 'Rejected' }
    };
    return statusMap[status] || statusMap['not-applied'];
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year} in 3pm`;
  };

  // Calculate active filters count for badge
  const activeFiltersCount = Object.values(activeFilters).reduce((acc, val) => {
    if (typeof val === 'object' && val !== null) {
      return acc + (Object.values(val).some(v => v !== '') ? 1 : 0);
    }
    return acc + (val !== '' && val !== null ? 1 : 0);
  }, 0);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = companies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(companies.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const [showDetails, setShowDetails] = useState(false);

  const openCompanyDetails = (company) => {
    setSelectedCompany(company);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1220] transition-colors duration-300">
      <div className="flex-none">
      </div>

      <div className="flex-1 flex flex-col p-8">
        {/* Controls */}
        <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <TabSwitcher
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 font-bold text-sm ${activeFiltersCount > 0
              ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'bg-white dark:bg-slate-800/40 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm hover:shadow'
              }`}
          >
            {/* Replace with Lucide Filter icon if impoted, or text */}
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Sidebar */}
        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Company Details Modal */}
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title={selectedCompany ? selectedCompany.name : 'Company Details'}
          size="lg"
        >
          {selectedCompany && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <CompanyLogo 
                    logo={selectedCompany.logo} 
                    name={selectedCompany.name} 
                    className="w-16 h-16" 
                    iconSize="w-8 h-8"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h3>
                    <p className="text-gray-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-0.5">{selectedCompany.industry} • {selectedCompany.location}</p>
                  </div>
                </div>
                <StatusBadge
                  status={selectedCompany.status}
                  label={selectedCompany.status.toUpperCase()}
                />
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Package</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedCompany.package} LPA</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">CGPA Cutoff</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedCompany.minCGPA || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Eligibility</p>
                  <div className="flex items-center gap-1">
                    {selectedCompany.eligible ? (
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm uppercase">Eligible</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm uppercase">Not Eligible</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Pass Year</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedCompany.passingYear || 'Any'}</p>
                </div>
              </div>

              {/* Recruitment Timeline */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <Timeline 
                  applicationStart={selectedCompany.applicationStart}
                  applicationDeadline={selectedCompany.applicationDeadline}
                  driveDate={selectedCompany.driveDate}
                />
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">About {selectedCompany.name}</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Job Roles */}
              {selectedCompany.jobRoles && selectedCompany.jobRoles.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Available Roles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCompany.jobRoles.map((role, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                        <p className="font-bold text-blue-600 dark:text-blue-400">{role.role}</p>
                        <p className="text-sm text-gray-900 dark:text-slate-200 font-bold mt-1">Package: ₹{role.package} LPA</p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 line-clamp-2 font-medium">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Process */}
              {selectedCompany.rounds && selectedCompany.rounds.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Selection Process</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedCompany.rounds.map((round, index) => (
                      <div key={index} className="flex flex-col gap-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-500/20 font-bold text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-blue-600 text-white flex items-center justify-center rounded-full text-[10px] font-bold">{index + 1}</span>
                          {typeof round === 'object' ? round.name : round}
                        </div>
                        {typeof round === 'object' && round.venue && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-500 dark:text-blue-400/70 ml-7 uppercase tracking-wider font-extrabold">
                            <MapPin className="w-3 h-3" />
                            {round.venue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Year Experiences */}
              {selectedCompany.previousExperiences && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Previous Year Experiences</h4>
                  <div className="space-y-4">
                    {selectedCompany.previousExperiences.map((exp, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-100 dark:border-slate-800 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900 dark:text-slate-200 text-sm">Year {exp.year}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">{exp.student}</span>
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 text-sm mb-3 font-medium">{exp.experience}</p>
                        <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:text-blue-700 transition-colors flex items-center gap-1 uppercase tracking-wider">
                          <Download className="w-3 h-3" />
                          Download Experience
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Experience Upload */}
              {selectedCompany.applicationStatus !== 'not-applied' && selectedCompany.applicationStatus !== 'applied' && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Share Your Experience</h4>
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-1">Upload Interview Experience</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Help your juniors by sharing your interview journey in a PDF.</p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
                      <Upload className="w-4 h-4" />
                      Upload PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Application Status / Action */}
              <div className="pt-4 border-t border-gray-100 flex justify-end items-center gap-4">
                {selectedCompany.applicationStatus !== 'not-applied' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <StatusBadge
                      {...getApplicationStatusBadge(selectedCompany.applicationStatus)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate(`/companies/${selectedCompany._id}/apply`);
                      setShowDetails(false);
                    }}
                    disabled={!selectedCompany.eligible}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${!selectedCompany.eligible
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 '
                      }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {!selectedCompany.eligible ? 'Not Eligible' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Companies List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <EmptyState
                icon={<Building2 className="w-16 h-16" />}
                title="No Companies Found"
                message="No companies match your current filters. Try adjusting your search criteria."
                action={{
                  label: 'Clear Filters',
                  onClick: handleClearFilters
                }}
              />
            </div>
          ) : (
            currentCompanies.map((company, index) => {
              const isApplyDisabled = !company.eligible;
              const hasApplied = company.applicationStatus !== 'not-applied';
              const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <div
                  key={company._id}
                  onClick={() => openCompanyDetails(company)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md dark:hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
                >
                  {/* Left: Logo + Info */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 dark:text-slate-500 w-6 text-center font-bold">{serialNumber}</span>
                    <CompanyLogo logo={company.logo} name={company.name} className="w-12 h-12" />
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <HighlightText text={company.name} highlight={searchQuery} />
                      </h4>
                      <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                        <HighlightText text={company.role} highlight={searchQuery} />
                        <span className="mx-2">•</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${(company.type === 'IT' || company.type === 'IT / Software') ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400'}`}>
                          {company.type}
                        </span>
                      </p>
                      {/* Eligibility Criteria Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {company.minCGPA > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-500/30 font-bold uppercase tracking-tighter">
                            📘 Min CGPA: {company.minCGPA}
                          </span>
                        )}
                        {company.requiredPoints > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/30 font-bold uppercase tracking-tighter">
                            ⭐ {company.requiredPoints} pts
                          </span>
                        )}
                        {company.eligibleBranches && company.eligibleBranches.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 font-bold uppercase tracking-tighter">
                            🎓 {company.eligibleBranches.slice(0, 3).join(', ')}{company.eligibleBranches.length > 3 ? ` +${company.eligibleBranches.length - 3}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Package + Deadline + Action */}
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Package</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₹{company.package} LPA</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Deadline</p>
                      <p className="text-sm text-gray-700 dark:text-slate-300 font-bold">{formatDeadline(company.applicationDeadline)}</p>
                    </div>
                    {hasApplied ? (
                      <div onClick={e => e.stopPropagation()}>
                        <StatusBadge
                          {...getApplicationStatusBadge(company.applicationStatus)}
                          size="sm"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isApplyDisabled) navigate(`/companies/${company._id}/apply`);
                        }}
                        disabled={isApplyDisabled}
                        title={company.eligibilityReason}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${isApplyDisabled
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-gray-200 dark:border-slate-700 opacity-60'
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg dark:shadow-blue-900/20 active:scale-95'
                          }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                        {isApplyDisabled ? 'Not Eligible' : 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {companies.length > 0 && (
          <div className="flex-none mt-10 flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-6">
            <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-gray-900 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(indexOfLastItem, companies.length)}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{companies.length}</span> companies
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Simple page counter visualization */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;