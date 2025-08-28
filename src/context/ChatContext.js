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
  const [currentChat, setCurrentChat] = useState(null); // {chat_id, other_user_id, other_user_name?}
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData") || "{}")
  );

  // بنستخدمه لمنع التكرارات لما توصل نفس الرسالة من API/Firebase
  const seenIdsRef = useRef(new Set());

  // Helper: current user id
  const getCurrentUserId = useCallback(() => {
    return userData?.id || userData?.user_id;
  }, [userData]);

  // -------- Chats list (from API) --------
  const calculateUnreadCount = useCallback((chatsList) => {
    // TODO: لو عندك فلاغ unread/last_seen من الـAPI احسبه هنا
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
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
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

  // -------- Messages (seed from API + live from Firebase) --------
  const fetchMessages = useCallback(
    async (chatId) => {
      if (!token || !chatId) return;

      // 1) Seed من API (مرة واحدة لكل دخول للشات)
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
          const chatData = response.data.data; // { chat_id, other_user_id, other_user_name, messages: [...] }

          // رسائل الـAPI قد تحتوي is_me. هنطبع user_id بناءً عليه لتوحيد الشكل مع Firebase
          const seeded = (chatData.messages || []).map((m) => ({
            ...m,
            chat_id: String(chatId),
            // لو الـAPI بعتهالك is_me فاحسب user_id بناء عليها
            user_id: m.is_me ? getCurrentUserId() : chatData.other_user_id,
            created_at_ms: Date.parse(m.created_at) || Date.now(),
            is_me: m.is_me ?? (String(m.user_id) === String(getCurrentUserId())),
          }));

          setCurrentChat({
            chat_id: String(chatId),
            other_user_id: chatData.other_user_id,
            other_user_name: chatData.other_user_name,
          });

          // حفظ الرسائل الأولية
          setMessages(seeded);
          // علّم الرسائل التي شوفتها عشان ما تتكررش لما تيجي من Firebase
          seenIdsRef.current = new Set(
            seeded.map((m) => m.id).filter((id) => id != null)
          );
        }
      } catch (error) {
        console.error("Error fetching messages (seed):", error);
      }

      // 2) الاشتراك من Firebase (onChildAdded/Changed/Removed)
      chatService.listenToChat(String(chatId), {
        onAdded: (msg) => {
          // نتوقع msg فيه: {id, chat_id, user_id, message, read, created_at, created_at_ms}
          if (!msg?.id) return;
          if (seenIdsRef.current.has(msg.id)) return; // منع التكرار
          seenIdsRef.current.add(msg.id);

          setMessages((prev) => {
            const next = [
              ...prev,
              {
                ...msg,
                chat_id: String(chatId),
                is_me: String(msg.user_id) === String(getCurrentUserId()), // <-- هنا
                created_at_ms:
                  msg.created_at_ms ||
                  (msg.created_at ? Date.parse(msg.created_at) : Date.now()),
              },
            ].sort((a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0));

            return next;
          });
        },
        onChanged: (msg) => {
          if (!msg?.id) return;
          setMessages((prev) => {
            const idx = prev.findIndex((x) => x.id === msg.id);
            if (idx === -1) return prev;
            const updated = {
              ...prev[idx],
              ...msg,
              is_me: msg.user_id === getCurrentUserId(),
              created_at_ms:
                msg.created_at_ms ??
                (msg.created_at
                  ? Date.parse(msg.created_at)
                  : prev[idx].created_at_ms),
            };
            const next = [...prev];
            next[idx] = updated;
            return next;
          });
        },
        onRemoved: (msg) => {
          if (!msg?.id) return;
          seenIdsRef.current.delete(msg.id);
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        },
      });
    },
    [token, getCurrentUserId]
  );

  // -------- Send message (API → write to Firebase) --------
  const sendMessage = useCallback(
    async (otherUserId, message) => {
      if (!token || !otherUserId || !message?.trim()) return;

      const text = message.trim();

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/chats/send`,
        { other_user_id: otherUserId, message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === 201) {
        const newMessage = response.data.data; // { id, chat_id, sender_id, message, read, created_at, ... }
        const chatId =
          newMessage.chat_id ||
          currentChat?.chat_id ||
          // fallback من URL لو لسه /chats/new
          (window.location.pathname.includes("/chats/")
            ? window.location.pathname.split("/").pop()
            : null);

        if (!chatId) {
          console.error("No chat_id found for new message");
          throw new Error("No chat_id found for new message");
        }

        // اكتب الرسالة في Firebase بمفتاح = id من الـAPI (idempotent)
        try {
          await chatService.upsertMessage(String(chatId), {
            id: newMessage.id,
            chat_id: String(chatId),
            user_id: newMessage.sender_id,
            message: newMessage.message,
            read: newMessage.read,
            created_at: newMessage.created_at,
            is_me: newMessage.sender_id === getCurrentUserId(),
          });
        } catch (firebaseErr) {
          console.error("Firebase write error:", firebaseErr);
          // في حالة فشل الكتابة في Firebase، نضيفها محليًا كحل أخير
          setMessages((prev) => {
            if (!newMessage.id || seenIdsRef.current.has(newMessage.id)) {
              return prev;
            }
            seenIdsRef.current.add(newMessage.id);
            const next = [
              ...prev,
              {
                id: newMessage.id,
                chat_id: String(chatId),
                user_id: newMessage.sender_id,
                message: newMessage.message,
                read: !!newMessage.read,
                created_at: newMessage.created_at,
                created_at_ms:
                  Date.parse(newMessage.created_at) || Date.now(),
                is_me: newMessage.sender_id === getCurrentUserId(),
              },
            ].sort(
              (a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0)
            );
            return next;
          });
        }

        // حدث آخر رسالة في قائمة الشاتس
        setChats((prev) =>
          prev.map((c) =>
            c.other_user_id === otherUserId
              ? {
                  ...c,
                  last_message: newMessage.message,
                  updated_at: newMessage.created_at,
                }
              : c
          )
        );

        // لو كنت فاتح /chats/new، حول للمسار الحقيقي
        if (window.location.pathname.includes("/chats/new")) {
          window.history.replaceState(null, "", `/chats/${chatId}`);
        }

        return newMessage;
      }
    },
    [token, currentChat, getCurrentUserId]
  );

  // -------- Mark as read (اختياري/placeholder) --------
  const markChatAsRead = useCallback(async (chatId) => {
    // لو عندك API للقراءة نده هنا وبعدين عدل رسائل Firebase (read=true) بنفس الـids
  }, []);

  // -------- Effects & lifecycle --------

  // listen & sync localStorage token/userData
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newUserData = JSON.parse(localStorage.getItem("userData") || "{}");
      setToken(newToken);
      setUserData(newUserData);
    };

    window.addEventListener("storage", handleStorageChange);

    // فحص دوري لتغير التوكن داخل نفس التاب
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    // عند أول تحميل لو مفيش توكن
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

  // fetch chats on mount / token change
  useEffect(() => {
    if (token) {
      fetchChats();
    } else {
      setLoading(false);
      setChats([]);
      setMessages([]);
      setCurrentChat(null);
      setUnreadCount(0);
    }
  }, [token, fetchChats]);

  // start Firebase listener when currentChat changes
  useEffect(() => {
    if (!currentChat?.chat_id) return;

    // مجرد حماية: نظّف أي listener سابق لنفس الشات
    chatService.stopListeningToChat(String(currentChat.chat_id));

    // مهم: ما نستدعيش listenToChat هنا مباشرة؛
    // هو بيتفعل داخل fetchMessages(chatId) بعد seed.
    // لو داخلت الشات من غير seed (حالة نادرة)، اعمل seed+subscribe:
    if (messages.length === 0) {
      fetchMessages(String(currentChat.chat_id));
    }

    return () => {
      if (currentChat?.chat_id) {
        chatService.stopListeningToChat(String(currentChat.chat_id));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat?.chat_id]);

  // keep currentChat in sync with URL changes
  useEffect(() => {
    const syncFromUrl = () => {
      if (window.location.pathname.includes("/chats/")) {
        const parts = window.location.pathname.split("/");
        const urlChatId = parts[parts.length - 1];
        if (
          urlChatId &&
          urlChatId !== "new" &&
          urlChatId !== currentChat?.chat_id
        ) {
          setCurrentChat((prev) => ({
            ...(prev || {}),
            chat_id: String(urlChatId),
          }));
          // seed + subscribe للـchatId من الـURL
          fetchMessages(String(urlChatId));
        }
      }
    };

    // أول مرة
    syncFromUrl();

    // راقب تغيّر الـURL
    const popHandler = () => syncFromUrl();
    window.addEventListener("popstate", popHandler);

    return () => {
      window.removeEventListener("popstate", popHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat?.chat_id]);

  // cleanup all Firebase listeners on unmount
  useEffect(() => {
    return () => {
      chatService.stopAllListeners();
    };
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
    markChatAsRead,
    setChats, // في حال احتجته موضعياً
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
