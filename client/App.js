
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import Welcome from './Welcome';
import Register from './Register'; // Assuming you have this component
import Form from './Form'; // Using our updated Form component
import Reason from './Reason'; // Using our updated Reason component
import HomePlan from './HomePlan'; // Assuming you have this component
import ProfileNavigation from './ProfileNavigation'; // Our navigation handler
import Chat from './Chat'; // Assuming you have this component
import Profile from './Profile'; // Assuming you have this component
import Setting from './Setting'; // Assuming you have this component
import HomeSetTime from './HomeSetTime';
import Explore from './Explore';
import TakeTest from './TakeTest';
import MicroAssessment from './MicroAssessment';


// Import context
import { UserContext } from './UserContext';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Store user data when it changes
  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      AsyncStorage.setItem('user', JSON.stringify(userData))
        .catch(error => console.error('Error saving user to storage:', error));
    } else {
      AsyncStorage.removeItem('user')
        .catch(error => console.error('Error removing user from storage:', error));
    }
  };

  if (isLoading) {
    return null; // TODO:  Or a loading screen
  }

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={user ? "ProfileCheck" : "Welcome"}
          screenOptions={{ 
            headerShown: false,
            // Common styling for all screens
            cardStyle: { backgroundColor: '#FAF9F6' }
          }}
          >
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Form" component={Form} />
            <Stack.Screen name="Reason" component={Reason} />
            <Stack.Screen name="HomePlan" component={HomePlan} />
            <Stack.Screen name="ProfileCheck" component={ProfileNavigation} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Setting" component={Setting} />
            <Stack.Screen name="Explore" component={Explore} />
            <Stack.Screen name="TakeTest" component={TakeTest} />
            <Stack.Screen name="HomeSetTime" component={HomeSetTime} />
            <Stack.Screen name="MicroAssessment" component={MicroAssessment} />

        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}
