
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { X, Send, MessageCircle } from "lucide-react";

const ChatModal = ({ rideId, rideTitle, currentUserId, receiverId, receiverName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const chatPartnerName = receiverName || "Driver";

  const loadMessages = async () => {
    try {
      const res = await API.get(`/chats/messages/${rideId}`);
      console.log("Messages loaded:", res.data.messages?.length || 0);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
   
    pollingRef.current = setInterval(loadMessages, 2000);
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [rideId]);

  
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!receiverId) {
      alert("Cannot find receiver. Please try again.");
      return;
    }
    
    setSending(true);
    
    try {
      await API.post("/chats/send", {
        rideId: rideId,
        receiverId: receiverId,
        message: newMessage.trim()
      });
      
      console.log("Message sent to:", receiverId);
      setNewMessage("");
      await loadMessages(); // Refresh messages
    } catch (err) {
      console.error("Send error:", err);
      alert(err.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">{chatPartnerName}</h3>
                <p className="text-xs text-white/80 truncate max-w-[200px]">{rideTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Messages - Your messages on RIGHT, others on LEFT */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No messages yet</p>
              <p className="text-xs text-gray-300">Say hello to start chatting!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              // Check if message is from current user
              const isMyMessage = msg.sender?._id === currentUserId;
              
              return (
                <div key={idx} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                    {/* Show sender name for others' messages */}
                    {!isMyMessage && (
                      <p className="text-xs text-gray-400 mb-1 ml-2">{msg.sender?.name}</p>
                    )}
                    <div className={`rounded-2xl px-4 py-2 ${
                      isMyMessage 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;