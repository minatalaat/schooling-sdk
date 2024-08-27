import { useTranslation } from 'react-i18next';

export default function CreateNewButton({ label, onClick }) {
  const { t } = useTranslation();

  return (
    <div className="section-create-new float-end" onClick={onClick}>
      <a className="d-flex align-items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
          <path
            d="M9.99999 4.36667V16.0333M4.16666 10.2H15.8333"
            stroke="#4027CD"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text">{t(label)}</div>
      </a>
    </div>
  );
}
