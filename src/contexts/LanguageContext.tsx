import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCache, setCache } from '../lib/cache';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    home: 'Home',
    history: 'History',
    scan: 'Scan',
    chat: 'Chat',
    reminders: 'Reminders',
    profile: 'Profile',
    admin: 'Admin',
    realTimeVitals: 'Real-time Vitals',
    heartRate: 'Heart Rate',
    oxygenLevel: 'Oxygen Level',
    bodyTemperature: 'Body Temperature',
    bmiBmrCalculator: 'BMI & BMR Calculator',
    heightCm: 'Height (cm)',
    weightKg: 'Weight (kg)',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    calculateAndGetAiAdvice: 'Calculate & Get AI Advice',
    calculating: 'Calculating...',
    yourBmi: 'Your BMI',
    yourBmr: 'Your BMR',
    weightStatus: 'Weight Status',
    adjustmentNeeded: 'Adjustment Needed',
    recommendedDailyCalories: 'Recommended Daily Calories',
    aiAdvice: 'AI Advice',
    emergencyContacts: 'Emergency Contacts',
    hospitalsAndAmbulances: 'Hospitals & Ambulances',
    healthStatusInsight: 'Health Status Insight',
    updateAi: 'Update AI',
    analyzing: 'Analyzing...',
    status: 'Status',
    recommendation: 'Recommendation',
    extraStepsForGoodHealth: 'Extra Steps for Good Health',
    heartRateTrend: 'Heart Rate Trend',
    logout: 'Logout',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    home: 'হোম',
    history: 'ইতিহাস',
    scan: 'স্ক্যান',
    chat: 'চ্যাট',
    reminders: 'রিমাইন্ডার',
    profile: 'প্রোফাইল',
    admin: 'অ্যাডমিন',
    realTimeVitals: 'রিয়েল-টাইম ভাইটালস',
    heartRate: 'হার্ট রেট',
    oxygenLevel: 'অক্সিজেন লেভেল',
    bodyTemperature: 'শরীরের তাপমাত্রা',
    bmiBmrCalculator: 'BMI এবং BMR ক্যালকুলেটর',
    heightCm: 'উচ্চতা (সেমি)',
    weightKg: 'ওজন (কেজি)',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    male: 'পুরুষ',
    female: 'মহিলা',
    calculateAndGetAiAdvice: 'ক্যালকুলেট ও এআই পরামর্শ পান',
    calculating: 'গণনা করা হচ্ছে...',
    yourBmi: 'আপনার BMI',
    yourBmr: 'আপনার BMR',
    weightStatus: 'ওজনের অবস্থা',
    adjustmentNeeded: 'সমন্বয় প্রয়োজন',
    recommendedDailyCalories: 'প্রস্তাবিত দৈনিক ক্যালোরি',
    aiAdvice: 'এআই পরামর্শ',
    emergencyContacts: 'জরুরী যোগাযোগ',
    hospitalsAndAmbulances: 'হাসপাতাল এবং অ্যাম্বুলেন্স',
    healthStatusInsight: 'স্বাস্থ্য অবস্থা ইনসাইট',
    updateAi: 'এআই আপডেট করুন',
    analyzing: 'বিশ্লেষণ করা হচ্ছে...',
    status: 'অবস্থা',
    recommendation: 'পরামর্শ',
    extraStepsForGoodHealth: 'সুস্বাস্থ্যের জন্য অতিরিক্ত পদক্ষেপ',
    heartRateTrend: 'হার্ট রেট ট্রেন্ড',
    logout: 'লগআউট',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const loadLang = async () => {
      const cachedLang = await getCache<Language>('app_language');
      if (cachedLang === 'en' || cachedLang === 'bn') {
        setLanguageState(cachedLang);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await setCache('app_language', lang);
  };

  const t = (key: string): string => {
    const langObj = translations[language];
    return (langObj as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
