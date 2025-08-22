import React, { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FaBars } from 'react-icons/fa';
import { NavbarProps } from '../../types/types';
import { Logo } from './Logo';
import { useDeviceType } from '../../hooks/device';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Language } from '../../types/types';
// import { VERSION_DESCRIPTION } from '../../config/constants';

export const Navbar: React.FC<NavbarProps> = ({
  title = "Logo",
  onMenuClick,
  isMenuOpen
}) => {
  const { isMobile, isDesktop } = useDeviceType();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // const [showWarning, setShowWarning] = useState(VERSION_DESCRIPTION === "Rehearsal");
  // const { t } = useTranslation();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (isMobile) {
          if (window.scrollY > lastScrollY && window.scrollY > 50) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          setLastScrollY(window.scrollY);
        } else {
          setIsVisible(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuButton = document.querySelector('.menu-button');
      const sidebar = document.querySelector('.sidebar');
      if (isMenuOpen && menuButton && sidebar) {
        if (!menuButton.contains(event.target as Node) && !sidebar.contains(event.target as Node)) {
          onMenuClick?.();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, onMenuClick]);

  const { i18n } = useTranslation();
  const [currentLocale, setCurrentLocale] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en-US';
  });

  const handleLocaleChange = (locale: Language) => {
    setCurrentLocale(locale);
    i18n.changeLanguage(locale);
    localStorage.setItem('language', locale);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-base-300 shadow-md border-b-2 border-primary-content transition-transform duration-300 ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* Warning banner */}
      {/* {showWarning && (
        <div className="bg-warning text-red-600 px-4 py-4 text-center text-bg font-bold relative">
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{t('common.rehearsalAlert')}</span>
          </div>
          <button 
            onClick={() => setShowWarning(false)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-yellow-500 rounded p-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )} */}
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex items-center">
            <button
              className={`menu-button btn btn-ghost btn-circle md:hidden`}
              onClick={onMenuClick}
            >
              <FaBars className="w-5 h-5" />
            </button>
            {isDesktop &&
              <a
                href="/"
                className={``}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/home';
                }}
              >
                <Logo />
              </a>
            }
          </div>

          <div className="flex-1 flex justify-end items-center gap-2">
            <LanguageSelector
              currentLocale={currentLocale}
              onLocaleChange={handleLocaleChange}
            />
            <WalletMultiButton className='btn btn-ghost' />
          </div>
        </div>
      </div>
    </nav>
  );
};
