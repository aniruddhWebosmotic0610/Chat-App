import { StyleSheet, Dimensions } from 'react-native';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
export default StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: screenHeight,
        width: screenWidth,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0, 0.2)',
        zIndex: 999,
    },
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        backgroundColor: '#007AFF'
    },
    fixToText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        alignItems: "center",
        backgroundColor: "#007AFF",
        padding: 10,
        width: 250,
        borderRadius: 50,
        color: '#fff',
        alignSelf: 'center'
    },
    separator: {
        marginVertical: 8,
        borderBottomColor: '#737373',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    body: {
        padding: 10,
        textAlignVertical: "center"
    },
    background: {
        backgroundColor: '#f9f9f9',
        flex: 1
    }
});

