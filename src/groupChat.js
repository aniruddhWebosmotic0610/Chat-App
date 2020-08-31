import React, { Component, useRef } from 'react'

import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    Keyboard
} from 'react-native';
import firebaseSvc from './firebaseSDK';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import { orderBy } from 'lodash';
import moment from 'moment';
import Styles from './styles/styles';
import database from '@react-native-firebase/database'

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class GroupchatScreen extends Component {
    scrollView;
    constructor(props) {
        super(props);
        this.state = {
            u_id: '',
            u_name: '',
            text: '',
            chatData: [],
            messages: [],
            isLoading: false,
            group_id: ''
        }
    }

    componentDidMount = () => {
        this.retrieveData();
    }

    // retrive previous Screen data
    retrieveData = () => {
        this.setState({
            u_id: this.props.route.params.uid,
            u_name: this.props.route.params.uname,
            u_photo: this.props.route.params.uphoto,
            group_id: this.props.route.params.group_id,
            group_name: this.props.route.params.group_name,

        })
        this.getChatdata();
    }

    //  function is use to get chats from  database
    getChatdata = async () => {
        if (this.props.route.params.group_id) {
            const ref = await database().ref('/group_messages')
            ref.child(this.props.route.params.group_id).on('value', (snapshot) => {
                let data = []
                let temp = snapshot.val();
                console.log('temp', temp);
                for (let tempkey in temp) {
                    data.push(temp[tempkey]);
                }
                let tempdata = orderBy(data, ["timestamp"], ['asc'])
                this.setState({
                    isLoading: false,
                    chatData: tempdata
                })
            })
        }
    }

    // send message function to store sent message to firebase 
    onSend = () => {
        this.textInput.clear()
        firebaseSvc.sendGroupmsg(
            this.state.group_id,
            this.state.group_name,
            this.state.text,
            this.state.u_id,
            this.state.u_name,
            this.state.u_photo ? this.state.u_photo : null,
        )
        this.setState({
            text: ""
        })
        Keyboard.dismiss();
    }
    // date convert to DD-MMM H:mm A from seaconds
    convertDateTime = (given_seconds) => {
        return moment(given_seconds).format('DD-MMM hh:mm A');
    }

    render() {
        let chats = this.state.chatData.map((c_data, i) => {
            if (c_data.user_id == this.state.u_id) {
                return (
                    <View style={{
                        flexDirection: "row-reverse", margin: 5,
                    }} key={i}>
                        {this.state.u_photo ?
                            <Avatar.Image
                                source={{
                                    uri: this.state.u_photo
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
                        <View style={[styles.triangle, styles.arrowRight]} />
                        <View style={styles.rightBox}>
                            <Text style={{ fontSize: 12, color: "gray", fontWeight: "bold",textTransform:"capitalize" }}> {c_data.user_name}</Text>
                            <Text style={{ fontSize: 16, color: "#000" }}> {c_data.group_message}</Text>
                            <Text style={styles.time}> {this.convertDateTime(c_data.timestamp)}</Text>
                        </View>
                    </View>
                )
            } else {
                return (
                    <View style={{ flexDirection: "row", margin: 5 }} key={i}>
                        {this.state.f_photo ?
                            <Avatar.Image
                                source={{
                                    uri: this.state.f_photo
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
                        <View style={[styles.triangle, styles.arrowLeft]} />

                        <View style={styles.leftBox}>
                            <Text style={{ fontSize: 12, color: "blue", fontWeight: "bold",textTransform:"capitalize" }}> {c_data.user_name}</Text>
                            <Text style={{ fontSize: 16, color: "#000" }}> {c_data.group_message} </Text>
                            <Text style={styles.time}> {this.convertDateTime(c_data.timestamp)}</Text>
                        </View>
                    </View>
                )
            }
        })

        return (
            <View style={styles.container} >
                {
                    this.state.isLoading &&
                    <ActivityIndicator animating={true} style={Styles.loader} />
                }
                <View style={{ backgroundColor: '#007AFF', height: 55, width: "100%", flexDirection: 'row' }} >
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ alignSelf: "center" }}>
                        <Icon
                            name="arrow-left"
                            color={'white'}
                            size={30}
                            style={{ margin: 10, fontWeight: 'bold' }}
                        />
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, margin: 10, fontSize: 20, fontWeight: 'bold', color: '#fff', textTransform: "capitalize", alignSelf: "center" }}>{this.state.group_name}</Text>
                </View>
                <View style={{ padding: 10, backgroundColor: 'rgba(0, 0, 0, 0.2)', flexDirection: 'row', alignSelf: "center", maxWidthwidth: 400, margin: 10, borderRadius: 20 }}>
                    <Text>Welcome to {this.state.group_name}</Text>
                </View>
                <View style={{
                    height: screenHeight - 150,
                    marginVertical: 20,
                    flex: 1,
                    flexDirection: 'row',
                    borderRadius: 10,
                    padding: 0,
                }}>
                    <ScrollView ref={ref => this.scrollView = ref}
                        onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}>
                        {chats}
                    </ScrollView>
                </View>
                <View style={styles.footer}>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.inputs}
                            placeholder="Write a message..."
                            underlineColorAndroid='transparent'
                            ref={input => { this.textInput = input }}
                            onChangeText={(msg) => this.setState({ text: msg })} />
                    </View>
                    <TouchableOpacity style={styles.btnSend} onPress={this.onSend} disabled={this.state.text == ""}>
                        <Icon
                            name="send"
                            color={'white'}
                            size={20}
                            style={{ margin: 10, fontWeight: 'bold', margin: 10 }}
                        />
                    </TouchableOpacity>
                </View>

            </View >
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5"
    },
    rightBox: {
        backgroundColor: "#91d0fb",
        borderRadius: 4,
        marginBottom: 20,
        padding: 10,
        maxWidth: screenWidth - 150,
        borderRadius: 15,
    },
    leftBox: {
        backgroundColor: "#dedede",
        borderRadius: 4,
        marginBottom: 20,
        maxWidth: screenWidth - 150,
        padding: 10,
        borderRadius: 15,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
    },
    arrowRight: {
        borderTopWidth: 7,
        borderRightWidth: 0,
        borderBottomWidth: 7,
        borderLeftWidth: 10,
        marginRight: 5,
        alignSelf: "center",
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: "#91d0fb",
    },
    arrowLeft: {
        borderTopWidth: 7,
        borderRightWidth: 10,
        borderBottomWidth: 7,
        borderLeftWidth: 0,
        alignSelf: "center",
        marginLeft: 5,
        borderTopColor: 'transparent',
        borderRightColor: "#dedede",
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    footer: {
        flexDirection: 'row',
        minHeight: 60,
        backgroundColor: 'white',
        paddingHorizontal: 15,
        padding: 5,
        paddingTop: 10
    },
    btnSend: {
        backgroundColor: "#007AFF",
        width: 40,
        height: 40,
        borderRadius: 360,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        borderBottomWidth: 1,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 5,
        marginRight: 10,
    },
    inputs: {
        height: 40,
        marginLeft: 16,
        borderBottomColor: '#FFFFFF',
        flex: 1,
    },

    time: {
        alignSelf: 'flex-end',
        marginTop: 10,
        margin: 5,
        fontSize: 12,
        color: "#808080",
    },

})