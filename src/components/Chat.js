import React, { useState, useEffect, useRef} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";
import EmojiPicker from 'emoji-picker-react'; // Default import



const socket = io("http://localhost:5001");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  
  // const [selectedEmoji, setSelectedEmoji] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimerRef = useRef(null);




  useEffect(() => {

    console.log('Socket ID:', socket.id); // Verify connection
      
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/users", {
          params: { currentUser: user.username },
        });
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();


  const handleReceiveMessage = (msg) => {
    console.log("RECEIVED:", msg);
    setMessages(prev => [...prev, {
      ...msg, 
      status: msg.sender === user.username ? 'sent' : 'delivered'
    }]);
  };

  const handleTyping = (data) => {
    if (data.receiver === currentChat) setTypingUser(data.sender);
  };

  const handleStopTyping = (data) => {
    if (data.receiver === currentChat) setTypingUser(null);
  };

  const handleMessageDelivered = ({ messageId }) => {
    setMessages(prev => prev.map(m => 
      m.messageId === messageId ? { ...m, status: 'delivered' } : m
    ));
  };

  const handleMessageRead = ({ messageIds }) => {
    setMessages(prev => prev.map(m => 
      messageIds.includes(m.messageId) ? { ...m, status: 'read' } : m
    ));
  };

  socket.on("receive_message", handleReceiveMessage);
  socket.on("typing", handleTyping);
  socket.on("stop_typing", handleStopTyping);
  socket.on("message_delivered", handleMessageDelivered);
  socket.on("message_read", handleMessageRead);

  return () => {
    socket.off("receive_message", handleReceiveMessage);
    socket.off("typing", handleTyping);
    socket.off("stop_typing", handleStopTyping);
    socket.off("message_delivered", handleMessageDelivered);
    socket.off("message_read", handleMessageRead);
  };
}, [currentChat, user.username]); // ✅ Stable deps only





// ✅ Auto-mark unread messages as read when viewing chat
useEffect(() => {
  if (currentChat) {
    const unread = messages.filter(
      m => m.status !== 'read' && m.sender !== user.username
    );
    if (unread.length > 0) {
      socket.emit('message_read', { 
        messageIds: unread.map(m => m.messageId),
        sender: currentChat  // Notify original sender
      });
    }
  }
}, [currentChat]); // ✅ Only when switching chats





//   useEffect(() => {
//   socket.on("receive_message", (saved) => {
//     setMessages(prev => [...prev, {
//       ...saved,
//       // Safe timestamp fallback: createdAt > sendTime > now
//       createdAt: new Date(saved.createdAt || saved.sendTime || Date.now())
//     }]);
//   });
//   return () => socket.off("receive_message");
// }, []);

// useEffect(() => {
//   // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// }, [messages]);









//   useEffect(() => {
//     // Fetch all users excluding the current user;

//       console.log('Socket ID:', socket.id); // Verify connection
      
//     const fetchUsers = async () => {
//       try {
//         const { data } = await axios.get("http://localhost:5001/users", {
//           params: { currentUser: user.username },
//         });
//         setUsers(data);
//       } catch (error) {
//         console.error("Error fetching users", error);
//       }
//     };

//     fetchUsers();

//     // Listen for incoming messages
//     // socket.on("receive_message", (data) => {
//       // console.log(data, "chedkingdkljdfjkat")
//     //   if (data.sender === currentChat || data.receiver === currentChat) {
//     //     setMessages((prev) => [...prev, data]);
//     //     console.log(messages, "fdfkdfkjdfsjfdjklfd")
//     //   }
//     // });

//     // New message arrives (for receiver)
//   socket.on("receive_message", (data) => {
//     console.log(data, "recijdkjMessgdkfj")
//     setMessages(prev => [...prev, {...data, status: data.sender === user.username ? 'sent' : 'delivered'}]);

//     console.log(setMessages, "setMesskjfdk");
//   });

    
//     socket.on("typing", (data) => {
//       if(data.receiver === currentChat){
//         setTypingUser(data.sender);
//       }
//     });

//     socket.on("stop_typing", (data) => {
//       if(data.receiver === currentChat){
//         setTypingUser(null);
//       }
//     })

// // New message arrives (for receiver)
//   // socket.on('message', (msg) => {
//   //   setMessages(prev => [...prev, {...msg, status: msg.sender === user._id ? 'delivered' : 'sent'}]);
//   // });

//   //Sender confirmation: message delivered
//   socket.on('message_delivered', ({ messageId }) => {
//     setMessages(prev => prev.map(m => m.messageId === messageId ? { ...m, status: 'delivered' } : m));
//   });

//   //Sender confirmation: message read
//    socket.on('message_read', ({ messageIds }) => {
//     setMessages(prev => prev.map(m => messageIds.includes(m.messageId) ? { ...m, status: 'read' } : m));
//   });


//     // D. Auto-mark as read when user views chat
//   const unread = messages.filter(m => m.status !== 'read' && m.sender !== user.username);
//   if (unread.length > 0) {
//     socket.emit('message_read', { 
//       messageIds: unread.map(m => m.messageId),
//       sender: user.username 
//     });
//   }


//     return () => {
//       socket.off("receive_message");
//       socket.off("typing");
//       socket.off("stop_typing");

//       // socket.off("message");
//       socket.off("message_delivered");
//       socket.off("message_read");


//     };

  // }, [messages, currentChat]);




  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get("http://localhost:5001/messages", {
        params: { sender: user.username, receiver },
      });
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = () => {
     if (!currentMessage.trim()) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    // console.log(messageData, "msgData"); 
    // setMessages((prev) => [...prev, messageData]);
    // console.log(messages, "messages");
    setCurrentMessage("");  
  };




//   const sendMessage = () => {
//   socket.emit('message', {     // Backend adds status automatically
//     sender: user.username,
//     receiver: currentChat,
//     message: currentMessage
//   });
//   setMessages((prev) => [...prev, messageData]);
//   setCurrentMessage('');
// };

  



  // useEffect(() => {
  //     console.log(typingUser, "typingUser");
  //   })



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
          <MessageList messages={messages} user={user}/>
          {typingUser && (
            <div className="typing-indicator">{typingUser} is typing...  </div>
          )}
   

          <div className="message-field">
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              style={{ minWidth: "400px" }}
              onChange={(e) => {
                setCurrentMessage(e.target.value);

                // Inline typing logic with ref cleanup
                  if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

                  //show typing message;
                  if (!isTyping && currentChat) {
                    setIsTyping(true);
                    socket.emit("typing", {
                      sender: user.username,
                      receiver: currentChat,
                    });
                  }

                  typingTimerRef.current = setTimeout(() => {
                    setIsTyping(false);
                    socket.emit("stop_typing", {
                      sender: user.username,
                      receiver: currentChat,
                    });
                  }, 1500);
                }}
            />

            <div>
              <button className="" onClick={() => (setShowEmojiPicker(!showEmojiPicker))}>{showEmojiPicker ? "Hide Picker" : "Show Picker"}</button>

              {showEmojiPicker && <div>
                <EmojiPicker onEmojiClick={(emojiData) => 
                (setCurrentMessage((prev) => prev + emojiData.emoji))}/>
              </div>}

              {/* {showEmojiPicker && <div>
                <EmojiPicker onEmojiClick={(emojiData) => (setSelectedEmoji((prev) => [...prev , emojiData.emoji]))}/>
              </div>} */}

              {/* <div>
                { selectedEmoji.length > 0 && <p>{selectedEmoji.join("")}
                </p> 
                }
              </div> */}
    
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
