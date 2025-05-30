import { useEffect, useState } from "react";
import { ARSEEDING_GATEWAY_URL, ARWEAVE_GATEWAY_URL, NETWORK_CONFIGS, STORAGE } from "../../config/constants";
import { TokenHeroProps, TokenMetadataIPFS } from "../../types/types";
import { fetchImageFromUrlOrCache } from "../../utils/db";
import { addressToColor } from "../../utils/format";
import { ShareButton } from "../common/ShareButton";
import { RenderSocialIcons } from "../mintTokens/RenderSocialIcons";
import { TokenImage } from "../mintTokens/TokenImage";
import { SocialButtonsToken } from "../social/SocialButtonsToken";
import { useAuth } from "../../hooks/auth";

export const TokenHeroMobile: React.FC<TokenHeroProps> = ({
  token,
  metadata,
  referrerCode,
  tokenData,
  fetchTokenData,
  isCommentOpen,
  setIsCommentOpen,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [imageData, setImageData] = useState("");
  const { token: userToken } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    if (metadata?.header) {
      fetchImageFromUrlOrCache(metadata?.header, Number(token?.metadataTimestamp)).then((imageData) => {
        setImageData(imageData.blobUrl as string);
        setRetryCount(0);
      }).catch((error) => {
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
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
  }, [imageData, metadata?.header, retryCount, token?.metadataTimestamp]);

  const hasImage = () => {
    if (STORAGE === "arweave") return metadata && imageData !== "" && metadata?.header !== ARWEAVE_GATEWAY_URL + "/" && metadata?.header !== ARSEEDING_GATEWAY_URL + "/"
    else if (STORAGE === "irys") return metadata && imageData !== "" && metadata?.header !== NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"].irysGatewayUrl + "/"
    else return false
  }

  return (
    <div className="-ml-4 -mt-10 -mr-4 relative">
      {/* Background Image with Blur */}
      <div className="relative w-full aspect-[3/2] overflow-hidden">
        {hasImage() ? (
          <img
            src={imageData}
            alt="Token Header"
            className="w-full h-full object-cover blur-xs opacity-80"
            style={{ padding: 0 }}
          />
        ) : (
          <div
            className="w-full h-full blur-xs opacity-80"
            style={{ backgroundColor: addressToColor(token.mint as string) }}
          />
        )}
        {/* Optional: Add a subtle overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" /> */}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0">
        <div className="h-full flex flex-col justify-between">
          <div className="p-6 space-y-4">
            {/* Top Section */}
            <div className="flex items-start gap-4">
              {/* Token Image */}
              <div className="relative">
                <TokenImage
                  imageUrl={metadata?.image as string}
                  name={metadata?.name as string}
                  metadataTimestamp={Number(token.metadataTimestamp)}
                  size={72}
                  className="rounded-full ring-2 ring-white shadow-xl"
                />
              </div>

              {/* Token Basic Info */}
              <div className="flex space-x-4">
                <div>
                  <div className="badge badge-lg text-xl badge-secondary">
                    {metadata?.symbol}
                  </div>
                  <div className="text-white text-md mt-2 [text-shadow:2px_2px_0_#000000] bg-black/60 px-3 rounded-md">
                    {metadata?.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between">
              <RenderSocialIcons metadata={metadata as TokenMetadataIPFS} />
              <ShareButton token={token} metadata={metadata as TokenMetadataIPFS} inputCode={referrerCode} />
            </div>
          </div>
          {metadata?.description && (
            <div className='bg-black/60 px-3 py-2 w-full'>
              <p className="pixel-text text-white text-sm [text-shadow:2px_2px_0_#000000] line-clamp-4">
                {metadata?.description}
              </p>
            </div>
          )}

          <div className="bg-black/60 px-3 py-2 w-full">
            {tokenData && token && userToken && <SocialButtonsToken 
              tokenData={tokenData} 
              mint={token.mint as string} 
              isCommentOpen={isCommentOpen} 
              setIsCommentOpen={setIsCommentOpen} 
              fetchTokenData={fetchTokenData}
            />}
          </div>
        </div>
      </div>
    </div>
  );
};
