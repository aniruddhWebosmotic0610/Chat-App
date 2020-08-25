import React, { Component, useRef } from 'react'

import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Dimensions,
    TextInput,
    FlatList,
    Button,
    AsyncStorage,
    Keyboard
} from 'react-native';
import firebaseSvc from './firebaseSDK';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import { orderBy } from 'lodash';
import moment from 'moment';
import Styles from './styles/styles';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class ChatScreen extends Component {
    scrollView;
    constructor(props) {
        super(props);
        this.state = {
            f_id: '',
            f_name: '',
            f_email: '',
            u_id: '',
            u_name: '',
            u_email: '',
            text: '',
            chatData: [],
            messages: [],
            isLoading: true
        }

    }

    componentDidMount = () => {
        this.retrieveData();
    }

    // retrive previous Screen data
    retrieveData = () => {
        this.setState({
            f_email: this.props.route.params.femail,
            f_id: this.props.route.params.fid,
            f_name: this.props.route.params.fname,
            u_id: this.props.route.params.uid,
            u_name: this.props.route.params.uname,
            u_email: this.props.route.params.uemail,
            u_photo: this.props.route.params.uphoto,
            f_photo: this.props.route.params.fphoto
        })
        this.getChatdata();
    }
    
    //  function is use to get chats from firestore
    getChatdata = () => {
        this.setState({ isLoading: true })
        firebaseSvc.fetchMessages()
            .then((solve) => {
                const data = orderBy(solve, ['created_at'], ['asc'])
                this.setState({ chatData: data })
                this.setState({ isLoading: false })
            }).then(() => {
                let data = this.state.chatData
                this.setState({ isLoading: false })
            }).catch((fail) => {
                console.log(fail)
                this.setState({ isLoading: false })
            })
    }

    //  function is use to get chats from firestore
    getChatdataAftersend = () => {
        firebaseSvc.fetchMessages().then((solve) => {
            const data = orderBy(solve, ['created_at'], ['asc'])
            this.setState({ chatData: data })
        }).then(() => {
            let data = this.state.chatData
        }).catch((fail) => {
            console.log(fail)
        })
    }

    // send message function to store sent message to firebase 
    onSend = () => {
        this.textInput.clear()
        firebaseSvc.send(
            this.state.f_id,
            this.state.f_email,
            this.state.f_name,
            this.state.text,
            this.state.u_id,
            this.state.u_email,
            this.state.u_name
        )
        Keyboard.dismiss();
        this.getChatdataAftersend()
    }
    // date convert to DD-MMM H:mm A from seaconds
    converDateTime = (given_seconds) => {
        return moment(given_seconds * 1000).format('DD-MMM H:mm A');
    }

    render() {
        let Data = this.state.chatData
        let chats = Data.map((c_data, i) => {
            if (this.state.f_id == c_data.from_id && this.state.u_id == c_data.user_id || this.state.f_id == c_data.user_id && this.state.u_id == c_data.from_id) {
                if (this.state.u_id == c_data.user_id) {
                    return (
                        <View style={{
                            flexDirection: "row", margin: 5, marginLeft: "42%",
                        }} key={i}>
                            <View style={{
                                backgroundColor: "#91d0fb",
                                borderRadius: 4,
                                marginBottom: 20,
                                padding: 10,
                                width: '70%',
                                maxWidth: 500,
                                marginRight: 10,
                                borderRadius: 20,
                            }}>
                                <Text style={{ fontSize: 16, color: "#000" }}> {c_data.text}</Text>
                                <Text style={styles.time}> {this.converDateTime(c_data.created_at._seconds)}</Text>
                            </View>
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
                            <View style={{
                                backgroundColor: "#dedede",
                                borderRadius: 4,
                                marginBottom: 20,
                                marginLeft: 10,
                                width: '50%',
                                maxWidth: 500,
                                padding: 10,
                                borderRadius: 20,
                            }}>
                                <Text style={{ fontSize: 16, color: "#000" }}> {c_data.text} </Text>
                                <Text style={styles.time}> {this.converDateTime(c_data.created_at._seconds)}</Text>
                            </View>
                        </View>
                    )
                }
            }
        })

        return (

            <View style={styles.container}>
                {this.state.isLoading &&
                    <ActivityIndicator animating={true} style={Styles.loader} />
                }
                <View style={{ backgroundColor: '#007AFF', height: 55, width: "100%", flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}
                    >
                        <Icon
                            name="arrow-left"
                            color={'white'}
                            size={30}
                            style={{ margin: 10, fontWeight: 'bold' }}
                        />
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, margin: 10, fontSize: 20, fontWeight: 'bold', color: '#fff', textTransform: "capitalize" }}>{this.state.f_name}</Text>
                </View >
                <View style={{
                    height: screenHeight - 150,
                    marginVertical: 20,
                    flex: 1,
                    flexDirection: 'row',
                    backgroundColor: "#eeeeee",
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
                    <TouchableOpacity style={styles.btnSend} onPress={this.onSend}>
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
        flex: 1
    },
    footer: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#eeeeee',
        paddingHorizontal: 10,
        padding: 5,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        borderBottomWidth: 1,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
