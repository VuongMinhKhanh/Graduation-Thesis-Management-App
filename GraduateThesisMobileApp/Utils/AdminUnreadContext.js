import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { MyDatabase } from '../configs/firebase';

const AdminUnreadContext = createContext();

export const AdminUnreadProvider = ({ children }) => {
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [unreadMessageIds, setUnreadMessageIds] = useState([]);
  const chatAdminRoom = 'chat_admin@gmail.com_zKrTyYLrAvfamHC07vcDn8oLewl1'

  useEffect(() => {
    const adminChatRoom = chatAdminRoom;
    const collectionRef = collection(MyDatabase, adminChatRoom);
    const q = query(collectionRef, where('read', '==', false), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setAdminUnreadCount(snapshot.docs.length);
      // console.log(`Unread messages in admin chat room: ${snapshot.docs.length}`);

      // Get the IDs of the unread messages
      const unreadIds = snapshot.docs.map((doc) => doc.id);
      // console.log("id", unreadIds)
      setUnreadMessageIds(unreadIds);
    });

    return () => unsubscribe();
  }, []);

  const [unreadMessages, setUnreadMessages] = useState([]);

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(MyDatabase, chatAdminRoom, messageId), { read: true });
      setUnreadMessages(unreadMessages.filter((message) => message.id !== messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  return (
    <AdminUnreadContext.Provider value={{ adminUnreadCount, unreadMessageIds, markAsRead }}>
      {children}
    </AdminUnreadContext.Provider>
  );
};

export default AdminUnreadContext;