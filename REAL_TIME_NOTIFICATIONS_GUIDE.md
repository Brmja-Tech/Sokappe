# دليل الإشعارات في الوقت الفعلي

## المشكلة السابقة

الإشعارات كانت تظهر في الوقت الفعلي على Google Chrome، لكن صفحة الإشعارات والنافبار لا يتم تحديثها تلقائياً. كان المستخدم يحتاج لعمل refresh لرؤية الإشعارات الجديدة.

## الحل المطبق

### 1. تحسين NotificationContext

تم تحسين `src/context/NotificationContext.jsx` لإضافة:

- **Firebase Messaging Listener**: استماع للإشعارات في المقدمة (foreground)
- **Service Worker Message Listener**: استماع للإشعارات من Service Worker
- **إضافة تلقائية للإشعارات الجديدة**: إضافة الإشعارات الجديدة للقائمة فوراً

### 2. تحسين Service Worker

تم تحسين `public/firebase-messaging-sw.js` لإضافة:

- **إرسال البيانات الكاملة**: إرسال جميع بيانات الإشعارات للتطبيق
- **رسائل للعملاء**: إرسال رسائل لجميع التبويبات المفتوحة
- **تحسين النقر على الإشعارات**: فتح التبويب الموجود بدلاً من إنشاء تبويب جديد

### 3. تحسين صفحة الإشعارات

تم تحسين `src/pages/Notifications/Notifications.jsx` لإضافة:

- **تحديث تلقائي**: تحديث الإشعارات كل 30 ثانية
- **استماع للتغييرات**: تحديث القائمة عند وصول إشعارات جديدة

## كيفية العمل

### 1. الإشعارات في المقدمة (Foreground)

```javascript
// في NotificationContext.jsx
const unsubscribe = onMessage(messaging, (payload) => {
  console.log("📨 إشعار جديد في المقدمة:", payload);

  const notificationData = payload.data || {};
  const notification = {
    id: notificationData.id || Date.now(),
    service_name: notificationData.service_name || "Service",
    status: notificationData.status || "info",
    // ... باقي البيانات
  };

  addNotification(notification);
});
```

### 2. الإشعارات في الخلفية (Background)

```javascript
// في firebase-messaging-sw.js
messaging.onBackgroundMessage((payload) => {
  // إظهار الإشعار
  self.registration.showNotification(title, {
    body,
    icon,
    data: {
      click_action,
      ...payload.data, // إرسال جميع البيانات
    },
  });

  // إرسال رسالة لجميع التبويبات
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "NEW_NOTIFICATION",
        payload: payload,
      });
    });
  });
});
```

### 3. استقبال الرسائل من Service Worker

```javascript
// في NotificationContext.jsx
const handleServiceWorkerMessage = (event) => {
  if (event.data && event.data.type === "NEW_NOTIFICATION") {
    console.log("📨 إشعار جديد من Service Worker:", event.data.payload);

    const payload = event.data.payload;
    const notificationData = payload.data || {};
    const notification = {
      // ... إنشاء كائن الإشعار
    };

    addNotification(notification);
  }
};
```

## النتائج

### ✅ **قبل التحسين:**

- الإشعارات تظهر في الوقت الفعلي
- صفحة الإشعارات تحتاج refresh
- النافبار لا يتم تحديثه تلقائياً

### ✅ **بعد التحسين:**

- الإشعارات تظهر في الوقت الفعلي
- صفحة الإشعارات تتحدث تلقائياً
- النافبار يتحدث تلقائياً
- عداد الإشعارات غير المقروءة يتحدث فوراً
- تحديث تلقائي كل 30 ثانية كنسخة احتياطية

## Debugging

افتح Developer Tools (F12) وانتقل إلى Console لرؤية:

```
📨 إشعار جديد في المقدمة: {notification: {...}, data: {...}}
📨 إشعار جديد من Service Worker: {notification: {...}, data: {...}}
➕ إضافة إشعار جديد: {id: 123, service_name: "Service", ...}
```

## ملاحظات مهمة

1. **الإشعارات في المقدمة**: تعمل عندما يكون التطبيق مفتوح
2. **الإشعارات في الخلفية**: تعمل عندما يكون التطبيق مغلق
3. **التحديث التلقائي**: كل 30 ثانية كنسخة احتياطية
4. **البيانات الكاملة**: جميع بيانات الإشعارات يتم إرسالها
5. **التوافق**: يعمل مع جميع المتصفحات المدعومة

## التحقق من النجاح

1. افتح صفحة الإشعارات
2. انتظر وصول إشعار جديد
3. ستجد أن:
   - الإشعار يظهر في القائمة فوراً
   - عداد الإشعارات غير المقروءة يتحدث
   - النافبار يتحدث تلقائياً
   - لا حاجة لـ refresh

## النتيجة النهائية

✅ **الإشعارات في الوقت الفعلي**  
✅ **تحديث تلقائي للصفحات**  
✅ **تحسين تجربة المستخدم**  
✅ **دعم الإشعارات في المقدمة والخلفية**  
✅ **تحديث عداد الإشعارات فوراً**
