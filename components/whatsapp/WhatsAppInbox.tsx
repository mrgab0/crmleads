'use client';
import { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { MessageRecord } from '@/types';

interface Conversation {
  _id: string;
  lastMessage: MessageRecord;
  unreadCount: number;
}

function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export function WhatsAppInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = () => {
    fetch('/api/whatsapp/conversations')
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []));
  };

  const loadMessages = (phone: string) => {
    setLoadingMsgs(true);
    fetch(`/api/whatsapp/messages/${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .finally(() => setLoadingMsgs(false));
  };

  useEffect(() => {
    loadConversations();
    if (typeof window !== 'undefined') {
      const paramPhone = new URLSearchParams(window.location.search).get('phone');
      if (paramPhone) {
        setSelectedPhone(decodeURIComponent(paramPhone));
      }
    }
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedPhone) return;
    loadMessages(selectedPhone);
    const interval = setInterval(() => loadMessages(selectedPhone), 5000);
    return () => clearInterval(interval);
  }, [selectedPhone]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedPhone, body: newMessage.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setNewMessage('');
      loadMessages(selectedPhone);
      loadConversations();
    } catch {
      toast.error('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Lista de conversaciones */}
      <div
        className={`w-full md:w-80 border-r border-zinc-100 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 ${
          selectedPhone ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <MessageCircle size={18} className="text-emerald-500" />
            WhatsApp
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay conversaciones</p>
              <p className="text-xs mt-1">Los mensajes aparecerán aquí</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedPhone(conv._id)}
                className={`w-full flex items-start gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left border-b border-zinc-50 dark:border-zinc-800/50 ${
                  selectedPhone === conv._id ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-semibold shrink-0 text-sm">
                  {conv._id.slice(-2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm truncate">
                      {conv._id}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0 ml-2">
                      {formatRelativeTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {conv.lastMessage.direction === 'outbound' && '→ '}
                    {conv.lastMessage.body || '📎 Adjunto'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ventana de chat */}
      {selectedPhone ? (
        <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setSelectedPhone(null)}
              className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            >
              ←
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xs font-bold">
              {selectedPhone.slice(-2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">{selectedPhone}</p>
              <p className="text-xs text-zinc-400">WhatsApp</p>
            </div>
            <a
              href={`/dashboard?call=${selectedPhone}`}
              className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors"
              title="Llamar"
            >
              <Phone size={16} />
            </a>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingMsgs ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.direction === 'outbound'
                        ? 'bg-brand-500 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {msg.mediaUrl && (
                      <a
                        href={msg.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs underline mb-1 opacity-80"
                      >
                        📎 Adjunto
                      </a>
                    )}
                    {msg.body && <p>{msg.body}</p>}
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        msg.direction === 'outbound' ? 'text-brand-100' : 'text-zinc-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('es', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-2"
          >
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-zinc-400">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
            <p>Selecciona una conversación</p>
          </div>
        </div>
      )}
    </div>
  );
}
