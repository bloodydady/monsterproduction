import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types/database';
import { Send } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChatWindowProps {
  requestId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ requestId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
    const subscription = subscribeToMessages();
    
    // Set up silent refresh every 2 seconds
    refreshIntervalRef.current = setInterval(() => {
      silentRefreshMessages();
    }, 2000);

    return () => {
      subscription.unsubscribe();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [requestId]);

  useEffect(() => {
    // Only auto-scroll if user isn't manually scrolling and there are new messages
    if (!isUserScrollingRef.current && messages.length > lastMessageCountRef.current) {
      scrollToBottom();
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, avatar_url)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const silentRefreshMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, avatar_url)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Only update if there are actually new messages
      if (data && data.length !== messages.length) {
        setMessages(data);
      }
    } catch (error) {
      // Silent fail - don't show errors for background refreshes
      console.debug('Silent refresh failed:', error);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel(`messages:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${requestId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender information
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id(first_name, last_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages((prev) => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === data.id);
              if (exists) return prev;
              return [...prev, data];
            });
          }
        }
      )
      .subscribe();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    // User is scrolling if they're not at the bottom
    isUserScrollingRef.current = !isAtBottom;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset scrolling flag after 3 seconds of no scroll activity
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        request_id: requestId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
      
      // Force scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-96 flex flex-col">
        <div 
          className="flex-1 overflow-y-auto p-4"
          onScroll={handleScroll}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.sender && (
                  <div className="text-sm font-medium mb-1">
                    {message.sender.first_name} {message.sender.last_name}
                  </div>
                )}
                <p className="break-words">{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id ? 'text-purple-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {sending ? (
                <LoadingSpinner size="small" color="text-white" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;