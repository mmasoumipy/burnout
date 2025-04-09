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

// MBI TEST SERVICE
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

// Start a new test and get its ID
export const startTest = async (userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/start-test`, { user_id: userId });
    return response.data.test_id;
  } catch (error) {
    console.error("Error starting test:", error);
    throw error;
  }
};

// Save a response for a test in progress
export const saveResponse = async (testId, questionId, score) => {
  try {
    const response = await axios.post(`${BASE_URL}/save-response`, {
      test_id: testId,
      question_id: questionId,
      score: score
    });
    return response.data;
  } catch (error) {
    console.error("Error saving response:", error);
    throw error;
  }
};

// Submit User Responses (complete test)
export const submitTest = async (userId, responses, testId = null) => {
  try {
    const payload = {
      user_id: userId,
      responses: responses
    };
    
    // Include test_id if provided (for completing an in-progress test)
    if (testId) {
      payload.test_id = testId;
    }
    
    const response = await axios.post(`${BASE_URL}/submit`, payload);
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    return null;
  }
};

// Get test progress for a specific test
export const getTestProgress = async (testId) => {
  try {
    const response = await axios.get(`${BASE_URL}/test-progress/${testId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test progress:", error);
    return { responses: {} };
  }
};

// Get user's in-progress test if it exists
export const getInProgressTest = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/in-progress-test/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching in-progress test:", error);
    return null;
  }
};

// USER SERVICES
// Fetch Test Results by User ID
export const getTestResults = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/tests/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching results:", error);
    return [];
  }
};

// Submit Mood Data
export const submitMood = async (userId, mood) => {
  try {
    const response = await axios.post(`${BASE_URL}/mood`, {
      user_id: userId,
      mood: mood
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting mood:", error);
    return null;
  }
};

// Fetch Mood Data by User ID
export const getMoodHistory = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/mood/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mood data:", error);
    return [];
  }
};

// Update Name
export const updateName = async (userId, newName) => {
  return axios.put(`${BASE_URL}/update-name`, {
    user_id: userId,
    new_name: newName,
  });
};

// Update Password
export const updatePassword = async (userId, currentPassword, newPassword) => {
  return axios.put(`${BASE_URL}/update-password`, {
    user_id: userId,
    current_password: currentPassword,
    new_password: newPassword,
  });
};

// Create a new journal entry
export const createJournalEntry = async (userId, title, content, analysis) => {
  try {
    const response = await axios.post(`${BASE_URL}/journal`, {
      user_id: userId,
      title,
      content,
      analysis
    });
    return response.data;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
};

// Get all journal entries for a user
export const getJournalEntries = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/journal/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
};

// Get a specific journal entry
export const getJournalEntry = async (entryId) => {
  try {
    const response = await axios.get(`${BASE_URL}/journal/entry/${entryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return null;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (entryId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/journal/${entryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
};

// Submit Micro Assessment
export const submitMicroAssessment = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/micro-assessment`, data);
    return response.data;
  } catch (error) {
    console.error("Error submitting micro assessment:", error);
    throw error;
  }
};

// Get Micro Assessments for a user
export const getMicroAssessments = async (userId, limit = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}/micro-assessment/${userId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching micro assessments:", error);
    return [];
  }
};

// Get latest Micro Assessment for a user
export const getLatestMicroAssessment = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/micro-assessment/latest/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching latest micro assessment:", error);
    return null;
  }
};

// Get Micro Assessment trend analysis
export const getMicroAssessmentTrend = async (userId, days = 30) => {
  try {
    const response = await axios.get(`${BASE_URL}/micro-assessment/trend/${userId}?days=${days}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching micro assessment trend:", error);
    return null;
  }
};

// Get user streak information
export const getUserStreaks = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/streaks/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user streaks:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      weeklyCheckIns: 0,
      totalAssessments: 0
    };
  }
};