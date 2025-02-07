import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

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
