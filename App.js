import React, { Component, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import WelcomeScreen from './src/welcome'
import { DrawerNavigator } from './src/drawer'
import LoginScreen from './src/login';
import SignupScreen from './src/signup';
import ChatScreen from './src/chat';
import { StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen'
import AddgroupScreen from './src/add_group';
import GroupchatScreen from './src/groupChat';



const Stack = createStackNavigator();

export default function App({ navigation }) {

  useEffect(() => {
    SplashScreen.hide();
  }, [])
  console.disableYellowBox = true;
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="blue"></StatusBar>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="add-group" component={AddgroupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="groupChat" component={GroupchatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="chat" component={ChatScreen} options={{
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


