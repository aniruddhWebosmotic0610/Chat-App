import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import WelcomeScreen from './compoents/welcome'
import Styles from './compoents/styles/styles'
import { DrawerNavigator } from './compoents/drawer'
import HomeView from './compoents/homescreen';
import LoginScreen from './compoents/login';
import SignupScreen from './compoents/signup';
import { Alert, TouchableOpacity, Image, StatusBar } from 'react-native';
import ChatScreen from './compoents/chat';

const Stack = createStackNavigator();





export default function App({ navigation }) {
  console.disableYellowBox = true;
  // componentDidMount = () => {
  //   GoogleSignin.configure({
  //     webClientId: '1013171964319-ru5voe2f9cjq8tq8655b4jcljm5kogds.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
  //     offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  //   });
  //   firebase.initializeApp({
  //     apiKey: "AIzaSyChR_fE4fEdk62uwuGyLCQjIQygJ6YafQM",
  //     authDomain: "chat-app-492b6.firebaseapp.com",
  //     databaseURL: "https://chat-app-492b6.firebaseio.com",
  //     projectId: "chat-app-492b6",
  //     storageBucket: "chat-app-492b6.appspot.com",
  //     messagingSenderId: "1013171964319",
  //     appId: "1:1013171964319:web:6d3b3c84d7e26878b0d5aa",
  //     measurementId: "G-CJX7EB9QPL"
  //   });
  // }

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


