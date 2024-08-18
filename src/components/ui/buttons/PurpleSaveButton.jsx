import { useTranslation } from 'react-i18next';

export default function PurpleSaveButton({ onClick, text = 'LBL_SAVE', disabled, btnOptions = {} }) {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        className="btn add-btn"
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
