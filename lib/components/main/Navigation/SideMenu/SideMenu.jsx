import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import FirstIcon from '../../../../assets/images/1-icon.svg';

import { featuresEnum } from '../../../../constants/featuresEnum/featuresEnum';

function SideMenu({
  showSideMenu,
  active,
  setActive,
  setShowSideMenu,
  setToggle,
  currentActive,
  setCurrentActive,
  showMenu,
  setShowMenu,
  setShow,
}) {
  const location = useLocation();
  const { t } = useTranslation();

  let features = useSelector(state => state.userFeatures.userFeatures);

  const getInitialSearchParams = requiredFeature => {
    if (!requiredFeature.PARAMS?.search) return '';
    if (!requiredFeature.PARAMS?.pagination) return '';
    return '?currentPage=1&pageSize=10';
  };

  const Menu = ({ feature, index, specificPath }) => {
    const selectedFeature = features[index];

    return (
      <li className="sidebar-list">
        <Link
          className={
            active === feature.LABEL
              ? `sidebar-link sidebar-title link-nav active step-${feature.id}`
              : `sidebar-link sidebar-title link-nav step-${feature.id}`
          }
          to={
            specificPath
              ? {
                  pathname: specificPath,
                  search: location.search,
                }
              : {
                  pathname: location.pathname,
                  search: location.search,
                }
          }
          state={location.state}
          onClick={() => {
            if (active === feature.LABEL) return setShowMenu(!showMenu);
            setActive(feature.LABEL);
            setToggle(true);
            setShowMenu(true);
          }}
        >
          <img src={feature.ICON} alt={feature.ICON} />
          <span>{t(feature.LABEL)}</span>
        </Link>
        {showMenu &&
          active === feature.LABEL &&
          selectedFeature.subFeatureList &&
          selectedFeature.subFeatureList.map(item => {
            let currentSubFeature = {};

            Object.keys(featuresEnum).forEach(subFeature => {
              if (featuresEnum[subFeature].id === item.subFeatureCode) {
                currentSubFeature = featuresEnum[subFeature];
              }
            });
            return (
              <ul className="sidebar-submenu" key={item.subFeatureCode}>
                <>
                  {item && (
                    <li>
                      {currentSubFeature && currentSubFeature.PATH && !currentSubFeature.hideFromMenu && (
                        <Link
                          to={{ pathname: currentSubFeature.PATH, search: getInitialSearchParams(currentSubFeature) }}
                          className={
                            currentActive === item.subFeatureCode.toString()
                              ? `current-active sidebar-link sidebar-title text-capitalize step-${item.subFeatureCode
                                  .toString()
                                  .replace('.', '-')}`
                              : `sidebar-link sidebar-title text-capitalize step-${item.subFeatureCode.toString().replace('.', '-')}`
                          }
                          onClick={() => {
                            setShowSideMenu(false);
                            setToggle(true);
                            setCurrentActive(item.subFeatureCode.toString());
                            setShow(false);
                          }}
                        >
                          {t(currentSubFeature.LABEL)}
                        </Link>
                      )}
                    </li>
                  )}
                </>
              </ul>
            );
          })}
      </li>
    );
  };

  return (
    <>
      <div className={`sidebar-wrapper ${showSideMenu === true ? '' : 'close_icon'}`}>
        <div className="logo-wrapper">
          <div
            className="nav-back-btn"
            onClick={() => {
              setShowSideMenu(false);
              setToggle(true);
            }}
          >
            <i className="fa fa-angle-left"></i>
          </div>
        </div>
        <nav className="sidebar-main">
          <div className="left-arrow" id="left-arrow">
            <i data-feather="arrow-left"></i>
          </div>
          <div id="sidebar-menu">
            <ul className="sidebar-links custom-scrollbar">
              <li className="sidebar-list">
                <Link
                  className={
                    active === 'Home' ? 'sidebar-link sidebar-title link-nav active  step-0' : 'sidebar-link sidebar-title link-nav  step-0'
                  }
                  onClick={() => {
                    setShowSideMenu(false);
                    setToggle(true);
                    setActive('Home');
                    setShow(false);
                  }}
                  to="/home"
                >
                  <img src={FirstIcon} alt={FirstIcon} />
                  <span>{t('LBL_QUICK_ACTIONS')}</span>
                </Link>
              </li>
              {Object.keys(featuresEnum).map(feature => {
                const index = features.findIndex(f => f.featureCode === featuresEnum[feature].id);
                if (index === -1) return null;
                return <Menu feature={featuresEnum[feature]} key={`MENU-${feature}`} index={index} />;
              })}
              <li className="sidebar-list">
                <Link
                  className="sidebar-link sidebar-title link-nav  step-0"
                  onClick={() => {
                    window.open(import.meta.env.VITE_QAEMA_APP_DOMAIN, '_self', 'noopener,noreferrer');
                    window.close();
                  }}
                  to=""
                >
                  <img src={FirstIcon} alt={FirstIcon} />
                  <span>{t('GO_TO_QAEMA')}</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="right-arrow" id="right-arrow">
            <i data-feather="arrow-right"></i>
          </div>
        </nav>
      </div>
    </>
  );
}

export default SideMenu;
