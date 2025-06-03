import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfileByWalletAddress, updateUserProfile, uploadAvatar } from '../../utils/user';
import { Role, User } from '../../types/types';
import toast from 'react-hot-toast';
import { AddressDisplay } from '../common/AddressDisplay';
import { FaTelegramPlane, FaDiscord, FaTwitter, FaGithub, FaFacebook, FaInternetExplorer } from "react-icons/fa";
import { API_BASE_URI } from '../../config/constants';
import { useAuth } from '../../hooks/auth';
import { useTranslation } from 'react-i18next';

export const socialNames = ['website', 'twitter', 'telegram', 'discord', 'github', 'facebook']
export const socialIcons = {
  github: <FaGithub className='w-5 h-5' />,
  twitter: <FaTwitter className='w-5 h-5' />,
  telegram: <FaTelegramPlane className='w-5 h-5' />,
  discord: <FaDiscord className='w-5 h-5' />,
  facebook: <FaFacebook className='w-5 h-5' />,
  website: <FaInternetExplorer className='w-5 h-5' />,
}

export const MyProfile: React.FC = () => {
  const { token, walletAddress, handleLogin, isLoggingIn } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    socialLinks: {} as Record<string, string>,
    roles: [] as string[],
    hides: [] as string[],
    avatarFile: null as File | null,
    avatarPreview: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const hideMap = {
    issuer: t('social.issuer'),
    promoter: t('social.promoter'),
    manager: t('social.manager')
  };

  const showPaticipants = (roles: string[]) => {
    let participants = [];
    for (let i = 0; i < roles.length; i++) {
      participants.push(
        hideMap[roles[i] as keyof typeof hideMap]
      );
    }
    return participants.join(', ');
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserProfileByWalletAddress(token as string, walletAddress as string);
      if(!result.success) {
        if (result.message === "Invalid token") {
          if (!isLoggingIn) handleLogin();
        }
        else toast.error(result.message as string);
        return;
      }
      const socialLinks = result.data.social_links ?
      Object.fromEntries(
        Object.entries(result.data.social_links).filter(([_, value]) => value !== "")
      ) as Record<string, string> : {};

      setUser({
        ...result.data,
        social_links: socialLinks,
      });

      const _formData = {
        username: result.data.username,
        email: result.data.email || '',
        bio: result.data.bio || '',
        socialLinks: socialLinks,
        roles: result.data.roles ? result.data.roles.split(',') : [],
        hides: result.data.hides ? result.data.hides.split(',') : [], // hide_deployment, hide_promotion, hide_valuemanage
        avatarFile: result.data.avatar ? new File([], result.data.avatar) : null,
        avatarPreview: result.data.avatar ? result.data.avatar : null,
      };
      setFormData(_formData);
    } catch (error: any) {
      toast.error("MyProfile.fetchUserData.2" + error.message as string);
    } finally {
      setLoading(false);
    }
  }, [handleLogin, isLoggingIn, token, walletAddress]);

  useEffect(() => {
    if (token && walletAddress) {
      fetchUserData();
    }
  }, [fetchUserData, token, walletAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarFile: file, avatarPreview: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      if (formData.avatarFile && formData.avatarFile.type !== '' && !formData.avatarFile?.name.startsWith(API_BASE_URI)) {
        const result = await uploadAvatar(token, formData.avatarFile as File);
        if (result.success) {
          console.log("avatar url: ", result.data.url);
        } else {
          if (result.message === "Invalid token") {
            if (!isLoggingIn) handleLogin();
          }
          else toast.error(result.message as string);
          return;
        }
      }

      if (formData.bio.length >= 200) {
        toast.error(t('social.bioTooLong'));
        return;
      }

      const result = await updateUserProfile(token, {
        username: formData.username,
        email: formData.email || null,
        bio: formData.bio || null,
        social_links: formData.socialLinks,
        roles: formData.roles.join(','),
        hides: formData.hides.join(','),
      });
      if(!result.success) {
        if (result.message === "Invalid token") {
          if (!isLoggingIn) handleLogin();
        }
        else toast.error(result.message as string);
        return;
      }
      if (formData.avatarPreview) {
        URL.revokeObjectURL(formData.avatarPreview);
      }
      await fetchUserData();
      setIsEditing(false);
    } catch (error) {
      toast.error(t('social.failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  
  if (loading && !user) {
    return <div className="text-center text-gray-400">{t('social.loading')}</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-400">{t('social.pleaseLoginToViewProfile')}</div>;
  }

  return (
    <div>
      {!token && (
        <div className="text-center mt-10">
          <p className="text-gray-300 mb-4">{t('social.pleaseLoginToViewFeed')}</p>
          {/* <p className="text-gray-300 mb-4">{USER_API_URL}</p> */}
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {t('common.connectWallet')}
          </button>
        </div>
      )}
      <div className="pixel-box">
        {/* User Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="">
            {user.avatar && !isEditing ? (
              <div className='w-16 h-16 rounded-full overflow-hidden flex items-center justify-center'>
                <img src={user.avatar} alt={t('social.avatar')} className="w-full h-full object-cover" onError={() => console.log(t('social.imageLoadFailed'))} />
              </div>
            ) : formData.avatarPreview ? (
              <div className='w-16 h-16 rounded-full overflow-hidden flex items-center justify-center'>
                <img src={formData.avatarPreview} alt={t('social.preview')} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center text-2xl">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl">{user.username}</h2>
            <div className="text-md"><AddressDisplay address={user.wallet_address} showCharacters={3} /></div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary btn-sm"
          >
            {isEditing ? t('common.cancel') : t('common.edit')}
          </button>
        </div>

        {/* Only read */}
        {!isEditing && (
          <div className="space-y-4">
            <div><span className="font-semibold">{t('social.email')}:</span> {user.email || t('social.notSet')}</div>
            <div><span className="font-semibold">{t('social.bio')}:</span> {user.bio || t('social.notSet')}</div>
            <div>
              <span className="font-semibold">{t('social.socialLinks')}:</span>
              {user.social_links && Object.keys(user.social_links).length > 0 ? (
                <ul className="list-disc pl-1 mt-2">
                  {Object.entries(user.social_links).map(([key, value]) => (
                    <li key={key} className='flex items-center space-x-3'>
                      <div>{socialIcons[key as keyof typeof socialIcons]}</div>
                      <a href={value as unknown as string} target='_blank' rel="noopener noreferrer" className="text-blue-400 hover:underline">{value}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                t('social.notSet')
              )}
            </div>
            <div><span className="font-semibold">{t('social.hide')}:</span> {user.hides ? showPaticipants(user.hides.split(',')) : t('social.notSet')}</div>
            <div><span className="font-semibold">{t('social.joinedAt')}:</span> {new Date(user.created_at).toLocaleString()}</div>
            {/* <p><span className="font-semibold">Updated:</span> {new Date(user.updated_at).toLocaleString()}</p> */}
          </div>
        )}

        {/* Edit mode */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">{t('social.avatar')}</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="w-full p-2 pixel-box"
              />
              {/* {formData.avatarFile && (
                <p className="text-gray-400 text-sm mt-1">Selected: {formData.avatarFile.name}</p>
              )} */}
            </div>
            <div>
              <label className="block text-sm font-semibold">{t('social.username')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input w-full mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">{t('social.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input w-full mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">{t('social.bio')}</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="input w-full mt-2 h-24 py-2 px-4"
                placeholder={t('placeholder.profileBio')}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">{t('social.hide')}</label>
              {[Role.ISSUER, Role.PROMOTER, Role.MANAGER].map((hide: string) => (
                <label key={hide} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hides.includes(hide)}
                    onChange={(e) => {
                      const updatedHides = e.target.checked
                        ? [...formData.hides, hide]
                        : formData.hides.filter((h) => h !== hide);
                      setFormData((prev) => ({...prev, hides: updatedHides }));
                    }}
                    className="text-blue-600"
                  />
                  <span>{t('social.notShow') + hideMap[hide as keyof typeof hideMap]}</span>
                </label>
              ))}
            </div>


            <div>
              <label className="block text-sm font-semibold">{t('social.socialLinks')}</label>
              {socialNames.map((key) => (
                <div key={key} className="flex items-center space-x-2 mt-2">
                  <div className="flex w-6 items-center gap-2">{socialIcons[key as keyof typeof socialIcons]}</div>
                  <div className="w-32">{key}</div>
                  <input
                    type="url"
                    value={formData.socialLinks[key] || ''}
                    onChange={(e) => handleSocialLinkChange(key, e.target.value)}
                    className="input w-full"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? t('common.save') + '...' : t('common.save')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};