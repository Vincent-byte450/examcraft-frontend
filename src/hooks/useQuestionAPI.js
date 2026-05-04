import { useState } from 'react';
import { API_BASE_URL } from '../config/env';

const useQuestionAPI = (authToken) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_BASE = API_BASE_URL;

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

  const fetchQuestions = async (params = {}) => {
    return handleRequest(async () => {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        curriculum: params.curriculum || 'JSS',
        ...params
      });

      const response = await fetch(`${API_BASE}/api/questions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    });
  };

  const fetchSubjects = async (curriculum) => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE}/api/questions/subjects?curriculum=${curriculum}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.subjects || [];
      }
      return [];
    });
  };

  const fetchTopics = async (curriculum, subject) => {
    if (!subject) return [];
    
    return handleRequest(async () => {
      const response = await fetch(
        `${API_BASE}/api/questions/topics?curriculum=${curriculum}&subject=${subject}`, 
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.topics || [];
      }
      return [];
    });
  };

  const deleteQuestion = async (questionId) => {
    return handleRequest(async () => {
      const response = await fetch(`${API_BASE}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    });
  };

  return {
    loading,
    error,
    setError,
    fetchQuestions,
    fetchSubjects,
    fetchTopics,
    deleteQuestion
  };
};

export default useQuestionAPI;