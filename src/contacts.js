import React, { Component } from 'react'
import { Text, View, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Dimensions, List, FlatList } from 'react-native'
import { Header } from './header'
import { Avatar, Searchbar, ActivityIndicator } from 'react-native-paper'
import auth from '@react-native-firebase/auth'
import firebaseSvc from './firebaseSDK';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from './styles/styles';

export default class ContactScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            auth_data: [],
            search_data: [],
            uid: '',
            uname: '',
            uemail: '',
            uphoto: '',
            search: '',
            isLoading: false
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
            this.setState({
                auth_data: solve,
                search_data: solve,
                isLoading: false
            })
        }).catch((fail) => {
            // console.log('not getting data')
        })
    }
    // search contacct list 
    searchText = (search) => {
        this.setState({ search })
        this.setState({ isLoading: true })
        if (search == '') {
            this.setState({
                auth_data: this.state.search_data,
                isLoading: false
            })
        }
        else {
            let data = this.state.search_data.filter((item) => {
                return (item.name.toLowerCase().match(search) || item.email.toLowerCase().match(search))
            })
            this.setState({
                auth_data: data,
                isLoading: false
            })
        }
    }
    render() {
        const renderItem = ({ item }) => (
            <View style={styles.item}>
                {
                    item.uid !== this.state.uid &&
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Chat', {
                        uemail: this.state.uemail,
                        uid: this.state.uid,
                        uname: this.state.uname,
                        uphoto: this.state.uphoto,
                        fid: item.uid,
                        fname: item.name,
                        femail: item.email,
                        fphoto: item.photoURL
                    })}>
                        <View style={styles.container}>
                            <View style={{ justifyContent: "center" }}>
                                {item.photoURL ?
                                    <Avatar.Image
                                        source={{
                                            uri: item.photoURL
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
                            <View style={{ justifyContent: "center", flex: 1 }}>
                                <Text style={{ fontSize: 16 }} key={item.name}> {item.name}</Text>
                                <Text style={styles.carname} key={item.email}> {item.email}</Text>
                            </View>
                            <View style={{ justifyContent: "center" }}>
                                <Icon
                                    name="chevron-right"
                                    color={'gray'}
                                    size={30}
                                    style={{ margin: 10, fontWeight: 'bold' }}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        );


        return (
            <SafeAreaView style={{ flex: 1 }}>
                {this.state.isLoading &&
                    <ActivityIndicator animating={true} style={Styles.loader} />
                }
                <Header title={"Contacts"} />
                <View>
                    <Searchbar placeholder="Type here..." onChangeText={this.searchText}
                        value={this.state.search} />

                    <FlatList
                        data={this.state.auth_data}
                        renderItem={renderItem}
                        style={{ backgroundColor: 'white' }}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={{
                            paddingBottom: 120,
                        }}
                    />
                </View>
            </SafeAreaView >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#D3D3D3",
        padding: 10
    },
    carname: { color: '#010000', fontSize: 12, },
    item: {
        color: "#D3D3D3",
    }

})