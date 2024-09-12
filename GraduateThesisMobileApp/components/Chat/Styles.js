import { StyleSheet } from "react-native";

export default StyleSheet.create({
    chatContainer: {
        // flex: 1,
        justifyContent: "flex-end",
        alignItems: 'flex-end',
        backgroundColor: "#fff",
        // position: "absolute"
    },
    chatButton: {
        backgroundColor: "orange",
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "black", // Use shadowColor for iOS
        elevation: 5, // Use elevation for Android
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .9,
        shadowRadius: 8,
        right: 15,
        bottom: 60,
        position: "absolute"
    },
    spinner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    userItem: {
      padding: 16,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginVertical: 8,
    },
    userEmail: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    lastMessage: {
      fontSize: 14,
      color: '#666',
    },
    lastMessageTime: {
      fontSize: 12,
      color: '#999',
      textAlign: 'right',
    },
    faqContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: 16,
      borderWidth: 1,
      borderColor: '#ccc',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      // zIndex: 1,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    faqButton: {
      position: 'absolute',
      bottom: 70,
      right: 1,
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    faqButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    logout: {
      paddingRight: 10
    },
    unreadBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: 'red',
      color: 'white',
      paddingHorizontal: 2,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 'bold',
    }
});