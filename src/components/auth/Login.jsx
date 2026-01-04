import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  LogIn,
  Mail,
  Lock,
  Activity,
  Eye,
  EyeOff,
  Globe,
  Shield,
  AlertCircle,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { t, language, switchLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setConnectionError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError(t("fillAllFields", "login") || "Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setConnectionError(false);

    try {
      const response = await api.post("/employeelogin", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        navigate("/dashboard");
      } else {
        setError(
          response.data.message ||
            t("loginFailed", "login") ||
            "Login failed - No authentication token received"
        );
      }
    } catch (err) {
      setConnectionError(true);

      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            setError(
              data.message || t("invalidRequest", "login") || "Invalid request"
            );
            break;
          case 401:
            setError(
              t("invalidCredentials", "login") || "Invalid email or password"
            );
            break;
          case 403:
            setError(t("accessDenied", "login") || "Access denied");
            break;
          case 404:
            setError(
              t("endpointNotFound", "login") || "Login endpoint not found"
            );
            break;
          case 500:
            setError(
              t("serverError", "login") ||
                "Internal server error. Please try again later."
            );
            break;
          default:
            setError(
              data.message || t("loginFailed", "login") || "Login failed"
            );
        }
      } else if (err.request) {
        if (err.code === "ECONNABORTED") {
          setError(
            t("timeoutError", "login") ||
              "Request timeout. Please check your connection."
          );
        } else {
          setError(
            t("noResponse", "login") ||
              "No response from server. Please check your internet connection."
          );
        }
      } else {
        setError(
          err.message ||
            t("requestError", "login") ||
            "Error setting up request"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    switchLanguage(language === "en" ? "sv" : "en");
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("authToken");

    if (isAuthenticated === "true" && token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
            DentalHub Admin
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
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

            {/* رسائل الخطأ */}
            {error && (
              <div
                className={`p-3 rounded-lg ${
                  connectionError
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    connectionError ? "text-red-600" : "text-yellow-700"
                  } font-medium`}
                >
                  {connectionError ? "⚠️ " : ""}
                  {error}
                </p>
                {connectionError && (
                  <p className="text-xs text-red-500 mt-1">
                    {t("checkConnection", "login") ||
                      "Please check your internet connection and try again."}
                  </p>
                )}
              </div>
            )}

            {/* تعليمات للمسؤول */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start mb-3">
                <Shield className="text-dental-blue mt-0.5 mr-2" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {t("adminGuidelines", "login") || "Admin Guidelines"}
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-dental-blue mr-2">•</span>
                      {t("useCompanyCredentials", "login") ||
                        "Use your company-issued credentials only"}
                    </li>
                    <li className="flex items-start">
                      <span className="text-dental-blue mr-2">•</span>
                      {t("neverSharePassword", "login") ||
                        "Never share your password with anyone"}
                    </li>
                    <li className="flex items-start">
                      <span className="text-dental-blue mr-2">•</span>
                      {t("logoutSharedDevices", "login") ||
                        "Log out after each session on shared devices"}
                    </li>
                    <li className="flex items-start">
                      <span className="text-dental-blue mr-2">•</span>
                      {t("reportSuspiciousActivity", "login") ||
                        "Report any suspicious activity immediately"}
                    </li>
                  </ul>
                </div>
              </div>

              {connectionError && (
                <div className="flex items-center mt-3 pt-3 border-t border-gray-200">
                  <AlertCircle size={16} className="text-red-500 mr-2" />
                  <p className="text-xs text-red-600">
                    Unable to connect to DentalHub servers. Please verify your
                    network connection.
                  </p>
                </div>
              )}
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
              {t("professionalSystem", "common")} {t("version", "common")} v1.0
            </p>
          </div>
        </div>

        {/* حقوق الطبع */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DentalHub.{" "}
            {t("allRightsReserved", "common")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure Enterprise Platform • ISO 27001 Certified
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
