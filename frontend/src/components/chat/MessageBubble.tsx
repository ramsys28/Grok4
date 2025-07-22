import React, { useState } from 'react';
import { Copy, User, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/store/chatStore';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 p-4 group ${
        message.isUser ? 'justify-end' : 'justify-start'
      } ${isLast ? 'mb-4' : ''}`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${message.isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm ${
            message.isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {message.isUser ? (
              <p className="m-0 text-white">{message.content}</p>
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="m-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="mt-2 mb-0 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mt-2 mb-0 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          {!message.isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-slate-500" />
              )}
            </Button>
          )}
        </div>
        
        {showTimestamp && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-2"
          >
            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
          </motion.p>
        )}
      </div>
      
      {message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}