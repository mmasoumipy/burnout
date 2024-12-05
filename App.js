import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './Welcome'; 
import Form from './Form';
import Reason from './Resean';
import HomePlan from './HomePlan';
import HomeSetTime from './HomeSetTime';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Form" component={Form} />
        <Stack.Screen name="Reason" component={Reason} />
        <Stack.Screen name='HomePlan' component={HomePlan} />
        <Stack.Screen name='HomeSetTime' component={HomeSetTime} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
