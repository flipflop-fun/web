import React from 'react';
import { useTranslation } from 'react-i18next';

const MaintenanceBanner: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex-1 p-4 md:p-8 pb-20 mt-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-500">{t('common.mainnetComingSoon')}</h1>
        <div className="text-lg">
          {t('common.mainnetNotLaunched')}
        </div>
        <div className="justify-center text-lg mb-8">
          <div className='mr-3'>{t('common.orUseTestnet')} </div>
          <a href="https://test.flipflop.plus" target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">
            https://test.flipflop.plus
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;