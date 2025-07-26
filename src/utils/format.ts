import { BN } from "@coral-xyz/anchor";
import { UTCTimestamp } from "lightweight-charts";
import { InitiazlizedTokenData, MintData, SetRefererCodeEntity, TokenListItem } from "../types/types";
import { BADGE_BG_COLORS, DEPRECATED_MINTS } from "../config/constants";

export const formatAddress = (address: string, showCharacters = 4): string => {
  if (!address) return '';
  return `${address.slice(0, showCharacters)}...${address.slice(-showCharacters)}`;
};

export const BN_LAMPORTS_PER_SOL = new BN(1000000000);
export const BN_ZERO = new BN(0);
export const BN_HUNDRED = new BN(100);
export const BN_MILLION = new BN(1000000);

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// Generate default username from wallet address
export const generateDefaultUsername = (address: string) => {
  if (!address || address.length < 8) return `user_${Date.now()}`;
  return `${address.substring(0, 4)}${address.substring(address.length - 4)}`;
};

export const formatSeconds = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return 'arrived';

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

export const getTimeRemaining = (startTimestamp: string) => {
  const diff = Number(startTimestamp) - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'arrived';
  return `Start in ${formatSeconds(diff)}`;
};

export const calculateMaxSupply = (epochesPerEra: string, initialTargetMintSizePerEpoch: string, reduceRatio: string): number => {
  const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
  const initialTargetMintSizePerEpochNum = numberStringToBN(initialTargetMintSizePerEpoch).div(BN_LAMPORTS_PER_SOL).toNumber();
  const reduceRatioNum = parseFloat(reduceRatio) / 100 || 0;

  if (epochesPerEraNum <= 0 || initialTargetMintSizePerEpochNum <= 0 || reduceRatioNum <= 0) {
    return 0;
  }

  return epochesPerEraNum * initialTargetMintSizePerEpochNum / (1 - reduceRatioNum);
};

export const getMintSpeed = (targetSecondsPerEpoch: string, initialTargetMintSizePerEpoch: string, initialMintSize: string) => {
  return Number(targetSecondsPerEpoch) / Number(initialTargetMintSizePerEpoch) * Number(initialMintSize);
}
export const getMintedSupply = (supply: string, liquidityTokensRatio: string) => {
  return numberStringToBN(supply).sub(numberStringToBN(supply).mul(numberStringToBN(liquidityTokensRatio)).div(BN_HUNDRED)).div(BN_LAMPORTS_PER_SOL).toNumber();
}

export const calculateTotalSupplyToTargetEras = (
  epochesPerEra: string,
  initialTargetMintSizePerEpoch: string,
  reduceRatio: string,
  targetEras: string
): number => {
  const reduceRatioNum = parseFloat(reduceRatio) / 100 || 0;
  const targetErasNum = parseFloat(targetEras) || 0;

  if (reduceRatioNum <= 0 || targetErasNum <= 0) {
    return 0;
  }

  const maxSupply = calculateMaxSupply(epochesPerEra, initialTargetMintSizePerEpoch, reduceRatio);
  const percentToTargetEras = 1 - Math.pow(reduceRatioNum, targetErasNum);
  const totalsupplyToTargetEras = percentToTargetEras * maxSupply;
  return totalsupplyToTargetEras;
};

export const calculateTargetMintTime = (
  targetSecondsPerEpoch: string,
  epochesPerEra: string,
  targetEras: string
): number => {
  const targetSecondsPerEpochNum = parseFloat(targetSecondsPerEpoch) || 0;
  const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
  const targetErasNum = parseFloat(targetEras) || 0;

  if (targetSecondsPerEpochNum <= 0 || epochesPerEraNum <= 0 || targetErasNum <= 0) {
    return 0;
  }

  return targetSecondsPerEpochNum * epochesPerEraNum * targetErasNum;
};

export const calculateMinTotalFee = (
  initialTargetMintSizePerEpoch: string,
  feeRate: string,
  targetEras: string,
  epochesPerEra: string,
  initialMintSize: string
): number => {
  const initialTargetMintSizePerEpochNum = numberStringToBN(initialTargetMintSizePerEpoch).div(BN_LAMPORTS_PER_SOL).toNumber();
  const feeRateNum = parseFloat(feeRate) || 0;
  const targetErasNum = parseFloat(targetEras) || 0;
  const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
  const initialMintSizeNum = numberStringToBN(initialMintSize).div(BN_LAMPORTS_PER_SOL).toNumber();

  if (initialTargetMintSizePerEpochNum <= 0 || feeRateNum <= 0 || targetErasNum <= 0 ||
    epochesPerEraNum <= 0 || initialMintSizeNum <= 0) {
    return 0;
  }

  return initialTargetMintSizePerEpochNum / initialMintSizeNum * feeRateNum * (targetErasNum * epochesPerEraNum + 1) / 1e9;
};

export const numberStringToBN = (decimalStr: string): BN => {
  return new BN(decimalStr.replace(/[,\s]/g, '').split('.')[0] || '0');
};

