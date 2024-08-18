import React from 'react';
import { useTranslation } from 'react-i18next';

const CloseButton = ({ onClick, text = 'LBL_CLOSE', disabled, btnOptions = {} }) => {
  const { t } = useTranslation();
  return (
    <>
      <button
        type="button"
        className="btn cancel-act"
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
};

export default CloseButton;
