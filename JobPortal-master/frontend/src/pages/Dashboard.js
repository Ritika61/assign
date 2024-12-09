import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...',auth.role,auth);
        const endpoint = auth.role === 'company' ? '/dashboard/company-jobs' : '/dashboard/applicant-applications';
        const response = await api.get(endpoint, { headers: { Authorization: auth.token } });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [auth]);
  return (
    <div>
      <h2>{auth.role === 'company' ? 'My Posted Jobs' : 'My Applications'}</h2>
      {data.map((item) => (
        <div key={item.id}>
          <h3>{item.title || item.status}</h3>
          <p>{item.description || item.status}</p>
        </div>
      ))}
    </div>
  );
};
export default Dashboard;