export const formatPrice = (price: number, digitalsAfterZero: number = 5): string => {
  if (price === 0) return '0';
  digitalsAfterZero = digitalsAfterZero - 1;
  const priceStr = price.toString();
  // If it is a scientific notation representation, first convert it to a normal number string
  if (priceStr.includes('e')) {
    const [base, exponent] = priceStr.split('e');
    const exp = parseInt(exponent);
    if (exp < 0) {
      // Handle numbers less than 1
      const absExp = Math.abs(exp);
      const baseNum = parseFloat(base);
      const fullNumber = baseNum.toFixed(absExp + digitalsAfterZero); // keep 5 digitals
      const zeroCount = fullNumber.slice(2, fullNumber.length - digitalsAfterZero).length - 1;
      if (zeroCount > 2) { // if 0.00012345 does not need to be formatted
        const result = `0.0{${zeroCount}}${(baseNum * Math.pow(10, digitalsAfterZero)).toFixed(0)}`;
        return result.replace(/\.?0+$/, '');
      }
      const result = parseFloat(fullNumber).toFixed(digitalsAfterZero);
      return result.replace(/\.?0+$/, '');
    }
  }

  // Handle normal decimal numbers
  const parts = priceStr.split('.');
  if (parts.length === 2) {
    const decimals = parts[1];
    let zeroCount = 0;
    for (const char of decimals) {
      if (char === '0') {
        zeroCount++;
      } else {
        break;
      }
    }
    if (zeroCount > 2) {
      const significantDigits = decimals.slice(zeroCount, zeroCount + digitalsAfterZero);
      return `0.{${zeroCount}}${significantDigits}`;
    }
  }

  // If not special processing, keep 5 digitals
  return price.toLocaleString(undefined, { minimumFractionDigits: digitalsAfterZero });
};

export const processRawData = (data: MintData[], feeRate: number) => {
  if (!data || data.length === 0) return [];

  // Sort by timestamp
  const sortedData = [...data].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

  // Group by minute
  const minuteData = new Map<number, {
    prices: number[];
    volumes: number[];
    timestamp: number;
  }>();

  // Iterate through all data points, group by minute
  sortedData.forEach(item => {
    const timestamp = parseInt(item.timestamp);
    const mintSize = parseFloat(item.mintSizeEpoch);
    const price = feeRate / mintSize;

    // Convert timestamp to minute level (remove seconds)
    const minuteTimestamp = Math.floor(timestamp / 60) * 60;

    if (!minuteData.has(minuteTimestamp)) {
      minuteData.set(minuteTimestamp, {
        prices: [],
        volumes: [],
        timestamp: minuteTimestamp
      });
    }

    const minute = minuteData.get(minuteTimestamp)!;
    minute.prices.push(price);
    minute.volumes.push(mintSize / 1000000000); // Convert to standard units
  });

  // Convert to K-line data
  return Array.from(minuteData.values()).map(minute => {
    const prices = minute.prices;
    const volumes = minute.volumes;

    return {
      time: minute.timestamp as UTCTimestamp,
      open: prices[0], // This minute's first price
      high: Math.max(...prices), // Highest price in this minute
      low: Math.min(...prices), // Lowest price in this minute
      close: prices[prices.length - 1], // This minute's last price
      volume: volumes.reduce((a, b) => a + b, 0) // Total volume
    };
  });
};

export function getFeeValue(
  feeRate: BN,
  difficultyCoefficient: number,
  referrerAtaBalance: BN,
  totalSupply: BN
): [BN, BN] {
  // For special processing in BN, we scale by 1000000
  const SCALE = BN_MILLION; // new BN(1000000);

  // Calculate balance ratio with scale
  // console.log("referrerAtaBalance:", referrerAtaBalance.toString());
  // console.log("totalSupply:", totalSupply.toString());
  const balanceRatioScaled = totalSupply.gt(new BN(0)) ? referrerAtaBalance.mul(SCALE).div(totalSupply) : new BN(0);
  const balanceRatio = balanceRatioScaled.toNumber() / SCALE.toNumber();
  // console.log("balance_ratio:", balanceRatio);

  // Determine discount rate and convert to scaled BN
  let discountRateScaled: BN;
  if (balanceRatio >= 0.01) {
    discountRateScaled = new BN(250000); // 0.25 * SCALE
  } else if (balanceRatio >= 0.008) {
    discountRateScaled = new BN(200000); // 0.20 * SCALE
  } else if (balanceRatio >= 0.006) {
    discountRateScaled = new BN(150000); // 0.15 * SCALE
  } else if (balanceRatio >= 0.004) {
    discountRateScaled = new BN(100000); // 0.10 * SCALE
  } else if (balanceRatio >= 0.002) {
    discountRateScaled = new BN(50000);  // 0.05 * SCALE
  } else {
    discountRateScaled = new BN(0);
  }
  // const discountRate = discountRateScaled.toNumber() / SCALE.toNumber();
  // console.log("discount_rate:", discountRate);

  // Convert difficultyCoefficient to scaled BN
  const difficultyScaled = new BN(Math.floor(difficultyCoefficient * SCALE.toNumber()));

  // Calculate fee: feeRate * (1 + discountRate/difficultyCoefficient - discountRate)
  const one = SCALE;
  const discountByDifficulty = discountRateScaled.mul(SCALE).div(difficultyScaled);
  const scaledMultiplier = one.add(discountByDifficulty).sub(discountRateScaled);
  const fee = feeRate.mul(scaledMultiplier).div(SCALE);

  // console.log(
  //   "fee:",
  //   `${1} + ${discountRate} / ${difficultyCoefficient} - ${discountRate} = ${fee.toString()}`
  // );

  // Calculate code sharer reward: 0.2 * feeRate * discountRate * (1 - 1/difficultyCoefficient)
  const rewardBase = new BN(200000); // 0.2 * SCALE
  const difficultyFactor = SCALE.sub(SCALE.mul(SCALE).div(difficultyScaled));
  const rewardMultiplier = rewardBase.mul(discountRateScaled).mul(difficultyFactor);
  const codeSharerReward = feeRate.mul(rewardMultiplier).div(SCALE.mul(SCALE).mul(SCALE));

  return [fee, codeSharerReward];
}

