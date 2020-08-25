import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import WelcomeScreen from './src/welcome'
import { DrawerNavigator } from './src/drawer'
import LoginScreen from './src/login';
import SignupScreen from './src/signup';
import ChatScreen from './src/chat';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator();

export default function App({ navigation }) {
  console.disableYellowBox = true;
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="blue"></StatusBar>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{
          headerShown: false
        }} />
        <Stack.Screen name="Drawer" component={DrawerNavigator}
          options={{
            title: 'Home',
            headerShown: false
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


