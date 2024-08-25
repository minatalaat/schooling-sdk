import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import logo from '../../assets/images/logo/Logo-header.svg';

const RedirectingScreen = () => {
  const { t } = useTranslation();
  const { redirect } = useSelector(state => state.auth);

  return (
    <div className="redirection-screen">
      <img src={logo} alt="Logo" />
      <div className="redirecting-text">
        <p>{t(redirect?.text)}</p>
      </div>
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default RedirectingScreen;
