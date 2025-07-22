import React, { useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { useChatStore } from '@/store/chatStore';
import { getChats } from '@/api/chat';
import { useToast } from '@/hooks/useToast';
import { useIsMobile as useMobile } from '@/hooks/useMobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function ChatInterface() {
  const { chats, addChat, setLoading } = useChatStore();
  const { toast } = useToast();
  const isMobile = useMobile();

  useEffect(() => {
    const loadChats = async () => {
      if (chats.length > 0) return; // Don't reload if we already have chats

      setLoading(true);
      try {
        console.log('Loading user chats...');
        const { chats: loadedChats } = await getChats();
        loadedChats.forEach(chat => addChat(chat));
      } catch (error: any) {
        console.error('Error loading chats:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load chats',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  if (isMobile) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <ChatSidebar />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">NIRx GPT</h1>
            </div>
          </div>
          <ChatArea />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <ChatSidebar className="w-80 flex-shrink-0" />
      <ChatArea />
    </div>
  );
}