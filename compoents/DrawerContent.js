import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, AsyncStorage } from 'react-native';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import firebase from '@react-native-firebase/app'


// import{ AuthContext } from '../components/context';

export function DrawerContent(props, route) {

    const [userdata, setData] = useState();
    const [retrieve, setRetrieve] = useState(false);

    useEffect(() => {
        if (!retrieve) {
            retrieveData();
        }
    })

    const retrieveData = async () => {
        try {
            const valueString = await AsyncStorage.getItem('user');
            const value = JSON.parse(valueString);
            if (value) {
                setData(value)
                setRetrieve(true)
            }
        } catch (error) {
            // console.log(error);
        }
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={styles.userInfoSection}>

                {userdata &&
                    <View>
                        {(userdata.photoURL == "" || userdata.photoURL == null) ?
                            <Avatar.Image
                                source={require('../Assets/user.png')}
                                size={80}
                            />
                            :
                            <Avatar.Image
                                source={{ uri: userdata.photoURL }}
                                size={80}
                            />
                        }
                        <Title style={styles.title}>{userdata.displayName ? userdata.displayName : ''}</Title>
                        <Caption style={styles.caption}>{userdata.email ? userdata.email : ''}</Caption>
                    </View>
                }
            </View>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={() => (
                                <Icon
                                    name="home-outline"
                                    color={'black'}
                                    size={20}
                                />
                            )}
                            label="Home"
                            onPress={() => { props.navigation.navigate('Home') }}
                            labelStyle={{ color: 'black', fontWeight: "bold" }}
                        />
                    </Drawer.Section>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={() => (
                                <Icon
                                    name="account-group"
                                    color={'black'}
                                    size={20}
                                />
                            )}
                            label="Contacts"
                            onPress={() => { props.navigation.navigate('contacts') }}
                            labelStyle={{ color: 'black', fontWeight: "bold" }}
                        />
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({ color, size }) => (
                        <Icon
                            name="exit-to-app"
                            color={'black'}
                            size={20}
                        />
                    )}
                    label="Sign Out"
                    onPress={() => {
                        firebase.auth().signOut().then(function () {
                            // console.log("Sign-out successful.");
                            props.navigation.navigate("login")
                        }).catch(function (error) {
                            // console.log("An error happened when signing out");
                        });
                    }}
                    labelStyle={{ color: 'black', fontWeight: "bold" }}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        padding: 10,
        backgroundColor: 'blue'
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
        color: 'white'
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
        color: 'white'
    },
    row: {
        marginTop: 20,
        alignItems: 'flex-start',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        margin: 0,
        padding: 0

    },
    bottomDrawerSection: {
        borderTopColor: '#f1f1f1',
        borderTopWidth: 1
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});
