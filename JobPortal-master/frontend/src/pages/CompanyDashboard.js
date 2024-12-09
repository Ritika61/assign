import React, { useEffect, useState, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';
import '../css/CompanyDashboard.css'; 

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const { auth } = useContext(AuthContext);

  const [formData, setFormData] = useState({ title: '', description: '', location: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('my-jobs'); // State to manage active tab
  const jobsPerPage = 5;

  const fetchJobs = async (page = 1) => {
    const response = await api.get(`/dashboard/company-jobs?page=${page}&limit=${jobsPerPage}`, {
      headers: { Authorization: auth.token },
    });
    setJobs(response.data.jobs);
    setTotalPages(response.data.totalPages);
    setCurrentPage(page);
  };

  const handleAddJob = async () => {
    await api.post('/jobs', formData, { headers: { Authorization: auth.token } });
    setFormData({ title: '', description: '', location: '' });
    fetchJobs();
    alert('Job Added');
  };

  const handleEditClick = (job) => {
    setFormData({ title: job.title, description: job.description, location: job.location });
    setIsEditing(true);
    setEditingJobId(job.id);
    setActiveTab('add-job'); 
  };

  const handleUpdateJob = async () => {
    await api.put(`/jobs/${editingJobId}`, formData, { headers: { Authorization: auth.token } });
    setIsEditing(false);
    setEditingJobId(null);
    setFormData({ title: '', description: '', location: '' });
    fetchJobs(currentPage);
    alert('Job Updated');
  };

  const handleDeleteJob = async (id) => {
    await api.delete(`/jobs/${id}`, { headers: { Authorization: auth.token } });
    fetchJobs(currentPage);
    alert('Job Deleted');
  };

  const fetchApplications = async () => {
    const response = await api.get('/dashboard/company-applications', { headers: { Authorization: auth?.token } });
    setApplications(response.data);
  };

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const handlePageChange = (page) => {
    fetchJobs(page);
  };

  const handleApplicationStatusChange = async (applicationId, status) => {
    console.log("Application Status Change",applicationId,status)
    try {
      await api.post(
        `/jobs/status/${applicationId}`, // Matches backend route
        { status }, 
        { headers: { Authorization: auth?.token } }
      );
  
      fetchApplications();
      alert(`Application ${status} successfully.`);
    } catch (error) {
      console.error('Error updating application status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update application status.';
      alert(errorMessage);
    }
  };
  
  

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to Company Dashboard</h1>
        <p>Manage your jobs and track applications efficiently.</p>
      </header>

      {/* Tabs for Navigation */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'my-jobs' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('my-jobs')}
        >
          My Jobs
        </button>
        <button
          className={`tab ${activeTab === 'add-job' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('add-job')}
        >
          Add Job
        </button>
        <button
          className={`tab ${activeTab === 'applications' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      {/* Conditional Rendering of Sections */}
      <div className="dashboard-content">
        {activeTab === 'my-jobs' && (
          <section id="my-jobs">
            <h2>My Jobs</h2>
            <div className="jobs-container">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-details">
                    <h4>{job.title}</h4>
                    <p>{job.description}</p>
                    <p>
                      <strong>Location:</strong> {job.location}
                    </p>
                  </div>
                  <div className="job-actions">
                    <button onClick={() => handleEditClick(job)}>Edit</button>
                    <button onClick={() => handleDeleteJob(job.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </section>
        )}

{activeTab === 'add-job' && (
  <section id="add-job">
    <h2>{isEditing ? 'Update Job' : 'Add Job'}</h2>

    <div className="add-job-container">
      {/* Job Text */}
      <div className="job-text-container">
        
      </div>

      {/* Job Form */}
      <div className="job-form-container">
        
        <div className="job-form">
        <h3>Job Details</h3>
        <p>Fill out the form below to add a new job/ update job.</p>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <button onClick={isEditing ? handleUpdateJob : handleAddJob}>
            {isEditing ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  </section>
)}


        {activeTab === 'applications' && (
          <section id="applications">
            <div className="applications-container">
              {applications.map((application) => (
                <div key={application.id} className="application-card">
                  <p>
                    <strong>Job Title:</strong> {application.jobTitle}
                  </p>
                  <p>
                    <strong>Status:</strong> {application.status}
                  </p>
                  <p>
                    <strong>Applied At:</strong> {application.appliedAt}
                  </p>
                  <p>
                    <strong>Applicant:</strong> {application.applicantId}
                  </p>
                  {console.log("auth")}
                  <button className="accept-button"  onClick={() => handleApplicationStatusChange(application.id, 'accepted')}
              >Accept</button> 
               <button className="reject-button" onClick={() => handleApplicationStatusChange(application.id, 'rejected')} >
                Reject</button>               
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
