import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";
import EmojiPicker from "emoji-picker-react"; // Default import

// const socket = io("http://localhost:5001");
const socket = io("wss://chatapplicationfrontend-2.onrender.com");


export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  console.log(messages, "messages")
  const [currentMessage, setCurrentMessage] = useState("");



  // const [typing, setTyping] = useState(false);
  // const [isTyping, setIsTyping] = useState(false);

 

  // const [selectedEmoji, setSelectedEmoji] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
  console.log("isTyping state in Chat changed:", isTyping, "for", currentChat);
}, [isTyping, currentChat]);

  // const [typingUser, setTypingUser] = useState();

  // const typingTimerRef = useRef(null);
  // const [isTyping, setIsTyping] = useState(false);
const typingTimeout = useRef(null);



  

  //..............................................................................

// join user room; 
   useEffect(() => {
  if (socket && user.username) {
    socket.emit("user_Room", user.username);  // Join "bob" room
  }
}, [socket, user.username]);

  
  useEffect(() => {
    // Fetch all users excluding the current user;

    console.log("Socket ID:", socket.id); // Verify connection
    

    const fetchUsers = async () => {
      try {
        // const { data } = await axios.get("http://localhost:5001/users", {
        const { data } = await axios.get("https://chatapplicationbackend-1-5uw0.onrender.com/users", {
          params: { currentUser: user.username },
        });
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();


    // Listen for incoming messages
    socket.on("receive_message", (data) => {    
      console.log(data, "chedkingdkljdfjkat")
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);
        console.log(messages, "fdfkdfkjdfsjfdjklfd")

        // Confirm delivery back to sender
        if(data.receiver === user.username){
        socket.emit("message_delivered", {messageId: data.messageId});
        }
      }
    });


    return () => {
      socket.off("receive_message");

    };
  }, [messages, currentChat]);


  // Sender side - listen for delivery
useEffect(() => {
  socket.on("message_delivered", ({ messageId }) => {
    setMessages(prev => prev.map(msg =>
      msg.messageId === messageId
        ? { ...msg, status: "delivered" }  // ✓✓
        : msg
    ));
  });
  
  return () => socket.off("message_delivered");
}, []);



// Read Recipt, mark as read when user reads messages; 

useEffect(() => {
  if (currentChat && messages.length > 0) {
    const unreadIds = messages
      .filter(msg => 
        msg.sender === currentChat &&     // From this user
        msg.receiver === user.username && // To me
        msg.status !== "read"             // Unread
      )
      .map(msg => msg.messageId);

    if (unreadIds.length > 0) {
      socket.emit("message_read", {
        messageIds: unreadIds,
        sender: currentChat
      });
    }
  }
  
}, [currentChat, messages, user.username]);



// 2. SECOND: Listen for read confirmation (sender side)
useEffect(() => {
  const handleMessageRead = ({ messageIds }) => {
    if (!messageIds || !Array.isArray(messageIds)) return;
    
    setMessages(prev => prev.map(msg =>
      messageIds.includes(msg.messageId)
        ? { ...msg, status: "read" }
        : msg
    ));
  };

  socket.on("message_read", handleMessageRead);  // Named handler

  return () => {
    socket.off("message_read", handleMessageRead);  // Removes ONLY this handler
  };
}, []);  // Empty deps





  // ..........................................................................

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get("https://chatapplicationbackend-1-5uw0.onrender.com/messages", {
        params: { sender: user.username, receiver },
      });
      setMessages(data);
      console.log(messages, "messagesllddkfjdl");
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };


  const sendMessage = () => {
    // socket.emit('stop typing', currentChat._id); 


    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };

    socket.emit("send_message", messageData);
  
    setCurrentMessage("");

  };

  

// const handleInputIndicator = () => {
//   // if (currentMessage.length === 0) return; // Avoid spam on delete
//     if (!currentChat || currentMessage.length === 0) return;
  
//   socket.emit("typing", { 
//     sender: user.username, 
//     // currentChat: user.username  // Backend expects this as room name
//      currentChat
//   });
  
//   if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
//   typingTimerRef.current = setTimeout(() => {
//     socket.emit("stop_typing", { 
//       sender: user.username, 
//       // currentChat: user.username 
//       currentChat
//     });
//   }, 3000);
// };




// useEffect(() => {
//   const handleTypingIndicator = (data) => {
//       console.log("Received typing:", data, "currentChat:", currentChat);

