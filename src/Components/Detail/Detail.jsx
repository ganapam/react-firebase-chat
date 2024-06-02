import React, { useState, useEffect } from 'react';
import './Detail.css';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '../../Libary/userStore';
import { useChatStore } from '../../Libary/chatStore';
import { arrayRemove, arrayUnion, updateDoc, doc,onSnapshot } from 'firebase/firestore';
import { db } from '../../Libary/Firebase';

const Detail = () => {
  const auth = getAuth();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore(); 
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      if (isReceiverBlocked) {
        // If the user is currently blocked, unblock them
        await updateDoc(userDocRef, {
          blocked: arrayRemove(user.id),
        });
      } else {
        // If the user is not blocked, block them
        await updateDoc(userDocRef, {
          blocked: arrayUnion(user.id),
        });
      }
      // Toggle the block status
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.id);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setOnlineStatus(userData.online || false);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching user online status:", err);
      }
    };

    fetchOnlineStatus();
  }, [user]);
  if (!user) {
    return null; // Return null or loading indicator if user is not available
  }

  return (
    <div className='detail'>
      <div className='user'>
        <img src={user?.avatar || './avatar.png'} alt='' />
        <h2>{user?.username}</h2>
        <p>{onlineStatus ? "Online" : "Offline"}</p>
      </div>
      <div className='info'>
        <div className='option'>
          <div className='title'onClick={() => setPhotosOpen(!photosOpen)}>
            <span>Chat Settings</span>
            <img src='arrowUp.png' alt='' />
          </div>
        </div>
        <div className='option'>
          <div className='title' onClick={() => setPhotosOpen(!photosOpen)}>
            <span>Privacy & help</span>
            <img src='arrowUp.png' alt='' />
          </div>
        </div>
        <div className='option'>
        <div className='title' onClick={() => setPhotosOpen(!photosOpen)}>
            <span>Shared Photos</span>
            <img src='./arrowDown.png' alt='' />
          </div>
          {photosOpen && (
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" alt='' />
              </div>
              <span>photo_2024.png</span>
              <img src="./download.png" alt='' className='icon' />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" alt='' />
              </div>
              <span>photo_2024.png</span>
              <img src="./download.png" alt='' className='icon' />
            </div>
          </div>)}
        </div>
        <div className='option'>
          <div className='title'>
            <span>Shared Files</span>
            <img src='arrowUp.png' alt='' />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "Unblock" : 'Block User'}
        </button>
        <button className='logout' onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;
