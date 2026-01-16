import axios from 'axios';

const BASE_URL = 'https://nethy-production.up.railway.app/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 🔐 إعداد Bearer Token تلقائياً من localStorage
api.interceptors.request.use(
  (config) => {
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