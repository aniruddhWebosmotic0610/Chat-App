import React, { useEffect } from 'react';
import {
  createDrawerNavigator
} from '@react-navigation/drawer';
import HomeView from './homescreen';
import { DrawerContent } from './drawerContent';
import AsyncStorage from '@react-native-community/async-storage';
import ContactScreen from './contacts';

const Drawer = createDrawerNavigator();

export function DrawerNavigator({ navigation, route }) {

  // console.log(route);
  useEffect(() => {
    const userInfo = route.params.user
    saveData(userInfo)
  })
  const saveData = async (data) => {
    var userData = JSON.parse(data);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };


  return (
    <Drawer.Navigator initialRouteName="Home" drawerContent={(props) => <DrawerContent  {...props} />}>
      <Drawer.Screen name="Home" component={HomeView} title="Home" />
      <Drawer.Screen name="Contacts" component={ContactScreen} title="Contacts" />
    </Drawer.Navigator >
  )
}

