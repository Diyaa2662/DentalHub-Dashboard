import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import translations from "../locales";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // استخدام initial state مع localStorage
  const [language, setLanguageState] = useState(() => {
    // قراءة اللغة المحفوظة عند التهيئة الأولية
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage || "en";
  });

  // استخدام useCallback للدالة switchLanguage
  const switchLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  // حفظ اللغة عند التغيير
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // دالة الترجمة مع useCallback
  const t = useCallback(
    (key, ns = "common") => {
      try {
        const namespace = translations[language]?.[ns] || {};
        return namespace[key] || key;
      } catch (error) {
        console.error(
          `Translation error for key: ${key}, namespace: ${ns}`,
          error
        );
        return key;
      }
    },
    [language]
  );

  const value = {
    language,
    t,
    switchLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export الـ hook كـ named export
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Export الـ provider كـ default
export default LanguageProvider;
