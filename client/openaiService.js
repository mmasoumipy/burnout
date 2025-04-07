import axios from 'axios';
import Constants from 'expo-constants';

// Check if the environment variables are set
// console.log('Constants:', Constants);
const { OPENAI_API_KEY, OPENAI_ASSISTANT_ID } = Constants.expoConfig.extra || {};
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined. Please set it in your environment variables.');
}
if(!OPENAI_ASSISTANT_ID) {
  throw new Error('OPENAI_ASSISTANT_ID is not defined. Please set it in your environment variables.');
}

// console.log(OPENAI_API_KEY, OPENAI_ASSISTANT_ID);


const OPENAI_API_URL = 'https://api.openai.com/v1';

// Configure axios for OpenAI requests
const openaiAxios = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Function to send chat messages to OpenAI (for Carely chatbot)
export const sendChatMessage = async (messages) => {
  try {
    const response = await openaiAxios.post('/chat/completions', {
      model: 'gpt-3.5-turbo', // You can change this to gpt-3.5-turbo for lower cost
      messages: messages,
      max_tokens: 500
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error sending chat message to OpenAI:', error);
    throw error;
  }
};

// Alternative function to use OpenAI Assistant API instead of chat completions
export const sendAssistantMessage = async (message, threadId = null) => {
  try {
    // Create a thread if one doesn't exist
    if (!threadId) {
      const threadResponse = await openaiAxios.post('/threads', {});
      threadId = threadResponse.data.id;
    }
    
    // Add message to thread
    await openaiAxios.post(`/threads/${threadId}/messages`, {
      role: 'user',
      content: message
    });
    
    // Run the assistant on the thread
    const runResponse = await openaiAxios.post(`/threads/${threadId}/runs`, {
      assistant_id: OPENAI_ASSISTANT_ID
    });
    
    const runId = runResponse.data.id;
    
    // Poll for completion (simplified - in production you'd want to use a better approach)
    let runStatus = await pollRunStatus(threadId, runId);
    
    // Get messages from the thread
    const messagesResponse = await openaiAxios.get(`/threads/${threadId}/messages`);
    
    // Return the latest assistant message
    const assistantMessages = messagesResponse.data.data.filter(
      msg => msg.role === 'assistant'
    );
    
    return {
      threadId,
      message: assistantMessages.length > 0 ? assistantMessages[0].content[0].text.value : null
    };
  } catch (error) {
    console.error('Error using OpenAI Assistant:', error);
    throw error;
  }
};

// Helper function to poll run status
const pollRunStatus = async (threadId, runId, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const runResponse = await openaiAxios.get(`/threads/${threadId}/runs/${runId}`);
    const status = runResponse.data.status;
    
    if (status === 'completed') {
      return 'completed';
    } else if (status === 'failed' || status === 'cancelled') {
      throw new Error(`Run ${status}`);
    }
    
    // Wait for a moment before polling again (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(1.5, i)));
  }
  
  throw new Error('Polling timed out');
};

// Function to transcribe audio using Whisper API
export const transcribeAudio = async (audioFile) => {
  try {
    // Create form data to send the audio file
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    
    const response = await axios.post(`${OPENAI_API_URL}/audio/transcriptions`, 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio with Whisper:', error);
    throw error;
  }
};

// Function to analyze journal entries for sentiment or key themes
export const analyzeJournalEntry = async (entry) => {
  try {
    const response = await openaiAxios.post('/chat/completions', {
      model: 'gpt-4-turbo',
      messages: [
        {
          role: "system",
          content: "You are an assistant that analyzes journal entries for medical professionals. Identify sentiment, key themes, signs of burnout, and provide a brief summary. Be supportive and insightful."
        },
        {
          role: "user",
          content: entry
        }
      ],
      max_tokens: 300
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    throw error;
  }
};