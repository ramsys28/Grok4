import api from './api';
import { Chat, Message } from '@/store/chatStore';

// Description: Get all chat conversations for the current user
// Endpoint: GET /api/chats
// Request: {}
// Response: { chats: Array<Chat> }
export const getChats = async (): Promise<{ chats: Chat[] }> => {
  console.log('Fetching user chats...');
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockChats: Chat[] = [
        {
          _id: '1',
          title: 'NIRx Product Information',
          messages: [
            {
              _id: 'm1',
              content: 'What products does NIRx offer?',
              isUser: true,
              timestamp: new Date('2024-01-15T10:00:00Z'),
            },
            {
              _id: 'm2',
              content: 'NIRx offers cutting-edge near-infrared spectroscopy (NIRS) systems for brain imaging and neuroscience research. Our flagship products include the NIRSport2, NIRScout, and Aurora systems, each designed for different research applications and environments.',
              isUser: false,
              timestamp: new Date('2024-01-15T10:00:30Z'),
            },
          ],
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:30Z'),
        },
        {
          _id: '2',
          title: 'Company History and Mission',
          messages: [
            {
              _id: 'm3',
              content: 'Tell me about NIRx history and mission',
              isUser: true,
              timestamp: new Date('2024-01-14T14:30:00Z'),
            },
            {
              _id: 'm4',
              content: 'NIRx was founded with the mission to advance neuroscience research through innovative brain imaging technology. We specialize in functional near-infrared spectroscopy (fNIRS) systems that provide real-time insights into brain activity. Our commitment is to make brain imaging accessible, portable, and precise for researchers worldwide.',
              isUser: false,
              timestamp: new Date('2024-01-14T14:30:45Z'),
            },
          ],
          createdAt: new Date('2024-01-14T14:30:00Z'),
          updatedAt: new Date('2024-01-14T14:30:45Z'),
        },
      ];
      
      resolve({ chats: mockChats });
    }, 800);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/chats');
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new chat conversation
// Endpoint: POST /api/chats
// Request: { title: string }
// Response: { chat: Chat }
export const createChat = async (title: string): Promise<{ chat: Chat }> => {
  console.log('Creating new chat with title:', title);
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const newChat: Chat = {
        _id: Date.now().toString(),
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      resolve({ chat: newChat });
    }, 300);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/chats', { title });
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Send a message to a chat and get AI response
// Endpoint: POST /api/chats/:chatId/messages
// Request: { content: string }
// Response: { userMessage: Message, aiMessage: Message }
export const sendMessage = async (chatId: string, content: string): Promise<{ userMessage: Message; aiMessage: Message }> => {
  console.log('Sending message to chat:', chatId, 'Content:', content);
  
  // Create user message
  const userMessage: Message = {
    _id: `user_${Date.now()}`,
    content,
    isUser: true,
    timestamp: new Date(),
  };
  
  try {
    // Call the Python backend API
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: content }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Create AI message from backend response
    const aiMessage: Message = {
      _id: `ai_${Date.now()}`,
      content: data.answer || 'No response received from the AI.',
      isUser: false,
      timestamp: new Date(),
    };
    
    return { userMessage, aiMessage };
  } catch (error: any) {
    console.error('Error calling backend API:', error);
    
    // Create error message
    const aiMessage: Message = {
      _id: `ai_${Date.now()}`,
      content: `Error: ${error.message || 'Failed to get response from AI. Please try again.'}`,
      isUser: false,
      timestamp: new Date(),
    };
    
    return { userMessage, aiMessage };
  }
};

// Description: Delete a chat conversation
// Endpoint: DELETE /api/chats/:chatId
// Request: {}
// Response: { success: boolean }
export const deleteChat = async (chatId: string): Promise<{ success: boolean }> => {
  console.log('Deleting chat:', chatId);
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.delete(`/api/chats/${chatId}`);
  //   return response.data;
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};