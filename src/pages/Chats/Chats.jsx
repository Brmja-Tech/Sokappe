import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useChat } from "../../context/ChatContext";
import { BiMessageRounded, BiArrowBack } from "react-icons/bi";
import styles from "./Chats.module.css";

const Chats = () => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const location = useLocation();
  const { chats, loading, fetchChats } = useChat();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("Chats component mounted, fetching chats...");
    console.log("fetchChats function:", fetchChats);
    console.log(
      "Current token from localStorage:",
      localStorage.getItem("token")
    );
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter((chat) =>
    chat.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chat) => {
    navigate(`/chats/${chat.chat_id}`, {
      state: {
        otherUserId: chat.other_user_id,
        otherUserName: chat.other_user_name,
      },
    });
  };

  const formatLastMessage = (message) => {
    if (!message) return "";
    return message.length > 50 ? message.substring(0, 50) + "..." : message;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "الآن";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} س`;
    } else {
      return date.toLocaleDateString("ar-EG");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t("chat.loading") || "جاري التحميل..."}</p>
      </div>
    );
  }

  console.log("Current chats:", chats);
  console.log("Filtered chats:", filteredChats);

  return (
    <div className={styles.chatsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <BiArrowBack />
        </button>
        <h1>{t("chat.chats") || "المحادثات"}</h1>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={t("chat.searchChats") || "البحث في المحادثات..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Chats List */}
      <div className={styles.chatsList}>
        {filteredChats.length === 0 ? (
          <div className={styles.noChats}>
            <BiMessageRounded className={styles.noChatsIcon} />
            <h3>{t("chat.noChats") || "لا توجد محادثات"}</h3>
            <p>
              {t("chat.noChatsDesc") || "ابدأ محادثة جديدة مع مقدمي الخدمات"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={styles.chatItem}
              onClick={() => handleChatClick(chat)}
            >
              <div className={styles.chatAvatar}>
                <span>{chat.other_user_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <h4 className={styles.chatName}>{chat.other_user_name}</h4>
                  <span className={styles.chatTime}>
                    {formatTime(chat.updated_at)}
                  </span>
                </div>
                <p className={styles.chatLastMessage}>
                  {formatLastMessage(chat.last_message)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Chats;
