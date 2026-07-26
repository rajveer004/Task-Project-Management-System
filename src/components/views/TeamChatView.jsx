import React, { useState, useEffect, useRef } from 'react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  MessageSquare,
  Send,
  Hash,
  ListTodo
} from 'lucide-react';

export const TeamChatView = () => {
  const { activeBoard, chatMessages, sendTeamChatMessage, tasks } = useBoard();
  const { currentUser, allUsers } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const safeMessages = chatMessages || [];
  const safeTasks = tasks || [];
  const safeUsers = allUsers || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [safeMessages]);

  if (!activeBoard) {
    return (
      <div className="p-12 text-center text-slate-400">
        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-semibold">Select a workspace board to join the team chat channel.</p>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      await sendTeamChatMessage(text);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickTaskMention = (taskTitle) => {
    setInputMessage(prev => `${prev} [Task: "${taskTitle}"] `);
  };

  return (
    <div className="h-[calc(100vh-8rem)] p-6 max-w-6xl mx-auto flex flex-col gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950 border border-indigo-800 rounded-xl text-indigo-400">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {activeBoard.name} Channel
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Real-Time Live
              </span>
            </h2>
            <p className="text-xs text-slate-400">{activeBoard.description || 'Workspace team collaboration & task coordination channel.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-500 hidden sm:block">
            Active Members:
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {safeUsers.slice(0, 5).map(u => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={`${u.name} (${u.status || 'active'})`}
                className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4 shadow-inner custom-scrollbar">
        {safeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 my-12">
            <MessageSquare className="w-10 h-10 text-indigo-500/40 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No messages in this workspace channel yet.</p>
            <p className="text-xs text-slate-500 mt-1">Start the conversation with your team!</p>
          </div>
        ) : (
          safeMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover mt-1"
                />

                <div className={`max-w-xl ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-300">{msg.senderName}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-950 text-slate-200 border border-slate-800/80 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {safeTasks.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <ListTodo className="w-3.5 h-3.5 text-indigo-400" /> Quick Mention Task:
          </span>
          {safeTasks.slice(0, 4).map(t => (
            <button
              key={t.id}
              onClick={() => handleQuickTaskMention(t.title)}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md shrink-0 transition-colors"
            >
              #{t.title.slice(0, 22)}...
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-3">
        <input
          type="text"
          placeholder={`Message #${activeBoard.name} channel...`}
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          {isSending ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Send
        </button>
      </form>
    </div>
  );
};
