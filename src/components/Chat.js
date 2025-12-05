import React, { useState, useEffect, useRef} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";

const socket = io("http://localhost:5001");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    // Fetch all users excluding the current user;

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

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);
      }
    });

    //  listen for typing
    // socket.on("receiveTypInd", (data) => {
    //   console.log('RECEIVED_typing:', data); 
    //   console.log(currentChat, "currentChat");
    
    //   if (data.sender === currentChat || data.receiver === currentChat) {
    //     setTypingUser(data.sender);
    //   }
    // });

    // socket.on("recStop_typingInd", (data) => {
    //   if (data.sender === currentChat || data.receiver === currentChat) {
    //     setTypingUser(null);
    //   }
    // });

    socket.on("typing", (data) => {
      if(data.receiver === currentChat){
        setTypingUser(data.sender);
      }
    });

    socket.on("stop_typing", (data) => {
      if(data.receiver === currentChat){
        setTypingUser(null);
      }
    })


    return () => {
      socket.off("receive_message");

      socket.off("typing");
      socket.off("stop_typing");

    };
  }, [currentChat]);




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
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };


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
          <MessageList messages={messages} user={user} />
          {typingUser && (
            <div className="typing-indicator">{typingUser} is typing...</div>
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
                  if (typingTimer.current) clearTimeout(typingTimer.current);

                  //show typing message;
                  if (isTyping && currentChat) {
                    setIsTyping(true);
                    socket.emit("typing", {
                      sender: user.username,
                      receiver: currentChat,
                    });
                  }

                  typingTimer.current = setTimeout(() => {
                    setIsTyping(false);
                    socket.emit("stop_typing", {
                      sender: user.username,
                      receiver: currentChat,
                    });
                  }, 1500);
                }}
            />

            <button className="btn-prime" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
