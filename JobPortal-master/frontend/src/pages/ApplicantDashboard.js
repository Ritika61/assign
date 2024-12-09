import React, { useEffect, useState, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import '../css/ApplicantDashboard.css';

const ApplicantDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('jobs'); // Tracks active tab
  const [appliedJobs, setAppliedJobs] = useState([]); // To track applied jobs
  const jobsPerPage = 20;

  const { auth } = useContext(AuthContext);

  const fetchJobs = async (page = 1) => {
    const response = await api.get(
      `/applicants/allJobs?page=${page}&limit=${jobsPerPage}`,
      { headers: { Authorization: auth.token } }
    );
    setJobs(response.data.jobs);
    setTotalPages(response.data.totalPages);
    setCurrentPage(page);
  };

  const getApplications = async () => {
    const response = await api.get(`/applicants/appliedApplications`, {
      headers: { Authorization: auth.token }
    });
    setApplications(response.data);
  };

  const applyJob = async (applicationObject, jobId) => {
    const response = await api.post(`/applicants/applyJob`, applicationObject, {
      headers: { Authorization: auth.token }
    });

    if (response.status === 200) {
      // Add the jobId to the appliedJobs array to track which jobs were successfully applied
      setAppliedJobs((prev) => [...prev, jobId]);

      getApplications(); // Refresh applications list

      // Set a timeout to remove the jobId from appliedJobs after 3 seconds (for temporary message display)
      setTimeout(() => {
        setAppliedJobs((prev) => prev.filter((id) => id !== jobId));
      }, 3000);
    }
  };

  useEffect(() => {
    fetchJobs();
    getApplications();
  }, []);

  const handlePageChange = (page) => {
    fetchJobs(page);
  };

  const groupedJobs = jobs.reduce((acc, job) => {
    if (!acc[job.companyId]) acc[job.companyId] = [];
    acc[job.companyId].push(job);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header>
        <h1>Applicant Dashboard</h1>
      </header>

      {/* Tabs for Navigation */}
      <div className="tabs-container">
        <div
          className={`tab ${activeTab === 'jobs' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs
        </div>
        <div
          className={`tab ${activeTab === 'applications' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'jobs' && (
          <div className="jobs-container">
            <h2>Jobs Available</h2>
            {Object.entries(groupedJobs).map(([companyId, jobs]) => (
              <div key={companyId}>
                <h3>Company {companyId}</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {jobs.map((job) => (
                    <div key={job.id} className="job-card">
                      <h4>{job.title}</h4>
                      <button
                        onClick={() =>
                          applyJob({
                            id: job.id,
                            title: job.title,
                            status: 'pending',
                            appliedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
                            publishedBy: job.companyId
                          }, job.id)
                        }
                      >
                        Apply
                      </button>

                      {/* Show Success Message for Applied Jobs */}
                      {appliedJobs.includes(job.id) && (
                        <div className="success-message">
                          Successfully Applied!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-container">
            <h2>My Applications</h2>
            <ul>
              {applications.map((application) => (
                <li key={application.id}>
                  <p>
                    <strong>{application.jobTitle}</strong>: {application.status}{' '}
                    (Applied on {application.appliedAt}) - Company {application.publishedBy}
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
