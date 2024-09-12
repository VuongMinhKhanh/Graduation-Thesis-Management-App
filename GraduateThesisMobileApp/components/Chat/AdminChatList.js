import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, getDocs, listCollections } from 'firebase/firestore';
import { MyDatabase } from '../../configs/firebase';
import Styles from './Styles';
// import firestore from '@react-native-firebase/firestore'
import { getAuth, listUsers, onAuthStateChanged } from 'firebase/auth';
import { MyAuth } from '../../configs/firebase';
import database from "@react-native-firebase/database"


const AdminChatList = ({ route, navigation }) => {
  const [chatCollections, setChatCollections] = useState([]);
  const { admin } = route.params;
  const [users, setUsers] = useState([]);

  const getAllUser = () => {
    database()
    .ref("users/")
    .once("value")
    .then(snapshot => {
      console.log("all data user", snapshot.val())
    })
  }
  console.log(MyDatabase.app)
  useEffect(() => {
    getAllUser()
  })

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const auth = getAuth(MyDatabase.app);
  //       const usersList = [];

  //       onAuthStateChanged(auth, (user) => {
  //         if (user) {
  //           usersList.push({
  //             uid: user.uid,
  //             email: user.email,
  //             displayName: user.displayName,
  //           });
  //         }
  //       });

  //       setUsers(usersList);
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  // console.info("user", users)

  // const usersCollection = firestore()
  // console.log(usersCollection)

  // useEffect(() => {
  //   const fetchChats = () => {
  //     const q = query(
  //       collection(MyDatabase, 'chats'),
  //       where('user.uid', '!=', admin.uid),
  //       orderBy('createdAt', 'desc'),
  //       // limit(100)
  //     );

  //     console.info(q);

  //     const unsubscribe = onSnapshot(q, (snapshot) => {
  //       const userList = snapshot.docs.reduce((acc, doc) => {
  //         const user = doc.data().user;
  //         const existingUser = acc.find((u) => u.uid === user.uid);

  //         if (existingUser) {
  //           existingUser.lastMessage = doc.data().text;
  //           existingUser.lastMessageTime = doc.data().createdAt.toDate();
  //         } else {
  //           acc.push({
  //             uid: user.uid,
  //             email: user.email,
  //             lastMessage: doc.data().text,
  //             lastMessageTime: doc.data().createdAt.toDate(),
  //           });
  //         }

  //         return acc;
  //       }, []);

  //       setUsers(userList);
  //     });

  //     return unsubscribe;
  //   };

  //   const fetchCollections = async () => {
  //     try {
  //       const collectionRefs = await listCollections(MyDatabase);
  //       const collectionNames = await Promise.all(
  //         collectionRefs.map(async (collectionRef) => {
  //           const collectionName = collectionRef.id;
  //           const collectionSnapshot = await getDocs(collection(MyDatabase, collectionName));
  //           const collectionData = collectionSnapshot.docs.map((doc) => ({
  //             id: doc.id,
  //             ...doc.data(),
  //           }));
  //           return { name: collectionName, data: collectionData };
  //         })
  //       );
  //       setAllCollections(collectionNames);
  //     } catch (error) {
  //       console.error('Error fetching collections:', error);
  //     }
  //   };

  //   const unsubscribe = fetchChats();
  //   fetchCollections();

  //   return unsubscribe;
  // }, [admin.uid]);

  

  return (
    <FlatList
    //   data={chatCollections}
    //   keyExtractor={(item) => item.name}
    //   renderItem={({ item }) => (
    //     <TouchableOpacity
    //       style={Styles.userItem}
    //       onPress={() =>
    //         navigation.navigate('Chat', { userChatRoom: item.name, user: item.lastMessage?.user })
    //       }
    //     >
    //       <Text style={Styles.userEmail}>{item.name}</Text>
    //       {item.lastMessage && (
    //         <>
    //           <Text style={Styles.lastMessage}>{item.lastMessage.text}</Text>
    //           <Text style={Styles.lastMessageTime}>
    //             {item.lastMessage.createdAt.toDate().toLocaleString()}
    //           </Text>
    //         </>
    //       )}
    //     </TouchableOpacity>
    //   )}
    />
  );
};

export default AdminChatList;