import React from 'react';

import {
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Header = ({ title, add }) => {
    const navigation = useNavigation();
    return (
        <View style={{ backgroundColor: '#007AFF', height: 55, width: "100%", flexDirection: 'row' }}>
            <TouchableOpacity style={{ alignSelf: "center" }}
                onPress={() => navigation.toggleDrawer()}
            >
                <Image
                    style={{ width: 20, height: 20, margin: 15, flex: 0 }}
                    source={require('../Assets/menu.png')}
                />
            </TouchableOpacity>
            <Text style={{ marginLeft: 20, margin: 10, fontSize: 20, fontWeight: 'bold', color: '#fff', textTransform: "capitalize", flex: 1, alignSelf: "center" }}>{title}</Text>
            {add &&
                <TouchableOpacity style={{ alignSelf: "center", marginRight: 10 }} onPress={() => navigation.navigate('add-group')}>
                    <Icon
                        name="plus-circle"
                        color={'#fff'}
                        size={30}
                    />
                </TouchableOpacity>
            }
        </View>
    );
}