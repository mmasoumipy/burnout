import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Switch, Dimensions, TextInput } from 'react-native';
import { loginUser } from './api';
import { UserContext } from './UserContext';
import { all } from 'axios';


export default function Welcome({ navigation }) {

  const { setUser } = useContext(UserContext);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
  
    try {
      console.log("Sending to API:", { email, password }); 
      const res = await loginUser(email, password);
      alert("Login successful");
      setUser(res.data.user);
      navigation.navigate('Form');
    } catch (err) {
      console.log("Login error:", err?.response?.data || err.message);
      alert(err?.response?.data?.detail || "Login failed");
    }
  };  
  

  return (
    <View style={styles.container}>
      {/* Full image at the top */}
      <View style={styles.imageContainer}>
        <Image source={require('./assets/images/logo_half.png')} style={styles.logo} />
      </View>

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.appName}>WellMed</Text>
        <Text style={styles.description}>
          A very short explanation of the goal of the application
        </Text>
      </View>

      {/* Terms and conditions */}
      {/* Switch component to toggle the terms and conditions 
      <View style={styles.termsContainer}>
        <Switch
          value={isChecked}
          onValueChange={setIsChecked}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={isChecked ? '#f4f3f4' : '#f4f3f4'}
        />
        <Text style={styles.termsText}>Terms And Conditions</Text>
      </View>
      */}

      {/* Login Inputs */}
      <View style={styles.loginFields}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>      
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createAccountButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Create an account</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
  },
  
  imageContainer: {
    width: '100%',
    alignItems: 'flex-start',
    height: Dimensions.get('window').width / 2,
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
    marginTop: 20,           // added
  },
  loginButton: {
    backgroundColor: '#E0E0E0',
    width: '70%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    marginTop: 10,           // added
    marginBottom: 20,        // added
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginFields: {
    width: '70%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
});
