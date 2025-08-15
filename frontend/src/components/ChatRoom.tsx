// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000'); // Use VITE_API_BASE_URL for prod

// const ChatRoom: React.FC = () => {
//   const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     socket.on('message', (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });
//     return () => {
//       socket.off('message');
//     };
//   }, []);

//   const sendMessage = () => {
//     socket.emit('chatMessage', { user: 'User', text: message });
//     setMessage('');
//   };

//   return (
//     <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-white p-4 rounded-lg shadow-md h-96 flex flex-col">
//       <div className="flex-1 overflow-y-auto space-y-2">
//         {messages.map((msg, i) => (
//           <p key={i} className="text-sm md:text-base">{msg.user}: {msg.text}</p>
//         ))}
//       </div>
//       <div className="flex mt-2">
//         <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 border p-2 rounded-l" />
//         <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600">Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;



import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [message, setMessage] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('chatMessage', { user: user?.name || 'Guest', text: message });
    setMessage('');
  };

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-white p-4 rounded-lg shadow-md h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm md:text-base">
            <span className="font-semibold">{msg.user}:</span> {msg.text}
          </p>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;