import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function BackButton({ text = 'LBL_BACK', disabled = false, backPath = -1, fallbackPath = '/home', btnOptions = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleClick = () => {
    if (location.key !== 'default') return navigate(backPath);
    return navigate(fallbackPath);
  };

  return (
    <button className="btn cancel-btn" onClick={handleClick} disabled={disabled} {...btnOptions}>
      {t(text)}
    </button>
  );
}
