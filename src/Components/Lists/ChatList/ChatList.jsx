import React,{useState,useEffect} from 'react'
import './ChatList.css'
import Adduser from '../../ADDUSER/Adduser'
import { useUserStore } from '../../../Libary/userStore'
import { collection, onSnapshot, getDocs, query, where, getDoc,doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../Libary/Firebase';
import { useChatStore } from '../../../Libary/chatStore';
import { update } from 'firebase/database';
import Chatboat from '../../Chatboat/Chatbot';
import Chatbot from '../../Chatboat/Chatbot';
const ChatList = () => {
    const [chats, setChats] = useState([]);
    const { currentUser } = useUserStore();
    const [input,setInput]=useState("");
    const [addMode, setAddMode] = useState(false);
    const {chatId,changeChat}=useChatStore();
    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id),async (res) => {
            const items=res.data().chats;
            const promises=items.map(async(item)=>{
                const userDocRef=doc(db,"users",item.receiverId);
                const userDocSnap=await getDoc(userDocRef);
                const user=userDocSnap.data();
                return{...item,user};
            })
            const chatData=await Promise.all(promises)
            setChats(chatData.sort((a,b)=>b.updatedAt - a.updatedAt));
        });
        return () => {
            unSub();
        };
    }, [currentUser.id]);
    const handleSelect = async (chat) => {
        try {
            const userChats = chats.map((item) => {
                const { user, ...rest } = item;
                return { ...rest, user }; // Ensure to include the user object in each chat item
            });
    
            const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    
            if (chatIndex !== -1) {
                userChats[chatIndex].isSeen = true; // Set isSeen property if chat is found
    
                const userChatRef = doc(db, 'userchats', currentUser.id);
    
                await updateDoc(userChatRef, {
                    chats: userChats,
                });
    
                changeChat(chat.chatId, chat.user);
            } else {
                console.error('Chat not found');
            }
        } catch (err) {
            console.log(err);
        }
    };
    const filterdChats = chats.filter(c => 
        c.user && c.user.username.toLowerCase().includes(input.toLowerCase())
    );    
  return (
    <div className='chatlist'>
     <div className='search'>
        <div className='searchBar'>
            <img src='/search.png' alt=''/>
            <input type='text'placeholder='Search or Start a new chart' onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img src={addMode ? "./minus.png":'./plus.png'}alt='' className='add'
        onClick={()=>setAddMode((prev)=>!prev)}/>
     </div>
     {filterdChats.map((chat) => (
  <div className='item' key={chat.chatId} onClick={()=>handleSelect(chat)}
  style={{
    backgroundColor:chat?.isSeen? "transparent": "#5183fe"
  }}>
    <img src={chat.user.blocked.includes(currentUser.id)
        ?'./avatar.png'
        :chat.user.avatar ||'./avatar.png'} alt='' />
    <div className='texts'>
      <span>{chat.user.blocked.includes(currentUser.id)?'User'
      : chat.user.username}</span>
      <p>{chat.lastMessage}</p> 
    </div>
  </div>
))}
     {addMode && <Adduser/>}
            <Chatbot/>
    </div>
  )
}

export default ChatList
