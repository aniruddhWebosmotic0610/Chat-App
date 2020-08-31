import React, { useState, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, StyleSheet, CheckBox, Image, Dimensions } from 'react-native'
import { ActivityIndicator, Searchbar, Avatar } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles/styles';
import { ScrollView } from 'react-native-gesture-handler';
import firebaseSvc from './firebaseSDK';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


export default function AddgroupScreen({ navigation }) {
    const [isLoading, setLoading] = useState(false);
    const [group_name, setGroupname] = useState("");
    const [searchText, setSearch] = useState("");
    const [userInfo, setUser] = useState();
    const [userList, setUserlist] = useState([]);
    const [searchData, setSearchdata] = useState([]);
    const [addedUsers, setUsersGroup] = useState([]);
    const searchbarRef = useRef();

    global.addedUser = [];

    useEffect(() => {
        async function fetchData() {
            const res = await retrieveData();
        }
        fetchData();
    }, [])


    // retrive current user data from firebase using auth 
    async function retrieveData() {
        setLoading(true)
        const user = await auth().currentUser;
        setUser({
            uid: user.uid,
            uname: user.displayName,
            uemail: user.email,
            uphoto: user.photoURL
        })
        const response = await user_data();
        return userInfo;
    }

    // get all userlist data from firebase
    function user_data() {
        setUsersGroup([]);
        firebaseSvc.usersData().then((solve) => {
            setUserlist(solve)
            setSearchdata(solve)
            setLoading(false)
            return userList;
        }).catch((fail) => {
            // console.log('not getting data')
        })
    }

    //search functionality for userlist
    function searchUser(search) {
        setSearch(search)
        if (search == '') {
            setUserlist(searchData)
        }
        else {
            const data = userList.filter((item) => {
                return (item.name.toLowerCase().match(search) || item.email.toLowerCase().match(search))
            })
            setUserlist(data)
        }
    }

    function clearSearch() {
        console.log("clear");
    }

    //add user to group and remove it from UserList
    function addUser(user, index) {
        setSearch("")
        const data = searchData.filter((item) => {
            return (item.uid !== user.uid)
        })
        setUserlist(data);
        setSearchdata(data);

        const addData = searchData.filter((item) => {
            return (item.uid == user.uid)

        })
        var temUsers = [...addedUsers, ...addData]
        setUsersGroup(temUsers)
    }

    function removeAddedUser(u_data) {
        let add_Data = addedUsers;
        const data = addedUsers.filter((item) => {
            return (item.uid == u_data.uid)
        })
        const tempUsers = [...data, ...userList]
        setUserlist(tempUsers)
        setSearchdata(tempUsers)

        const removedData = addedUsers.filter((item) => {
            return (item.uid !== u_data.uid)
        })
        setUsersGroup(removedData)
    }

    function save() {

        if (group_name == "") {
            Toast.showWithGravity("Group name is required.", Toast.SHORT, Toast.TOP)
        }
        else if (addedUsers.length == 0) {
            Toast.showWithGravity("Atleast one user is required.", Toast.SHORT, Toast.TOP)
        }
        else {
            let curentUser = []
            const user = {
                uid: userInfo.uid,
                name: userInfo.uname,
                email: userInfo.uemail,
                photoURL: userInfo.uphoto
            }
            curentUser.push(user)
            const members = [...addedUsers, ...curentUser]
            firebaseSvc.addGroupDetails(group_name, members, userInfo).then((response) => {
                console.log('response', response);
                setGroupname("");
                // firebaseSvc.refOff()
                navigation.goBack();
            })

        }
    }

    const renderUser = userList.map((user, index) => {
        return (
            <View key={user.uid}>
                {
                    user.uid !== userInfo.uid &&
                    <View style={style.userContainer}>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ justifyContent: "center", alignSelf: "center" }}>
                                {user.photoURL ?
                                    <Avatar.Image
                                        source={{
                                            uri: user.photoURL
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
                            </View>
                            <View style={{ justifyContent: "center", flex: 1, alignSelf: "center" }}>
                                <Text style={{ fontSize: 16 }} key={user.name}> {user.name}</Text>
                                <Text style={styles.carname} key={user.email}> {user.email}</Text>
                            </View>
                            <View style={{ alignSelf: "center" }}>
                                <TouchableOpacity onPress={() => addUser(user, index)}>
                                    <Icon
                                        name="plus"
                                        color={'black'}
                                        size={30}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                }
            </View>
        )
    })


    const renderAddedusers = addedUsers.map((u_data, i) => {
        return (
            <View style={styles.addedContainer} key={i}>
                <View style={{ width: 60, margin: 10 }}>

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
                    <TouchableOpacity onPress={() => removeAddedUser(u_data)} style={{ position: "absolute", right: 0 }}>
                        <Avatar.Image
                            source={require('../Assets/close.png')}
                            size={20}
                            style={{ backgroundColor: "white" }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )

    })

    return (
        <View>
            {
                isLoading &&
                <ActivityIndicator animating={true} style={styles.loader} />
            }
            <SafeAreaView>
                <View style={{ backgroundColor: '#007AFF', height: 55, width: "100%", flexDirection: 'row' }} >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: "center" }}>
                        <Icon
                            name="arrow-left"
                            color={'white'}
                            size={30}
                            style={{ margin: 10, fontWeight: 'bold' }}
                        />
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, margin: 10, fontSize: 20, fontWeight: 'bold', color: '#fff', textTransform: "capitalize", alignSelf: "center" }}>Add Group</Text>
                </View>

                <ScrollView style={style.container}>
                    <View>
                        <TextInput
                            placeholder="Group Name"
                            onChangeText={name => setGroupname(name)}
                            underlineColorAndroid="transparent"
                            style={style.TextInput}
                        />
                    </View>
                    {addedUsers.length > 0 &&
                        <ScrollView horizontal={true} style={{ backgroundColor: "#fff", elevation: 5, marginTop: 10 }}>
                            {renderAddedusers}
                        </ScrollView>
                    }
                    <View style={{ marginTop: 15 }}>
                        <Searchbar placeholder="Type here..." onChangeText={searchUser} style={style.searchInput} clea={clearSearch}
                            value={searchText} />
                        <View>
                            {renderUser}
                        </View>
                    </View>
                </ScrollView>
                <View style={{ width: screenWidth, backgroundColor: "white", height: 70, flexDirection: "row-reverse" }} >
                    <View style={{ flexDirection: "row-reverse" }}>
                        <TouchableOpacity
                            style={style.saveBtn}
                            onPress={save}>
                            <Text style={{
                                color: '#fff', fontWeight: 'bold', alignSelf: "center"
                            }}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={style.cancelBtn}
                            onPress={() => navigation.goBack()}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', alignSelf: "center" }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

        </View >

    )
}

const style = StyleSheet.create({
    container: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        height: screenHeight - 150
    },
    TextInput: {
        width: '100%',
        padding: 10,
        paddingStart: 20,
        marginTop: 25,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 20,
        backgroundColor: "#fff"
    },
    userContainer: {
        marginTop: 15,
    },
    addedContainer: {
        margin: 10
    },
    searchInput: {
        borderRadius: 20
    },
    errorMsg: {
        color: 'red',
        marginTop: 5,
        marginStart: 10,
        alignSelf: "flex-start"
    },
    saveBtn: {
        alignItems: "flex-end",
        backgroundColor: "#007AFF",
        padding: 10,
        elevation: 5,
        borderRadius: 10,
        color: '#fff',
        alignSelf: 'center',
        margin: 10,
        width: 100
    },
    cancelBtn: {
        backgroundColor: "#CD5C5C",
        padding: 10,
        elevation: 5,
        borderRadius: 10,
        alignSelf: 'center',
        width: 100
    }
})
