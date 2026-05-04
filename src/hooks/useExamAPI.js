import { useState } from 'react';

import { API_API_BASE_URL } from '../config/env';

const useExamAPI = (authToken) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_BASE = API_API_BASE_URL;

  const handleRequest = async (requestFn) => {
    try {
      setLoading(true);
      setError(null);
      return await requestFn();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async (params = {}) => {
    return handleRequest(async () => {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...params
      });

      const response = await fetch(`${API_BASE}/exams?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in again to view your exams');
        }
        throw new Error(`Failed to load exams (${response.status})`);
      }

      return await response.json();
    });
  };

  const fetchExamStats = async () => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE}/exams/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return {};
    });
  };

  const fetchExamDetails = async (examId) => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE}/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load exam details');
      }

      const data = await response.json();
      return data.exam;
    });
  };

  const deleteExam = async (examId) => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE}/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete exam (${response.status})`);
      }

      return true;
    });
  };

  const downloadExam = async (examId, format = 'pdf') => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE}/exams/${examId}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format })
      });

      if (response.status === 402) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment required for download');
      }

      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }

      return await response.blob();
    });
  };

  return {
    loading,
    error,
    setError,
    fetchExams,
    fetchExamStats,
    fetchExamDetails,
    deleteExam,
    downloadExam
  };
};

export default useExamAPI;