import { useTranslation } from 'react-i18next';

export default function AddButton({ className, text, disabled, onClick, btnOptions = {} }) {
  const { t } = useTranslation();
  return (
    <button
      className={`btn addbtn-action ` + (className ?? '')}
      onClick={onClick}
      data-bs-toggle="modal"
      data-bs-target="#popup-1"
      disabled={disabled}
      {...btnOptions}
    >
      <i className="add-icon"></i>
      {t(text)}
    </button>
  );
}
