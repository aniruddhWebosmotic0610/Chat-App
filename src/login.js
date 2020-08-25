import React, { Component, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
  AsyncStorage
} from 'react-native';
import Styles from './styles/styles';

var FBLoginButton = require('./fbLoginButton');


import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore'
import { ActivityIndicator } from 'react-native-paper';
import firebaseSvc from './firebaseSDK';


export default function LoginScreen({ navigation }) {
  const [loggedIn, setloggedIn] = useState(false);
  const [isSubmit, setisSubmit] = useState(false);
  const [userInfo, setuserInfo] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');

  useEffect(() => {
    // Update the document title using the browser API
    GoogleSignin.configure({
      webClientId: '1013171964319-ru5voe2f9cjq8tq8655b4jcljm5kogds.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
    firebaseSvc.configuration();
    setLoading(false)

  });


  function CheckTextInput() {

    setisSubmit(isSubmit => true)
    if (Email == '' || !validate(Email)) {
    }
    else if (Password == '') {
    }
    else {
      try {
        setLoading(true)
        auth().signInWithEmailAndPassword(Email, Password)
          .then(res => {
            if (res.user) {
              setLoading(false)
              navigation.navigate('Drawer', { user: JSON.stringify(res.user) })
            }

          });
      } catch (error) {
        setLoading(false)
        console.log(error.toString());

      }
    }
  };

  function validate(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      return false;
    }
    else {
      return true
    }
  }

  async function _signIn() {
    try {
      setLoading(true)
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setuserInfo({ userInfo });
      if (userInfo.idToken) {
        const credential = auth.GoogleAuthProvider.credential(
          userInfo.idToken,
          userInfo.accessToken,
        );
        await auth().signInWithCredential(credential).then(res => {
          console.log('googleuser', res.user);
          firestore().collection("chatie_user").doc(res.user.uid).set({
            uid: res.user.uid,
            email: res.user.email,
            name: res.user.displayName,
            emailVerified: res.user.emailVerified,
            photoURL: res.user.photoURL
          }).then(function () {
            console.log("Document successfully written!");
            setLoading(false)
            navigation.navigate('Drawer', { user: JSON.stringify(res.user) })
          })

        });
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        alert('Cancel');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('PLAY_SERVICES_NOT_AVAILABLE');
      } else {
      }
    }
  };
  return (
    <SafeAreaView style={style.content}>
      {isLoading &&
        <ActivityIndicator animating={true} style={Styles.loader} />
      }
      <View style={{ alignSelf: "flex-start" }}>
        <Text style={style.welcomeText}>Login</Text>
      </View>

      <TextInput
        placeholder="Email Address"
        onChangeText={Email => setEmail(Email)
        }
        underlineColorAndroid="transparent"
        style={style.TextInput}
      />
      <View style={{ alignSelf: "flex-start" }}>
        {Email == '' &&
          isSubmit == true ? (
            <Text style={style.errorMsg}> Email is required.</Text>
          ) : !validate(Email) &&
            isSubmit == true ? (
              <Text style={style.errorMsg}> Email is not valid.</Text>
            ) : null}
      </View>
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={(Password) => setPassword(Password)}
        underlineColorAndroid="transparent"
        style={style.TextInput}
      />
      <View style={{ alignSelf: "flex-start" }}>
        {Password == '' && isSubmit == true ? (
          <Text style={style.errorMsg}> Password is required.</Text>
        ) : null}
      </View>
      <View>
        <TouchableOpacity
          style={style.buttonSignup}
          onPress={CheckTextInput}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>


      <View >
        <Text style={{ fontSize: 18, fontWeight: "bold", margin: 10 }}> OR</Text>
      </View>

      <FBLoginButton />
      <GoogleSigninButton
        style={{ width: 250, height: 50, marginTop: 10 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={_signIn}
      />
      <View>
        <TouchableOpacity
          style={{ marginTop: 5 }}
          onPress={() => navigation.navigate('Welcome')}>
          <Text style={{ alignSelf: 'flex-end' }}>
            Don't want to Login?
                  </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  content: {
    marginLeft: 30,
    marginRight: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  welcomeText: {
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