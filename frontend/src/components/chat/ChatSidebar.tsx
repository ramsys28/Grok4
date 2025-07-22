import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';
import { createChat, deleteChat } from '@/api/chat';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
  className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const { chats, activeChat, setActiveChat, addChat, deleteChat: removeChatFromStore } = useChatStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleNewChat = async () => {
    if (isCreatingChat) return;
    
    setIsCreatingChat(true);
    try {
      console.log('Creating new chat...');
      const { chat } = await createChat('New Chat');
      addChat(chat);
      toast({
        title: 'Success',
        description: 'New chat created successfully',
      });
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create new chat',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      console.log('Deleting chat:', chatId);
      await deleteChat(chatId);
      removeChatFromStore(chatId);
      toast({
        title: 'Success',
        description: 'Chat deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete chat',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">NIRx</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Company GPT</p>
          </div>
        </div>
        
        <Button
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingChat ? 'Creating...' : 'New Chat'}
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-4">
          <AnimatePresence>
            {filteredChats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-slate-500 dark:text-slate-400"
              >
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No chats found' : 'No previous chats'}
                </p>
              </motion.div>
            ) : (
              filteredChats.map((chat) => (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    activeChat?._id === chat._id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate text-sm">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {format(new Date(chat.updatedAt), 'MMM d, yyyy')}
                      </p>
                      {chat.messages.length > 0 && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                          {chat.messages[chat.messages.length - 1].content}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto hover:bg-red-100 dark:hover:bg-red-900/20"
                      onClick={(e) => handleDeleteChat(chat._id, e)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Settings */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}