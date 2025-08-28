import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { onValue, ref, push, set } from "firebase/database";
import { database } from "../config/firebase";
import axios from "axios";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true); // Start with true
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData") || "{}")
  );

  console.log("ChatContext - Token:", token);
  console.log("ChatContext - UserData:", userData);
  console.log("localStorage keys:", Object.keys(localStorage));

  // Fetch user chats
  const fetchChats = useCallback(async () => {
    console.log("fetchChats called with token:", token);
    if (!token) {
      console.log("No token, returning early");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(
        "Making API request to:",
        `${process.env.REACT_APP_BASE_URL}/chats/user`
      );
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/chats/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === 200) {
        console.log("Chats fetched successfully:", response.data.data);
        setChats(response.data.data);
        calculateUnreadCount(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch chat messages
  const fetchMessages = useCallback(
    async (chatId) => {
      if (!token || !chatId) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/chats/${chatId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.data.status === 200) {
          setMessages(response.data.data.messages);
          setCurrentChat(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    [token]
  );

  // Send message
  const sendMessage = useCallback(
    async (otherUserId, message) => {
      if (!token || !otherUserId || !message.trim()) return;

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/chats/send`,
          {
            other_user_id: otherUserId,
            message: message.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.data.status === 201) {
          const newMessage = response.data.data;

          // Add message to current chat
          setMessages((prev) => [
            ...prev,
            {
              ...newMessage,
              is_me: true,
            },
          ]);

          // Update chats list with last message
          setChats((prev) =>
            prev.map((chat) =>
              chat.other_user_id === otherUserId
                ? {
                    ...chat,
                    last_message: message.trim(),
                    updated_at: newMessage.created_at,
                  }
                : chat
            )
          );

          // Send to Firebase for real-time
          const chatRef = ref(
            database,
            `chats/${response.data.data.chat_id}/messages`
          );
          await push(chatRef, {
            ...newMessage,
            is_me: true,
            timestamp: Date.now(),
          });

          // Navigate to the new chat
          if (window.location.pathname.includes("/chats/new")) {
            window.history.replaceState(
              null,
              "",
              `/chats/${response.data.data.chat_id}`
            );
          }

          return response.data.data;
        }
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [token]
  );

  // Calculate unread count
  const calculateUnreadCount = useCallback((chatsList) => {
    // This would need to be implemented based on your backend logic
    // For now, we'll set it to 0
    setUnreadCount(0);
  }, []);

  // Mark chat as read
  const markChatAsRead = useCallback(async (chatId) => {
    // Implement marking chat as read
    // This would typically update the backend
  }, []);

  // Listen to Firebase real-time updates
  useEffect(() => {
    if (!currentChat?.chat_id) return;

    const chatRef = ref(database, `chats/${currentChat.chat_id}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data).sort(
          (a, b) => a.timestamp - b.timestamp
        );
        setMessages(messagesArray);
      }
    });

    return () => unsubscribe();
  }, [currentChat?.chat_id]);

  // Listen to localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newUserData = JSON.parse(localStorage.getItem("userData") || "{}");

      console.log("Storage changed - New token:", newToken);
      console.log("Storage changed - New userData:", newUserData);

      setToken(newToken);
      setUserData(newUserData);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check for changes when the component mounts
    const checkToken = () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        console.log("Token changed from localStorage check:", currentToken);
        setToken(currentToken);
      }
    };

    // Check every second for token changes
    const interval = setInterval(checkToken, 1000);

    // If no token on mount, set loading to false
    if (!localStorage.getItem("token")) {
      setLoading(false);
      setChats([]);
      setMessages([]);
      setCurrentChat(null);
      setUnreadCount(0);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  // Fetch chats on mount and when token changes
  useEffect(() => {
    console.log("Token changed, fetching chats...", token);
    if (token) {
      console.log("Token exists, calling fetchChats...");
      fetchChats();
    } else {
      console.log("No token found, cannot fetch chats");
      setLoading(false); // Set loading to false when no token
      setChats([]); // Clear chats when no token
      setMessages([]); // Clear messages when no token
      setCurrentChat(null); // Clear current chat when no token
      setUnreadCount(0); // Clear unread count when no token
    }
  }, [token, fetchChats]);

  const value = {
    chats,
    currentChat,
    messages,
    unreadCount,
    loading,
    fetchChats,
    fetchMessages,
    sendMessage,
    setCurrentChat,
    markChatAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
