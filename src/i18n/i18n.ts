import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


import enTranslation from './locales/en.json';
import zhCNTranslation from './locales/zh-CN.json';
import zhTWTranslation from './locales/zh-TW.json';
import jaTranslation from './locales/ja.json';
import esTranslation from './locales/es.json';
// import ruTranslation from './locales/ru.json';
import viVNTranslation from './locales/vi-VN.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': { translation: enTranslation },
      'zh-CN': { translation: zhCNTranslation },
      'zh-TW': { translation: zhTWTranslation },
      'ja-JP': { translation: jaTranslation },
      'es-ES': { translation: esTranslation },
      // 'ru-RU': { translation: ruTranslation },
      'vi-VN': { translation: viVNTranslation },
    },
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;