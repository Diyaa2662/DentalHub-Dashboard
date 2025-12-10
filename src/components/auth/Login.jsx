import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { LogIn, Mail, Lock, Activity, Eye, EyeOff, Globe } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { t, language, switchLanguage } = useLanguage(); // إضافة language و switchLanguage
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
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (
        formData.email === validCredentials.email &&
        formData.password === validCredentials.password
      ) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", formData.email);
        navigate("/");
      } else {
        setError(
          t("invalidCredentials", "login") ||
            "Invalid email or password. Please try again."
        );
      }
      setLoading(false);
    }, 1000);
  };

  const toggleLanguage = () => {
    switchLanguage(language === "en" ? "sv" : "en");
  };

  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* زر تبديل اللغة في الأعلى */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            title={
              language === "en" ? "Switch to Swedish" : "Byt till engelska"
            }
          >
            <Globe size={18} />
            <span className="font-medium">
              {language === "en" ? "🇸🇪 SV" : "🇺🇸 EN"}
            </span>
          </button>
        </div>

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
          <p className="text-gray-600">
            {t("signInToDashboard", "login") ||
              "Sign in to your admin dashboard"}
          </p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("welcomeBack", "login") || "Welcome Back"}
          </h2>
          <p className="text-gray-600 mb-8">
            {t("enterCredentials", "login") ||
              "Please enter your credentials to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("emailAddress", "login") || "Email Address"}
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
                  placeholder={
                    t("enterYourEmail", "login") || "Enter your email"
                  }
                  required
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("password", "common")}
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
                  placeholder={
                    t("enterYourPassword", "login") || "Enter your password"
                  }
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
                {t("demoCredentials", "login") || "Demo Credentials:"}
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  {t("email", "common")}:{" "}
                  <span className="font-mono">admin@dentalpro.com</span>
                </p>
                <p>
                  {t("password", "common")}:{" "}
                  <span className="font-mono">admin123</span>
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
                  {t("signingIn", "login") || "Signing in..."}
                </>
              ) : (
                <>
                  <LogIn size={20} className="mr-2" />
                  {t("signIn", "common")}
                </>
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {t("demoAdminPanel", "login") ||
                "This is a demo admin panel. For security, please don't use real credentials."}
            </p>
          </div>
        </div>

        {/* حقوق الطبع */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DentalPro Shop.{" "}
            {t("allRightsReserved", "common")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("currentLanguage", "login") || "Current language"}:{" "}
            {language === "en" ? "English" : "Swedish"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
