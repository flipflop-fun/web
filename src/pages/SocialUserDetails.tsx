import { FC, useCallback, useEffect, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { useParams } from "react-router-dom";
import { InitiazlizedTokenData, OrderedUser, Role } from "../types/types";
import { DEFAULT_IMAGE, NETWORK_CONFIGS } from "../config/constants";
import { AddressDisplay } from "../components/common/AddressDisplay";
import { socialIcons } from "../components/social/MyProfile";
import { generateDefaultUsername } from "../utils/format";
import { getSearchByKey} from "../utils/user";
import { useDeviceType } from "../hooks/device";
import { mergeUserData } from "./SocialExplore";
import { CommentBox } from "../components/social/CommentBox";
import { queryInitializeTokenEventByMints, queryMyDelegatedTokens, queryMyDeployments, querySetRefererCodeEntitiesByOwner } from "../utils/graphql2";
import { TokenCardSimple } from "../components/mintTokens/TokenCardSimple";
import { TokenCardWeb } from "../components/mintTokens/TokenCardWeb";
import { SocialButtonsUser } from "../components/social/SocialButtonsUser";
import { FaAngleDoubleDown } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/auth";
import { useTranslation } from "react-i18next";
import { runGraphQuery } from "../hooks/graphquery";

type SocialUserDetailsProps = {
  expanded: boolean;
};

export const SocialUserDetails: FC<SocialUserDetailsProps> = ({ expanded }) => {
  const [user, setUser] = useState<OrderedUser | null>(null);
  const { token, isLoggingIn, handleLogin } = useAuth();
  const { address } = useParams();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { isMobile } = useDeviceType();
  const [tokensByAdmin, setTokensByAdmin] = useState<InitiazlizedTokenData[]>([]);
  const [tokensByValueManager, setTokensByValueManager] = useState<InitiazlizedTokenData[]>([]);
  const [tokensByPromoter, setTokensByPromoter] = useState<InitiazlizedTokenData[]>([]);
  const { t } = useTranslation();
  const subgraphUrl = NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"].subgraphUrl2;
  
  const titles = {
    "issuer": t('social.launchedTokensList'),
    "promoter": t('social.promotedTokensList'),
    "manager": t('social.managedTokensList'),
  }

  const fetchUserData = useCallback(async () => {
    const result = await getSearchByKey(token as string, address as string);
    if (!result.success) {
      if (result.message === "Invalid token") {
        if (!isLoggingIn) handleLogin();
      }
      else toast.error(result.message as string);
      return;
    }
    const users = mergeUserData(result.data as OrderedUser[]);
    setUser(users[0] as OrderedUser);
  }, [address, handleLogin, isLoggingIn, token]);

  const fetchTokens = useCallback(async () => {
    if (!user) return;
    const roles = (user?.role as Role[]);
    for (const role of roles) {
      if (user?.hides.includes(role)) continue;

      if (role === Role.ISSUER && tokensByAdmin.length === 0) {
        const data = await runGraphQuery(
          subgraphUrl,
          queryMyDeployments,
          { wallet: user?.admin, offset: 0, first: 100 }
        );
        if (data?.allInitializeTokenEventEntities?.nodes) {
          setTokensByAdmin(data.allInitializeTokenEventEntities.nodes as InitiazlizedTokenData[]);
        }
      } else if (role === Role.PROMOTER && tokensByPromoter.length === 0) {
        const refData = await runGraphQuery(
          subgraphUrl,
          querySetRefererCodeEntitiesByOwner,
          { owner: user?.admin, offset: 0, first: 100 }
        );
        const refNodes = refData?.allSetRefererCodeEventEntities?.nodes || [];
        const mints: string[] = refNodes.map((n: any) => n.mint).filter(Boolean);
        if (mints.length > 0) {
          const mintData = await runGraphQuery(
            subgraphUrl,
            queryInitializeTokenEventByMints,
            { mints, offset: 0, first: mints.length }
          );
          if (mintData?.allInitializeTokenEventEntities?.nodes) {
            setTokensByPromoter(mintData.allInitializeTokenEventEntities.nodes as InitiazlizedTokenData[]);
          }
        } else {
          setTokensByPromoter([]);
        }
      } else if (role === Role.MANAGER && tokensByValueManager.length === 0) {
        const data = await runGraphQuery(
          subgraphUrl,
          queryMyDelegatedTokens,
          { wallet: user?.admin, offset: 0, first: 100 }
        );
        if (data?.allInitializeTokenEventEntities?.nodes) {
          setTokensByValueManager(data.allInitializeTokenEventEntities.nodes as InitiazlizedTokenData[]);
        }
      }
    }
  }, [user, tokensByAdmin.length, tokensByPromoter.length, tokensByValueManager.length, subgraphUrl]);

  useEffect(() => {
    if (address && token) fetchUserData();
  }, [address, fetchUserData, token]);

  useEffect(() => {
    if (user) fetchTokens();
  }, [user]);

  if (!user) {
    return (
      <div className={`space-y-3 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <PageHeader title={t('socialUserDetails.userDetails')} bgImage="/bg/group1/22.jpg" />
        <p className="text-gray-400">{t('socialUserDetails.userNotFound')}</p>
      </div>
    );
  }

  const roles = Array.isArray(user.role) ? user.role : [user.role];
  const socialLinks = user.socialLinks ? user.socialLinks : {};

  // const handleCopy = () => {
  //   navigator.clipboard.writeText(token as string);
  // };

  return (
    <div className={`space-y-4 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <div
        className="pixel-box flex flex-col items-center space-y-3"
        style={{
          backgroundImage: `url(${user.avatar || DEFAULT_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          className="absolute inset-0 bg-white/60 backdrop-filter backdrop-blur-md"
          style={{ zIndex: 0 }}
        ></div>

        <div className="relative flex flex-col items-center space-y-3">
          <img
            src={user.avatar || DEFAULT_IMAGE}
            alt={user.username || 'User'}
            className="pixel-avatar-round w-32 h-32"
          />
          <div className="text-center">
            <h2 className="text-xl font-bold">{user.username || generateDefaultUsername(user.admin)}</h2>
            <div className="flex justify-center">
              <AddressDisplay address={user.admin} />
            </div>
            {user.bio && <p className="text-sm mt-1 p-3">{user.bio}</p>}
          </div>

          {token && 
          <SocialButtonsUser 
            user={user} 
            isCommentOpen={false} 
            setIsCommentOpen={setIsCommentOpen} 
            fetchUserData={fetchUserData}
          />}

          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="flex justify-center gap-3">
              {Object.entries(socialLinks).map(([key, value]) => (
                <div key={key} className='flex items-center space-x-5'>
                  <a href={value as unknown as string} target='_blank' rel="noopener noreferrer" className="hover:underline">
                    <div>{socialIcons[key as keyof typeof socialIcons]}</div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role and Token */}
      <div className="space-y-2">
        {roles.map((role, index) => (
          <div key={index} className="">
            {((tokensByAdmin.length > 0 && role === Role.ISSUER) || 
             (tokensByValueManager.length > 0  && role === Role.MANAGER) || 
             (tokensByPromoter.length > 0 && role === Role.PROMOTER)) &&
            <div className="flex font-semibold mb-2 ml-2">
              <div>{titles[role]}</div>
              <FaAngleDoubleDown className="mt-1 ml-1"/>
            </div>}
            {tokensByAdmin.length > 0 && role === Role.ISSUER && 
              (isMobile ? (
                <div className="grid grid-cols-2 gap-4 p-1">
                  {tokensByAdmin.map((tokenData: InitiazlizedTokenData, index: number) =>
                    <TokenCardSimple key={index} token={tokenData} number={index + 1} type="static" />
                  )}
                </div> 
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {tokensByAdmin.map((tokenData: InitiazlizedTokenData, index: number) =>
                    <TokenCardWeb key={index} token={tokenData} number={index + 1} type="static" />
                  )}
                </div>
              ))}

              {tokensByValueManager.length > 0 && role === Role.MANAGER && 
              (isMobile ? (
                <div className="grid grid-cols-2 gap-4 p-1">
                  {tokensByValueManager.map((tokenData: InitiazlizedTokenData, index: number) =>
                    <TokenCardSimple key={index} token={tokenData} number={index + 1} type="static" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {tokensByValueManager.map((tokenData: InitiazlizedTokenData, index: number) =>
                    <TokenCardWeb key={index} token={tokenData} number={index + 1} type="static" />
                  )}
                </div>
              ))}

              {tokensByPromoter.length > 0 && role === Role.PROMOTER && 
              (isMobile ? (
                <div className="grid grid-cols-2 gap-4 p-1">
                  {tokensByPromoter.map((tokenData: InitiazlizedTokenData, index: number) =>
                    <TokenCardSimple key={index} token={tokenData} number={index + 1} type="static" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {tokensByPromoter.map((tokenData: InitiazlizedTokenData, index: number) =>
                    <TokenCardWeb key={index} token={tokenData} number={index + 1} type="static" />
                  )}
                </div>
              ))}

          </div>
        ))}
      </div>

      {/* Comments */}
      {isCommentOpen && token && user && 
        <div className="">
          <CommentBox 
            setIsOpen={(bl) => setIsCommentOpen(bl)} 
            token={token as string} 
            orderedData={user as OrderedUser}
            type={'user'}
            expanded={expanded}
          />
        </div>}
    </div>
  );
};