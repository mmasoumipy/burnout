import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { UserContext } from './UserContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { updatePassword, updateName } from './api'; 


export default function Setting({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [healthPermission, setHealthPermission] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setHealthPermission(user.healthPermission);
    }
  }, [user]);


  const handleNameUpdate = async () => {
    if (name.trim() === '') {
      Alert.alert('Name cannot be empty');
      return;
    }
  
    try {
      await updateName(user.id, name);
      setUser({ ...user, name });
      Alert.alert('Name updated successfully!');
    } catch (err) {
      Alert.alert('Error updating name', err.response?.data?.detail || 'Failed to update name');
    }
  };
  

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    updatePassword(user.id, currentPassword, newPassword)
      .then(() => {
        Alert.alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err) => {
        Alert.alert('Error updating password', err.response?.data?.detail || 'Failed to update password');
      });
  };

  const handleHealthToggle = (value) => {
    setHealthPermission(value);
    Alert.alert(value ? 'Connected to Health app' : 'Disconnected from Health app');
    // TODO: handle permission logic
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBackground}>
        <Image source={require('./assets/images/logo_half.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Change Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter new name"
        />
        <TouchableOpacity style={styles.button} onPress={handleNameUpdate}>
          <Text style={styles.buttonText}>Update Name</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Change Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="New password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            if (newPassword !== confirmPassword) {
              Alert.alert("Passwords do not match");
              return;
            }
            try {
              await updatePassword(user.id, currentPassword, newPassword);
              Alert.alert("Password updated successfully");
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            } catch (err) {
              Alert.alert("Error", err.response?.data?.detail || "Failed to update password");
            }
          }}
        >
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoBackground: {
    width: '100%',
    height: Dimensions.get('window').width / 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    opacity: 0.4,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    padding: 10,
    opacity: 0.7,
  },
  icon: {
    width: 30,
    height: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 60,
    color: '#000',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#5D92B1',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
});