//         if (data.chatId === currentChat && data.sender !== user.username) {
//       setIsTyping(data.isTyping);
//     }
//   };

//   socket.on("user_typing", handleTypingIndicator);

//   return () => socket.off("user_typing", handleTypingIndicator);
// }, [currentChat, user.username]);


// useEffect(() => {
//   socket.on('typing', () => setIsTyping(true));
//   socket.on('stop typing', () => setIsTyping(false));
// }, []); 


// const handleTypingIndicator = (e) => {
//   // if (!socketConnected)
//   // setCurrentChat(e.target.value);

//   if(!typing){
//     setTyping(true); 
//     socket.emit('typing', currentChat._id);
//   }

//   let lastTypingTime = new Date().getTime();
//   var timerLength = 3000; 

//   setTimeout(() => {
//     var timeNow = new Date().getTime();
//     var timeDiff = timeNow - lastTypingTime;

//     if(timeDiff >= timerLength && typing){
//       socket.emit('stop typing', currentChat._id);
//       setTyping(false); 
//     }
//   }, timerLength);
// }


// Add this useEffect ONCE (empty deps array)
// useEffect(() => {
//   const handleTyping = (data) => {
//     console.log('✅ Typing received:', data);
//     if (data.sender === currentChat) {
//       setIsTyping(data.isTyping);
//     }
//   };

//   socket.on('user_typing', handleTyping);
//   return () => socket.off('user_typing', handleTyping);
// }, []); // Empty deps = runs once forever




// const handleTypingIndicator = (e) => {
//   setCurrentMessage(e.target.value);
  
//   if (!currentChat) return;
  
//   socket.emit('typing', { 
//     sender: user.username, 
//     receiver: currentChat 
//   });
  
//   if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
//   typingTimerRef.current = setTimeout(() => {
//     socket.emit('stop_typing', { 
//       sender: user.username, 
//       receiver: currentChat 
//     });
//   }, 1500);
// };/



// JOIN ROOM FIRST THING
useEffect(() => {
  if (user.username) {
    console.log("🚀 JOINING:", user.username);
    socket.emit("user_Room", user.username);
  }
}, [user.username]);

// LISTEN FOR TYPING (runs ONCE)
useEffect(() => {
  socket.on("typing", (typing) => {
    console.log("📱 TYPING EVENT:", typing);
    setIsTyping(typing);
  });
  return () => socket.off("typing");
}, []);



// PERFECT TYPING HANDLER
const handleTyping = (e) => {
  setCurrentMessage(e.target.value);
  
  if (!currentChat) return;
  
  // Clear old timeout
  if (typingTimeout.current) clearTimeout(typingTimeout.current);
  
  // Tell room you're typing
  socket.emit("typing", currentChat);
  
  // Auto-stop after 1.5s
  typingTimeout.current = setTimeout(() => {
    socket.emit("stop_typing", currentChat);
  }, 2000);
};




  return (
    <div className="chat-container">
      <h2>Welcome, {user.username}</h2>
      <div className="chat-list">
        <h3>Chats</h3>
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-user ${
              currentChat === u.username ? "active" : ""
            }`}
            onClick={() => fetchMessages(u.username)}
          >
            {u.username}
          </div>
        ))}
      </div>
      {currentChat && (
        <div className="chat-window">
          <h5>You are chatting with {currentChat}</h5>
          <MessageList messages={messages} user={user} 
          isTyping={isTyping}  
          currentChat={currentChat} />


          <div className="message-field">
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              style={{ minWidth: "400px" }}
              onChange={(e) => {
                setCurrentMessage(e.target.value);
                // handleInputIndicator(e);

                handleTyping(e)

              }}
            />

            <div>
              <button
                className=""
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {showEmojiPicker ? "Hide Picker" : "Show Picker"}
              </button>

              {showEmojiPicker && (
                <div>
                  <EmojiPicker
                    onEmojiClick={(emojiData) =>
                      setCurrentMessage((prev) => prev + emojiData.emoji)
                    }
                  />
                </div>
              )}

              {/* {showEmojiPicker && <div>
                <EmojiPicker onEmojiClick={(emojiData) => (setSelectedEmoji((prev) => [...prev , emojiData.emoji]))}/>
              </div>} */}

            </div>

            <button className="btn-prime" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
