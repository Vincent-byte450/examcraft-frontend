// services/topicalQuestionsService.js
import { API_BASE_URL } from '../config/env';

class TopicalQuestionsService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/topical-questions`;
  }

  // 🔹 Get auth token (if backend is protected)
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

  // 🔹 Get all topical questions (optional filters: curriculum, subject, page, limit)
  async getTopicalQuestions(filters = {}) {
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
        throw new Error(data.message || "Failed to fetch topical questions");
      }

      return data; // { topicalQuestions: [...] }
    } catch (error) {
      console.error("Error fetching topical questions:", error);
      throw error;
    }
  }

  // 🔹 Get a specific topical question set (with topics & questions)
  async getTopicalQuestionsById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch topical questions set");
      }

      return data;
    } catch (error) {
      console.error("Error fetching topical questions by id:", error);
      throw error;
    }
  }

  // 🔹 Upload topical questions file (JSON)
  async uploadTopicalQuestions(formData) {
    try {
      const token = this.getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/upload/upload_topical`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // ⚠️ Do not set Content-Type manually when sending FormData
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data;
    } catch (error) {
      console.error("Error uploading topical questions:", error);
      throw error;
    }
  }
}

export { TopicalQuestionsService };
