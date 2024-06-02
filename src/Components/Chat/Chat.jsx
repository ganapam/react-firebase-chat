import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useChatStore } from '../../Libary/chatStore';
import { useUserStore } from '../../Libary/userStore';
import { db } from '../../Libary/Firebase';
import upload from '../../Libary/Upload';
import Detail from '../Detail/Detail'
const Chat = () => {
    const [chat, setChat] = useState(null);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [img, setImg] = useState({
        file: null,
        url: '',
    });
    const [lastDisplayedDate, setLastDisplayedDate] = useState(null); 
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const [onlineStatus, setOnlineStatus] = useState(false);
    const { currentUser } = useUserStore();
    const endRef = useRef(null);
    const [detailPageOpen, setDetailPageOpen] = useState(false);
    const toggleDetailPage = () => {
        setDetailPageOpen(prev => !prev);
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

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, 'chats', chatId),
            (res) => {
                setChat(res.data());
            }
        );
        return () => {
            unSub();
        };
    }, [chatId]);

    const formatDate = (timestamp) => {
        return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDisplayDate = (timestamp) => {
        return timestamp.toDate().toLocaleDateString();
    };

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        try {
            let imgUrl = null;

            if (img.file) {
                imgUrl = await upload(img.file);
            }

            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];
            userIDs.forEach(async (id) => {
                const userChatRef = doc(db, 'userchats', id);
                const userChatDoc = await getDoc(userChatRef);

                if (userChatDoc.exists()) {
                    const userChatsData = userChatDoc.data();
                    const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatRef, {
                        chats: userChatsData.chats,
                    });
                }
            });
        } catch (err) {
            console.error('Error sending message:', err);
        }
        setText('');
        setImg({ file: null, url: '' });
    };
    return (
        <div className='chat'>
            {detailPageOpen && <Detail />}
            <div className='top'>
                <div className='user'>
                    <img src={user?.avatar || './avatar.png'} alt='' />
                    <div className='texts'>
                        <span>{user?.username}</span>
                        <p>{onlineStatus ? "Online" : "Offline"}</p>
                    </div>
                </div>
                <div className='icons' style={{ cursor: 'pointer' }}>
                    <img src='./phone.png' alt='' />
                    <img src='./video.png' alt='' />
                    <img src='./info.png' alt='' onClick={toggleDetailPage} />
                </div>
            </div>

            <div className='center'>
    {chat?.messages?.map((message, index) => (
        <div key={index}>
            {index === 0 || formatDisplayDate(message.createdAt) !== formatDisplayDate(chat.messages[index - 1].createdAt) ? (
                <div className="message-date">{formatDisplayDate(message.createdAt)}</div>
            ) : null}
            <div className={message.senderId === currentUser.id ? 'message own' : 'message'}>
                <div className={message.senderId === currentUser.id ? 'texts own-texts' : 'texts'}>
                    {message.img && <img src={message.img} alt='' />}
                    <p>{message.text}</p>
                </div>
                <div className="message-time">{formatDate(message.createdAt)}</div>
            </div>
        </div>
    ))}
  {img.url && (
    <div className={currentUser.id === chat.messages[chat.messages.length - 1].senderId ? 'message own' : 'message'}>
        <div className="texts">
            <img src={img.url} alt='' />
            {/* Add a button/icon to deselect the image */}
            <button className="deselectButton" onClick={() => setImg({ file: null, url: '' })}>
                Discard Image Click Here OR " Enter Message Click Send BUtoon "
            </button>
        </div>
    </div>
)}
    <div ref={endRef}></div>
</div>
            <div className='bottom'>
                <div className='icons'>
                    <label htmlFor='file'>
                        <img src='./img.png' alt='' />
                    </label>
                    <input type='file' id='file' style={{ display: "none" }} onChange={handleImg} />
                    <img src='./camera.png' alt='' />
                    <img src='./mic.png' alt='' />
                </div>
                <input
                    type="text"
                    placeholder={isCurrentUserBlocked || isReceiverBlocked
                        ? "You Cannot send a message"
                        : 'Type a message...'}
                    className='input'
                    onChange={(e) => setText(e.target.value)}
                    value={text}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className='emoji'>
                    <img src='./emoji.png' alt='' onClick={() => setOpen((prev) => !prev)} />
                    <div className='picker'>
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button
                    className='sendButton'
                    onClick={handleSend}
                    disabled={isCurrentUserBlocked || isReceiverBlocked || !text.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;