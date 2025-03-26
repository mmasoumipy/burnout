import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Register User
export const registerUser = async (name, email, password) => {
  return axios.post(`${BASE_URL}/register`, { name, email, password });
};


// Login User
export const loginUser = async (email, password) => {
  return axios.post(`${BASE_URL}/login`, { email, password });
};

// Fetch MBI Test Questions
export const getTestQuestions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/test`);
    return response.data.questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

// Submit User Responses
export const submitTest = async (userId, responses) => {
  try {
    const response = await axios.post(`${BASE_URL}/submit`, {
      user_id: userId,
      responses: responses
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    return null;
  }
};

// Fetch Test Results by User ID
export const getTestResults = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/tests/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching results:", error);
    return null;
  }
};