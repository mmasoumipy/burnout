import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { UserContext } from './UserContext';
import { Audio } from 'expo-av'; // Use expo-av instead of expo-audio
import * as FileSystem from 'expo-file-system';
import { sendChatMessage, sendAssistantMessage, transcribeAudio, analyzeJournalEntry } from './openaiService';
import { createJournalEntry, getJournalEntries, deleteJournalEntry } from './api';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Make sure to install react-native-vector-icons

export default function Chat({ navigation }) {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('Chatbot');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: '0', text: 'Hello! I\'m Carely, your wellness companion. How are you feeling today?', sender: 'bot' },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalInputText, setJournalInputText] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [threadId, setThreadId] = useState(null);
  
  const chatFlatListRef = useRef(null);

  // Load journal entries when tab changes to Journal
  useEffect(() => {
    if (activeTab === 'Journal' && user?.id) {
      loadJournalEntries();
    }
  }, [activeTab, user]);

  const loadJournalEntries = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const entries = await getJournalEntries(user.id);
      setJournalEntries(entries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start recording for voice input
  const startRecording = async () => {
    try {
      // Request permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to record audio');
        return;
      }

      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Function to stop recording and process the audio
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsLoading(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      // For journal entry
      if (activeTab === 'Journal') {
        const transcription = await transcribeAudio({
          uri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        });
        
        setJournalInputText(transcription);
      } 
      // For chatbot
      else {
        const transcription = await transcribeAudio({
          uri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        });
        
        setInputText(transcription);
        await handleSendMessage(transcription);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to process your voice message');
      setIsLoading(false);
      setIsRecording(false);
    }
  };

  // Function to handle sending messages in the chatbot
  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;
    
    // Add user message to the chat
    const newUserMessage = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Use the OpenAI Assistant API for more consistent, stateful conversations
      const response = await sendAssistantMessage(text, threadId);
      
      // Save the thread ID for continued conversation
      if (!threadId) {
        setThreadId(response.threadId);
      }
      
      // Add bot response to chat
      const newBotMessage = { 
        id: (Date.now() + 1).toString(), 
        text: response.message || "I'm sorry, I couldn't process that. Could you try again?", 
        sender: 'bot' 
      };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Fallback to regular chat completions if Assistant API fails
      try {
        const messageHistory = [
          { 
            role: "system", 
            content: `You are Carely, a wellness companion for medical professionals. 
            You're talking to ${user?.name || 'a healthcare professional'}. Be empathetic, 
            supportive, and provide wellness advice tailored to healthcare workers. 
            Keep responses concise and friendly.`
          },
          ...messages.map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            content: msg.text
          })),
          { role: "user", content: text }
        ];
        
        const fallbackResponse = await sendChatMessage(messageHistory);
        const fallbackMessage = { id: (Date.now() + 1).toString(), text: fallbackResponse, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, fallbackMessage]);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        Alert.alert('Error', 'Failed to get a response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save a journal entry
  const handleAddJournal = async () => {
    if (!journalInputText.trim()) {
      Alert.alert('Error', 'Journal entry cannot be empty');
      return;
    }
    
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to save journal entries');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Analyze the journal entry for sentiment/themes using OpenAI
      const analysis = await analyzeJournalEntry(journalInputText);
      
      // Save to backend
      const entryTitle = journalTitle || `Journal Entry - ${new Date().toLocaleDateString()}`;
      await createJournalEntry(user.id, entryTitle, journalInputText, analysis);
      
      // Reset form and reload entries
      setJournalInputText('');
      setJournalTitle('');
      setShowJournalForm(false);
      
      // Reload journal entries
      await loadJournalEntries();
      
      Alert.alert('Success', 'Journal entry saved');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a journal entry
  const handleDeleteJournal = async (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteJournalEntry(entryId);
              await loadJournalEntries();
              Alert.alert('Success', 'Journal entry deleted');
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Scroll to the bottom when new messages come in
  useEffect(() => {
    if (chatFlatListRef.current && messages.length > 0) {
      chatFlatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Render a single message in the chat
  const renderChatMessage = ({ item }) => (
    <View style={[
      styles.messageBubble, 
      item.sender === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  // Render a journal entry
  const renderJournalEntry = ({ item }) => (
    <TouchableOpacity 
      style={styles.journalEntry}
      onPress={() => Alert.alert(
        item.title,
        `${item.content}\n\nAnalysis: ${item.analysis || 'No analysis available'}`
      )}
      onLongPress={() => handleDeleteJournal(item.id)}
    >
      <Text style={styles.journalTitle}>{item.title}</Text>
      <Text style={styles.journalDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'Chatbot' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('Chatbot')}
          >
            <Text style={[styles.tabText, activeTab === 'Chatbot' && styles.activeTabText]}>
              Carely
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'Journal' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('Journal')}
          >
            <Text style={[styles.tabText, activeTab === 'Journal' && styles.activeTabText]}>
              Journal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.bodyContent}>
          {activeTab === 'Chatbot' ? (
            // Chatbot Section
            <>
              <FlatList
                ref={chatFlatListRef}
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContainer}
              />
              
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#5D92B1" />
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a message..."
                  multiline
                />
                
                <TouchableOpacity 
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[styles.iconButton, isRecording && styles.recordingButton]}
                >
                  <Icon name={isRecording ? "stop" : "mic"} size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleSendMessage()}
                  style={styles.iconButton}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Icon name="send" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Journal Section
            <>
              {showJournalForm ? (
                <View style={styles.journalForm}>
                  <TextInput
                    style={styles.titleInput}
                    value={journalTitle}
                    onChangeText={setJournalTitle}
                    placeholder="Entry Title"
                  />
                  
                  <TextInput
                    style={styles.journalTextInput}
                    value={journalInputText}
                    onChangeText={setJournalInputText}
                    placeholder="Write your thoughts here..."
                    multiline
                  />
                  
                  <View style={styles.journalButtonsContainer}>
                    <TouchableOpacity
                      style={styles.journalButton}
                      onPress={() => setShowJournalForm(false)}
                    >
                      <Text style={styles.journalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={isRecording ? stopRecording : startRecording}
                      style={[styles.journalButton, isRecording && styles.recordingButton]}
                    >
                      <Icon name={isRecording ? "stop" : "mic"} size={20} color="white" />
                      <Text style={styles.journalButtonText}>
                        {isRecording ? "Stop" : "Voice"}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.journalButton, { backgroundColor: '#5D92B1' }]}
                      onPress={handleAddJournal}
                      disabled={isLoading}
                    >
                      <Text style={styles.journalButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {isLoading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#5D92B1" />
                    </View>
                  )}
                </View>
              ) : (
                // Journal Entries List
                <>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#5D92B1" />
                    </View>
                  ) : journalEntries.length === 0 ? (
                    <View style={styles.emptyJournal}>
                      <Text style={styles.emptyJournalText}>
                        No journal entries yet. Tap the + button to get started.
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={journalEntries}
                      renderItem={renderJournalEntry}
                      keyExtractor={(item) => item.id.toString()}
                      contentContainerStyle={styles.journalList}
                    />
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* Add Button for Journal */}
        {activeTab === 'Journal' && !showJournalForm && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowJournalForm(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomePlan')}>
          <Image source={require('./assets/images/home.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('./assets/images/search.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Chat')}>
          <Image source={require('./assets/images/chat_choose.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('./assets/images/profile.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: 32,
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#B8CDD9',
  },
  activeTabButton: {
    backgroundColor: '#5D92B1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  bodyContent: {
    flex: 1,
    padding: 10,
  },
  chatContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3E3E3',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F6F6F6',
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  iconButton: {
    backgroundColor: '#5D92B1',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordingButton: {
    backgroundColor: '#FF4500',
  },
  journalEntry: {
    backgroundColor: '#DFF9DC',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  journalDate: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5D92B1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFF',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#E0E0E0',
  },
  navItem: { 
    padding: 10 
  },
  navIcon: { 
    width: 30, 
    height: 30 
  },
  journalForm: {
    flex: 1,
    padding: 15,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  journalTextInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    height: 200,
    textAlignVertical: 'top',
  },
  journalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  journalButton: {
    backgroundColor: '#B8CDD9',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  journalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyJournal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyJournalText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  journalList: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});