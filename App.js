import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Switch, Dimensions } from 'react-native';

export default function App() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View style={styles.container}>
      {/* Full image at the top */}
      <View style={styles.imageContainer}>
        <Image source={require('./assets/logo_half.png')} style={styles.logo} />
      </View>

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.appName}>APP NAME</Text>
        <Text style={styles.description}>
          A very short explanation of the goal of the application
        </Text>
      </View>

      {/* Terms and conditions */}
      <View style={styles.termsContainer}>
        <Switch
          value={isChecked}
          onValueChange={setIsChecked}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={isChecked ? '#f4f3f4' : '#f4f3f4'}
        />
        <Text style={styles.termsText}>Terms And Conditions</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.createAccountButton}>
        <Text style={styles.buttonText}>Create an account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'flex-start',
    height: Dimensions.get('window').width/2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6', 
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', 
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'left',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginTop: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 10,
  },
  createAccountButton: {
    backgroundColor: '#007AFF',
    width: '70%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 1,
  },
  loginButton: {
    backgroundColor: '#E0E0E0',
    width: '70%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});