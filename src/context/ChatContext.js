// src/context/ChatContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import chatService from "../services/chatService";

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
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData") || "{}")
  );

  // لتفادي التكرار
  const seenIdsRef = useRef(new Set());

  const getCurrentUserId = useCallback(() => {
    return userData?.id || userData?.user_id;
  }, [userData]);

  const calculateUnreadCount = useCallback((chatsList) => {
    setUnreadCount(0);
  }, []);

  const fetchChats = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setChats([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/chats/user`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );
      if (response.data.status === 200) {
        setChats(response.data.data || []);
        calculateUnreadCount(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, [token, calculateUnreadCount]);

  // -------- Messages --------
  const fetchMessages = useCallback(
    async (chatId) => {
      if (!token || !chatId) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/chats/${chatId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          }
        );

        if (response.data.status === 200) {
          const chatData = response.data.data;
          const seeded = (chatData.messages || []).map((m) => {
            const id = String(m.id);
            return {
              ...m,
              id,
              chat_id: String(chatId),
              user_id: m.is_me ? getCurrentUserId() : chatData.other_user_id,
              created_at_ms: Date.parse(m.created_at) || Date.now(),
              is_me: m.is_me ?? String(m.user_id) === String(getCurrentUserId()),
            };
          });

          setCurrentChat({
            chat_id: String(chatId),
            other_user_id: chatData.other_user_id,
            other_user_name: chatData.other_user_name,
          });

          // تحديث الرسائل وحماية من التكرار
          setMessages(seeded);
          seenIdsRef.current = new Set(seeded.map((m) => String(m.id)));
        }
      } catch (error) {
        console.error("Error fetching messages (seed):", error);
      }

      // Firebase listener
      chatService.listenToChat(String(chatId), {
        onAdded: (msg) => {
          if (!msg?.id) return;
          const msgId = String(msg.id);
          if (seenIdsRef.current.has(msgId)) return;
          seenIdsRef.current.add(msgId);

          setMessages((prev) =>
            [...prev, {
              ...msg,
              chat_id: String(chatId),
              is_me: String(msg.user_id) === String(getCurrentUserId()),
              created_at_ms: msg.created_at_ms || Date.now(),
            }].sort((a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0))
          );
        },
        onChanged: (msg) => {
          if (!msg?.id) return;
          const msgId = String(msg.id);

          setMessages((prev) => {
            const idx = prev.findIndex((x) => String(x.id) === msgId);
            if (idx === -1) return prev;
            const updated = {
              ...prev[idx],
              ...msg,
              is_me: String(msg.user_id) === String(getCurrentUserId()),
              created_at_ms:
                msg.created_at_ms ??
                (msg.created_at ? Date.parse(msg.created_at) : prev[idx].created_at_ms),
            };
            const next = [...prev];
            next[idx] = updated;
            return next;
          });
        },
        onRemoved: (msg) => {
          if (!msg?.id) return;
          const msgId = String(msg.id);
          seenIdsRef.current.delete(msgId);
          setMessages((prev) => prev.filter((m) => String(m.id) !== msgId));
        },
      });
    },
    [token, getCurrentUserId]
  );

  // -------- Send message --------
  const sendMessage = useCallback(
    async (otherUserId, message) => {
      if (!token || !otherUserId || !message?.trim()) return;
      const text = message.trim();

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/chats/send`,
        { other_user_id: otherUserId, message: text },
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );

      if (response.data.status === 201) {
        const newMessage = response.data.data;
        const chatId =
          newMessage.chat_id ||
          currentChat?.chat_id ||
          (window.location.pathname.includes("/chats/")
            ? window.location.pathname.split("/").pop()
            : null);

        if (!chatId) throw new Error("No chat_id found for new message");

        const msgId = String(newMessage.id);
        const currentUserId = getCurrentUserId();

        const messageToSend = {
          id: msgId,
          chat_id: String(chatId),
          user_id: String(currentUserId),
          message: newMessage.message,
          read: !!newMessage.read,
          created_at: newMessage.created_at,
          created_at_ms: Date.parse(newMessage.created_at) || Date.now(),
        };

        // أضف محليًا فقط لو مش مكرر
        setMessages((prev) => {
          if (seenIdsRef.current.has(msgId)) return prev;
          seenIdsRef.current.add(msgId);
          return [...prev, { ...messageToSend, is_me: true }].sort(
            (a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0)
          );
        });

        // Firebase
        try {
          await chatService.upsertMessage(String(chatId), messageToSend);
        } catch (err) {
          console.error("Firebase write error:", err);
        }

        // تحديث قائمة الشاتس
        setChats((prev) =>
          prev.map((c) =>
            c.other_user_id === otherUserId
              ? { ...c, last_message: newMessage.message, updated_at: newMessage.created_at }
              : c
          )
        );

        if (window.location.pathname.includes("/chats/new")) {
          window.history.replaceState(null, "", `/chats/${chatId}`);
        }

        return newMessage;
      }
    },
    [token, currentChat, getCurrentUserId]
  );

  // -------- Effects --------
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newUserData = JSON.parse(localStorage.getItem("userData") || "{}");
      setToken(newToken);
      setUserData(newUserData);
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) setToken(currentToken);
    }, 1000);

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

  useEffect(() => {
    if (token) fetchChats();
    else {
      setLoading(false);
      setChats([]);
      setMessages([]);
      setCurrentChat(null);
      setUnreadCount(0);
    }
  }, [token, fetchChats]);

  useEffect(() => {
    if (!currentChat?.chat_id) return;
    chatService.stopListeningToChat(String(currentChat.chat_id));
    fetchMessages(String(currentChat.chat_id));
    return () => {
      if (currentChat?.chat_id) chatService.stopListeningToChat(String(currentChat.chat_id));
    };
  }, [currentChat?.chat_id, fetchMessages]);

  useEffect(() => {
    const syncFromUrl = () => {
      if (window.location.pathname.includes("/chats/")) {
        const parts = window.location.pathname.split("/");
        const urlChatId = parts[parts.length - 1];
        if (urlChatId && urlChatId !== "new" && urlChatId !== currentChat?.chat_id) {
          setCurrentChat((prev) => ({ ...(prev || {}), chat_id: String(urlChatId) }));
          fetchMessages(String(urlChatId));
        }
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [currentChat?.chat_id, fetchMessages]);

  useEffect(() => {
    return () => chatService.stopAllListeners();
  }, []);

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
    setChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
