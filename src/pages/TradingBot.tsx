import { FC } from "react"
import { PageHeader } from "../components/common/PageHeader"
import { useTranslation } from "react-i18next";

type TradingBotProps = {
  expanded: boolean;
}

export const TradingBot: FC<TradingBotProps> = ({
  expanded
}) => {
  const { t } = useTranslation();
  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Trading Bot" bgImage='/bg/group1/8.jpg' />
      <p>{t('common.underConstruction')}</p>
    </div>
  )
}