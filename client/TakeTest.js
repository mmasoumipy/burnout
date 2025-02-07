import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getTestQuestions, submitTest } from './api';

const options = [
  'Never',
  'A few times a year',
  'Once a month or less',
  'A few times a month',
  'Once a week',
  'A few times a week',
  'Every day',
];

const TakeTest = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    async function fetchQuestions() {
      const data = await getTestQuestions();
      setQuestions(data);
    }
    fetchQuestions();
  }, []);

  const handleSelect = (questionId, score) => {
    setResponses((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async () => {
    const formattedResponses = Object.keys(responses).map((id) => ({
      question_id: parseInt(id),
      score: responses[id],
    }));

    try {
      const response = await submitTest("123", formattedResponses);
      if (response) {
        Alert.alert('Test Result', `Burnout Level: ${response.burnout_level} \n
          Emotional Exhaustion: ${response.emotional_exhaustion_score} \n
          Depersonalization: ${response.depersonalization_score} \n
          Personal Accomplishment: ${response.personal_accomplishment_score}
          `);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit the test. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>Maslach Burnout Inventory (MBI)</Text>
        {questions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.question}>{question.text}</Text>
            {options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={styles.optionContainer}
                onPress={() => handleSelect(question.id, optionIndex)}
              >
                <View
                  style={[
                    styles.radioButton,
                    responses[question.id] === optionIndex && styles.selectedRadio,
                  ]}
                />
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: 64,
    marginBottom: 64,
    backgroundColor: '#FAF9F6',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  questionContainer: {
    backgroundColor: '#5D92B1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D9D9D9',
    marginRight: 10,
  },
  selectedRadio: {
    backgroundColor: '#F5A623',
  },
  optionText: {
    fontSize: 14,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TakeTest;
