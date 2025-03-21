import React, { useState, useEffect } from 'react';
import { fetchImageFromUrlOrCache } from '../../utils/db';

export type TokenBackgroundImageProps = {
  imageUrl?: string;
  metadataTimestamp: number
};

export const TokenBackgroundImage: React.FC<TokenBackgroundImageProps> = ({
  imageUrl,
  metadataTimestamp,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [imageData, setImageData] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (imageUrl) {
      setIsLoading(true);
      fetchImageFromUrlOrCache(imageUrl, metadataTimestamp).then((imageData) => {
        // console.log('fetchImageFromUrlOrCache', imageData);
        setImageData(imageData.blobUrl as string);
        setIsLoading(false);
        setRetryCount(0);
      }).catch((error) => {
        setIsLoading(false);
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setIsLoading(true);
          }, backoffTime);
        }
      });
    }

    return () => {
      controller.abort();
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageData, imageUrl, metadataTimestamp, retryCount]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-base-100 rounded-full`} />
    );
  }

  return imageData !== "" ? (
    <div
      className="absolute inset-0 bg-cover bg-center opacity-30"
      style={{
        backgroundImage: `url(${imageData})`,
        filter: 'blur(2px)'
      }}
    />
  ) : null;
};