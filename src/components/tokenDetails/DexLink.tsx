import { FC } from "react";
import { FaExternalLinkAlt } from 'react-icons/fa';

export const DexLink: FC<{ mint: string }> = ({ mint }) => {
  const dexLinks = [
    {
      name: 'DexScreener',
      url: `https://dexscreener.com/solana/${mint}`,
      icon: FaExternalLinkAlt,
      color: '#00D4AA'
    },
    {
      name: 'Raydium',
      url: `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${mint}`,
      icon: FaExternalLinkAlt,
      color: '#C200FB'
    },
    {
      name: 'DexTools',
      url: `https://www.dextools.io/app/en/solana/pair-explorer/${mint}`,
      icon: FaExternalLinkAlt,
      color: '#05A3C9'
    },
    {
      name: 'Birdeye',
      url: `https://birdeye.so/token/${mint}?chain=solana`,
      icon: FaExternalLinkAlt,
      color: '#F59E0B'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-base-content mb-2">View on DEX</h3>
      <div className="grid grid-cols-2 gap-2">
        {dexLinks.map((dex, index) => (
          <a
            key={index}
            href={dex.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md flex items-center gap-2 hover:shadow-pixel transition-all duration-200"
            style={{
              borderColor: dex.color,
              color: dex.color
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = dex.color;
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = dex.color;
            }}
          >
            <dex.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{dex.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
