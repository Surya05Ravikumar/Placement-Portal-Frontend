import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Send, Paperclip, Image, File, X, Search,
  MessageSquare, Clock, Check, CheckCheck, FileText
} from 'lucide-react';

const ADMIN_ID = 'placement-cell';

const Messages = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(location.state?.studentId || null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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
      console.log('Admin Socket Connected');
      socketRef.current.emit('join_personal', ADMIN_ID);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 2. Search for students
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        axios.get(`${import.meta.env.VITE_API_URL}/api/messages/users?search=${searchQuery}`)
          .then(res => {
            setSearchResults(res.data);
            setIsSearching(false);
          })
          .catch(err => {
            console.error(err);
            setIsSearching(false);
          });
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 3. Listen for incoming messages globally
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (newMessage) => {
      // If message belongs to active chat, show it
      // Compare with both id and registerNumber to be safe
      const isSenderMatch = newMessage.sender === selectedChat;
      const isReceiverMatch = newMessage.receiver === selectedChat;
      
      if (
        (isSenderMatch && newMessage.receiver === ADMIN_ID) ||
        (newMessage.sender === ADMIN_ID && isReceiverMatch)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Update sidebar conversation text and bump unread count if it's not the active chat
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === newMessage.sender || c.id === newMessage.receiver);
        if (index === -1) {
          // New interaction, fetch entire conversation list again
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${ADMIN_ID}`)
            .then(response => setConversations(response.data))
            .catch(err => console.error(err));
          return prev;
        }

        const newConversations = [...prev];
        const conv = newConversations[index];
        newConversations[index] = {
          ...conv,
          lastMessage: newMessage.text || (newMessage.file ? 'Attachment' : ''),
          time: newMessage.createdAt || newMessage.timestamp,
          unread: (newMessage.sender !== ADMIN_ID && newMessage.sender !== selectedChat)
            ? (Number(conv.unread) || 0) + 1 : (Number(conv.unread) || 0)
        };
        // Move to top
        const item = newConversations.splice(index, 1)[0];
        newConversations.unshift(item);
        return newConversations;
      });
    };

    socketRef.current.on('receive_message', handleReceiveMessage);
    return () => socketRef.current.off('receive_message', handleReceiveMessage);
  }, [selectedChat]);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${ADMIN_ID}`);
        setConversations(response.data);
        if (response.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages for selected chat & join socket room
  useEffect(() => {
    if (!selectedChat) return;

    const roomId = [ADMIN_ID, selectedChat].sort().join('_');
    socketRef.current?.emit('join_chat', roomId);

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${ADMIN_ID}/${selectedChat}`);
        setMessages(response.data);

        // Reset local unread counter
        setConversations(prev => prev.map(conv =>
          conv.id === selectedChat ? { ...conv, unread: 0 } : conv
        ));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat || (!messageInput.trim() && !attachedFile)) return;

    const roomId = [ADMIN_ID, selectedChat].sort().join('_');
    let fileData = null;
    if (attachedFile) {
      try {
        const formData = new FormData();
        formData.append('file', attachedFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fileData = { name: attachedFile.name, size: attachedFile.size, url: uploadRes.data.url };
      } catch (err) {
        console.error("File upload failed", err);
        alert('File upload failed');
        return;
      }
    }

    const messagePayload = { chatId: roomId, sender: ADMIN_ID, receiver: selectedChat, text: messageInput, file: fileData };
    socketRef.current.emit('send_message', messagePayload);
    setMessageInput('');
    setAttachedFile(null);
    setShowAttachMenu(false);
    const textarea = document.getElementById('messageInput');
    if (textarea) textarea.style.height = 'auto';
  };

  const startNewChat = (student) => {
    setSelectedChat(student.id);
    setSearchQuery('');
    setSearchResults([]);
    // Check if student exists in conversations already
    if (!conversations.find(c => c.id === student.id)) {
      setConversations(prev => [{
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        lastMessage: 'Start a conversation...',
        time: null,
        unread: 0,
        online: true
      }, ...prev]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }
    setAttachedFile(file);
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Auto-select and fetch student info if passed via state
  useEffect(() => {
    if (selectedChat && conversations.length > 0 && !conversations.find(c => c.id === selectedChat)) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/users/byReg/${selectedChat}`)
        .then(res => {
          const student = res.data;
          setConversations(prev => {
            if (prev.find(c => c.id === student.registerNumber)) return prev;
            return [{
              id: student.registerNumber,
              name: student.name,
              avatar: student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
              lastMessage: 'Start a conversation...',
              time: null,
              unread: 0,
              online: true
            }, ...prev];
          });
        })
        .catch(err => console.error("Error fetching student for new chat:", err));
    }
  }, [selectedChat, conversations.length]);

  const selectedChatData = conversations.find(chat => chat.id === selectedChat);

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    if (!msgs) return groups;
    msgs.forEach(msg => {
      const date = formatDate(msg.timestamp || msg.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div>
      <div className="p-8">
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden h-[calc(100vh-200px)] shadow-sm dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-slate-800 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-800 relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchQuery.trim() && (
                  <div className="absolute left-4 right-4 top-full mt-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(u => (
                        <div
                          key={u.id}
                          onClick={() => startNewChat(u)}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-[#0F172A] cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-slate-800 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{u.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.id} • {u.department}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No students found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {conversations.length > 0 ? (
                  conversations.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all border ${selectedChat === chat.id
                        ? 'bg-blue-50 dark:bg-[#020617] border-blue-200 dark:border-[#3B82F6]'
                        : 'bg-white dark:bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-[#0F172A] hover:border-gray-200 dark:hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {chat.avatar}
                          </div>
                          {chat.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-[#F1F5F9] truncate">{chat.name}</h3>
                            <span className="text-xs text-gray-500 dark:text-[#94A3B8]">{chat.time ? formatDate(chat.time) : ''}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-[#94A3B8] truncate">{chat.lastMessage}</p>
                            {Number(chat.unread) > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                {chat.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No conversations yet.<br />Search for a student to suggest a chat.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            {selectedChat ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-[#1E293B]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {selectedChatData?.avatar || "UN"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-[#F1F5F9]">{selectedChatData?.name || "Unknown User"}</h3>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Online
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-gray-50 dark:bg-[#0B1220]">
                  {messages.length > 0 ? Object.entries(messageGroups).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="flex items-center justify-center my-4">
                        <div className="px-4 py-1 bg-gray-200 dark:bg-slate-800 rounded-full text-xs text-gray-600 dark:text-slate-400 font-medium font-bold">
                          {date}
                        </div>
                      </div>
                      {msgs.map((msg, index) => (
                        <div key={msg._id || index} className={`flex ${msg.sender === ADMIN_ID ? 'justify-end' : 'justify-start'} mb-3`}>
                          <div className={`max-w-[70%] ${msg.sender === ADMIN_ID ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg p-3 ${msg.sender === ADMIN_ID ? 'bg-blue-600 text-white' : 'bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] border border-gray-200 dark:border-slate-800 shadow-sm'}`}>
                              {msg.file && (
                                <a href={`${import.meta.env.VITE_API_URL}${msg.file.url}`} target="_blank" rel="noopener noreferrer" className="mb-2 p-2 bg-white bg-opacity-20 rounded flex items-center gap-2 hover:bg-opacity-30 transition cursor-pointer">
                                  <File className="w-4 h-4" />
                                  <span className="text-sm underline">{msg.file.name}</span>
                                </a>
                              )}
                              <p className="text-sm leading-relaxed">{msg.text || msg.message}</p>
                              <div className={`flex items-center gap-1 mt-1 ${msg.sender === ADMIN_ID ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-xs ${msg.sender === ADMIN_ID ? 'text-blue-100' : 'text-gray-500'}`}>{formatTime(msg.timestamp || msg.createdAt)}</span>
                                {msg.sender === ADMIN_ID && (msg.isRead ? <CheckCheck className="w-4 h-4 text-blue-100" /> : <Check className="w-4 h-4 text-blue-100" />)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                      <MessageSquare className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm italic">Send a message to start the conversation</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
                  {attachedFile && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-[#020617] rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <File className="w-5 h-5 text-gray-600" />
                        <div><p className="text-sm font-medium text-gray-900 dark:text-white">{attachedFile.name}</p><p className="text-xs text-gray-500 dark:text-[#94A3B8]">{(attachedFile.size / 1024).toFixed(2)} KB</p></div>
                      </div>
                      <button onClick={removeAttachment} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
                    <div className="relative">
                      <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="h-[42px] w-[42px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0 mb-0.5"><Paperclip className="w-5 h-5 text-gray-600" /></button>
                      {showAttachMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2 flex gap-2 z-50 animate-in zoom-in-95 slide-in-from-bottom-2">
                          <button type="button" onClick={() => { setFileType('document'); setShowAttachMenu(false); fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors min-w-[70px]"><div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-1"><FileText className="w-5 h-5" /></div><span className="text-xs font-medium text-gray-700 dark:text-gray-300">Document</span></button>
                          <button type="button" onClick={() => { setFileType('image'); setShowAttachMenu(false); fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors min-w-[70px]"><div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-1"><Image className="w-5 h-5" /></div><span className="text-xs font-medium text-gray-700 dark:text-gray-300">Image</span></button>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept={fileType === 'document' ? ".pdf,.doc,.docx" : ".jpg,.jpeg,.png"} />
                    <div className="flex-1">
                      <textarea id="messageInput" value={messageInput} onChange={(e) => { setMessageInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} placeholder="Type a message..." className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#020617] text-gray-900 dark:text-[#E2E8F0] dark:placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto no-scrollbar" style={{ minHeight: '42px', maxHeight: '120px' }} rows="1" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} />
                    </div>
                    <button type="submit" disabled={!messageInput.trim() && !attachedFile} className="h-[42px] w-[42px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"><Send className="w-5 h-5 ml-0.5" /></button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift + Enter for new line. Max file size: 5MB</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B1220] transition-colors p-8 text-center text-gray-500">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-sm"><MessageSquare className="w-10 h-10" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Messages</h3>
                <p className="max-w-sm">Select a student from the sidebar to start a conversation or use search to find a specific student.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;