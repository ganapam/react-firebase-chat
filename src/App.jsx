import React ,{useEffect}from 'react'
import List from './Components/Lists/List'
import Chat from './Components/Chat/Chat'
import Detail from './Components/Detail/Detail'
import Login from './Components/Login/Login'
import Notification from './Components/Notification/Notification'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useUserStore } from './Libary/userStore'
import { useChatStore } from './Libary/chatStore'
// import Chatbot from './Components/Chatboat/Chatbot'
const App = () => {
  const {currentUser,isLoading,fetchUserInfo}=useUserStore()
  const {chatId}=useChatStore();
  useEffect(() => {
    const auth = getAuth(); 
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  if(isLoading)return <div className='loading'>Loading....</div>
  return (
    <div className='container'>
      {currentUser ?(
        <>
      <List/>
      {chatId &&<Chat/>}
      {/* {chatId &&<Detail/>} */}
        </>
      ):(
        <Login/>
      )}
      <Notification/>
      {/* <Chatbot/> */}
    </div>
  )
}

export default App
