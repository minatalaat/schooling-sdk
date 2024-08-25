import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import i18n from 'i18next';

import NavbarMenuItem from './NavbarMenuItem';

import { setItem } from '../../../../utils/localStorage';
import { useAuthServices } from '../../../../services/apis/useAuthServices';
import { confirmationPopupActions } from '../../../../store/confirmationPopup';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { getActionUrl } from '../../../../services/getUrl';
import { MODELS } from '../../../../constants/models';

const NavbarMenu = ({ show, setShow }) => {
  const dispatch = useDispatch();

  const { api } = useAxiosFunction();
  const location = useLocation();
  const { logoutService } = useAuthServices();
  const menuRef = useRef(null);

  let userProfile = useSelector(state => state.userFeatures.userData);
  let userId = userProfile?.id ? userProfile.id : -1;

  const onChangeLanguageClick = () => {
    const onConfirmHandler = async () => {
      let newLanguage = i18n.language === 'en' ? 'ar' : 'en';
      setItem('code', newLanguage);
      await updateMyLanguage(newLanguage);
      window.location.reload(true);
    };

    dispatch(confirmationPopupActions.openPopup({ message: 'LBL_DATA_WILL_REMOVE', onConfirmHandler }));
    setShow(false);
  };

  const updateMyLanguage = async newLanguage => {
    let createUserPayload = {
      action: MODELS.UPDATEMYPROFILE,
      data: {
        context: {
          id: userId,
          language: newLanguage,
        },
      },
    };
    await api('POST', getActionUrl(), createUserPayload);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShow(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ul
      className={
        show === true
          ? 'dropdown-menu dropdown-animation dropdown-menu-end show step-nav-open'
          : 'dropdown-menu dropdown-animation dropdown-menu-end'
      }
      aria-labelledby="profileDropdown"
      ref={menuRef}
    >
      <NavbarMenuItem
        onClick={onChangeLanguageClick}
        path={{
          pathname: location.pathname,
          search: location.search,
        }}
        label="LBL_OTHER_LANGUAGE"
        iconClass="fi fi-rr-subtitles"
      />
      <NavbarMenuItem onClick={logoutService} path="/login" label="LOGOUT" iconClass="fi fi-rr-sign-out" />
    </ul>
  );
};

export default NavbarMenu;
