
import React from "react";

const MessageList = ({ messages, user, 
  isTyping, 
  currentChat
}) => {
  console.log(isTyping, currentChat, "typdhfgi");

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={msg._id || index}
          className={`message ${
            msg.sender === user.username ? "sent" : "received"
          }`}
        >
          <div className="message-content">
            <strong>{msg.sender}: </strong>
            <span>{msg.message}</span>
            <div className="message-meta">
              <small>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>

              {msg.sender === user.username && (
                <span className="status">
                  {msg.status === "sent"
                    ? "✓"
                    : msg.status === "delivered"
                    ? "✓✓" 
                    : msg.status === "read"
                    ? "✓✓💙" : "✓"}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

{/* <h1>what can we see??</h1> */}
{/* {isTyping ? <h1>what can we see??</h1> : <></>} */}


      {isTyping && currentChat && (
  <div className="typing-indicator" style={{ fontStyle: "italic", color: "green" }}>
    {currentChat} is typing...
  </div>
)}


    </div>
  );
};

export default MessageList;
