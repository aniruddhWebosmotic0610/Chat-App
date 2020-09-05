import React, { Component } from 'react'

import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    Keyboard,
    Image
} from 'react-native';
import firebaseSvc from './firebaseSDK';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import moment from 'moment';
import Styles from './styles/styles';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import ImageModal from 'react-native-image-modal';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class ChatScreen extends Component {
    scrollView;
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            f_id: '',
            f_name: '',
            u_id: '',
            u_name: '',
            text: '',
            chatData: [],
            messages: [],
            isLoading: false,
            avatarSource: null,
        }
    }

    componentDidMount = () => {
        this._isMounted = true
        this.retrieveData();
    }

    componentWillUnmount = () => {
        this._isMounted = false
    }

    // retrive previous Screen data
    retrieveData = async () => {
        this.setState({
            f_id: this.props.route.params.fid,
            f_name: this.props.route.params.fname,
            u_id: this.props.route.params.uid,
            u_name: this.props.route.params.uname,
            u_photo: this.props.route.params.uphoto,
            f_photo: this.props.route.params.fphoto
        })
        this.getChatdata();
    }

    //  function is use to get chats from  database
    getChatdata = () => {
        this.setState({ isLoading: true })
        if (this.props.route.params.uid && this.props.route.params.fid) {
            const ref = firestore().collection('chatie_user')
            ref.doc(this.props.route.params.uid)
                .collection('messages')
                .orderBy('created_at')
                .onSnapshot((snapshot) => {
                    var data = [];
                    snapshot.forEach(function (doc) {
                        data.push(doc.data());
                    });
                    this.setState({
                        isLoading: false,
                        chatData: data
                    })
                    // dispatchMessages({ type: 'add', payload: snapshot.docs });
                },
                    error => {
                        console.error('getMessages error', error);
                    },
                );
        }
    }


    // send message function to store sent message to firebase 
    onSend = () => {
        if (this.state.imageSource) {
            this.setState({ isLoading: true })
            this.textInput.clear()
            this.WriteBase64ToFile(this.state.imageSource).then((imgUrl) => {
                this.setState({ isLoading: false })
                firebaseSvc.send(
                    this.state.f_id,
                    this.state.f_name,
                    this.state.f_photo ? this.state.f_photo : null,
                    this.state.text,
                    imgUrl,
                    this.state.u_id,
                    this.state.u_name,
                    this.state.u_photo ? this.state.u_photo : null,
                )
                this.setState({
                    text: ""
                })
                this.removeImage();
                Keyboard.dismiss();
            })
        } else if (this.state.text !== "") {
            this.textInput.clear()
            firebaseSvc.send(
                this.state.f_id,
                this.state.f_name,
                this.state.f_photo ? this.state.f_photo : null,
                this.state.text,
                null,
                this.state.u_id,
                this.state.u_name,
                this.state.u_photo ? this.state.u_photo : null,
            )

            this.setState({
                text: ""
            })
            Keyboard.dismiss();

        }
    }
    // date convert to DD-MMM H:mm A from seaconds
    convertDateTime = (given_seconds) => {
        return moment(given_seconds).format('DD-MMM hh:mm A');
    }

    // function use to convert local storage uri into file storage and then upload it in firebase Storage

    // function use to convert local storage uri into file storage and then upload it in firebase Storage
    WriteBase64ToFile = (Base64) => {
        return new Promise((resolve) => {
            const dirs = RNFetchBlob.fs.dirs;
            const number = Math.random()
            const imageName = "/image" + number + ".png"
            const path = dirs.DCIMDir + imageName;
            RNFetchBlob.fs.writeFile(path, Base64, 'base64').then((res) => {
                const filename = path.substring(path.lastIndexOf('/') + 1);
                const uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
                storage().ref('messages').child(filename).putFile(uploadUri).then(function (res) {
                    storage().ref('messages/' + imageName).getDownloadURL().then(url => {
                        resolve(url)
                    }).catch(e => {
                        console.log(e);
                        resolve(e)
                    })
                })
            });
        })
    }

    // function to upload profile picture using Image picker plugin
    uploadPic = () => {
        const options = {
            title: 'Select Image',
            quality: 0.3,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: 'data:image/jpeg;base64,' + response.data };
                this.setState({
                    avatarSource: source,
                    imageSource: response.data
                });
            }
        });
    }

    removeImage = () => {
        this.setState({
            avatarSource: null,
            imageSource: null
        });
    }

    render() {
        const chats = this.state.chatData.map((c_data, i) => {
            if (this.state.f_id == c_data.from_id && this.state.u_id == c_data.user_id || this.state.f_id == c_data.user_id && this.state.u_id == c_data.from_id) {
                if (c_data.from_id == this.state.f_id) {
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
                                {c_data.image &&
                                    <ImageModal resizeMode="contain"
                                        imageBackgroundColor="#000000"
                                        style={{ height: 120, width:120 }}
                                        source={{ uri: c_data.image }}
                                    />
                                }
                                {c_data.text != "" &&
                                    <Text style={{ fontSize: 16, color: "#000" }}> {c_data.text} </Text>
                                }
                                <Text style={styles.time}> {this.convertDateTime(c_data.created_at)}</Text>
                            </View>
                        </View>
                    )
                } else if (c_data.user_id !== this.state.uid) {
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
                                {c_data.image &&
                                    <ImageModal resizeMode="contain"
                                        imageBackgroundColor="#000000"
                                        style={{ height: 120, width:120 }}
                                        source={{ uri: c_data.image }}
                                    />
                                }
                                {c_data.text != "" &&
                                    <Text style={{ fontSize: 16, color: "#000" }}> {c_data.text} </Text>
                                }
                                <Text style={styles.time}> {this.convertDateTime(c_data.created_at)}</Text>
                            </View>
                        </View>
                    )
                }
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
                    <Text style={{ marginLeft: 20, margin: 10, fontSize: 20, fontWeight: 'bold', color: '#fff', textTransform: "capitalize", alignSelf: "center" }}>{this.state.f_name}</Text>
                </View >
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
                {this.state.avatarSource &&
                    <View style={styles.footer_img}>
                        <Image style={{ height: 60, width: 50 }}
                            source={this.state.avatarSource}
                        />
                        <TouchableOpacity style={{ position: "relative", right: 10, top: 0 }} onPress={this.removeImage}>
                            <Avatar.Image
                                source={require('../Assets/close.png')}
                                size={15}
                                style={{ backgroundColor: 'white' }}
                            />
                        </TouchableOpacity>
                    </View>
                }

                <View style={styles.footer}>
                    <View>
                        <TouchableOpacity style={[styles.btnSend, { marginRight: 10 }]} onPress={this.uploadPic}>
                            <Image
                                style={styles.camera}
                                source={require('../Assets/photograph.png')}
                            />
                        </TouchableOpacity>
                    </View>
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
    footer_img: {
        flexDirection: 'row',
        minHeight: 80,
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
    camera: {
        backgroundColor: "#007AFF",
        padding: 10,
        width: 30,
        height: 30,
        borderRadius: 50,
    },

})
