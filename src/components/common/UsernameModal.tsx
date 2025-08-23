import React, { useState, useEffect } from 'react';
import { ModalTopBar } from './ModalTopBar';
import { useTranslation } from 'react-i18next';
import { TERMS_OF_SERVICE } from '../../config/termsOfService';
import ReactMarkdown from 'react-markdown';

type UsernameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  defaultUsername: string;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultUsername
}) => {
  const [username, setUsername] = useState(defaultUsername);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { t } = useTranslation();
  
  // Reset username and terms agreement when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername(defaultUsername);
      setAgreedToTerms(false);
    }
  }, [isOpen, defaultUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreedToTerms) {
      onSubmit(username);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box relative p-3">
        <ModalTopBar title={t('social.setUsername')} onClose={onClose} />
        <div className="space-y-4 p-2">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder={t('placeholder.enterYourUsername')}
                autoFocus
                required
              />
            </div>
            <div className="text-sm mb-3">
              {t('social.setUsernameDescription')}
            </div>
            
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">
                {t('common.termsOfService')}
              </label>
              <div className="pixel-textarea w-full h-32 text-xs overflow-y-auto p-3 bg-base-200 border border-base-300 rounded">
                <ReactMarkdown 
                  // className="prose prose-sm max-w-none"
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                    p: ({children}) => <p className="mb-2 text-xs leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 text-xs">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-xs">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                    code: ({children}) => <code className="bg-base-300 px-1 py-0.5 rounded text-xs">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-2 border-primary pl-2 italic text-xs">{children}</blockquote>
                  }}
                >
                  {TERMS_OF_SERVICE}
                </ReactMarkdown>
              </div>
              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="checkbox checkbox-primary mr-2"
                />
                <label htmlFor="agreeTerms" className="text-sm cursor-pointer">
                  {t('common.agreeToTerms')}
                </label>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className={`btn btn-primary ${!agreedToTerms ? 'btn-disabled' : ''}`}
                disabled={!agreedToTerms}
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
