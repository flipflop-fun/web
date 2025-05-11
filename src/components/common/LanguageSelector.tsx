import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { Language, LanguageSelectorProps } from '../../types/types';

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLocale,
  onLocaleChange,
}) => {
  const languages: Language[] = ['en-US', 'ja-JP', 'es-ES', 'zh-CN', 'zh-TW', 'vi-VN'];

  const getLanguageName = (locale: Language) => {
    const langMap: Record<Language, string> = {
      'en-US': 'English',
      'zh-CN': '简体中文',
      'ja-JP': '日本語',
      // 'ru-RU': 'Русский',
      'zh-TW': '繁體中文',
      'es-ES': 'Español',
      'vi-VN': 'Tiếng Việt',
    };
    return langMap[locale];
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <FaGlobe className="w-5 h-5" />
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36">
        {languages.map((lang) => (
          <li key={lang}>
            <button
              className={`${currentLocale === lang ? 'active' : ''}`}
              onClick={() => onLocaleChange(lang)}
            >
              {getLanguageName(lang)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
