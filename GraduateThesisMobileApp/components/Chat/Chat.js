import { GiftedChat, MessageText } from 'react-native-gifted-chat';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from "@react-navigation/native"
import { addDoc, collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { MyAuth, MyDatabase } from "../../configs/firebase"
import { MyDispatchUnreadMsgContext, MyUserContext } from '../../configs/Contexts';
import { LogBox, Text, TouchableOpacity, View } from 'react-native';
import Styles from './Styles';
import FAQList from './FAQList';
import { Modal } from 'react-native-paper';
import FAQs from '../../assets/FAQs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminUnreadContext from '../../Utils/AdminUnreadContext';
// import handleChatbotResponse from './ChatBot';

LogBox.ignoreLogs(['two children', 'FirebaseError: No document to update']); // 

const adminUID = "zKrTyYLrAvfamHC07vcDn8oLewl1"
let anonymousChat = "chats" // cant use const and useState, it seems cant use set, maybe they need async await?
let chatRoom = anonymousChat
let userChatRoom = ""
const botId = "botId";
const botName = "ChatBox";

const handleChatbotResponse = (text, isChatRoomChanged) => {
  if (isChatRoomChanged) 
    return;

  // Check if the user's message matches any of the FAQ questions
  const faq = FAQs.find((item) =>
    text.toLowerCase().includes(item.question.toLowerCase())
  );

  if (faq) {
    return [
      {
        _id: 'faq',
        text: faq.response,
        createdAt: new Date(),
        user: { _id: botId, name: botName },
      },
    ];
  } 
  else { // Default response (if there is no questions included in FAQs)
    return [
      {
        _id: 'bot',
        text: FAQs.find((item) => item.question === "default").response,
        createdAt: new Date(),
        user: { _id: botId, name: botName },
      },
    ];
  }
};

const Chat = ({ route }) => {
  const [showFAQs, setShowFAQs] = useState(false);
  const [unreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  // const [currentUser, setCurrentUser] = useState(null);
  const [isChatRoomChanged, setIsChatRoomChanged] = useState(false);
  // const navigation = useNavigation();
  const currentUser = useContext(MyUserContext)
  const adminChatRoom = "chat_admin@gmail.com_zKrTyYLrAvfamHC07vcDn8oLewl1"
  const [messageText, setMessageText] = useState('');

  userChatRoom = route.params?.userChatRoom
  
  // set chatRoom
  if (userChatRoom !== "")
    chatRoom = userChatRoom

  React.useLayoutEffect(() => {
    const collectionRef = collection(MyDatabase, chatRoom);
    const q = query(collectionRef, orderBy("createdAt", "desc"));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return () => unsubscribe();
  }, [chatRoom]);

  const onFAQClick = (faq) => {
    setMessageText(faq.question)
    setShowFAQs(false);
  };
  console.log(chatRoom)
  const onSend = React.useCallback(
    (messages = []) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));

      const { _id, createdAt, text, user } = messages[0];

      // ChatBot
      if (text.toLowerCase().includes("yes") && userChatRoom === "") {
        // Transfer the chat to the admin
        if (chatRoom === anonymousChat) {
          chatRoom = adminChatRoom;
          setIsChatRoomChanged(true);
          
          let requestMsg = {
            _id: 'student_request',
            createdAt: new Date(),
            text: textRequest,
            user: { _id: currentUser.email, avatar: "https://i.pravatar.cc/300" },
            read: false,
          }
          let replyMsg = { 
            _id: 'replyMsg', 
            text: "Admin has been notified. Please wait for a response.", 
            createdAt: new Date(), 
            user: { _id: "botId", name: "Chatbot" } 
          }

          addDoc(collection(MyDatabase, chatRoom), requestMsg);
          addDoc(collection(MyDatabase, chatRoom), replyMsg);

          setMessages([requestMsg]); // Clear the previous messages before changing chatRoom

          // setMessages(previousMessages => GiftedChat.append(previousMessages, msg)) // user text
          setMessages(previousMessages => GiftedChat.append(previousMessages, replyMsg))
          
          // 
          const collectionRef = collection(MyDatabase, chatRoom);
          const q = query(collectionRef, orderBy("createdAt", "desc"));
    
          onSnapshot(q, (snapshot) => {
            setMessages(
              snapshot.docs.map((doc) => ({
                _id: doc.id,
                createdAt: doc.data().createdAt.toDate(),
                text: doc.data().text,
                user: doc.data().user,
                read: doc.data().read, // 
              }))
            );
          });
        }
      } else {
        // Human chat
        if (user._id !== "botId")
          textRequest = text;
        
        addDoc(collection(MyDatabase, chatRoom), {
          _id,
          createdAt,
          text,
          user,
          read: userChatRoom !== "" ? true : false, // Set the 'read' field based on the chat room
        });
      }
    },
    [currentUser, chatRoom, unreadCount] //, isChatRoomChanged, userChatRoom, anonymousChat
  );

  const { unreadMessageIds, markAsRead } = useContext(AdminUnreadContext);

  React.useEffect(() => {
    if (userChatRoom !== "") {
      unreadMessageIds.forEach(id => {
        markAsRead(id);
      });
    }
  }, [chatRoom, unreadMessageIds]);
  
  
  return (
    <>
      <GiftedChat 
        messages={messages}
        onSend={messages => {
          onSend(messages);
          if (!messages[0].text.toLowerCase().includes("yes"))
          {
            const chatbotResponse = handleChatbotResponse(messages[0].text, isChatRoomChanged);
            if (!isChatRoomChanged && userChatRoom === "") {
              onSend(chatbotResponse);
            }
          }
        }}
        user={{
          _id: currentUser?.email || '1',
          avatar: currentUser?.current_user.avatar || "https://i.pravatar.cc/300"
        }}
        text={messageText}
        onInputTextChanged={text => setMessageText(text)}
      />
      {/* FAQ list */}
      {showFAQs && (
        <View style={Styles.faqContainer}>
          <FAQList faqs={FAQs} onFAQClick={onFAQClick}/>
        </View>
      )}
      <TouchableOpacity
        style={Styles.faqButton}
        onPress={() => setShowFAQs(!showFAQs)}
      >
        <Text style={Styles.faqButtonText}>FAQs</Text>
      </TouchableOpacity>
    </>
  );
}

export default Chat;