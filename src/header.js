



import React, { useEffect } from 'react';

import { navigationOptions } from '@react-navigation/drawer'
import {
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const Header = ({ title }) => {
    const navigation = useNavigation();
    return (
        <View style={{ backgroundColor: '#007AFF', height: 55, width: "100%", flexDirection: 'row' }}>
            <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
            >
                <Image
                    style={{ width: 20, height: 20, margin: 15, flex: 0 }}
                    source={require('../Assets/menu.png')}
                />
            </TouchableOpacity>
            <Text style={{ marginLeft: 20, margin: 10, fontSize: 20, fontWeight: 'bold', color: '#fff', textTransform: "capitalize" }}>{title}</Text>
        </View>
    );
}