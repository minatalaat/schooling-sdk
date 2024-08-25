import { useTranslation } from 'react-i18next';

export default function SaveButton({ className, text = 'LBL_SAVE', disabled, onClick, btnOptions = {}, children }) {
  const { t } = useTranslation();
  return (
    <button
      className={`btn btn-save ` + (className ?? '')}
      onClick={onClick}
      data-bs-toggle="modal"
      data-bs-target="#popup-1"
      disabled={disabled}
      {...btnOptions}
    >
      {children}
      {t(text)}
    </button>
  );
}
