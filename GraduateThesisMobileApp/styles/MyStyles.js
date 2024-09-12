import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        marginTop: 10,
        alignItems: 'center',
        paddingBottom: 20
    }, 
    subject: {
        fontSize: 20,
        fontWeight: "bold",
        color: "blue"
    }, 
    row: {
        flexDirection: "row",
        flexWrap: "wrap"
    }, 
    touchableStyle: {
        width: Dimensions.get('screen').width * 0.9,
    },
    margin: {
        margin: 5,
    }, 
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 20
    },
    legend: {
        alignItems: 'left'
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        height: 60,
        width: "100%",
        borderColor: 'gray',
        borderWidth: 1,
    },
    suggestion: {
        position: 'absolute', 
        width: '100%',        
        maxHeight: 200,       
        backgroundColor: 'white',
        zIndex: 1,
        marginTop: 60,
    },
    touchableItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    touchableText: {
        fontSize: 16
    },
    button: {
        backgroundColor: "lightwhite",
        color: "black"
    },
    card: {
        marginTop: 10,
        marginBottom: 10
    },
    section: {
        width: "90%",
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        // padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        marginHorizontal: 5,
        // width: Dimensions.get('screen').width * 0.9
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#444',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        backgroundColor: '#f2f2f2',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        borderBottomColor: '#ccc',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    columnHeader: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    columnRowText: {
        flex: 1,
        textAlign: 'center',
    },
    // container: { 
    //     flex: 1, 
    //     padding: 16, 
    //     paddingTop: 30, 
    //     backgroundColor: '#fff' 
    // },
    // header: { 
    //     height: 50, 
    //     // backgroundColor: '#f1f8ff' 
    // },
    text: { 
        textAlign: 'center', 
        fontWeight: '100' 
    },
    dataWrapper: { 
        marginTop: -1 
    },
    row: { 
        height: 40, 
        backgroundColor: '#E7E6E1' 
    },
    finalScore: {
        fontWeight: "bold",
        fontSize: 20
    },
    notification: {
        position: 'absolute',
        top: 10,
        left: "20%",
        right: "20%", 
        backgroundColor: 'lightblue',
        color: "#000",
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // flexDirection: 'row',
        zIndex: 1,
        elevation: 4,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        opacity: 0.75
    },
    searchBar: {
        margin: 10,
    },
    addThesisButton: {
        position: "absolute",
        bottom: 5,
        right: "25%",
        left: "25%",
    },
    addCriteria: {
        marginVertical: 5,
        marginHorizontal: "auto"
    }
});