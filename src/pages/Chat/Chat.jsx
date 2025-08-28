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
  const { messages, currentChat, sendMessage, fetchMessages } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get other user info from location state or URL params
  const otherUserId =
    location.state?.otherUserId ||
    new URLSearchParams(location.search).get("other_user_id");
  const otherUserName = location.state?.otherUserName || "مستخدم جديد";

  useEffect(() => {
    if (chatId && chatId !== "new") {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!otherUserId) {
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
            <span>{otherUserName.charAt(0).toUpperCase()}</span>
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
        {messages.length === 0 ? (
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
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`${styles.messageItem} ${
                  message.is_me ? styles.myMessage : styles.otherMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <p>{message.message}</p>
                  <span className={styles.messageTime}>
                    {formatMessageTime(message.created_at)}
                  </span>
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
          onKeyPress={handleKeyPress}
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
