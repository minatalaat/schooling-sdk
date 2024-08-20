import { useTranslation } from 'react-i18next';

// import SaveIcon from '../../../assets/svgs/SaveIcon';
import CheckCircle from '../../../assets/svgs/CheckCircle';
// import DollarIcon from '../../../assets/images/quickActionsIcons/SaleInvoiceSVG';
import ReturncIcon from '../../../assets/svgs/ReturncIcon';
import DeleteIcon from '../../../assets/svgs/DeleteIcon';
import { AddIcon, EditIcon, SnapShotIcon, ViewIcon, ViewPDFIcon, CopyIcon } from '../actions/Actions';
import { MODES } from '../../../constants/enums/FeaturesModes';

export default function PrimaryButton({
  type,
  theme = 'primary',
  text,
  disabled,
  onClick,
  btnOptions = {},
  children,
  style,
  setIsOpen,
  icon = '',
  className = '',
  mode,
}) {
  const { t } = useTranslation();
  const icons = {
    // save: SaveIcon,
    edit: EditIcon,
    view: ViewIcon,
    print: ViewPDFIcon,
    snap: SnapShotIcon,
    copy: CopyIcon,
    check: CheckCircle,
    // dollar: DollarIcon,
    return: ReturncIcon,
    delete: DeleteIcon,
    add: AddIcon,
  };

  const themes = {
    primary: {
      className: 'new-btn new-btn-primary',
      text: 'LBL_SAVE',
    },
    secondary: {
      className: 'new-btn new-btn-secondary',
      text: 'LBL_SAVE',
    },
    tertiary: {
      className: 'new-btn new-btn-tertiary',
      text: 'LBL_CLOSE',
    },
    quaternary: {
      className: 'new-btn new-btn-quaternary',
      text: 'LBL_SAVE',
    },
    green: {
      className: 'btn btn-import ',
      text: 'LBL_IMPORT',
    },

    red: {
      className: 'btn cancel-btn',
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
      icon: 'add',
    },
    clickableIcon: {
      className: 'clickable-icon btn p-0',
    },
    clickableIconDanger: {
      className: 'clickable-icon-danger btn p-0',
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
      className: 'btn button-primary float-end',
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
    purpleAddEnd: {
      className: 'btn btn-add-tb float-end',
      text: 'LBL_ADD',
    },
    formAction: {
      className: 'new-btn btn-top-form-action',
    },
    export: {
      className: 'btn border-0 bg-transparent',
    },
    cardActionEnd: {
      className: 'new-btn new-btn-primary card-action-end',
      text: 'LBL_SAVE',
    },
    formFooterDanger: {
      className: 'new-btn new-btn-danger',
      text: 'LBL_CANCEL',
    },
  };

  if (!text && mode === MODES.ADD) text = 'LBL_CREATE';
  if (!text) text = themes[theme].text ?? '';

  const DisplayedIcon = themes[theme].icon ? icons[themes[theme].icon] : (icons[icon] ?? null);

  return (
    <button
      type={type ? type : 'button'}
      className={`${themes[theme].className} ${className}`}
      onClick={onClick}
      // onClick={onClick}
      disabled={disabled}
      {...btnOptions}
      style={style}
      onMouseEnter={setIsOpen ? () => setIsOpen(true) : () => {}}
    >
      {DisplayedIcon && <DisplayedIcon />}
      {children}
      <span className="btn-text">{t(text)}</span>
    </button>
  );
}
