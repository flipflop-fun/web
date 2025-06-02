import { MyProfile } from "../components/social/MyProfile";
import { PageHeader } from "../components/common/PageHeader";
import { useTranslation } from "react-i18next";

type SocialProfileProps = {
  expanded: boolean;
};

export const SocialProfile: React.FC<SocialProfileProps> = ({ expanded }) => {
  const { t } = useTranslation();
  return (
    <div className={`space-y-3 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title={t('menu.socialProfile')} bgImage='/bg/group1/24.jpg' />
      <MyProfile />
    </div>
  );
};