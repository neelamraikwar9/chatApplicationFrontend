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



            {msg.sender === user.username && (
        <span className={`status-icon ${msg.status}`}>
          {msg.status === 'sent' && <span>✓</span>}           {/* Single gray tick */}
          {msg.status === 'delivered' && <span>✓✓</span>}     {/* Double gray tick */}
          {msg.status === 'read' && <span>✓✓💙</span>}        {/* Double blue tick */}
        </span>
      )}


      
    
          <p><small>{new Date(msg?.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</small></p>
        </div>
      ))}


      <div></div>
      
    </div>



  );
};

export default MessageList;
