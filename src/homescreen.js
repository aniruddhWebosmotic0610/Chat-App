import React, { Component, useEffect, useState, useRef } from 'react';

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
import CardView from 'react-native-cardview'


import { TouchableOpacity } from 'react-native-gesture-handler';

import { Header } from './header';
import auth from '@react-native-firebase/auth'
import firebaseSvc from './firebaseSDK';
import _, { orderBy, uniqBy } from 'lodash'
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



export default function HomeView({ props, navigation }) {
    const [isLoading, setLoading] = useState(false);
    const [userInfo, setUser] = useState();
    const [userList, setUserlist] = useState([]);
    const [combinedChatlist, setCombineChatlist] = useState([]);

    useEffect(() => {
        let isRendered = true
        async function fetchData() {
            const user = await retrieveData();
            const userlist = await user_data();
            const chat = await getChatdata(user.uid, userlist)
        }
        fetchData()
        return () => {
            isRendered = false
        }
    }, [navigation])

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
    function getChatdata(uid, userData) {
        return new Promise(async (resolve) => {
            if (uid && userData) {
                const ref = await firestore().collection('chatie_user')
                ref.doc(uid).collection('recent_message').onSnapshot((snapshot) => {
                    var data = [];
                    snapshot.forEach(function (doc) {
                        data.push(doc.data());
                    });
                    let tdata = orderBy(data, ["timestamp"], ['desc'])
                    setCombineChatlist(tdata)
                    setLoading(false)
                    resolve(tdata)
                    // dispatchMessages({ type: 'add', payload: snapshot.docs });
                },
                    error => {
                        console.error('getMessages error', error);
                    },
                );
            }
        })
    }

    function addGroup() {
        navigation.navigate('add-group')
    }

    // date convert to DD-MMM H:mm A from seaconds
    function convertDateTime(given_seconds) {
        return moment(given_seconds * 1000).format('hh:mm A');
    }

    //View of horizontal userlist 
    const User = userList.map((u_data, i) => {
        if (u_data.uid !== userInfo.uid) {
            return (
                <View style={styles.container} key={u_data.uid.toString()}>
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

    //render Flatlist of recent chats
    const renderItem = ({ item, index }) => (
        <View key={String(index)}>
            <View style={styles.item}>
                {item && (item.text || item.image) &&
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('chat', {
                            uid: userInfo.uid,
                            uname: userInfo.uname,
                            uphoto: userInfo.uphoto,
                            fid: item.from_id,
                            fname: item.from_name,
                            fphoto: item.f_photo
                        })
                    }}>

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
                                    <View style={{ flex: 1, flexDirection: "row" }}>
                                        {item.image &&
                                            <View style={{ flexDirection: 'row' }}>

                                                <Icon
                                                    name="camera"
                                                    color={'gray'}
                                                    size={20}

                                                />
                                                <Text numberOfLines={1} style={styles.text}>
                                                    Image!!</Text>
                                            </View>

                                        }
                                        {item.text !== "" &&
                                            <View style={{ flex: 1, flexDirection: "row" }}>
                                                < Text numberOfLines={1} style={styles.text}> {item.text}</Text>
                                            </View>
                                        }
                                    </View>

                                    <View>
                                        <Text style={styles.time}> {convertDateTime(item.timestamp)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                }
                {item && (item.group_message || item.group_image) &&
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('groupChat', {
                            uid: userInfo.uid,
                            uname: userInfo.uname,
                            uphoto: userInfo.uphoto,
                            group_id: item.group_id,
                            group_name: item.group_name
                        })
                    }}           >
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
                                    <View style={{ flex: 1, flexDirection: "row" }}>
                                        {item.group_image &&
                                            <View style={{ flexDirection: 'row' }}>

                                                <Icon
                                                    name="camera"
                                                    color={'gray'}
                                                    size={20}

                                                />
                                                <Text numberOfLines={1} style={styles.text}>
                                                    Image!!</Text>
                                            </View>

                                        }
                                        {item.group_message !== "" &&
                                            <View style={{ flex: 1, flexDirection: "row" }}>
                                                < Text numberOfLines={1} style={styles.text}> {item.group_message}</Text>
                                            </View>
                                        }
                                    </View>

                                    <View>
                                        <Text style={styles.time}> {convertDateTime(item.timestamp)}</Text>
                                    </View>
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
            {isLoading &&
                <ActivityIndicator animating={true} style={Styles.loader} />
            }
            <View>
                <Header title={"Home"} />
                <ScrollView horizontal={true} style={{ backgroundColor: "#fff" }}>
                    {User}
                </ScrollView>
                <CardView cardElevation={2} style={{ flexDirection: "row-reverse", padding: 10, backgroundColor: "#fff" }}>
                    <TouchableOpacity onPress={() => addGroup()}><Text style={{ color: "#007AFF", fontSize: 16 }}> + New Group</Text></TouchableOpacity>
                </CardView>
                <FlatList
                    data={combinedChatlist}
                    renderItem={renderItem}
                    style={{ backgroundColor: "#FFFAFA" }}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{
                        paddingBottom: 220,
                    }} />
            </View>
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