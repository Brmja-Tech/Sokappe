import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useChat } from "../../context/ChatContext";
import { BiMessageRounded } from "react-icons/bi";
import styles from "./ChatIcon.module.css";

const ChatIcon = () => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const { chats, unreadCount, fetchChats } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && chats.length === 0) {
      fetchChats();
    }
  }, [isDropdownOpen, fetchChats, chats.length]);

  const handleChatClick = (chat) => {
    setIsDropdownOpen(false);
    navigate(`/chats/${chat.chat_id}`, {
      state: {
        otherUserId: chat.other_user_id,
        otherUserName: chat.other_user_name,
      },
    });
  };

  const formatLastMessage = (message) => {
    if (!message) return "";
    return message.length > 30 ? message.substring(0, 30) + "..." : message;
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

  return (
    <div className={styles.chatIconContainer} ref={dropdownRef}>
      <button
        className={styles.chatIconButton}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        title={t("chat.chats") || "المحادثات"}
      >
        <BiMessageRounded className={styles.chatIcon} />
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h6>{t("chat.chats") || "المحادثات"}</h6>
            <Link
              to="/chats"
              className={styles.viewAllLink}
              onClick={() => setIsDropdownOpen(false)}
            >
              {t("chat.viewAll") || "عرض الكل"}
            </Link>
          </div>

          <div className={styles.chatsList}>
            {chats.length === 0 ? (
              <div className={styles.noChats}>
                <p>{t("chat.noChats") || "لا توجد محادثات"}</p>
              </div>
            ) : (
              chats.slice(0, 5).map((chat) => (
                <div
                  key={chat.chat_id}
                  className={styles.chatItem}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className={styles.chatAvatar}>
                    <span>{chat.other_user_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatName}>
                      {chat.other_user_name}
                    </div>
                    <div className={styles.chatLastMessage}>
                      {formatLastMessage(chat.last_message)}
                    </div>
                  </div>
                  <div className={styles.chatTime}>
                    {formatTime(chat.updated_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatIcon;
