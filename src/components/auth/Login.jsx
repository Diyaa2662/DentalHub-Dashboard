import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Activity, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // بيانات تسجيل الدخول الثابتة
  const validCredentials = {
    email: "admin@dentalpro.com",
    password: "admin123",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // إزالة الخطأ عند البدء بالكتابة
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // محاكاة اتصال بالخادم
    setTimeout(() => {
      if (
        formData.email === validCredentials.email &&
        formData.password === validCredentials.password
      ) {
        // تخزين حالة تسجيل الدخول في localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", formData.email);

        // التوجيه إلى الداشبورد
        navigate("/");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
    }, 1000);
  };

  // إعادة التوجيه إذا كان المستخدم مسجل دخول بالفعل
  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* الشعار */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-dental-blue to-dental-teal rounded-xl">
              <Activity className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            DentalPro Admin
          </h1>
          <p className="text-gray-600">Sign in to your admin dashboard</p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-8">
            Please enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent transition"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff
                      className="text-gray-400 hover:text-gray-600"
                      size={20}
                    />
                  ) : (
                    <Eye
                      className="text-gray-400 hover:text-gray-600"
                      size={20}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* معلومات تسجيل الدخول */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Demo Credentials:
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  Email: <span className="font-mono">admin@dentalpro.com</span>
                </p>
                <p>
                  Password: <span className="font-mono">admin123</span>
                </p>
              </div>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-dental-blue to-dental-teal hover:from-blue-600 hover:to-teal-600 text-white"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} className="mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              This is a demo admin panel. For security, please don't use real
              credentials.
            </p>
          </div>
        </div>

        {/* حقوق الطبع */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DentalPro Shop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
