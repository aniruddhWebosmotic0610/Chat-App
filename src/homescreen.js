import React, { Component, useEffect, useState } from 'react';

import {
    Text,
    Button,
    SafeAreaView,
    View,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList
} from 'react-native';
import {
    Avatar, ActivityIndicator
} from 'react-native-paper';
import Styles from './styles/styles';


import { TouchableOpacity } from 'react-native-gesture-handler';

import { Header } from './header';
import firebase from '@react-native-firebase/app'
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
import firebaseSvc from './firebaseSDK';
import _, { orderBy } from 'lodash'
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);



export default function HomeView({ props, navigation }) {
    const [isLoading, setLoading] = useState(true);
    const [userInfo, setUser] = useState();
    const [userList, setUserlist] = useState([]);
    const [chatUserlist, setChatlist] = useState([]);
    const [retrived, setRetrived] = useState(false);


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            _retrieveData();
        });
        return unsubscribe;
    }, [navigation])

    // retrive current user data from firebase using auth 
    function _retrieveData() {
        const user = auth().currentUser;
        if (user) {
            setUser({
                uid: user.uid,
                uname: user.displayName,
                uemail: user.email,
                uphoto: user.photoURL
            })
            getChatdata(user.uid)
        }
    }

    //get User list of this user's had chat with latest chat user comes top
    function getChatdata(uid) {
        if (uid) {
            firebaseSvc.getLatestMsgs(uid).then((res) => {
                setChatlist(res)
                user_data()
                setRetrived(false)

            }).catch((fail) => {
                console.log('not getting message data')
                setRetrived(false)
            })
        }
    }
    // get all userlist data from firebase
    function user_data() {
        firebaseSvc.usersData().then((solve) => {
            setUserlist(solve)
            setLoading(false)
            setRetrived(true)
            getChatdata()
        }).catch((fail) => {
            setLoading(false)
            console.log('not getting data')
        })
    }


    // date convert to DD-MMM H:mm A from seaconds
    function convertDateTime(given_seconds) {
        return moment(given_seconds * 1000).format('H:mm A');
    }

    const User = userList.map((u_data, i) => {
        if (u_data.uid !== userInfo.uid) {
            return (
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.navigate('Chat', {
                        uid: userInfo.uid,
                        uname: userInfo.uname,
                        uphoto: userInfo.uphoto,
                        fid: u_data.uid,
                        fname: u_data.name,
                        fphoto: u_data.photoURL
                    })}>
                        <View style={{ width: 60 }}>
                            {u_data.photoURL ?
                                <Avatar.Image
                                    source={{
                                        uri: u_data.photoURL
                                    }}
                                    size={55}
                                    style={{ alignSelf: "center" }}
                                />
                                :
                                <Avatar.Image
                                    source={{
                                        uri: 'https://www.whatsappprofiledpimages.com/wp-content/uploads/2018/11/whatsapp-profile-iopic-lif-300x300.gif'
                                    }}
                                    size={55}
                                    style={{ alignSelf: "center" }}
                                />
                            }
                            <View style={{ flexDirection: "row" }}>
                                <Text numberOfLines={1} style={{ flex: 1, textAlign: "center", textTransform: "capitalize" }} key={u_data.name}> {u_data.name}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    })

    const renderItem = ({ item }) => (
        <View>
            <View style={styles.item}>
                <TouchableOpacity onPress={() => navigation.navigate('Chat', {
                    uid: userInfo.uid,
                    uname: userInfo.uname,
                    uphoto: userInfo.uphoto,
                    fid: item.from_id,
                    fname: item.from_name,
                    fphoto: item.f_photo
                })}>
                    {item.text &&

                        <View style={styles.list_container}>
                            <View style={{ justifyContent: "center", marginRight: 10 }}>
                                {item.f_photo ?
                                    <Avatar.Image
                                        source={{
                                            uri: item.f_photo
                                        }}
                                        size={65}
                                        style={{ alignSelf: "center" }}
                                    />
                                    :
                                    <Avatar.Image
                                        source={{
                                            uri: 'https://www.whatsappprofiledpimages.com/wp-content/uploads/2018/11/whatsapp-profile-iopic-lif-300x300.gif'
                                        }}
                                        size={65}
                                        style={{ alignSelf: "center" }}
                                    />
                                }
                            </View>
                            <View style={{ justifyContent: "center", flex: 1 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    textTransform: "capitalize",
                                }} key={item.name}>
                                    {item.from_name}
                                </Text>
                                <View style={{ flexDirection: "row" }} key={item.text}>
                                    <Text numberOfLines={1} style={styles.carname}> {item.text}</Text>
                                    <Text> {convertDateTime(item.timestamp)}</Text>
                                </View>
                            </View>
                        </View>
                    }
                </TouchableOpacity>
            </View>
        </View>
    );


    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFAFA" }}>
            <Header title={"Home"} />
            {isLoading ?
                <ActivityIndicator animating={true} style={Styles.loader} />
                :
                <View>
                    <ScrollView horizontal={true} style={{ backgroundColor: "#fff", elevation: 5 }}>
                        {User}
                    </ScrollView>
                    <FlatList
                        data={chatUserlist}
                        renderItem={renderItem}
                        style={{ backgroundColor: "#FFFAFA" }}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={{
                            paddingBottom: 180,
                        }} />


                </View>
            }
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20
    },
    list_container: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#D3D3D3",
        padding: 10
    },
    carname: {
        color: '#010000',
        fontSize: 14,
        flex: 1
    },
    item: {
        color: "#D3D3D3",

    }
})