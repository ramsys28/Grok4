import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  _id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  addChat: (chat: Chat) => void;
  setActiveChat: (chat: Chat | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  deleteChat: (chatId: string) => void;
  setLoading: (loading: boolean) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      isLoading: false,
      
      addChat: (chat) => {
        set((state) => ({
          chats: [chat, ...state.chats],
          activeChat: chat,
        }));
      },
      
      setActiveChat: (chat) => {
        set({ activeChat: chat });
      },
      
      addMessage: (chatId, message) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: new Date(),
                }
              : chat
          );
          
          const updatedActiveChat = state.activeChat?._id === chatId
            ? {
                ...state.activeChat,
                messages: [...state.activeChat.messages, message],
                updatedAt: new Date(),
              }
            : state.activeChat;
            
          return {
            chats: updatedChats,
            activeChat: updatedActiveChat,
          };
        });
      },
      
      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat._id !== chatId),
          activeChat: state.activeChat?._id === chatId ? null : state.activeChat,
        }));
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      updateChatTitle: (chatId, title) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) =>
            chat._id === chatId ? { ...chat, title } : chat
          );
          
          const updatedActiveChat = state.activeChat?._id === chatId
            ? { ...state.activeChat, title }
            : state.activeChat;
            
          return {
            chats: updatedChats,
            activeChat: updatedActiveChat,
          };
        });
      },
    }),
    {
      name: 'nirx-chat-storage',
    }
  )
);