import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { UserContext } from './UserContext';
import { saveUserReasons, getUserProfile } from './api';

export default function Reason({ navigation }) {
  const { user } = useContext(UserContext);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Load user's previously selected reasons if any
    const loadUserReasons = async () => {
      if (!user?.id) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.id);
        if (userProfile.reasons && userProfile.reasons.length > 0) {
          setSelectedOptions(userProfile.reasons);
        }
      } catch (error) {
        console.error('Error loading user reasons:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadUserReasons();
  }, [user]);

  const options = [
    {
      id: 1,
      title: 'Emotional Exhaustion',
      description: 'I feel emotionally drained by my work',
      icon: '😫'
    },
    {
      id: 2,
      title: 'Work-Life Balance',
      description: 'I want to improve my work-life integration',
      icon: '⚖️'
    },
    {
      id: 3,
      title: 'Patient Care Quality',
      description: 'I want to maintain quality patient interactions',
      icon: '🏥'
    },
    {
      id: 4,
      title: 'Stress Management',
      description: 'I need better tools to manage workplace stress',
      icon: '😓'
    },
    {
      id: 5,
      title: 'Career Satisfaction',
      description: 'I want to reconnect with my purpose in medicine',
      icon: '⭐'
    },
    {
      id: 6,
      title: 'Peer Relationships',
      description: 'I want to improve workplace relationships',
      icon: '👥'
    },
    {
      id: 7,
      title: 'Resilience Building',
      description: 'I want to build long-term professional resilience',
      icon: '💪'
    },
    {
      id: 8,
      title: 'Preventative Care',
      description: 'I want to prevent burnout before it occurs',
      icon: '🛡️'
    }
  ];

  const toggleOption = (id) => {
    if (selectedOptions.includes(id)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== id));
    } else {
      setSelectedOptions([...selectedOptions, id]);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    if (selectedOptions.length === 0) {
      Alert.alert('Please Select', 'Please select at least one reason to continue.');
      return;
    }

    try {
      setIsLoading(true);
      await saveUserReasons(user.id, selectedOptions);
      setIsLoading(false);
      
      // Navigate to next screen
      navigation.navigate('HomePlan');
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving reasons:', error);
      Alert.alert('Error', 'Failed to save your selections. Please try again.');
    }
  };

  const handleSkip = () => {
    // Skip this screen and go to home plan
    navigation.navigate('HomePlan');
  };

  const renderOption = ({ item }) => {
    const isSelected = selectedOptions.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => toggleOption(item.id)}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionIcon}>{item.icon}</Text>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, isSelected && styles.selectedText]}>{item.title}</Text>
            <Text style={[styles.optionDescription, isSelected && styles.selectedText]}>{item.description}</Text>
          </View>
          <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
            {isSelected && <Text style={styles.checkMark}>✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D92B1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/images/logo.jpg')} style={styles.backgroundImage} />

      {/* Content View */}
      <View style={styles.content}>
        <Text style={styles.title}>What brings you to WellMed?</Text>
        <Text style={styles.subtitle}>Select all that apply to personalize your experience</Text>
        <Text style={styles.optionalText}>This step is optional but helps us tailor content to your needs</Text>

        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              selectedOptions.length === 0 && styles.disabledButton
            ]} 
            onPress={handleSubmit}
            disabled={selectedOptions.length === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.2,
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
    color: '#666',
  },
  optionalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  option: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionSelected: {
    backgroundColor: '#5D92B1',
    borderColor: '#5D92B1',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  checkMark: {
    color: '#5D92B1',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  continueButton: {
    backgroundColor: '#5D92B1',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  skipButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#B8CDD9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});