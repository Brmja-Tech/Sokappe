// services/chatService.js
import { ref, set, get, query, orderByChild, onChildAdded, onChildChanged, onChildRemoved, off } from "firebase/database";
import { database } from "../config/firebase";

class ChatService {
  constructor() {
    this.listeners = new Map(); // chatId -> {refs:[], cleanup:fn}
  }

  // اكتب رسالة في Firebase بمفتاح = message.id (راجع sendMessage في ChatContext)
  async upsertMessage(chatId, message) {
    // message.id لازم يكون موجود من الـAPI
    const msgRef = ref(database, `chats/${chatId}/messages/${message.id}`);
    await set(msgRef, {
      id: message.id,
      chat_id: chatId,
      user_id: message.user_id,     // sender_id من الـAPI
      message: message.message,
      read: !!message.read,
      created_at: message.created_at,            // ISO من السيرفر
      created_at_ms: Date.parse(message.created_at) || Date.now(),
    });
  }

  // seed للرسائل (لو احتجته)
  async getChatMessages(chatId) {
    const q = query(ref(database, `chats/${chatId}/messages`), orderByChild('created_at_ms'));
    const snap = await get(q);
    if (!snap.exists()) return [];
    const data = snap.val() || {};
    return Object.values(data).sort((a,b)=> (a.created_at_ms||0)-(b.created_at_ms||0));
  }

  listenToChat(chatId, { onAdded, onChanged, onRemoved }) {
    this.stopListeningToChat(chatId);

    const baseRef = ref(database, `chats/${chatId}/messages`);
    const q = query(baseRef, orderByChild('created_at_ms'));

    const added = onChildAdded(q, (snap) => {
      const val = snap.val();
      onAdded && onAdded(val);
    });
    const changed = onChildChanged(q, (snap) => {
      const val = snap.val();
      onChanged && onChanged(val);
    });
    const removed = onChildRemoved(q, (snap) => {
      const val = snap.val();
      onRemoved && onRemoved(val);
    });

    this.listeners.set(chatId, {
      refs: [q],
      cleanup: () => {
        off(q, 'child_added', added);
        off(q, 'child_changed', changed);
        off(q, 'child_removed', removed);
      }
    });
  }

  stopListeningToChat(chatId) {
    const l = this.listeners.get(chatId);
    if (l) {
      l.cleanup && l.cleanup();
      this.listeners.delete(chatId);
    }
  }

  stopAllListeners() {
    [...this.listeners.keys()].forEach((id)=> this.stopListeningToChat(id));
  }
}

export default new ChatService();
