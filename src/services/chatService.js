// src/services/chatService.js
import {
  ref,
  set,
  get,
  query,
  orderByChild,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";
import { database } from "../config/firebase";

class ChatService {
  constructor() {
    this.listeners = new Map();
  }

  async upsertMessage(chatId, message) {
    const msgRef = ref(database, `chats/${chatId}/messages/${String(message.id)}`);
    const createdAtMs = Number(
      message.created_at_ms ??
        (message.created_at ? Date.parse(message.created_at) : Date.now())
    );
    const messageData = {
      id: String(message.id),
      chat_id: String(chatId),
      user_id: message.user_id != null ? String(message.user_id) : null,
      message: message.message,
      read: !!message.read,
      created_at: message.created_at ?? new Date(createdAtMs).toISOString(),
      created_at_ms: createdAtMs,
    };
    await set(msgRef, messageData);
  }

  async getChatMessages(chatId) {
    const baseRef = ref(database, `chats/${chatId}/messages`);
    const snap = await get(baseRef);
    if (!snap.exists()) return [];
    const data = snap.val() || {};
    return Object.values(data).sort(
      (a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0)
    );
  }

  listenToChat(chatId, { onAdded, onChanged, onRemoved }) {
    this.stopListeningToChat(chatId);
    const q = query(ref(database, `chats/${chatId}/messages`), orderByChild("created_at_ms"));
    const state = { initialDone: false, seenIds: new Set(), bufferAdded: [], bufferChanged: [], bufferRemoved: [] };
    const normalize = (snap) => {
      const val = snap.val() || {};
      const id = val.id != null ? String(val.id) : String(snap.key);
      return {
        ...val,
        id,
        chat_id: String(chatId),
        user_id: val.user_id != null ? String(val.user_id) : null,
        created_at_ms: val.created_at_ms ?? (val.created_at ? Date.parse(val.created_at) : undefined),
      };
    };

    const unsubs = [];
    unsubs.push(
      onChildAdded(q, (snap) => {
        const msg = normalize(snap);
        if (state.initialDone) {
          if (!state.seenIds.has(msg.id)) {
            state.seenIds.add(msg.id);
            onAdded && onAdded(msg);
          }
        } else {
          state.bufferAdded.push(msg);
        }
      })
    );
    unsubs.push(
      onChildChanged(q, (snap) => {
        const msg = normalize(snap);
        if (state.initialDone) onChanged && onChanged(msg);
        else state.bufferChanged.push(msg);
      })
    );
    unsubs.push(
      onChildRemoved(q, (snap) => {
        const msg = normalize(snap);
        if (state.initialDone) onRemoved && onRemoved(msg);
        else state.bufferRemoved.push(msg);
      })
    );

    get(q)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const arr = [];
          snapshot.forEach((child) => arr.push(normalize(child)));
          arr.sort((a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0));
          for (const m of arr) {
            if (!state.seenIds.has(m.id)) {
              state.seenIds.add(m.id);
              onAdded && onAdded(m);
            }
          }
        }
        state.initialDone = true;
        for (const m of state.bufferAdded.filter((m) => !state.seenIds.has(m.id))) {
          state.seenIds.add(m.id);
          onAdded && onAdded(m);
        }
        for (const m of state.bufferChanged) onChanged && onChanged(m);
        for (const m of state.bufferRemoved) onRemoved && onRemoved(m);
        state.bufferAdded = [];
        state.bufferChanged = [];
        state.bufferRemoved = [];
      })
      .catch(() => {
        state.initialDone = true;
      });

    this.listeners.set(chatId, {
      cleanup: () => {
        try {
          unsubs.forEach((u) => typeof u === "function" && u());
        } catch {}
      },
      state,
    });
  }

  stopListeningToChat(chatId) {
    const l = this.listeners.get(chatId);
    if (l?.cleanup) l.cleanup();
    this.listeners.delete(chatId);
  }

  stopAllListeners() {
    for (const id of this.listeners.keys()) {
      this.stopListeningToChat(id);
    }
  }
}

export default new ChatService();
