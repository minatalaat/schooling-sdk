import { useTranslation } from 'react-i18next';

export default function PrimaryButton({
  type,
  className,
  theme = 'blue',
  text,
  disabled,
  onClick,
  btnOptions = {},
  children,
  title,
  style,
  setIsOpen,
}) {
  const { t } = useTranslation();
  const themes = {
    blue: {
      className: 'btn btn-save ',
      text: 'LBL_SAVE',
    },
    green: {
      className: 'btn btn-import ',
      text: 'LBL_IMPORT',
    },
    purple: {
      className: 'btn add-btn ',
      text: 'LBL_SAVE',
    },
    white: {
      className: 'btn cancel-act ',
      text: 'LBL_CLOSE',
    },
    red: {
      className: 'btn cancel-btn ',
      text: 'LBL_CANCEL',
    },
    borderedWhite: {
      className: 'btn btn-border-color ',
      text: 'LBL_AUTO_RECONCILE',
    },
    blueConnect: {
      className: 'btn con-btn ',
      text: 'LBL_CONNECT_ANOTHER_ACCOUNT',
    },
    whiteNoBg: {
      className: 'btn back-btn ',
      text: 'LBL_BACK',
    },
    purpleWithIcon: {
      className: 'btn addbtn-action ',
      text: 'LBL_ADD',
      iconClassName: 'add-icon',
    },
    clickableIcon: {
      className: 'clickable btn ',
    },
    whiteOutsideCard: {
      className: 'btn back ',
      text: 'LBL_BACK',
    },
    blueOutsideCard: {
      className: 'btn next ',
      text: 'LBL_CONTINUE',
    },
    activeTab: {
      className: 'nav-link active',
      text: 'LBL_CURRENT',
    },
    inactiveTab: {
      className: 'nav-link',
      text: 'LBL_CURRENT',
    },
    confirmationPopup: {
      className: 'btn btn-primary close',
      text: 'LBL_CLOSE_OB',
    },
    dashboardChart: {
      className: 'add-invoive-btn float-end btn',
      text: 'NEW_INVOICE',
    },
    submitBlue: {
      className: 'btn btn-primary btn-block btn-lg',
      text: 'LBL_SUBMIT',
    },
    lightPurple: {
      className: 'btn sync-btn',
      text: 'INTEGRATIONS.LBL_SYNC_NOW',
    },
    blueInCard: {
      className: 'btn btn-req btn-w-100',
    },
    redInCard: {
      className: 'btn btn-cancel btn-w-100',
      text: 'LBL_CANCEL',
    },
    redModal: {
      className: 'btn btn-primary delete-act',
      text: 'LBL_CANCEL',
    },
    blueModal: {
      className: 'btn btn-primary cancel-act',
      text: 'LBL_CONFIRM',
    },
  };

  if (!text) text = themes[theme].text || '';
  return (
    <button
      type={type ? type : 'button'}
      title={title} //add title fot tooltip
      className={themes[theme]?.className + (className ?? '')}
      onClick={onClick}
      disabled={disabled}
      {...btnOptions}
      style={style}
      onMouseEnter={setIsOpen ? () => setIsOpen(true) : () => {}}
    >
      {themes[theme]?.iconClassName && <i className={themes[theme]?.iconClassName}></i>}
      {children}
      {t(text)}
    </button>
  );
}
