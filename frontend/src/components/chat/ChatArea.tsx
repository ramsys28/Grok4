import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { useChatStore } from '@/store/chatStore';
import { sendMessage } from '@/api/chat';
import { useToast } from '@/hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';

export function ChatArea() {
  const { activeChat, isLoading, setLoading, addMessage, updateChatTitle } = useChatStore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;

    setLoading(true);
    try {
      console.log('Sending message to chat:', activeChat._id);
      const { userMessage, aiMessage } = await sendMessage(activeChat._id, content);

      // Add user message first
      addMessage(activeChat._id, userMessage);

      // Update chat title if it's the first message
      if (activeChat.messages.length === 0 && activeChat.title === 'New Chat') {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        updateChatTitle(activeChat._id, title);
      }

      // Add AI response after a short delay
      setTimeout(() => {
        addMessage(activeChat._id, aiMessage);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome to NIRx Company GPT
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your AI assistant for all NIRx-related questions. Get instant answers about our products, 
            services, support, and company information.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4" />
            <span>Start a new conversation to begin</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Chat Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{activeChat.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeChat.messages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="min-h-full">
          {activeChat.messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Ready to help!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Ask me anything about NIRx products, support, or company information.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="py-4">
              <AnimatePresence>
                {activeChat.messages.map((message, index) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isLast={index === activeChat.messages.length - 1}
                  />
                ))}
              </AnimatePresence>
              
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={
          activeChat.messages.length === 0
            ? "Ask me anything about NIRx..."
            : "Continue the conversation..."
        }
      />
    </div>
  );
}