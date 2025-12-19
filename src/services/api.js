// ملف: src/services/api.js
import axios from 'axios';

// 🔧 الخطوة 1: ضع هنا رابط الـAPI الأساسي الخاص بالباك إند
const BASE_URL = 'https://your-dental-api.com/v1'; // ⬅️ استبدل هذا الرابط

// 📦 إنشاء نسخة مخصصة من axios مع إعدادات افتراضية
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 ثانية كحد أقصى للانتظار
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 الخطوة 2: إعداد Bearer Token تلقائياً من localStorage
api.interceptors.request.use(
  (config) => {
    // نحاول جلب التوكن من localStorage (افترض أنه مخزن باسم 'authToken')
    const token = localStorage.getItem('authToken');
    if (token) {
      // إذا وجد التوكن، نضيفه تلقائياً لرأس الطلب
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⚠️ الخطوة 3: التعامل مع الأخطاء الشائعة من الخادم
api.interceptors.response.use(
  (response) => {
    // في حالة نجاح الطلب، نعيد الرد مباشرة
    return response;
  },
  (error) => {
    // إذا فشل الطلب، نتحقق من نوع الخطأ
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // خطأ "غير مصرح" - التوكن منتهي أو غير صالح
        console.error('انتهت جلسة العمل! يلزم إعادة تسجيل الدخول.');
        // يمكن إضافة إعادة توجيه لصفحة تسجيل الدخول هنا
        // window.location.href = '/login';
        
      } else if (status === 403) {
        // خطأ "ممنوع" - المستخدم ليس لديه الصلاحيات
        console.error('ليس لديك صلاحيات للقيام بهذا الإجراء.');
        
      } else if (status === 404) {
        // خطأ "غير موجود"
        console.error('الملف المطلوب غير موجود على الخادم.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;