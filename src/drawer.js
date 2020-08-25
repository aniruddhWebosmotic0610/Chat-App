import React, { Component, useEffect, useState } from 'react';
import {
  createDrawerNavigator
} from '@react-navigation/drawer';

import HomeView from './homescreen';


import { DrawerContent } from './drawerContent';
import { AsyncStorage } from 'react-native';
import ContactScreen from './contacts';



// const CustomDrawerComponent = (props) => (
//     <SafeAreaView>
//         <ScrollView>
//             <DrawerItems {...props} />
//         </ScrollView>
//     </SafeAreaView>
// )

const Drawer = createDrawerNavigator();

export function DrawerNavigator({ navigation, route }) {

  const [userInfo, setUser] = useState();
  // console.log(route);
  useEffect(() => {
    const userInfo = route.params.user
    saveData(userInfo)
  })
  const saveData = async (data) => {
    var userData = JSON.parse(data);
    // setUser(userData)
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    // XXX: Removed state logic, call it somewhere else.
  };


  return (
    <Drawer.Navigator initialRouteName="Home" drawerContent={(props) => <DrawerContent  {...props} />}>
      <Drawer.Screen name="Home" component={HomeView} title="Home" />
      <Drawer.Screen name="contacts" component={ContactScreen} />
    </Drawer.Navigator >
  )
}

