import React, { useState, useEffect ,useRef} from 'react';
import './Chatbot.css'; 
import { FaTimes, FaMicrophone, FaSyncAlt } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [microphoneClass, setMicrophoneClass] = useState('microphone-icon');
  const [showMessage, setShowMessage] = useState(true)
  const lastMessageRef = useRef(null);
  useEffect(() => {
    setShowMessage(true);
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      initiateBotConversation();
    }
  }, [isOpen]);
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  useEffect(() => {
    if (conversation.length > 0 && conversation[conversation.length - 1].sender === 'user') {
      setTimeout(() => {
        receiveBotMessage();
      }, 500);
    }
  }, [conversation]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  const handleInputChange = (e) => {
    setUserMessage(e.target.value);
  };

  const sendMessage = (message) => {
    if (message.trim() !== '') {
      const newMessage = { sender: 'user', message: message };
      setConversation([...conversation, newMessage]);
      setUserMessage('');
    }
  };
  const initiateBotConversation = () => {
    const welcomeMessage = "Hi, Welcome To People TechSoft , I'm Bot, your personal assistant";
    const thirdMessage = "Do you want help with any of these services?";
    const options = ['Web Design', 'Web Development','DIGITAL MARKETING','HOSTING','PRODUCTS'];
    const conversationMessages = [
      { sender: 'bot', message: welcomeMessage },
      { sender: 'bot', message: thirdMessage},
      {sender: 'bot', options: options},
    ];
  
    setConversation(conversationMessages);
  };
  const receiveBotMessage = () => {
    const lastUserMessage = conversation[conversation.length - 1].message.toLowerCase();
    let botResponse = '';
    let botOptions = [];
    let url;
    if (lastUserMessage.includes('web design')) {
      botOptions = ['LOGO DESIGN', 'TEMPLATE DESGIN','RESPONSIVE DESIGN','WEBSITE REDESGIN','BROCHURE DESGIN','Back To Services'];
    } else if (lastUserMessage.includes('logo design')) {
      url = "https://www.peopletechsoft.com/logo-design/";
    } else if (lastUserMessage.includes('template desgin')) {
      url = "https://www.peopletechsoft.com/template-design/";
    } else if (lastUserMessage.includes('reponsive design')) {
      url = "https://www.peopletechsoft.com/responsive-design/";
    }
    else if (lastUserMessage.includes('website redesgin')) {
      url = "https://www.peopletechsoft.com/website-redesign/";
    }
    else if (lastUserMessage.includes('brochure design')) {
      url = "https://www.peopletechsoft.com/brochure-design/";
    }
    else if (lastUserMessage.includes('web development')) {
      botOptions = ['STATIC WEBSITE', 'DYNAMIC WEBSITE','E COMMERCE','WEB APPLICATION','MOBILE APPLICATION','Back To Services'];
    } 
    else if (lastUserMessage.includes('web')) {
      botOptions = ['Web Design', 'Web Development','DIGITAL MARKETING','HOSTING','PRODUCTS'];
    }
    else if (lastUserMessage.includes('back to services')) {
      botOptions = ['Web Design', 'Web Development','DIGITAL MARKETING','HOSTING','PRODUCTS'];
    }
    else if (lastUserMessage.includes('static website')) {
      url = "https://www.peopletechsoft.com/static-website/";
    }
    else if (lastUserMessage.includes('dynamic website')) {
      url = "https://www.peopletechsoft.com/dynamic-website/";
    }
    else if (lastUserMessage.includes('e commerce')) {
      url = "https://www.peopletechsoft.com/ecommerce-website-development/";
    }
    else if (lastUserMessage.includes('web application')) {
      url = "https://www.peopletechsoft.com/web-application-development/";
    }
    else if (lastUserMessage.includes('mobile application')) {
      url = "https://www.peopletechsoft.com/mobile-application-development/";
    }
    else if (lastUserMessage.includes('digital marketing')) {
      botOptions = ['SEARCH ENGINE OPTIMIZATION', 'SOCIAL MEDIA OPTIMIZATION','SERACH ENGINE MARKETING','SOCIAL MEDIA MARKETING','SOCIAL MEDIA CAMPAIGN','Back To Services'];
    } 
    else if (lastUserMessage.includes('search engine optimization')) {
      url = "https://www.peopletechsoft.com/search-engine-optimization/";
    }
    else if (lastUserMessage.includes('social media optimization')) {
      url = "https://www.peopletechsoft.com/social-media-optimization/";
    }
    else if (lastUserMessage.includes('search engine marketing')) {
      url = "https://www.peopletechsoft.com/search-engine-marketing/";
    }
    else if (lastUserMessage.includes('social media marketing')) {
      url = "https://www.peopletechsoft.com/social-media-marketing/";
    }
    else if (lastUserMessage.includes('social media campaign')) {
      url = "https://www.peopletechsoft.com/social-media-campaign/";
    }
    else if (lastUserMessage.includes('hosting')) {
      botOptions = ['DOMAIN REGISTRATION', 'WEB HOSTING','CPANEL HOSTING','EMAIL HOSTING','MALWARE SECURITY','Back To Services'];
    }
    else if (lastUserMessage.includes('domain registration')) {
      url = "https://www.peopletechsoft.com/domain-registration/";
    }
    else if (lastUserMessage.includes('web hosting')) {
      url = "https://www.peopletechsoft.com/web-hosting/";
    }
    else if (lastUserMessage.includes('cpanel hosting')) {
      url = "https://www.peopletechsoft.com/cpanel-hosting/";
    }
    else if (lastUserMessage.includes('email hosting')) {
      url = "https://www.peopletechsoft.com/email-hosting/";
    }
    else if (lastUserMessage.includes('malware security')) {
      url = "https://www.peopletechsoft.com/malware-security/";
    }
    else {
      botResponse = "I'm sorry, I didn't understand that.";
    }
  
    const newMessage = { sender: 'bot', message: botResponse , options: botOptions,url: url};
    setConversation([...conversation, newMessage]);
  };
  

  const handleOptionSelect = (option) => {
    sendMessage(option);
  };

  const handleSpeechButtonClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setMicrophoneClass('microphone-icon active');
      startSpeechRecognition();
    } else {
      setMicrophoneClass('microphone-icon');
    }
  };

  const startSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
  
      setUserMessage(transcript);
      sendMessage(transcript);
      recognition.stop(); 
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setMicrophoneClass('microphone-icon');
    };
  
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      setMicrophoneClass('microphone-icon');
    };
  
    recognition.start();
  };

  const resetConversation = () => {
    initiateBotConversation();
  };

  return (
    <div>
      <div className="startlogo-container"> {!isOpen && <> <img src='./download.svg' alt="Avatar" onClick={toggleChatbot} className='startlogo' /> {showMessage && <p className="chatbot-closed-message">Hi!! I am BOT</p>}</>}</div>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-top">
            <img src='./download.svg' alt="Logo" className="logo" />
            <div className="chatbot-name">Chatbot</div>
            <FaSyncAlt className='refresh-icon' onClick={resetConversation} />
            <div className="close-symbol" onClick={toggleChatbot}> <FaTimes /></div>
          </div>
          <div className="chatbot-middle">
          {conversation.map((msg, index) => (
  <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'} ref={index === conversation.length - 1 ? lastMessageRef : null}>
    {msg.sender === 'bot' && (
      <img src="./download.svg" alt="Bot Logo" className="bot-logo" />
    )}
    <div className="message-content">
      {msg.message}
      {msg.options && (
        <div className="options-container">
          {msg.options.map((option, optionIndex) => (
            <button key={optionIndex} className="option-button" onClick={() => handleOptionSelect(option)}>{option}</button>
          ))}
        </div>
      )}
      {msg.url && ( 
        <a href={msg.url} target="_blank" rel="noopener noreferrer">Click here for more information</a>
      )}
    </div>
    {msg.sender === 'user' && (
      <img src="./user.png" alt="Bot Logo" className="user-logo" />
    )}
  </div>
))}
          </div>
          <div className="chatbot-bottom">
            <input 
              type="text" 
              className="rsc-input" 
              placeholder="Type a message ..." 
              value={userMessage}
              onChange={handleInputChange}
            />
            <button className="rsc-submit-button" onClick={() => sendMessage(userMessage)}>
              <FaMicrophone className={microphoneClass} onClick={handleSpeechButtonClick}/>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 500 500">
                <polygon points="0,497.25 535.5,267.75 0,38.25 0,216.75 382.5,267.75 0,318.75" className="submit-icon" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
