// ملف: src/services/api.js
import axios from 'axios';

const BASE_URL = 'https://dentist-production.up.railway.app/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  // ❌ أزل الـ headers الافتراضية هنا لأنها تسبب المشكلة
});

// 🔐 إعداد Bearer Token تلقائياً من localStorage
// في ملف api.js - النسخة المحسنة
api.interceptors.request.use(
  (config) => {
    // ✅ اجعل هذا الشرط أول شيء
    // إذا كان FormData لا تلمس Content-Type
    const isFormData = config.data instanceof FormData;
    
    if (!isFormData) {
      // فقط لغير FormData أضف application/json
      config.headers['Content-Type'] = 'application/json';
    }
    
    // ✅ إضافة التوكن
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ طباعة للتصحيح (يمكن حذفها لاحقاً)
    // console.log(`Request to: ${config.url}`);
    // console.log(`Is FormData: ${isFormData}`);
    // console.log(`Content-Type: ${config.headers['Content-Type']}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⚠️ التعامل مع الأخطاء الشائعة من الخادم
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        console.error('انتهت جلسة العمل! يلزم إعادة تسجيل الدخول.');
      } else if (status === 403) {
        console.error('ليس لديك صلاحيات للقيام بهذا الإجراء.');
      } else if (status === 404) {
        console.error('الملف المطلوب غير موجود على الخادم.');
      } else if (status === 422) {
        console.error('Validation error:', error.response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;