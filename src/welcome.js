import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    View,
    SafeAreaView,
    Text,
    Alert,
    TouchableOpacity,
    Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import Styles from './styles/styles';



class WelcomeScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            thename: 'somename'
        };
    }

    render() {
        return (

            <SafeAreaView style={Styles.container}>
                <View style={Styles.body}>
                    <View>
                        <Image
                            style={style.mainImg}
                            source={require('../Assets/Login.png')}
                        />
                    </View>
                    <View>
                        <Text style={style.welcomeText}>
                            Welcome
                        </Text>
                    </View>
                    <View style={style.content}>
                        <Text style={{ textAlign: 'center' }}>
                            Stay in touch with your best friend.
                        </Text>
                    </View>
                    <View>
                        <TouchableOpacity
                            style={Styles.button}
                            onPress={() => this.props.navigation.navigate('login')}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={style.buttonSignup}
                            onPress={() => this.props.navigation.navigate('signup')}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold' }}>Sign UP</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>

        );
    }

}
export default WelcomeScreen

const style = StyleSheet.create({
    content: {
        margin: 5,
        marginBottom: 20
    },
    welcomeText: {
        color: "#007AFF",
        textAlign: "center",
        backgroundColor: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 5,
    },
    buttonSignup: {
        // shadowColor: 'rgba(0,0,0, .4)', // IOS
        // shadowOffset: { height: 1, width: 1 }, // IOS
        // shadowOpacity: 1, // IOS
        // shadowRadius: 1, //IOS
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        width: 250,
        elevation: 5,
        borderRadius: 50,
        color: '#fff',
        alignSelf: 'center',
        marginTop: 20
    },
    mainImg: {
        width: 200,
        height: 200,
        backgroundColor: 'white',
        alignSelf: "center",
        marginBottom: 20
    }


})