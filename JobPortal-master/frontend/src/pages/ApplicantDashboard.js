import React, { useEffect, useState, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import './ApplicantDashboard.css';

const ApplicantDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const { auth } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 20;

  const fetchJobs = async (page = 1) => {
    const response = await api.get(`/applicants/allJobs?page=${page}&limit=${jobsPerPage}`, {
      headers: { Authorization: auth.token },
    });
    setJobs(response.data.jobs);
    setTotalPages(response.data.totalPages);
    setCurrentPage(page);

    // Fetch company details
    const uniqueCompanyIds = [...new Set(response.data.jobs.map(job => job.companyId))];
    fetchCompanyDetails(uniqueCompanyIds);
  };

  const fetchCompanyDetails = async (companyIds) => {
    const response = await api.post('/companies/getCompanyDetails', { companyIds }, {
      headers: { Authorization: auth.token },
    });
    const companiesData = response.data.reduce((acc, company) => {
      acc[company.id] = {
        name: company.name,
        logoUrl: company.logoUrl,
        description: company.description,
        location: company.location,
      };
      return acc;
    }, {});
    setCompanies(companiesData);
  };

  const getApplications = async () => {
    const response = await api.get(`/applicants/appliedApplications`, {
      headers: { Authorization: auth.token },
    });
    setApplications(response.data);
  };

  const applyJob = async (applicationObject) => {
    const response = await api.post(`/applicants/applyJob`, applicationObject, {
      headers: { Authorization: auth.token },
    });

    if (response.status) {
      getApplications();
    }
  };

  useEffect(() => {
    fetchJobs();
    getApplications();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="dashboard-container">
      {/* Profile Section */}
      <div className="profile-section">
        <h2>Welcome to Next Step Workforce Solution</h2>
        <p>Empowering Your Next Career Move</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div
          className={`tab ${activeTab === 'jobs' ? 'active-tab' : ''}`}
          onClick={() => handleTabChange('jobs')}
        >
          Jobs
        </div>
        <div
          className={`tab ${activeTab === 'company' ? 'active-tab' : ''}`}
          onClick={() => handleTabChange('company')}
        >
          Company
        </div>
        <div
          className={`tab ${activeTab === 'applications' ? 'active-tab' : ''}`}
          onClick={() => handleTabChange('applications')}
        >
          My Applications
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'jobs' && (
          <div className="jobs-container">
            <h3>Jobs</h3>
            <div className="jobs-list">
              {/* Filter out jobs from Company 2 */}
              {jobs
                .filter((job) => companies[job.companyId]?.name !== 'Company 2')
                .map((job) => (
                  <div className="job-card" key={job.id}>
                    <h4>{job.title}</h4>
                    <p>Company: {companies[job.companyId]?.name || 'Loading...'}</p>
                    <button
                      onClick={() =>
                        applyJob({
                          id: job.id,
                          title: job.title,
                          status: 'pending',
                          appliedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
                          publishedBy: job.companyId,
                        })
                      }
                    >
                      Apply
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
        {activeTab === 'company' && (
          <div className="company-container">
            <h3>Company Details</h3>
            <div className="companies-list">
              {Object.entries(companies).map(([id, company]) => (
                <div key={id} className="company-card">
                  <img
                    src={company.logoUrl || 'default_logo.png'}
                    alt={`${company.name} Logo`}
                    className="company-logo"
                  />
                  <p><strong>Company Name:</strong> {company.name}</p>
                  <p><strong>Description:</strong> {company.description || 'No description available'}</p>
                  <p><strong>Location:</strong> {company.location || 'Location not specified'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'applications' && (
          <div className="applications-container">
            <h3>My Applications</h3>
            <ul className="applications-list">
              {applications.map((application) => (
                <li key={application.id}>
                  <p>
                    {application.jobTitle} - {application.status} - Applied At: {application.appliedAt} - Published By:{' '}
                    {companies[application.publishedBy]?.name || 'Unknown Company'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
