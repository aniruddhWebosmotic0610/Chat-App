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
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
import firebaseSvc from './firebaseSDK';
import _, { orderBy } from 'lodash'
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function HomeView({ props, navigation }) {
    const [isLoading, setLoading] = useState(false);
    const [userInfo, setUser] = useState();
    const [userList, setUserlist] = useState([]);
    const [chatUserlist, setChatlist] = useState([]);
    const [chatGrouplist, setGrpChatlist] = useState([]);
    const [combinedChatlist, setCombineChatlist] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        fetchData();
    }, [isFocused])

    async function fetchData() {
        const user = await retrieveData();
        const userlist = await user_data();
        const chat = await getChatdata(user.uid, userlist);
        const groupchat = await getGroupChat(user.uid);
    }

    // retrive current user data from firebase using auth 
    function retrieveData() {
        const user = auth().currentUser;
        setLoading(true)
        if (user) {
            setUser({
                uid: user.uid,
                uname: user.displayName,
                uemail: user.email,
                uphoto: user.photoURL
            })
            return user
        }
    }

    // get all userlist data from firebase
    function user_data() {
        return new Promise((resolve) => {
            firebaseSvc.usersData().then((solve) => {
                setUserlist(solve)
                resolve(solve)
            }).catch((fail) => {
                resolve()
                setLoading(false)
                console.log('not getting data')
            })
        })
    }

    //get User list of this user's had chat with latest chat user comes top
    async function getChatdata(uid, userData) {
        // return new Promise((resolve) => {
        if (uid && userData) {
            const ref = await database().ref('/chat_messages')
            ref.child(uid).on('value', (snapshot) => {
                let data = []
                let temp = snapshot.val();
                for (let tempkey in temp) {
                    if (temp[tempkey]['recent_message']) {
                        data.push(temp[tempkey]['recent_message']);
                    }
                    setChatlist(data)
                    setLoading(false)

                }
            })

            // return tdata
        }
        // })
    }

    // get recent groupChat
    function getGroupChat(uid) {
        console.log('uid', uid);
        return new Promise((resolve) => {
            let gData = [];
            const gRef = database().ref('/users_group')
            gRef.child(uid).on('value', (snapshot) => {
                const grp = snapshot.val();
                console.log('grp', grp);
                if (grp) {
                    for (let key in grp) {
                        const grp_id = grp[key].group_id;
                        console.log(grp_id);
                        const detailRef = database().ref('/group_details').child(grp_id)
                        detailRef.on('value', (snapshot) => {
                            const grp_val = snapshot.val();
                            if (grp_val['recent_message']) {
                                let grpObj = { ...grp_val['recent_message'], ...{ "group_id": grp_id } }
                                gData.push(grpObj)
                            }
                            setGrpChatlist(gData);
                        })
                    }

                    if (chatGrouplist.length > 0 || chatUserlist.length > 0) {
                        let combineData = [];
                        console.log('userChat', chatUserlist);
                        console.log('grpChat', chatGrouplist);
                        combineData = [...chatGrouplist, ...chatUserlist];
                        let tdata = orderBy(combineData, ["timestamp"], ['desc'])
                        setCombineChatlist(tdata)
                        setLoading(false)
                        resolve(combineData)
                    }
                }
                else {
                    if (chatGrouplist.length > 0 || chatUserlist.length > 0) {
                        let combineData = [];
                        console.log('userChat', chatUserlist);
                        console.log('grpChat', chatGrouplist);
                        combineData = [...chatGrouplist, ...chatUserlist];
                        let tdata = orderBy(combineData, ["timestamp"], ['desc'])
                        setCombineChatlist(tdata)
                        setLoading(false)
                        resolve(combineData)
                    }
                }

            })
            // gRef.child(uid).off()


        })
    }

    // date convert to DD-MMM H:mm A from seaconds
    function convertDateTime(given_seconds) {
        return moment(given_seconds * 1000).format('hh:mm A');
    }
    const User = userList.map((u_data, i) => {
        if (u_data.uid !== userInfo.uid) {
            return (
                <View style={styles.container} key={u_data.uid}>
                    <TouchableOpacity onPress={() => navigation.navigate('chat', {
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
                                <Text numberOfLines={1} style={{ flex: 1, textAlign: "center", textTransform: "capitalize" }}> {u_data.name}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    })

    const renderItem = ({ item, index }) => (
        <View key={index}>
            <View style={styles.item}>
                {item.text ?
                    <TouchableOpacity onPress={() => navigation.navigate('chat', {
                        uid: userInfo.uid,
                        uname: userInfo.uname,
                        uphoto: userInfo.uphoto,
                        fid: item.from_id,
                        fname: item.from_name,
                        fphoto: item.f_photo
                    })}>

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
                                }}>
                                    {item.from_name}
                                </Text>
                                <View style={{ flexDirection: "row" }} >
                                    <Text numberOfLines={1} style={styles.text}> {item.text}</Text>
                                    <Text style={styles.time}> {convertDateTime(item.timestamp)}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => navigation.navigate('groupChat', {
                        uid: userInfo.uid,
                        uname: userInfo.uname,
                        uphoto: userInfo.uphoto,
                        group_id: item.group_id,
                        group_name: item.group_name
                    })}           >
                        <View style={styles.list_container}>
                            <View style={{ justifyContent: "center", marginRight: 10 }}>
                                <Avatar.Image
                                    source={{
                                        uri: 'https://www.whatsappprofiledpimages.com/wp-content/uploads/2018/11/whatsapp-profile-iopic-lif-300x300.gif'
                                    }}
                                    size={65}
                                    style={{ alignSelf: "center" }}
                                />

                            </View>
                            <View style={{ justifyContent: "center", flex: 1 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    textTransform: "capitalize",
                                }}>
                                    {item.group_name}
                                </Text>
                                <View style={{ flexDirection: "row" }} >
                                    <Text numberOfLines={1} style={styles.text}> {item.group_message}</Text>
                                    <Text style={styles.time}> {convertDateTime(item.timestamp)}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        </View >
    );


    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFAFA" }}>
            <Header title={"Home"} />
            {isLoading ?
                <ActivityIndicator animating={true} style={Styles.loader} />
                :
                <View>
                    <ScrollView horizontal={true} style={{ backgroundColor: "#fff" }}>
                        {User}
                    </ScrollView>
                    <View style={{ flexDirection: "row-reverse", padding: 10, elevation: 5, backgroundColor: "#fff" }}>
                        <TouchableOpacity onPress={() => navigation.navigate('add-group')}><Text style={{ color: "#007AFF", fontSize: 16 }}> + New Group</Text></TouchableOpacity>
                    </View>
                    <FlatList
                        data={combinedChatlist}
                        renderItem={renderItem}
                        style={{ backgroundColor: "#FFFAFA" }}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={{
                            paddingBottom: 200,
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
    text: {
        color: '#808080',
        fontSize: 14,
        flex: 1
    },
    time: {
        color: '#808080',
        fontSize: 14,
    },
    item: {
        color: "#D3D3D3",

    }
})

// Extra code for re-use if required


        // return unsubscribe;