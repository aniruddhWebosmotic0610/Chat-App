import React, { Component, useEffect, useState } from 'react';

import {
    Text,
    Button,
    SafeAreaView,
    View,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView
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

const screenWidth = Math.round(Dimensions.get('window').width);

export default class HomeView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            auth_data: [],
            uid: '',
            uname: '',
            uemail: '',
            uphoto: '',
            isLoading: false,
            chatData: []
        }

    }
    componentDidMount = () => {
        this._retrieveData()
        this.user_data()
    }
    // retrive current user data from firebase using auth 
    _retrieveData = () => {
        let user = auth().currentUser;
        this.setState({
            uid: user.uid,
            uname: user.displayName,
            uemail: user.email,
            uphoto: user.photoURL
        })
    }
    // get all userlist data from firebase
    user_data = () => {
        this.setState({ isLoading: true })
        firebaseSvc.usersData().then((solve) => {
            this.setState({ auth_data: solve })
            this.setState({ isLoading: false })

        }).catch((fail) => {
            console.log('not getting data')
        })
    }

    render() {
        let Data = this.state.auth_data
        let User = Data.map((u_data, i) => {
            if (u_data.uid !== this.state.uid) {
                return (
                    <View style={styles.container}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Chat', {
                            uemail: this.state.uemail,
                            uid: this.state.uid,
                            uname: this.state.uname,
                            uphoto: this.state.uphoto,
                            fid: u_data.uid,
                            fname: u_data.name,
                            femail: u_data.email,
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
                                    <Text numberOfLines={1} style={{ flex: 1, textAlign: "center" }} key={u_data.name}> {u_data.name}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>


                )
            }
        })

        return (

            <SafeAreaView>
                <Header title={"Home"} />
                {this.state.isLoading ?
                    <ActivityIndicator animating={true} style={Styles.loader} />
                    :
                    <View>
                        <ScrollView horizontal={true} style={{ backgroundColor: "#fff" }}>
                            {User}
                        </ScrollView>
                    </View>
                }
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20
    },
    backarrow: {
        marginTop: 10,
        paddingBottom: 10,
    },
    nav_icon: {
        width: 40,
        height: 40,
    },
    search_header: {
        width: screenWidth - 100,
        flexDirection: 'row',
    },
    search_icon: {
        width: 30,
        height: 30,
        margin: 5,
    },
    search_box: {
        //height: 40,
        paddingTop: 10,
        //paddingBottom: 5,
        borderBottomColor: '#fff',
        color: '#000000',
        fontSize: 15,
        opacity: 1,
        width: screenWidth - 200,
        borderBottomWidth: StyleSheet.hairlineWidth,
        //fontFamily:"Poppins"
    },
    home_padding: {
        padding: 10,
        backgroundColor: "#ffffff",
        flex: 1
    },
    list_img: {
        width: '100%',
        height: 115,
        marginRight: 4,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    forwidth_left: {
        width: '30%',
        //paddingBottom:30
    },
    forwidth_right:
    {
        width: '50%'
    },
    price: {
        color: '#0b85bd',
        fontSize: 14,
        flexWrap: "nowrap"
    },
    carname: { color: '#010000', fontSize: 10, },
    list_img: {
        width: '100%',
        height: 115,
        marginRight: 4,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    list: {
        width: '100%',
        flexDirection: 'row',
        borderBottomColor: '#e3e3e1',
        // borderBottomWidth:2 ,
        paddingTop: 0,
        paddingBottom: 0,

        //marginTop: 3,
        //width: screenWidth / 2 - 30,
        //marginRight: 20		
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
})