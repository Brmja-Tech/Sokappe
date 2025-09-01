// ملف اختبار FCM token
import { initPushAndGetToken } from "../config/firebase-messaging.js";

export const testFCMToken = async () => {
  console.log("🧪 بدء اختبار FCM Token...");

  try {
    const result = await initPushAndGetToken();

    console.log("📊 نتائج الاختبار:");
    console.log("- Token:", result.token ? "✅ موجود" : "❌ غير موجود");
    console.log("- Reason:", result.reason || "غير محدد");

    if (result.token) {
      console.log("- Token length:", result.token.length);
      console.log("- Token preview:", result.token.substring(0, 20) + "...");
    }

    return result;
  } catch (error) {
    console.error("❌ خطأ في اختبار FCM:", error);
    return { token: null, messaging: null };
  }
};

// استدعاء الاختبار عند تحميل الملف
if (typeof window !== "undefined") {
  // يمكنك استدعاء هذا في console المتصفح
  window.testFCM = testFCMToken;
  console.log("🔧 يمكنك استدعاء testFCM() في console لاختبار FCM");
}
