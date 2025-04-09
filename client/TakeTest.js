import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
  getTestQuestions, 
  submitTest, 
  startTest, 
  saveResponse, 
  getTestProgress,
  getInProgressTest
} from './api';
import { UserContext } from './UserContext';

// Categories for grouping questions
const QUESTION_CATEGORIES = {
  'emotional_exhaustion': 'Emotional Energy',
  'depersonalization': 'Connection with Patients',
  'personal_accomplishment': 'Professional Satisfaction'
};

// Response options with descriptive labels
const options = [
  { score: 0, label: 'Never', description: 'Never experience this' },
  { score: 1, label: 'A few times a year', description: 'Rarely experience this' },
  { score: 2, label: 'Once a month or less', description: 'Occasionally experience this' },
  { score: 3, label: 'A few times a month', description: 'Sometimes experience this' },
  { score: 4, label: 'Once a week', description: 'Regularly experience this' },
  { score: 5, label: 'A few times a week', description: 'Frequently experience this' },
  { score: 6, label: 'Every day', description: 'Constantly experience this' },
];

const TakeTest = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [activeTestId, setActiveTestId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load questions and check for in-progress test
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        
        // Fetch questions
        const questionsData = await getTestQuestions();
        
        // Group questions by category
        const grouped = {};
        questionsData.forEach(question => {
          if (!grouped[question.category]) {
            grouped[question.category] = [];
          }
          grouped[question.category].push(question);
        });
        
        setGroupedQuestions(grouped);
        setQuestions(questionsData);
        
        // Check for in-progress test
        if (user?.id) {
          try {
            const inProgressTest = await getInProgressTest(user.id);
            
            if (inProgressTest && inProgressTest.test_id) {
              const testProgress = await getTestProgress(inProgressTest.test_id);
              
              if (testProgress && testProgress.responses) {
                Alert.alert(
                  "Resume Test",
                  "Would you like to continue where you left off?",
                  [
                    {
                      text: "Start Over",
                      style: "cancel",
                      onPress: () => initializeNewTest()
                    },
                    {
                      text: "Continue",
                      onPress: () => {
                        setActiveTestId(inProgressTest.test_id);
                        setResponses(testProgress.responses);
                        
                        // Find the next unanswered question index
                        const answeredIds = Object.keys(testProgress.responses).map(Number);
                        for (let i = 0; i < questionsData.length; i++) {
                          if (!answeredIds.includes(questionsData[i].id)) {
                            setCurrentQuestionIndex(i);
                            break;
                          }
                        }
                      }
                    }
                  ]
                );
                
                // No need to initialize a new test, as we'll either use the existing one or start over
                return;
              }
            }
            
            // If no valid in-progress test, start a new one
            await initializeNewTest();
            
          } catch (error) {
            console.error("Failed to check in-progress test:", error);
            await initializeNewTest();
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load questions. Please try again.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
  }, [user]);

  // Initialize a new test
  const initializeNewTest = async () => {
    try {
      if (user?.id) {
        const testId = await startTest(user.id);
        setActiveTestId(testId);
        setResponses({});
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error("Error starting new test:", error);
    }
  };

  // Auto-save responses when they change
  useEffect(() => {
    const saveCurrentResponses = async () => {
      if (activeTestId && Object.keys(responses).length > 0 && !isSaving) {
        setIsSaving(true);
        
        try {
          // Get the current response that might have changed
          const currentQuestion = questions[currentQuestionIndex];
          if (currentQuestion && responses[currentQuestion.id] !== undefined) {
            await saveResponse(activeTestId, currentQuestion.id, responses[currentQuestion.id]);
          }
        } catch (error) {
          console.error("Error auto-saving response:", error);
        } finally {
          setIsSaving(false);
        }
      }
    };
    
    saveCurrentResponses();
  }, [responses, currentQuestionIndex]);

  const handleSelect = (questionId, score) => {
    setResponses(prev => ({ ...prev, [questionId]: score }));
    
    // Auto-advance to next question if not on the last question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }
    
    if (!activeTestId) {
      Alert.alert("Error", "No active test found. Please try again.");
      return;
    }
    
    // Check if all questions have been answered
    if (Object.keys(responses).length < questions.length) {
      const unansweredCount = questions.length - Object.keys(responses).length;
      Alert.alert(
        "Incomplete",
        `You still have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Would you like to submit anyway?`,
        [
          {
            text: "Complete All",
            style: "cancel"
          },
          {
            text: "Submit Anyway",
            onPress: submitResponses
          }
        ]
      );
    } else {
      submitResponses();
    }
  };

  const submitResponses = async () => {
    try {
      setSubmitting(true);
      
      const formattedResponses = Object.keys(responses).map(id => ({
        question_id: parseInt(id),
        score: responses[id],
      }));

      const response = await submitTest(user.id, formattedResponses, activeTestId);
      
      if (response) {
        // Display a success message and navigate to profile
        Alert.alert(
          'Test Completed',
          'Your responses have been recorded. View your results in your profile.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Profile')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit the test. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Get current question
  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };
  
  // Render category heading
  const renderCategoryHeading = (category) => {
    const displayName = QUESTION_CATEGORIES[category] || category;
    return (
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{displayName}</Text>
        <Text style={styles.categoryDescription}>
          {category === 'emotional_exhaustion' && 'Questions about how emotionally drained you feel from your work.'}
          {category === 'depersonalization' && 'Questions about your connection with patients and colleagues.'}
          {category === 'personal_accomplishment' && 'Questions about your sense of achievement and impact.'}
        </Text>
      </View>
    );
  };

  // Render the question view
  const renderQuestionView = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D92B1" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      );
    }
    
    if (questions.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="warning" size={60} color="#F5A623" />
          <Text style={styles.errorText}>No questions available. Please try again later.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const currentQuestion = getCurrentQuestion();
    
    return (
      <View style={styles.questionContainer}>
        {/* Show category heading when first question in category appears */}
        {questions.findIndex(q => q.category === currentQuestion.category) === currentQuestionIndex && 
          renderCategoryHeading(currentQuestion.category)
        }
        
        <Text style={styles.question}>{currentQuestion.text}</Text>
        
        <View style={styles.optionsContainer}>
          {options.map((option, optionIndex) => (
            <TouchableOpacity
              key={optionIndex}
              style={[
                styles.optionButton,
                responses[currentQuestion.id] === option.score && styles.selectedOption
              ]}
              onPress={() => handleSelect(currentQuestion.id, option.score)}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  responses[currentQuestion.id] === option.score && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  responses[currentQuestion.id] === option.score && styles.selectedOptionText
                ]}>
                  {option.description}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                responses[currentQuestion.id] === option.score && styles.selectedRadio
              ]} />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Icon name="arrow-back" size={24} color={currentQuestionIndex === 0 ? "#CCC" : "#5D92B1"} />
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>Previous</Text>
          </TouchableOpacity>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNextQuestion}
            >
              <Text style={styles.navButtonText}>Next</Text>
              <Icon name="arrow-forward" size={24} color="#5D92B1" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maslach Burnout Inventory</Text>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${(Object.keys(responses).length / questions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Object.keys(responses).length} of {questions.length} questions answered
        </Text>
      </View>
      
      {/* Current Question Indicator */}
      <View style={styles.questionIndicator}>
        <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {renderQuestionView()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, 
    textAlign: 'center'
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FAF9F6',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#5D92B1',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  questionIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#F6F6F6',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  categoryHeader: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ECF3F9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#5D92B1',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  questionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedOption: {
    backgroundColor: '#5D92B1',
    borderColor: '#5D92B1',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#FFF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    marginLeft: 10,
  },
  selectedRadio: {
    borderColor: '#FFF',
    backgroundColor: '#FFF',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    color: '#5D92B1',
    marginHorizontal: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#CCC',
  },
  submitButton: {
    backgroundColor: '#5D92B1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#5D92B1',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default TakeTest;