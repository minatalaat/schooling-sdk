import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import NavbarMenu from './NavbarMenu';

import ToggleRight from '../../../../assets/images/toggel_right.svg';
import ToggleLeft from '../../../../assets/images/toggel_left.svg';
import Menu from '../../../../assets/images/con-menu-mobile.svg';
import DateIcon from '../../../../assets/images/Date-icon-header.svg';
import NotifiIcon from '../../../../assets/images/notf-icon-header.svg';
import Settings from '../../../../assets/images/Setting-icon-header.svg';
import DefaultProfile from '../../../../assets/images/user-photo.svg';
import MaleProfile from '../../../../assets/images/Saudi Male Avatar.jpg';
import FemaleProfile from '../../../../assets/images/Saudi Female avatar.jpg';
import ExpandDown from '../../../../assets/images/Expand-down-icon.svg';

import { useAxiosFunction } from '../../../../hooks/useAxios';
import { offCanvasActions } from '../../../../store/offCanvas';

function Navbar({ setShowSideMenu, setActive, toggle, setToggle, firstLogin, show, setShow }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { downloadDocumentWithFileId } = useAxiosFunction();
  const [logo, setLogo] = useState(DefaultProfile);
  let reader = new FileReader();
  let username = useSelector(state => state.userFeatures.userData.name);
  let userPartnerData = useSelector(state => state?.userFeatures?.userData?.partner);
  let companyMainData = useSelector(state => state?.userFeatures?.companyInfo?.mainData);

  reader.onloadstart = () => {
    setLogo(DefaultProfile);
  };

  reader.onloadend = () => {
    setLogo(reader.result);
  };

  const setUserProfileImgByGender = () => {
    if (userPartnerData?.titleSelect === 0) {
      setLogo(DefaultProfile);
    } else if (userPartnerData?.titleSelect === 1) {
      setLogo(MaleProfile);
    } else if (userPartnerData?.titleSelect === 2) {
      setLogo(FemaleProfile);
    } else {
      setLogo(DefaultProfile);
    }
  };

  useEffect(() => {
    if (userPartnerData?.img) {
      downloadDocumentWithFileId(
        userPartnerData?.img?.id,
        data => {
          if (!data) return;
          reader.readAsDataURL(data);
        },
        () => {
          return;
        }
      );
    } else if (companyMainData?.logo?.id) {
      downloadDocumentWithFileId(
        companyMainData?.logo?.id,
        data => {
          if (!data) {
            return setUserProfileImgByGender();
          }

          reader.readAsDataURL(data);
        },
        () => {
          return setUserProfileImgByGender();
        }
      );
    } else {
      setUserProfileImgByGender();
    }
  }, [userPartnerData, userPartnerData?.img, userPartnerData?.img?.id, userPartnerData?.titleSelect, companyMainData?.logo?.id]);

  return (
    <>
      <div className={`page-header ${toggle === false ? 'close_icon' : ''}`}>
        <div className="header-wrapper row m-0">
          <div className="nav-left col">
            <div className="header-logo-wrapper">
              {firstLogin !== 'true' && toggle && (
                <div className="toggle-sidebar desktop-menu-icon-open">
                  <i
                    className="status_toggle middle"
                    data-feather="grid"
                    onClick={() => {
                      setToggle(false);
                      setShowSideMenu(true);
                      setActive('');
                    }}
                  >
                    <img src={ToggleRight} alt={ToggleRight} />
                  </i>
                </div>
              )}
              {firstLogin !== 'true' && !toggle && (
                <div className="toggle-sidebar desktop-menu-icon-close">
                  <i
                    className="status_toggle middle"
                    data-feather="grid"
                    onClick={() => {
                      setToggle(true);
                      setShowSideMenu(false);
                      setActive('');
                    }}
                  >
                    <img src={ToggleLeft} alt={ToggleLeft} />
                  </i>
                </div>
              )}
              {/* { toggle && <div className="toggle-sidebar desktop-menu-icon-open"><i className="status_toggle middle" data-feather="grid" onClick={()=> {setToggle(false)}}><img src={ToggleRight} alt={ToggleRight} /></i></div>}
                                {!toggle && <div className="toggle-sidebar desktop-menu-icon-close"><i className="status_toggle middle" data-feather="grid"  onClick={()=> {setToggle(true)}}><img src={ToggleLeft} alt={ToggleLeft} /></i></div>} */}
              <div
                className="toggle-sidebar mobile-menu-icon"
                onClick={() => {
                  setToggle(false);
                  setShowSideMenu(true);
                  setActive('');
                }}
              >
                <i className="status_toggle middle sidebar-toggle" data-feather="grid">
                  <img src={Menu} alt={Menu} />
                </i>
              </div>
            </div>
          </div>
          <div className="nav-right col pull-right right-header p-0">
            <ul className="nav-menus">
              {firstLogin !== 'true' && (
                <li className="onhover-dropdown">
                  <div className="calender-box">
                    <img src={DateIcon} alt={DateIcon} />
                  </div>
                </li>
              )}

              {firstLogin !== 'true' && (
                <li className="onhover-dropdown">
                  <div
                    className="notification-box"
                    onClick={() => {
                      dispatch(offCanvasActions.open());
                    }}
                  >
                    <img src={NotifiIcon} alt={NotifiIcon} />
                  </div>
                </li>
              )}
              <li className="onhover-dropdown">
                <div className="setting-box">
                  <img src={Settings} alt={Settings} />
                </div>
              </li>

              <li className="profile-nav onhover-dropdown p-0 mr-0 step-profile">
                <div className="avatar">
                  <div className="dropdown" onClick={() => setShow(!show)}>
                    <Link
                      to={{
                        pathname: location.pathname,
                        search: location.search,
                      }}
                      className={show === true ? 'avatar avatar-sm p-0 show' : 'avatar avatar-sm p-0'}
                      id="profileDropdown"
                      role="button"
                      data-bs-auto-close="outside"
                      data-bs-display="static"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <img className="avatar-img rounded-circle" src={logo} alt="avatar" />
                      <div className="name" onClick={() => setShow(!show)}>
                        <p>{username}</p>
                        <img src={ExpandDown} alt={ExpandDown} />
                      </div>
                    </Link>
                    <NavbarMenu show={show} setShow={setShow} firstLogin={firstLogin} />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
