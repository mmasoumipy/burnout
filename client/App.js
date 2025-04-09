import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Welcome from './Welcome';
import Form from './Form';
import Reason from './Reason';
import HomePlan from './HomePlan';
import HomeSetTime from './HomeSetTime';
import Explore from './Explore';
import Chat from './Chat';
import Profile from './Profile';
import TakeTest from './TakeTest';
import Register from './Register';
import Setting from './Setting';
import MicroAssessment from './MicroAssessment';
import { UserProvider } from './UserContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <UserProvider> 
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Form" component={Form} />
          <Stack.Screen name="Reason" component={Reason} />
          <Stack.Screen name='HomePlan' component={HomePlan} />
          <Stack.Screen name='HomeSetTime' component={HomeSetTime} />
          <Stack.Screen name='Explore' component={Explore} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="TakeTest" component={TakeTest} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="MicroAssessment" component={MicroAssessment} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
