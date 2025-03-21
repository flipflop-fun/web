import { MyProfile } from "../components/social/MyProfile";
import { PageHeader } from "../components/common/PageHeader";
import { API_BASE_URI } from "../config/constants";

type SocialProfileProps = {
  expanded: boolean;
};

export const SocialProfile: React.FC<SocialProfileProps> = ({ expanded }) => {
  return (
    <div className={`space-y-3 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="My Profile" bgImage='/bg/group1/24.jpg' />
      <div>###### 
        {API_BASE_URI} ENV:
        {process.env.REACT_APP_ENV}
      </div>
      <MyProfile />
    </div>
  );
};