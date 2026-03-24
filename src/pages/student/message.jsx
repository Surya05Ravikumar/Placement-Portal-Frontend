import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Send, Paperclip, Image, File, X, Search,
  MessageSquare, Clock, Check, CheckCheck, FileText
} from 'lucide-react';

const Messages = () => {
    const getStudentId = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                // Prioritize registerNumber as it's the identifier used for student chats
                return userObj.registerNumber || userObj.id || userObj._id;
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
        }
        return null;
    };
    
    const STUDENT_ID = getStudentId();
    const [selectedChat, setSelectedChat] = useState('placement-cell');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [fileType, setFileType] = useState('document');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Socket
    socketRef.current = io(`${import.meta.env.VITE_API_URL}`);

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      socketRef.current.emit('join_personal', STUDENT_ID);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []); // Run ONLY once on mount

  // 2. Listen for incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (newMessage) => {
      // If the message belongs to the current open chat, append it to the chat window
      if (
        (newMessage.sender === selectedChat && newMessage.receiver === STUDENT_ID) ||
        (newMessage.sender === STUDENT_ID && newMessage.receiver === selectedChat)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Update the conversations list sidebar text
      setChats(prev => {
        const index = prev.findIndex(c => c.id === newMessage.sender || c.id === newMessage.receiver);
        if (index === -1) {
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${STUDENT_ID}`)
            .then(res => setChats(res.data))
            .catch(err => console.error(err));
          return prev;
        }

        const newChats = [...prev];
        const conv = newChats[index];
        newChats[index] = {
          ...conv,
          lastMessage: newMessage.text || (newMessage.file ? 'Attachment' : ''),
          time: newMessage.createdAt || newMessage.timestamp,
          unread: (newMessage.sender !== STUDENT_ID && newMessage.sender !== selectedChat)
            ? (Number(conv.unread) || 0) + 1 : (Number(conv.unread) || 0)
        };
        const item = newChats.splice(index, 1)[0];
        newChats.unshift(item);
        return newChats;
      });
    };

    socketRef.current.on('receive_message', handleReceiveMessage);

    return () => {
      socketRef.current.off('receive_message', handleReceiveMessage);
    };
  }, [selectedChat]);

  useEffect(() => {
    // 3. Fetch list of conversations
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${STUDENT_ID}`);
        setChats(res.data);
        if (res.data.length > 0 && !selectedChat) {
          // In student view, it defaults to placement-cell, but just in case
          setSelectedChat(res.data[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    // 4. Load messages for selected chat & join socket room
    if (!selectedChat) return;

    // The room name is a sorted combination of both IDs so both parties join the identical room string
    const roomId = [STUDENT_ID, selectedChat].sort().join('_');
    socketRef.current.emit('join_chat', roomId);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${STUDENT_ID}/${selectedChat}`);
        setMessages(res.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() && !attachedFile) return;

    const roomId = [STUDENT_ID, selectedChat].sort().join('_');

    let fileData = null;
    if (attachedFile) {
      try {
        const formData = new FormData();
        formData.append('file', attachedFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fileData = {
          name: attachedFile.name,
          size: attachedFile.size,
          url: uploadRes.data.url
        };
      } catch (err) {
        console.error("File upload failed", err);
        alert('File upload failed');
        return;
      }
    }

    const messagePayload = {
      chatId: roomId, // So the server knows which room to emit to
      sender: STUDENT_ID,
      receiver: selectedChat,
      text: messageInput,
      file: fileData
    };

    // Emit to backend Socket.io handler
    socketRef.current.emit('send_message', messagePayload);

    setMessageInput('');
    setAttachedFile(null);
    setShowAttachMenu(false);

    const textarea = document.getElementById('messageInput');
    if (textarea) textarea.style.height = 'auto';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = formatDate(msg.timestamp || msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-transparent">
            <div className="flex-1 p-4 lg:p-6 overflow-hidden">
                <div className="bg-white dark:bg-[#020617] rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden h-full shadow-2xl shadow-blue-500/5 flex transition-colors">
            {/* Chat List Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                        {/* Search */}
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800/50">
                            <div className="relative group">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 dark:text-white text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3 space-y-1">
                                {chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat.id)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 ${selectedChat === chat.id
                                            ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-500/20 dark:border-blue-500/20'
                                            : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-slate-900/50 hover:border-gray-100 dark:hover:border-slate-800'
                                            }`}
                                    >
                    <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                                                    {chat.avatar}
                                                </div>
                                                {chat.online && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-black uppercase tracking-tight text-xs truncate ${selectedChat === chat.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{chat.name}</h3>
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{chat.time ? formatDate(chat.time) : ''}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 truncate pr-2">{chat.lastMessage}</p>
                                                    {chat.unread > 0 && (
                                                        <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-500/30">
                                                            {chat.unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                                    {selectedChatData?.avatar || "PC"}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedChatData?.name || "Placement Cell"}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <p className="text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-[0.2em]">Active Now</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-gray-50/30 dark:bg-[#020617] transition-colors">
                            {Object.entries(messageGroups).map(([date, msgs]) => (
                                <div key={date} className="space-y-6">
                                    {/* Date Separator */}
                                    <div className="flex items-center justify-center py-4">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent"></div>
                                        <div className="px-5 py-1.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] shadow-sm z-10 mx-4">
                                            {date}
                                        </div>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent"></div>
                                    </div>

                    {/* Messages */}
                                        {msgs.map((msg, index) => (
                                            <div
                                                key={msg._id || index}
                                                className={`flex ${msg.sender === STUDENT_ID ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                            >
                                                <div className={`max-w-[75%] ${msg.sender === STUDENT_ID ? 'order-2' : 'order-1'} group`}>
                                                    <div
                                                        className={`rounded-2xl px-5 py-3.5 shadow-sm transition-all hover:shadow-md ${msg.sender === STUDENT_ID
                                                            ? 'bg-blue-600 dark:bg-blue-700 text-white rounded-tr-none'
                                                            : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-800/50 rounded-tl-none'
                                                            }`}
                                                    >
                                                        {msg.file && (
                                                            <a
                                                                href={`${import.meta.env.VITE_API_URL}${msg.file.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`mb-3 p-3 rounded-xl flex items-center gap-3 transition-colors group/file ${msg.sender === STUDENT_ID
                                                                    ? 'bg-white/10 hover:bg-white/20'
                                                                    : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                                                                    }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${msg.sender === STUDENT_ID ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-black uppercase tracking-tight truncate border-b border-transparent group-hover/file:border-current inline-block">{msg.file.name}</p>
                                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-60`}>{(msg.file.size / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                            </a>
                                                        )}
                                                        <p className="text-sm font-medium leading-relaxed tracking-tight">{msg.text || msg.message}</p>
                                                        <div className={`flex items-center gap-1.5 mt-2.5 ${msg.sender === STUDENT_ID ? 'justify-end' : 'justify-start'}`}>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${msg.sender === STUDENT_ID ? 'text-white' : 'text-gray-500 dark:text-slate-500'}`}>
                                                                {formatTime(msg.timestamp || msg.createdAt)}
                                                            </span>
                                                            {msg.sender === STUDENT_ID && (
                                                                <div className="opacity-40">
                                                                    {msg.isRead ?
                                                                        <CheckCheck className="w-3.5 h-3.5" /> :
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white dark:bg-[#020617] border-t border-gray-100 dark:border-slate-800/50 transition-colors">
                            {/* File Attachment Preview */}
                            {attachedFile && (
                                <div className="mb-5 p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center justify-between shadow-inner animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 shadow-sm">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{attachedFile.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                                {(attachedFile.size / 1024).toFixed(1)} KB • Ready to send
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removeAttachment}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex items-end gap-3 relative">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                                        className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all mb-0.5 transform active:scale-95 ${showAttachMenu ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
                                    >
                                        <Paperclip className={`w-5 h-5 transition-transform duration-300 ${showAttachMenu ? 'rotate-45' : ''}`} />
                                    </button>

                                    {/* Attachment Popup */}
                                    {showAttachMenu && (
                                        <div className="absolute bottom-full left-0 mb-4 bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-2 flex gap-2 z-50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFileType('document');
                                                    setShowAttachMenu(false);
                                                    fileInputRef.current?.click();
                                                }}
                                                className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 dark:hover:bg-blue-500/5 rounded-xl transition-all min-w-[85px] group/item"
                                            >
                                                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/item:scale-110 transition-transform">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 uppercase tracking-widest">Doc</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFileType('image');
                                                    setShowAttachMenu(false);
                                                    fileInputRef.current?.click();
                                                }}
                                                className="flex flex-col items-center gap-2 p-4 hover:bg-purple-50 dark:hover:bg-purple-500/5 rounded-xl transition-all min-w-[85px] group/item"
                                            >
                                                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover/item:scale-110 transition-transform">
                                                    <Image className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 uppercase tracking-widest">Image</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept={fileType === 'document' ? ".pdf,.doc,.docx" : ".jpg,.jpeg,.png"}
                  />

                                <div className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent focus-within:border-blue-500/30 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all px-2 py-1 flex items-end">
                                    <textarea
                                        id="messageInput"
                                        value={messageInput}
                                        onChange={(e) => {
                                            setMessageInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        placeholder="Write your message..."
                                        className="w-full px-3 py-2 bg-transparent focus:outline-none dark:text-white text-sm font-medium resize-none overflow-y-auto no-scrollbar"
                                        style={{ minHeight: '40px', maxHeight: '120px' }}
                                        rows="1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!messageInput.trim() && !attachedFile}
                                    className="w-12 h-11 flex items-center justify-center bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30 disabled:grayscale disabled:shadow-none active:scale-[0.9] mb-0.5 transform"
                                >
                                    <Send className="w-5 h-5 ml-1" />
                                </button>
                            </form>

                            <div className="flex items-center justify-between mt-4">
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                                    Enter to send • Shift+Enter for new line
                                </p>
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                                    Max file size: 5MB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;