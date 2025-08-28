// services/chatService.js
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
      // chatId -> { cleanup: fn, state: {...} }
      this.listeners = new Map();
    }
  
    // اكتب رسالة في Firebase بمفتاح = message.id
    async upsertMessage(chatId, message) {
      const msgRef = ref(database, `chats/${chatId}/messages/${message.id}`);
  
      // created_at_ms موحّد (لو مش موجود نحسبه)
      const createdAtMs = Number(
        message.created_at_ms ??
          (message.created_at ? Date.parse(message.created_at) : Date.now())
      );
  
      await set(msgRef, {
        id: message.id,
        chat_id: String(chatId),
        // لا نحسب is_me هنا؛ ده دايمًا بيتحسب في الفرونت من user_id مقارنةً بالمستخدم الحالي
        user_id: message.user_id != null ? String(message.user_id) : null,
        message: message.message,
        read: !!message.read,
        created_at: message.created_at ?? new Date(createdAtMs).toISOString(),
        created_at_ms: createdAtMs,
      });
    }
  
    // (اختياري) جلب سريع
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
      // نظّف أي listener قديم
      this.stopListeningToChat(chatId);
  
      const q = query(
        ref(database, `chats/${chatId}/messages`),
        orderByChild("created_at_ms")
      );
  
      // حالة لكل شات
      const state = {
        initialDone: false,              // اتعمل snapshot الأول؟
        seenIds: new Set(),              // لتفادي التكرار
        bufferAdded: [],                 // أحداث جات قبل initial snapshot
        bufferChanged: [],
        bufferRemoved: [],
      };
  
      // helper لتطبيع الرسالة
      const normalize = (snap) => {
        const val = snap.val() || {};
        const id = val.id != null ? String(val.id) : String(snap.key);
        return {
          ...val,
          id,
          chat_id: String(chatId),
          user_id: val.user_id != null ? String(val.user_id) : null,
          created_at_ms:
            val.created_at_ms ??
            (val.created_at ? Date.parse(val.created_at) : undefined),
        };
      };
  
      // unsubscribes
      const unsubs = [];
  
      // child_added
      const unAdded = onChildAdded(
        q,
        (snap) => {
          const msg = normalize(snap);
          if (state.initialDone) {
            if (!state.seenIds.has(msg.id)) {
              state.seenIds.add(msg.id);
              onAdded && onAdded(msg);
            }
          } else {
            state.bufferAdded.push(msg);
          }
        },
        (err) => console.error("onChildAdded error:", err)
      );
      unsubs.push(unAdded);
  
      // child_changed
      const unChanged = onChildChanged(
        q,
        (snap) => {
          const msg = normalize(snap);
          if (state.initialDone) {
            onChanged && onChanged(msg);
          } else {
            state.bufferChanged.push(msg);
          }
        },
        (err) => console.error("onChildChanged error:", err)
      );
      unsubs.push(unChanged);
  
      // child_removed
      const unRemoved = onChildRemoved(
        q,
        (snap) => {
          const msg = normalize(snap);
          if (state.initialDone) {
            onRemoved && onRemoved(msg);
          } else {
            state.bufferRemoved.push(msg);
          }
        },
        (err) => console.error("onChildRemoved error:", err)
      );
      unsubs.push(unRemoved);
  
      // اعمل snapshot أولي **بعد** تركيب الليسنرز
      // عشان لو حصلت رسائل أثناء التحميل نلقطها في البافر
      get(q)
        .then((snapshot) => {
          // 1) مرّر الرسائل الأولية بالترتيب
          if (snapshot.exists()) {
            const arr = [];
            snapshot.forEach((child) => arr.push(normalize(child)));
            // الترتيب حسب created_at_ms
            arr.sort(
              (a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0)
            );
            for (const m of arr) {
              if (!state.seenIds.has(m.id)) {
                state.seenIds.add(m.id);
                onAdded && onAdded(m);
              }
            }
          }
  
          // 2) علّم إن التحميل الأولي انتهى
          state.initialDone = true;
  
          // 3) فضّي البافر (أحداث حصلت أثناء التحميل)
          //   - added: أضف أي رسائل جديدة غير موجودة
          const addedAfter = state.bufferAdded
            .filter((m) => !state.seenIds.has(m.id))
            .sort((a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0));
          for (const m of addedAfter) {
            state.seenIds.add(m.id);
            onAdded && onAdded(m);
          }
  
          //   - changed & removed: مرّرهم كلهم (الأحدث يحسم)
          for (const m of state.bufferChanged) {
            onChanged && onChanged(m);
          }
          for (const m of state.bufferRemoved) {
            onRemoved && onRemoved(m);
          }
  
          // 4) نظّف البافرات
          state.bufferAdded = [];
          state.bufferChanged = [];
          state.bufferRemoved = [];
        })
        .catch((err) => {
          // حتى لو snapshot فشل، هنكمل بالـlisteners اللي اتثبتت
          console.warn("Initial snapshot failed:", err);
          state.initialDone = true;
  
          // مرّر أي أحداث كانت في البافر (لو حصلت)
          for (const m of state.bufferAdded) {
            if (!state.seenIds.has(m.id)) {
              state.seenIds.add(m.id);
              onAdded && onAdded(m);
            }
          }
          for (const m of state.bufferChanged) onChanged && onChanged(m);
          for (const m of state.bufferRemoved) onRemoved && onRemoved(m);
  
          state.bufferAdded = [];
          state.bufferChanged = [];
          state.bufferRemoved = [];
        });
  
      // سجل cleanup
      this.listeners.set(chatId, {
        cleanup: () => {
          try {
            unsubs.forEach((u) => typeof u === "function" && u());
          } catch (e) {
            console.warn("unsubscribe failed:", e);
          }
        },
        state,
      });
    }
  
    stopListeningToChat(chatId) {
      const l = this.listeners.get(chatId);
      if (l?.cleanup) {
        l.cleanup();
      }
      this.listeners.delete(chatId);
    }
  
    stopAllListeners() {
      for (const id of this.listeners.keys()) {
        this.stopListeningToChat(id);
      }
    }
  }
  
  export default new ChatService();
  