import React, { useState } from 'react';
import './Adduser.css';
import { db } from '../../Libary/Firebase';
import { collection, getDocs, query, where, doc, setDoc ,serverTimestamp,updateDoc,arrayUnion,getDoc} from 'firebase/firestore';
import { useUserStore } from '../../Libary/userStore';
const Adduser = () => {
  const [user, setUser] = useState();
  const [userList, setUserList] = useState([]);
  const {currentUser}=useUserStore()
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim(); // Trim whitespace
    if (!username) {
      // If the username is empty, clear the user list and return
      setUserList([]);
      return;
    }
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", ">=", username));
      const querySnapShot = await getDocs(q);
      const filteredUsers = [];
      querySnapShot.forEach(doc => {
        const userData = doc.data();
        if (userData.username.toLowerCase().includes(username.toLowerCase())) {
          filteredUsers.push(userData);
        }
      });
      setUserList(filteredUsers);
    } catch (err) {
      console.log(err);
    }
  };
  
  const handleAdd = async (user) => {
    if (!user) {
      console.log("No user selected.");
      return;
    }
  
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    try {
      // Check if the user is already added
      const currentUserChatDocRef = doc(userChatsRef, currentUser.id);
      const currentUserChatDocSnap = await getDoc(currentUserChatDocRef);
      if (currentUserChatDocSnap.exists()) {
        const chats = currentUserChatDocSnap.data().chats;
        const existingChat = chats.find(chat => chat.receiverId === user.id);
        if (existingChat) {
          // User already added
          console.log("User already added");
          return;
        }
      }
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      const userChatDocRef = doc(userChatsRef, user.id); 
      const userChatDocSnap = await getDoc(userChatDocRef);
      if (!userChatDocSnap.exists()) {
        await setDoc(userChatDocRef, { chats: [] });
      }
      await updateDoc(userChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });
      await updateDoc(currentUserChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type='text' placeholder='Username' name='username' />
        <button>Search</button>
      </form>
      {userList.length > 0 && (
        <div className='user-list'>
          {userList.map((user, index) => (
            <div className='user' key={index}>
              <div className='detail'>
                <img src={user.avatar || './avatar.png'} alt='' />
                <span>{user.username}</span>
              </div>
              <button onClick={() => handleAdd(user)} disabled={!user}>Add User</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Adduser;
