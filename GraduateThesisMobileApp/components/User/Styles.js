import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#fff"
    }, 
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "red",
        alignSelf: "center",
        paddingBottom: 24,
    },
    input: {
        backgroundColor: "#f6f7fb",
        height: 50,
        margin: 10,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    backImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        top: 0,
        resizeMode: "cover",
    },
    whiteSheet: {
        width: "100%",
        height: "75%",
        position: "absolute",
        bottom: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: "center",
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: "crimson",
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40
    },
    login: {
        fontWeight: "bold",
        color: "#fff",
        fontSize: 18,
    },
    floatingButton: {
        position: "absolute",
        width: 60,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        right: 30,
        bottom: 50,
        borderColor: "red"
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 100,
        alignSelf: 'center',
        overflow:'hiddent',
        marginVertical: 10
    },
    infoContainer: {
        alignSelf:'center',
        alignItems:'center',
        marginTop: 10
    },
    email: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        color:"gray"
    },
    className: {
        fontSize: 18,
        textAlign: 'center',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -25,
        marginTop: -25,
    },
    changeAvatar: {
        position: 'absolute',
        // bottom:0,
        // right:70,
        alignItems: "center",
        top: 120,
        right: 110
        // margin: 10
    },
    text: {
        fontFamily:'Roboto',
        padding:10,
        fontWeight:'900',
        fontSize:35
    },
    card: {
        marginVertical: 10,
        width: "90%"
    },
    helperText: {
        fontSize: 14, 
        fontStyle:"italic", 
        textAlign: 'center', 
        textDecorationLine: 'underline',
    }
});