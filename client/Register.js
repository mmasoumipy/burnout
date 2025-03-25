import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { registerUser } from './api';
import { SensorType } from 'react-native-reanimated';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#?$%^&*()\[\]\-_=+<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters and include lowercase, uppercase, number, and special character.");
      return;
    }

    try {
      const res = await registerUser(name, email, password);
      alert(res.data.message);
      navigation.navigate('Welcome');
    } catch (err) {
        console.log('Registration error:', err);
        alert(err.response?.data?.detail || "Registration failed");
      }
      
  };

  const handleGoogleRegister = () => {
    alert("Google Sign-In not implemented yet.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Welcome to WellMed</Text>
      <Text style={styles.subtitle}>Create an account to get started</Text>

      <View style={styles.form}>

      <TextInput
          placeholder="Your Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          style={styles.input}
          keyboardType="default"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                source={require('./assets/images/google.png')}
                style={styles.googleIcon}
                />
                <Text style={styles.googleText}>Register with Google</Text>
            </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6C7A89',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderColor: '#DDD',
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 15,
  },
  registerButton: {
    backgroundColor: '#0077CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleText: {
    fontSize: 15,
    color: '#333',
  },
  loginLink: {
    textAlign: 'center',
    color: '#0077CC',
    marginTop: 12,
    fontSize: 14,
  },
});
