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
    console.log('Sending chat message to OpenAI...');
    console.log('API Key available:', !!OPENAI_API_KEY);
    console.log('Messages structure:', JSON.stringify(messages, null, 2));
    
    const response = await openaiAxios.post('/chat/completions', {
      model: 'gpt-4-turbo', // You can change this to gpt-3.5-turbo for lower cost
      messages: messages,
      max_tokens: 500
    });
    
    console.log('OpenAI response received');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error sending chat message to OpenAI:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    
    // Use fallback model if the selected model isn't available
    if (error.response?.data?.error?.code === 'model_not_available') {
      console.log('Attempting with fallback model gpt-3.5-turbo...');
      try {
        const fallbackResponse = await openaiAxios.post('/chat/completions', {
          model: 'gpt-3.5-turbo', // Fallback to a more widely available model
          messages: messages,
          max_tokens: 500
        });
        return fallbackResponse.data.choices[0].message.content;
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

// Let's use a simpler chat completion approach for now instead of Assistants API
export const sendAssistantMessage = async (message, threadId = null) => {
  try {
    console.log('Using simpler chat completion as fallback...');
    
    // Create system message for context
    const systemMessage = {
      role: 'system',
      content: `You are Carely, a wellness companion for medical professionals. 
                Be empathetic, supportive, and provide wellness advice tailored to healthcare workers. 
                Keep responses concise and friendly.`
    };
    
    // Create user message
    const userMessage = {
      role: 'user',
      content: message
    };
    
    // Send as a regular chat completion
    const response = await openaiAxios.post('/chat/completions', {
      model: 'gpt-3.5-turbo', // More reliable model
      messages: [systemMessage, userMessage],
      max_tokens: 500
    });
    
    console.log('Chat completion successful');
    
    return {
      threadId: null, // No thread concept in regular chat completions
      message: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error using chat completion fallback:', error);
    console.error('Error response data:', error.response?.data);
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
    console.log('Preparing audio transcription with file:', audioFile);
    
    // Validate the audio file
    if (!audioFile || !audioFile.uri) {
      throw new Error('Invalid audio file object');
    }
    
    // Create form data to send the audio file
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    
    console.log('Sending transcription request to OpenAI...');
    console.log('API URL:', `${OPENAI_API_URL}/audio/transcriptions`);
    
    const response = await axios.post(
      `${OPENAI_API_URL}/audio/transcriptions`, 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Transcription response received:', response.data);
    
    if (!response.data || !response.data.text) {
      throw new Error('Invalid response from transcription service');
    }
    
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio with Whisper:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    throw new Error(`Transcription failed: ${error.message}`);
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