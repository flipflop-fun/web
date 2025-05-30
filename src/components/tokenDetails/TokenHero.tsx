import { useEffect, useState } from "react";
import { ARSEEDING_GATEWAY_URL, ARWEAVE_GATEWAY_URL, NETWORK_CONFIGS, STORAGE } from "../../config/constants";
import { TokenHeroProps, TokenMetadataIPFS } from "../../types/types";
import { addressToColor } from "../../utils/format";
import { ShareButton } from "../common/ShareButton";
import { RenderSocialIcons } from "../mintTokens/RenderSocialIcons";
import { TokenImage } from "../mintTokens/TokenImage";
import { fetchImageFromUrlOrCache } from "../../utils/db";
import { SocialButtonsToken } from "../social/SocialButtonsToken";
import { useAuth } from "../../hooks/auth";

export const TokenHero: React.FC<TokenHeroProps> = ({
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
    <div className="w-full relative">
      {/* Background Image */}
      {hasImage()
        ? (
          <img
            src={imageData}
            alt="Token Header"
            className="pixel-box w-full h-auto aspect-[3/1] object-cover"
            style={{ padding: 0 }}
          />
        ) : (
          <div className="pixel-box w-full aspect-[3/1]" style={{ backgroundColor: addressToColor(token.mint as string) }} />
        )}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-6 items-end">
        {/* Token Image */}
        <div className="w-24 h-24 relative">
          <TokenImage
            imageUrl={metadata?.image as string}
            name={metadata?.name as string}
            metadataTimestamp={Number(token.metadataTimestamp)}
            size={96}
            className="rounded-full ring-4 ring-white shadow-xl" />
        </div>

        {/* Token Info with enhanced text shadows */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className='flex'>
              <div className="badge badge-lg text-2xl badge-secondary">
                {metadata?.symbol}
              </div>
              <p className="ml-3 text-white text-2xl [text-shadow:2px_2px_0_#000000]">
                {metadata?.name}
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <RenderSocialIcons metadata={metadata as TokenMetadataIPFS} />
            <ShareButton token={token} metadata={metadata as TokenMetadataIPFS} inputCode={referrerCode} />
          </div>
          {metadata?.description && (
            <div className='bg-black/60 rounded-lg px-3 py-2 mt-2'>
              <p className="pixel-text mt-1 text-white text-lg [text-shadow:2px_2px_0_#000000]">
                {metadata?.description}
              </p>
            </div>)}
            <div className="bg-black/60 px-3 py-2 w-full mt-3">
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