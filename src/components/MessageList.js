import React from "react";

const MessageList = ({ messages, user }) => {



  
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${
            msg.sender === user.username ? "sent" : "received"
          }`}
        >
          <strong>{msg.sender}: </strong>
          {msg.message}
          {console.log(msg.createdAt, "createdAt")}
    
          <p><small>{new Date(msg?.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</small></p>
        </div>
      ))}


      <div></div>
      
    </div>



  );
};

export default MessageList;
