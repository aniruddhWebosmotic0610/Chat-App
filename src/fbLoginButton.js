import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LoginButton, LoginManager } from 'react-native-fbsdk';

export default class FBLoginButton extends Component {

  handleFacebookLogin() {
    LoginManager.logInWithPermissions(['public_profile', 'email', 'user_friends']).then(
      function (result) {
        if (result.isCancelled) {
          console.log('Login cancelled')
        } else {
          console.log('Login success with permissions: ' + result.grantedPermissions.toString())
        }
      },
      function (error) {
        console.log('Login fail with error: ' + error)
      }
    )
  }
  render() {
    return (
      <View style={{width:250}}>
        <TouchableOpacity style={style.btn} onPress={this.handleFacebookLogin}>
          <Text style={style.TextStyle}>Login with Facebook </Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const style = StyleSheet.create({
  btn: {
    backgroundColor: '#4267b2',
    borderRadius: 30,
    paddingTop: 10,
    paddingBottom: 10,
    elevation:5,
    paddingLeft: 20,
    paddingRight: 20

  },
  TextStyle: {
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: "center"
  }

})

module.exports = FBLoginButton;