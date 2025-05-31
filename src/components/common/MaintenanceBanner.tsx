import React from 'react';

const MaintenanceBanner: React.FC = () => {
  return (
    <div className="flex-1 p-4 md:p-8 pb-20 mt-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Flipflop mainnet is comming soon!</h1>
        <div className="text-lg">
          Flipflop mainnet has not launched. Please check back later.
        </div>
        <div className="justify-center text-lg mb-8">
          <div className='mr-3'>Or you can use the testnet </div>
          <a href="https://test.flipflop.plus" target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">
            https://test.flipflop.plus
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;