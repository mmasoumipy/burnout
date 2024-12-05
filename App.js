import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './Welcome'; 
import Form from './Form';
import Reason from './Resean';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Form" component={Form} />
        <Stack.Screen name="Reason" component={Reason} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
