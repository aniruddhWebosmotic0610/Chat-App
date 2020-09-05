import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    View,
    SafeAreaView,
    Text,
    Alert,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Platform
} from 'react-native';

import Styles from './styles/styles';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage';
import { ActivityIndicator } from 'react-native-paper';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'
import firebaseSvc from './firebaseSDK';


class SignupScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            TextInputName: '',
            TextInputEmail: '',
            Password: '',
            isSubmit: false,
            isValid: false,
            isLoading: false,
            avatarSource: '',
            firebase_url: ''
        };
        // fetch firebase configuration for inititalize app
        firebaseSvc.configuration();
    }

    componentDidMount() {
        // firebase authetication user to signin anonymously to save images in Storage
        auth().signInAnonymously();
    }

    // main function use for custom signup
    signUp = () => {
        this.setState({
            isSubmit: true
        })
        if (this.state.TextInputName == '') {
            this.setState({
                isValid: false
            })

        }
        else if (this.state.TextInputEmail == '' || !this.validate(this.state.TextInputEmail)) {
            this.setState({
                isValid: false
            })
        }
        else if (this.state.Password == '') {
            this.setState({
                isValid: false
            })
        }
        else {
            this.setState({
                isValid: true
            })

            try {
                this.setState({ isLoading: true })
                // register user in firebase using email and password
                auth().createUserWithEmailAndPassword(this.state.TextInputEmail, this.state.Password)
                    .then(pass => {
                        const update = {
                            displayName: this.state.TextInputName,
                            photoURL: this.state.firebase_url
                        };
                        // update user's profile pic and name in firebase
                        auth().currentUser.updateProfile(update).then(function (res) {
                            // add this user to firestore collection to disply list of users in contacts
                            firestore().collection("chatie_user").doc(pass.user.uid).set({
                                uid: pass.user.uid,
                                email: pass.user.email,
                                name: update.displayName,
                                emailVerified: pass.user.emailVerified,
                                photoURL: update.photoURL
                            }).then(function () {
                                this.setState({ isLoading: false })
                            })

                        });
                        this.setState({
                            TextInputName: '',
                            TextInputEmail: '',
                            Password: '',
                            isSubmit: false,
                            isValid: false,
                        })
                        this.props.navigation.navigate('Welcome');
                    })
            } catch (error) {
                console.log(error.toString(error));
            }
        }
    };

    // function use to convert local storage uri into file storage and then upload it in firebase Storage
    WriteBase64ToFile = (Base64) => {
        const dirs = RNFetchBlob.fs.dirs;
        let number = Math.random()
        let imageName = "/image" + number + ".png"
        let path = dirs.DCIMDir + imageName;
        RNFetchBlob.fs.writeFile(path, Base64, 'base64').then((res) => {
            const filename = path.substring(path.lastIndexOf('/') + 1);
            const uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
            // use firebase Storage to save images which are uploaded
            storage().ref('chat_app').child(filename).putFile(uploadUri).then((res) => {
                const ref = storage().ref('chat_app/' + imageName);
                ref.getDownloadURL().then(url => {
                    this.setState({ firebase_url: url })

                })
                    .catch(e => { console.log(e); })
            })
        });
    }
    // function to upload profile picture using Image picker plugin
    uploadPic = () => {
        const options = {
            title: 'Select Avatar',
            customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
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
                this.WriteBase64ToFile(response.data);
                this.setState({
                    avatarSource: source,
                });
            }
        });
    }

    // email validation using regex
    validate = (text) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            return false;
        }
        else {
            return true
        }
    }
    render() {
        return (
            <SafeAreaView style={Styles.background}>
                {this.state.isLoading &&
                    <ActivityIndicator animating={true} style={Styles.loader} />
                }
                <ScrollView style={style.content}>
                    <View>
                        <View>
                            <Text style={style.welcomeText}>
                                Creat New Account
                        </Text>
                        </View>
                        <View style={{ position: "relative" }}>
                            {this.state.avatarSource == '' ?
                                <Image
                                    style={style.avatar}
                                    source={require('../Assets/user.png')}
                                />
                                :
                                <Image
                                    style={style.avatar}
                                    source={this.state.avatarSource}
                                />
                            }
                            <View style={style.cameraView}>
                                <TouchableOpacity onPress={this.uploadPic}>
                                    <Image
                                        style={style.camera}
                                        source={require('../Assets/photograph.png')}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={style.MainContainer}>
                            <TextInput
                                placeholder="Full Name"
                                onChangeText={TextInputName => this.setState({ TextInputName })}
                                underlineColorAndroid="transparent"
                                style={style.TextInput}
                            />
                            <View>
                                {this.state.TextInputName == '' && this.state.isSubmit == true ? <Text style={style.errorMsg}> Full Name is required.</Text> : null}
                            </View>
                            <TextInput
                                placeholder="Email Address"
                                onChangeText={TextInputEmail => this.setState({ TextInputEmail })}
                                underlineColorAndroid="transparent"
                                style={style.TextInput}
                            />
                            <View>
                                {this.state.TextInputEmail == '' && this.state.isSubmit == true ? <Text style={style.errorMsg}> Email is required.</Text> :
                                    (!this.validate(this.state.TextInputEmail) && this.state.isSubmit == true ? <Text style={style.errorMsg}> Email is not valid.</Text> : null)}
                            </View>
                            <TextInput
                                placeholder="Password"
                                secureTextEntry={true}
                                onChangeText={Password => this.setState({ Password })}
                                underlineColorAndroid="transparent"
                                style={style.TextInput}
                            />
                            <View>
                                {this.state.Password == '' && this.state.isSubmit == true ? <Text style={style.errorMsg}> Password is required.</Text> : null}
                            </View>
                            <View>
                                <TouchableOpacity
                                    style={style.buttonSignup}
                                    onPress={this.signUp}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign UP</Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <TouchableOpacity
                                    style={{ marginTop: 5 }}
                                    onPress={() => this.props.navigation.goBack()}>
                                    <Text style={{ alignSelf: "center" }}>Don't want to signup?</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

            </SafeAreaView>
        )
    }

}
export default SignupScreen


const style = StyleSheet.create({
    content: {
        margin: 20,
    },
    welcomeText: {
        textAlign: "left",
        color: "#007AFF",
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 30,
    },
    buttonSignup: {
        alignItems: "center",
        backgroundColor: "#007AFF",
        padding: 10,
        width: 250,
        elevation:5,
        borderRadius: 50,
        color: '#fff',
        alignSelf: 'center',
        marginTop: 20
    },
    avatar: {
        width: 100,
        height: 100,
        marginTop: 20,
        borderRadius: 50,
        backgroundColor: 'white',
        alignSelf: "center",
        marginBottom: 20
    },
    cameraView: {
        position: "absolute",
        alignSelf: "center",
        bottom: 20,
        right: 135,
    },
    camera: {
        backgroundColor: "#007AFF",
        padding: 10,
        width: 30,
        height: 30,
        borderRadius: 50,
    },
    MainContainer: {
        flex: 1,
        margin: 20,
    },
    TextInput: {
        width: '100%',
        height: 45,
        padding: 10,
        paddingStart: 20,
        marginTop: 25,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 20
    },
    errorMsg: {
        color: 'red',
        marginTop: 5,
        marginStart: 10,
        alignSelf: "flex-start"
    }
})