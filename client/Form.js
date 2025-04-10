import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { UserContext } from './UserContext';
import { saveUserProfile, getUserProfile } from './api';

export default function Form({ navigation }) {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Form state
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [hasChildren, setHasChildren] = useState('Yes');
  const [maritalStatus, setMaritalStatus] = useState('Married');
  const [specialty, setSpecialty] = useState('');
  const [workSetting, setWorkSetting] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [onCallFrequency, setOnCallFrequency] = useState('');
  const [careerStage, setCareerStage] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [previousBurnout, setPreviousBurnout] = useState('1');

  useEffect(() => {
    // Load user profile data if it exists
    const loadUserProfile = async () => {
      if (!user?.id) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.id);
        
        // Fill in existing data if available
        if (userProfile.age) setAge(String(userProfile.age));
        if (userProfile.gender) setGender(userProfile.gender);
        if (userProfile.marital_status) setMaritalStatus(userProfile.marital_status);
        if (userProfile.has_children !== null) setHasChildren(userProfile.has_children ? 'Yes' : 'No');
        if (userProfile.specialty) setSpecialty(userProfile.specialty);
        if (userProfile.work_setting) setWorkSetting(userProfile.work_setting);
        if (userProfile.career_stage) setCareerStage(userProfile.career_stage);
        if (userProfile.work_hours) setWorkHours(String(userProfile.work_hours));
        if (userProfile.on_call_frequency) setOnCallFrequency(userProfile.on_call_frequency);
        if (userProfile.years_experience) setYearsExperience(String(userProfile.years_experience));
        if (userProfile.previous_burnout) setPreviousBurnout(String(userProfile.previous_burnout));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Options for dropdown selectors
  const specialties = [
    'Select Specialty',
    'Family Medicine',
    'Internal Medicine',
    'Emergency Medicine',
    'Pediatrics',
    'Surgery',
    'Obstetrics/Gynecology',
    'Psychiatry',
    'Anesthesiology',
    'Radiology',
    'Dermatology',
    'Neurology',
    'Cardiology',
    'Oncology',
    'Orthopedics',
    'Other'
  ];

  const workSettings = [
    'Select Work Setting',
    'Hospital (Academic)',
    'Hospital (Non-academic)',
    'Private Practice',
    'Outpatient Clinic',
    'Emergency Department',
    'ICU/Critical Care',
    'Telemedicine',
    'Locum Tenens',
    'Other'
  ];

  const careerStages = [
    'Select Career Stage',
    'Resident/Fellow',
    'Early Career (0-5 years)',
    'Mid Career (6-15 years)',
    'Established (16-25 years)',
    'Senior (25+ years)',
    'Other'
  ];

  const onCallOptions = [
    'Select On-Call Frequency',
    'None',
    'Rarely (few times a year)',
    'Monthly',
    'Every other week',
    'Weekly',
    'Multiple times per week',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    try {
      // Prepare user profile data
      const userData = {
        user_id: user.id,
        age: age ? parseInt(age) : null,
        gender: gender,
        marital_status: maritalStatus,
        has_children: hasChildren === 'Yes',
        specialty: specialty,
        work_setting: workSetting,
        career_stage: careerStage,
        work_hours: workHours ? parseInt(workHours) : null,
        on_call_frequency: onCallFrequency,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        previous_burnout: parseInt(previousBurnout)
      };

      setIsLoading(true);
      await saveUserProfile(userData);
      setIsLoading(false);
      
      // Navigate to next screen
      navigation.navigate('Reason');
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile information. Please try again.');
    }
  };

  const handleSkip = () => {
    // Just navigate to the next screen without saving
    navigation.navigate('Reason');
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D92B1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Background image */}
      <Image source={require('./assets/images/logo.jpg')} style={styles.backgroundImage} />

      {/* Form content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.formTitle}>Tell Us About You</Text>
          <Text style={styles.formSubtitle}>This helps us personalize your burnout prevention plan</Text>
          <Text style={styles.optionalText}>All fields are optional, but filling them helps us personalize your experience</Text>

          <Text style={styles.sectionHeader}>Personal Information</Text>

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group onValueChange={(value) => setGender(value)} value={gender}>
              <View style={styles.radioRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="Female" />
                  <Text style={styles.radioLabel}>Female</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Male" />
                  <Text style={styles.radioLabel}>Male</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Other" />
                  <Text style={styles.radioLabel}>Other</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          <Text style={styles.label}>Marital Status</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group onValueChange={(value) => setMaritalStatus(value)} value={maritalStatus}>
              <View style={styles.radioRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="Married" />
                  <Text style={styles.radioLabel}>Married</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Single" />
                  <Text style={styles.radioLabel}>Single</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Other" />
                  <Text style={styles.radioLabel}>Other</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          <Text style={styles.label}>Do you have children?</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group onValueChange={(value) => setHasChildren(value)} value={hasChildren}>
              <View style={styles.radioRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="Yes" />
                  <Text style={styles.radioLabel}>Yes</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="No" />
                  <Text style={styles.radioLabel}>No</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          <Text style={styles.sectionHeader}>Professional Information</Text>

          <Text style={styles.label}>Medical Specialty</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={specialty}
              onValueChange={(itemValue) => setSpecialty(itemValue)}
              style={styles.picker}
            >
              {specialties.map((item, index) => (
                <Picker.Item key={index} label={item} value={index === 0 ? '' : item} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Primary Work Setting</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={workSetting}
              onValueChange={(itemValue) => setWorkSetting(itemValue)}
              style={styles.picker}
            >
              {workSettings.map((item, index) => (
                <Picker.Item key={index} label={item} value={index === 0 ? '' : item} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Career Stage</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={careerStage}
              onValueChange={(itemValue) => setCareerStage(itemValue)}
              style={styles.picker}
            >
              {careerStages.map((item, index) => (
                <Picker.Item key={index} label={item} value={index === 0 ? '' : item} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Average Weekly Work Hours</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter weekly hours"
            keyboardType="numeric"
            value={workHours}
            onChangeText={setWorkHours}
          />

          <Text style={styles.label}>On-Call Frequency</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={onCallFrequency}
              onValueChange={(itemValue) => setOnCallFrequency(itemValue)}
              style={styles.picker}
            >
              {onCallOptions.map((item, index) => (
                <Picker.Item key={index} label={item} value={index === 0 ? '' : item} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Years of Professional Experience</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter years of experience" 
            keyboardType="numeric" 
            value={yearsExperience}
            onChangeText={setYearsExperience}
          />

          <Text style={styles.label}>Previous Experience with Burnout</Text>
          <Text style={styles.helperText}>On a scale from 1 (none) to 5 (severe)</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group onValueChange={(value) => setPreviousBurnout(value)} value={previousBurnout}>
              <View style={styles.ratingRow}>
                {['1', '2', '3', '4', '5'].map((rating) => (
                  <View key={rating} style={styles.ratingItem}>
                    <RadioButton value={rating} />
                    <Text style={styles.ratingLabel}>{rating}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          </View>
          <View style={styles.ratingLegend}>
            <Text style={styles.ratingLegendText}>None</Text>
            <Text style={styles.ratingLegendText}>Severe</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
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
    padding: 20,
    paddingTop: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  formSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  optionalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#5D92B1',
    borderBottomWidth: 1,
    borderBottomColor: '#5D92B1',
    paddingBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    alignSelf: 'flex-start',
    color: '#333',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioGroup: {
    width: '100%',
    marginVertical: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#333',
  },
  ratingLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
    marginBottom: 10,
  },
  ratingLegendText: {
    fontSize: 14,
    color: '#666',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40,
  },
  submitButton: {
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