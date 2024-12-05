import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { RadioButton } from 'react-native-paper'; 

export default function Form({ navigation }) {
  const [gender, setGender] = useState('Female');
  const [hasChildren, setHasChildren] = useState('Yes');
  const [marital, setMarital] = useState('Married')

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image source={require('./assets/logo.jpg')} style={styles.backgroundImage} />

      {/* Form content */}
      <View style={styles.content}>
        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} placeholder="Enter your age" />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={(value) => setGender(value)} value={gender}>
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
          </RadioButton.Group>
        </View>

        <Text style={styles.label}>Marital Status</Text>
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={(value) => setMarital(value)} value={gender}>
            <View style={styles.radioItem}>
              <RadioButton value="Married" />
              <Text style={styles.radioLabel}>Married</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="Single" />
              <Text style={styles.radioLabel}>Single</Text>
            </View>
          </RadioButton.Group>
        </View>

        <Text style={styles.label}>Do you have children?</Text>
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={(value) => setHasChildren(value)} value={hasChildren}>
            <View style={styles.radioItem}>
              <RadioButton value="Yes" />
              <Text style={styles.radioLabel}>Yes</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="No" />
              <Text style={styles.radioLabel}>No</Text>
            </View>
          </RadioButton.Group>
        </View>

        <Text style={styles.label}>Years of Professional Experience:</Text>
        <TextInput style={styles.input} placeholder="Enter years of experience" />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate('Reason')}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    alignSelf: 'flex-start',
    color: '#333',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  radioGroup: {
    width: '100%',
    marginVertical: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
