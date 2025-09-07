import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useChat } from "../../context/ChatContext";
import { BiArrowBack, BiSend } from "react-icons/bi";
import styles from "./Chat.module.css";

const Chat = () => {
  const { t } = useTranslation("global");
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ خد setCurrentChat علشان نزامن الـURL مع الـContext listener
  const { messages, currentChat, sendMessage, fetchMessages, setCurrentChat } =
    useChat();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ otherUserId fallback من currentChat لو مش موجود في الـstate/URL
  const otherUserId =
    location.state?.otherUserId ||
    new URLSearchParams(location.search).get("other_user_id") ||
    currentChat?.other_user_id;

  const otherUserName =
    location.state?.otherUserName ||
    currentChat?.other_user_name ||
    "مستخدم جديد";

  // sync & seed
  useEffect(() => {
    if (chatId && chatId !== "new") {
      // ✅ خلى الـContext يعرف الشات الحالي (يساعد في تشغيل listener لو seed اتعمل قبل)
      setCurrentChat((prev) =>
        prev?.chat_id === String(chatId) ? prev : { chat_id: String(chatId) }
      );
      fetchMessages(chatId);
    }
    // Scroll to top when chat opens
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, fetchMessages, setCurrentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to top when component mounts or otherUserId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [otherUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(otherUserId, newMessage.trim());
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // ✅ اعرض الوقت بالأولوية: created_at_ms -> created_at -> timestamp
  const formatMessageTime = (created_at_like) => {
    if (!created_at_like) return "";
    const ms =
      typeof created_at_like === "number"
        ? created_at_like
        : Date.parse(created_at_like);
    if (!ms || Number.isNaN(ms)) return "";
    const date = new Date(ms);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ استخدم onKeyDown بدل onKeyPress
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // ✅ قارن chat_id كسلسلة علشان تتفادى type mismatch
  const currentChatMessages = messages.filter((message) => {
    if (chatId && chatId !== "new") {
      return String(message.chat_id) === String(chatId);
    }
    if (chatId === "new") {
      return !message.chat_id;
    }
    return true;
  });

  if (!otherUserId && chatId === "new") {
    // في محادثة جديدة لازم نعرف otherUserId
    return (
      <div className={styles.errorContainer}>
        <h3>{t("chat.error") || "خطأ في تحميل المحادثة"}</h3>
        <button onClick={() => navigate("/chats")}>
          {t("chat.backToChats") || "العودة للمحادثات"}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/chats")}
        >
          <BiArrowBack />
        </button>
        <div className={styles.chatInfo}>
          <div className={styles.chatAvatar}>
            <span>{otherUserName?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
          <h2>
            {chatId === "new"
              ? t("chat.startConversation") || "بدء محادثة جديدة"
              : otherUserName}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {currentChatMessages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>
              {chatId === "new"
                ? t("chat.welcomeMessage") || "مرحباً! كيف يمكنني مساعدتك؟"
                : t("chat.noMessages") || "لا توجد رسائل بعد"}
            </p>
            <p>{t("chat.startConversation") || "ابدأ المحادثة الآن!"}</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {currentChatMessages.map((message, index) => (
              <div
                key={
                  message.id ??
                  message.firebase_id ??
                  `${index}-${
                    message.created_at_ms ||
                    message.created_at ||
                    message.timestamp
                  }`
                }
                className={`${styles.messageItem} ${
                  message.is_me ? styles.myMessage : styles.otherMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <p>{message.message}</p>
                  <span className={styles.messageTime}>
                    {formatMessageTime(
                      message.created_at_ms ||
                        message.created_at ||
                        message.timestamp
                    )}
                  </span>
                  {/* Debug (اختياري) */}
                  {/* <small style={{ fontSize: "10px", opacity: 0.6 }}>
                    ID: {message.id} | is_me: {message.is_me ? "true" : "false"} | chat_id: {message.chat_id}
                  </small> */}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form className={styles.messageInput} onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            chatId === "new"
              ? t("chat.welcomeMessage") || "مرحباً! كيف يمكنني مساعدتك؟"
              : t("chat.typeMessage") || "اكتب رسالتك هنا..."
          }
          disabled={isSending}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className={styles.sendButton}
        >
          <BiSend />
        </button>
      </form>
    </div>
  );
};

export default Chat;
