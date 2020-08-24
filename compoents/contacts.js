import React, { Component } from 'react'
import { Text, View, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList, List } from 'react-native'
import { Header } from './header'
import { Avatar, Searchbar, ActivityIndicator } from 'react-native-paper'
import auth from '@react-native-firebase/auth'
import firebaseSvc from './firebaseSDK';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from './styles/styles';


const screenWidth = Math.round(Dimensions.get('window').width);


export default class ContactScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            auth_data: [],
            search_data: [],
            uid: '',
            uname: '',
            uemail: '',
            search: '',
            isLoading: false
        }
    }
    componentDidMount = () => {
        this._retrieveData()
        this.User_data()
    }
    _retrieveData = async () => {
        let user = auth().currentUser;
        console.log('user', user);
        this.setState({
            uid: user.uid,
            uname: user.displayName,
            uemail: user.email
        })
    }
    User_data = () => {
        this.setState({ isLoading: true })
        firebaseSvc.usersData().then((solve) => {
            console.log('solve', solve);
            this.setState({
                auth_data: solve,
                search_data: solve,
                isLoading: false
            })
        }).catch((fail) => {
            console.log('not getting data')
        })
    }

    searchText = (search) => {
        console.log('search', search);
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
                // item.email.toLowerCase().match(search)
            })
            console.log('searchdata', data);
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
                        fid: item.uid,
                        fname: item.name,
                        femail: item.email
                    })}>
                        <View style={styles.container}>
                            <View style={{ justifyContent: "center" }}>
                                <Avatar.Image
                                    source={{
                                        uri: 'https://www.whatsappprofiledpimages.com/wp-content/uploads/2018/11/whatsapp-profile-iopic-lif-300x300.gif'
                                    }}
                                    size={55}
                                    style={{ alignSelf: "flex-start", flex: 1 }}
                                />
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
            <SafeAreaView>
                {this.state.isLoading &&
                    <ActivityIndicator animating={true} style={Styles.loader} />
                }
                <Header title={"Contacts"} />

                <Searchbar placeholder="Type here..." onChangeText={this.searchText}
                    value={this.state.search} />
                <FlatList
                    data={this.state.auth_data}
                    renderItem={renderItem}
                    style={{ backgroundColor: 'white' }}
                    keyExtractor={item => item.email}
                />
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
        color: "#D3D3D3"
    }

})