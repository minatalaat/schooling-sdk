import { useTranslation } from 'react-i18next';

export default function BorderSection({ title, withBorder = true }) {
  const { t } = useTranslation();

  return (
    <>
      {withBorder && <div className="border-section"></div>}
      <div className="section-title">
        <h4>{t(title)}</h4>
      </div>
    </>
  );
}
