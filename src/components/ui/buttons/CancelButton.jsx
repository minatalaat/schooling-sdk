import { useTranslation } from 'react-i18next';

export default function CancelButton({ onClick, text = 'LBL_CANCEL', disabled, btnOptions = {} }) {
  const { t } = useTranslation();

  return (
    <>
      <button
        className="btn cancel-btn"
        data-bs-toggle="modal"
        data-bs-target="#popup-1"
        onClick={onClick}
        disabled={disabled}
        {...btnOptions}
      >
        {t(text)}
      </button>
    </>
  );
}
