import React, { useState, useEffect } from 'react';
import { analyzeData } from '../api';

export default function Analysis({ token }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyzeData(token);
      setAnalysisData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [token]);

  if (loading) {
    return <div className="loading">Loading analysis data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="analysis-container">
      <h2>Data Analysis</h2>
      {analysisData && (
        <div className="analysis-results">
          <div className="analysis-card">
            <h3>Total Bookings</h3>
            <p>{analysisData.totalBookings}</p>
          </div>
          <div className="analysis-card">
            <h3>Revenue</h3>
            <p>${analysisData.totalRevenue}</p>
          </div>
          <div className="analysis-card">
            <h3>Popular Services</h3>
            <ul>
              {analysisData.popularServices.map((service, index) => (
                <li key={index}>
                  {service.name} - {service.count} bookings
                </li>
              ))}
            </ul>
          </div>
          <div className="analysis-card">
            <h3>Customer Demographics</h3>
            <div className="demographics">
              <p>New Customers: {analysisData.newCustomers}</p>
              <p>Returning Customers: {analysisData.returningCustomers}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 