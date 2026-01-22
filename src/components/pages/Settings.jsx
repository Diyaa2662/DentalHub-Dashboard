import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Mail,
  Key,
  LogOut,
} from "lucide-react";

const Settings = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  const navigate = useNavigate();

  // بيانات تعديل الملف الشخصي
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // بيانات تغيير كلمة المرور
  const [passwordData, setPasswordData] = useState({
    email: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // جلب بيانات المستخدم الحالي من localStorage أو API
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = () => {
    try {
      // جلب البيانات من localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setProfileData({
          name: user.name || "",
          email: user.email || "",
        });
        setPasswordData((prev) => ({
          ...prev,
          email: user.email || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // ✅ دالة تسجيل الخروج
  const handleLogout = async () => {
    try {
      setLogoutInProgress(true);

      await api.post("/logout");

      // مسح بيانات المستخدم من localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // حتى لو فشل الـ API، ننظف localStorage ونعيد التوجيه
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    } finally {
      setLogoutInProgress(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  const validateProfile = () => {
    if (!profileData.name.trim()) {
      return t("nameRequired", "settings") || "Name is required";
    }
    if (!profileData.email.trim()) {
      return t("emailRequired", "settings") || "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      return t("validEmailRequired", "settings") || "Valid email is required";
    }
    return null;
  };

  const validatePassword = () => {
    if (!passwordData.email.trim()) {
      return t("emailRequired", "settings") || "Email is required";
    }
    if (!passwordData.current_password.trim()) {
      return (
        t("currentPasswordRequired", "settings") ||
        "Current password is required"
      );
    }
    if (!passwordData.new_password.trim()) {
      return t("newPasswordRequired", "settings") || "New password is required";
    }
    if (passwordData.new_password.length < 6) {
      return (
        t("passwordMinLength", "settings") ||
        "Password must be at least 6 characters"
      );
    }
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      return t("passwordsDoNotMatch", "settings") || "Passwords do not match";
    }
    return null;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/updateuser", {
        name: profileData.name,
        email: profileData.email,
      });

      console.log("Profile update response:", response.data);

      // التحقق إذا تغير الإيميل (بشكل صحيح)
      const userData = localStorage.getItem("user");
      const oldUser = userData ? JSON.parse(userData) : null;
      // التحقق أن oldUser موجود وله email وأنه مختلف عن الجديد
      const emailChanged =
        oldUser &&
        oldUser.email &&
        profileData.email &&
        oldUser.email !== profileData.email;

      // تحديث البيانات في localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        name: profileData.name,
        email: profileData.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // إظهار رسالة النجاح
      if (emailChanged) {
        console.log(
          "Email changed from:",
          oldUser.email,
          "to:",
          profileData.email,
        );
        setSuccess(
          t("profileUpdatedRelogin", "settings") ||
            "Profile updated successfully! Logging out in 2 seconds...",
        );

        // تسجيل الخروج التلقائي بعد 2 ثانية (بدون تأكيد)
        setTimeout(() => {
          // إظهار رسالة قبل تسجيل الخروج
          alert(
            t("emailChangedLogoutMessage", "settings") ||
              "Your email has been changed. You will be redirected to login page.",
          );
          handleLogout();
        }, 2000);
      } else {
        console.log("Email not changed or not valid comparison");
        setSuccess(
          t("profileUpdatedSuccess", "settings") ||
            "Profile updated successfully!",
        );
      }

      // تحديث email في قسم كلمة المرور
      setPasswordData((prev) => ({
        ...prev,
        email: profileData.email,
      }));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          t("profileUpdateError", "settings") ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/resetpassword", passwordData);

      console.log("Password change response:", response.data);

      setSuccess(
        t("passwordChangedRelogin", "settings") ||
          "Password changed successfully! Logging out in 2 seconds...",
      );

      // تسجيل الخروج التلقائي بعد 2 ثانية (بدون تأكيد)
      setTimeout(() => {
        // إظهار رسالة قبل تسجيل الخروج
        alert(
          t("passwordChangedLogoutMessage", "settings") ||
            "Your password has been changed. You will be redirected to login page.",
        );
        handleLogout();
      }, 2000);

      // إعادة تعيين حقول كلمة المرور
      setPasswordData((prev) => ({
        email: prev.email,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      }));
    } catch (err) {
      console.error("Error changing password:", err);
      setError(
        err.response?.data?.message ||
          t("passwordChangeError", "settings") ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: "profile",
      label: t("profileInformation", "settings") || "Profile Information",
      icon: <User size={20} />,
    },
    {
      id: "password",
      label: t("changePassword", "settings") || "Change Password",
      icon: <Lock size={20} />,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("name", "common")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("enterYourName", "settings") || "Enter your name"
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email", "common")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("enterYourEmail", "settings") || "Enter your email"
                    }
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-yellow-600">
                  {t("emailChangeWarning", "settings") ||
                    "Changing your email will require you to log in again."}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-dental-blue hover:bg-blue-600 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{t("saving", "common") || "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>
                        {t("updateProfile", "settings") || "Update Profile"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        );

      case "password":
        return (
          <form onSubmit={handleChangePassword}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email", "common")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={passwordData.email}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("enterYourEmail", "settings") || "Enter your email"
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("currentPassword", "settings")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("enterCurrentPassword", "settings") ||
                      "Enter current password"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("newPassword", "settings")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("enterNewPassword", "settings") || "Enter new password"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("confirmNewPassword", "settings")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      t("confirmNewPassword", "settings") ||
                      "Confirm new password"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-yellow-600">
                  {t("passwordChangeWarning", "settings") ||
                    "Changing your password will require you to log in again."}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-dental-blue hover:bg-blue-600 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>
                        {t("changingPassword", "settings") ||
                          "Changing Password..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>
                        {t("changePassword", "settings") || "Change Password"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {t("settings", "common")}
        </h1>
        <p className="text-gray-600">
          {t("manageYourAccountSettings", "settings") ||
            "Manage your account settings"}
        </p>
      </div>

      {/* رسالة النجاح */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-green-800">
                {t("success", "common") || "Success"}
              </h3>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("error", "common") || "Error"}
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* القائمة الجانبية */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-6">
              {t("accountSettings", "settings") || "Account Settings"}
            </h3>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-3 w-full p-4 text-left rounded-lg transition ${
                    activeSection === section.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={
                      activeSection === section.id
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    {section.icon}
                  </span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}

              {/* زر تسجيل الخروج */}
              <button
                onClick={handleLogout}
                disabled={logoutInProgress}
                className={`flex items-center space-x-3 w-full p-4 text-left rounded-lg transition mt-4 ${
                  logoutInProgress
                    ? "bg-gray-100 cursor-not-allowed"
                    : "text-red-700 hover:bg-red-50"
                }`}
              >
                <LogOut size={20} className="text-red-600" />
                <span className="font-medium">
                  {logoutInProgress
                    ? t("loggingOut", "settings") || "Logging out..."
                    : t("logout", "common") || "Logout"}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                {sections.find((s) => s.id === activeSection)?.icon || (
                  <User size={24} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {sections.find((s) => s.id === activeSection)?.label || ""}
                </h3>
                <p className="text-sm text-gray-600">
                  {activeSection === "profile" &&
                    (t("updateYourPersonalInformation", "settings") ||
                      "Update your personal information")}
                  {activeSection === "password" &&
                    (t("changeYourAccountPassword", "settings") ||
                      "Change your account password")}
                </p>
              </div>
            </div>

            {renderContent()}
          </div>

          {/* معلومات مساعدة */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              🔐 {t("securityNotes", "settings") || "Security Notes"}
            </h3>
            <ul className="space-y-3 text-sm text-blue-700">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">!</span>
                </div>
                <span>
                  {t("autoLogoutNotice", "settings") ||
                    "For security reasons, you will be automatically logged out after changing your email or password."}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✓</span>
                </div>
                <span>
                  {t("passwordStrengthNote", "settings") ||
                    "Use a strong password with at least 6 characters"}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">🔒</span>
                </div>
                <span>
                  {t("securityNote", "settings") ||
                    "Keep your password secure and don't share it"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
