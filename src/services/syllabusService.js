// import { API_BASE_URL } from '../config/api';
// services/syllabusService.js
export class SyllabusService {
  constructor() {
    this.baseUrl = `http://localhost:5000/api/syllabus`;
  }

  // 🔹 Get auth token (optional, keep if your backend is protected)
  getAuthToken() {
    return (
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken")
    );
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  }

  // 🔹 Get all syllabi (with optional filters: curriculum, subject, page, limit)
  async getSyllabi(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.curriculum)
        queryParams.append("curriculum", filters.curriculum);
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);

      const url = `${this.baseUrl}?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch syllabi");
      }

      return data; // { syllabi: [...] }
    } catch (error) {
      console.error("Error fetching syllabi:", error);
      throw error;
    }
  }

  // 🔹 Get a specific syllabus with full content (Topics, Objectives, etc.)
  async getSyllabusById(syllabusId) {
    try {
      const response = await fetch(`${this.baseUrl}/${syllabusId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch syllabus");
      }

      return data;
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      throw error;
    }
  }

  // Upload syllabus file
  async uploadSyllabus(formData) {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${import.meta.env.API_BASE_URL}/api/upload/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Error uploading syllabus:', error);
      throw error;
    }
  }
}