export const addressToNumber = (address: string, maxNumber: number): number => {
  // Convert address to number array
  const numbers = address.split('').map(char => char.charCodeAt(0));

  // Sum all numbers
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);

  // Use modulo to get a number between 0-99, then add 1 to get 1-100
  return (sum % maxNumber) + 1;
};

export const addressToColor = (address: string): string => {
  const number = addressToNumber(address, BADGE_BG_COLORS.length);
  const colors = BADGE_BG_COLORS[number - 1];
  return colors;
};

// Filter out deprecated tokens
export const filterTokens = (data: InitiazlizedTokenData[]) => {
  if (!data) return [];
  return data.filter(
    (token: InitiazlizedTokenData) => !DEPRECATED_MINTS.includes(token.mint)
  );
};


export const filterTokenListItem = (data: TokenListItem[]) => {
  if (!data) return [];
  return data.filter(
    (token: TokenListItem) => !DEPRECATED_MINTS.includes(token.mint)
  );
};

export const filterRefererCode = (data: SetRefererCodeEntity[]):SetRefererCodeEntity[] => {
  if (!data) return [];
  return data.filter(
    (code: SetRefererCodeEntity) => !DEPRECATED_MINTS.includes(code.mint)
  );
};

export const formatLargeNumber = (num: number): string => {
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;

  if (num >= billion) {
    return (num / billion).toFixed(1) + 'B';
  } else if (num >= million) {
    return (num / million).toFixed(1) + 'M';
  } else if (num >= thousand) {
    return (num / thousand).toFixed(1) + 'K';
  }
  return num.toString();
};

export const isImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};

export const parseAnchorError = (logs: string[]): string => {
  if (!logs || logs.length === 0) return 'Transaction failed';
  
  // Look for specific error patterns in logs
  for (const log of logs) {
    if (log.includes('Program log: Error:')) {
      return log.split('Program log: Error:')[1].trim();
    }
    if (log.includes('Program failed to complete')) {
      return 'Program execution failed';
    }
    if (log.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (log.includes('Account does not exist')) {
      return 'Required account does not exist';
    }
  }
  
  return logs[logs.length - 1] || 'Transaction failed';
};

export const compressImage = (file: File, maxSize: number = 1048576): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Check if canvas context is supported
    if (!ctx) {
      reject(new Error('Canvas context not supported'));
      return;
    }

    // Create URL from file
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      // Release URL object
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;
      let quality = 0.9; // Initial JPEG quality
      const targetSize = maxSize; // Target size: 1MB = 1048576 bytes
      const scaleFactor = 0.9; // Scale factor for resizing

      const tryCompress = () => {
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        ctx!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If size is under target or minimum limits reached, resolve with compressed file
            if (blob.size <= targetSize || (width < 100 && quality <= 0.1)) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified,
              });
              resolve(compressedFile);
            } else {
              // If size still exceeds target, reduce quality first
              if (quality > 0.1) {
                quality -= 0.1;
                ctx!.clearRect(0, 0, canvas.width, canvas.height);
                ctx!.drawImage(img, 0, 0, width, height);
                tryCompress();
              } else {
                // If quality is at minimum, reduce dimensions and reset quality
                quality = 0.9;
                width = Math.floor(width * scaleFactor);
                height = Math.floor(height * scaleFactor);
                canvas.width = width;
                canvas.height = height;
                ctx!.clearRect(0, 0, canvas.width, canvas.height);
                ctx!.drawImage(img, 0, 0, width, height);
                tryCompress();
              }
            }
          },
          file.type,
          quality
        );
      };

      // Start compression
      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
  });
};