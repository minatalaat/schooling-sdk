import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import QuickActionsCardWithSkeleton from '../components/ui/skeletons/QuickActionsCardWithSkeleton';

import { featuresEnum } from '../constants/featuresEnum/featuresEnum';
import { useAxiosFunction } from '../hooks/useAxios';
import { alertsActions } from '../store/alerts';
import { useFeatures } from '../hooks/useFeatures';

function Landing() {
  const actionEnum = {
    view: '1',
    add: '2',
    edit: '3',
    delete: '4',
  };

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let { userFeatures, quickActionsTotal, userFavorites } = useSelector(state => state.userFeatures);
  // checkPrivilege('view'), [featureName, subFeatureName];
  const { checkPrivilegeBySubFeatureCode } = useFeatures();

  const [favorites, setFavorites] = useState(userFavorites);

  const showErrorMessage = message => dispatch(alertsActions.initiateAlert({ message }));

  return (
    <div className="page-body">
      <div className="container-fluid">
        {favorites && favorites.length > 0 && (
          <>
            <div className="row mb-3">
              <div className="col-md-12 text-center">
                <h2 className="dashboard-title">{t('LBL_FAVORITES')}</h2>
              </div>
            </div>
            <div className="row">
              {featuresEnum &&
                Object.keys(featuresEnum).map(key => {
                  if (
                    key !== 'REPORTS' &&
                    key !== 'DASHBOARD' &&
                    key !== 'JOURNAL_TYPES' &&
                    featuresEnum[key].id.split('.').length > 1 &&
                    favorites.indexOf(featuresEnum[key].id) > -1 &&
                    checkPrivilegeBySubFeatureCode('view', featuresEnum[key].id) &&
                    !featuresEnum[key].hideFromMenu
                  )
                    return (
                      <>
                        <div className="col-xl-3 col-md-3 col-xl-3 box-col-12">
                          <QuickActionsCardWithSkeleton
                            onCardClick={
                              featuresEnum[key].PATH
                                ? () => {
                                    navigate(featuresEnum[key].PATH);
                                  }
                                : null
                            }
                            currentSubFeature={featuresEnum[key]}
                            favorites={favorites}
                            setFavorites={setFavorites}
                            api={api}
                            showErrorMessage={showErrorMessage}
                          />
                        </div>
                      </>
                    );
                })}
            </div>
          </>
        )}
        {favorites.length > 0 && favorites.length !== quickActionsTotal && <div className="border-section"></div>}

        {featuresEnum &&
          Object.keys(featuresEnum).length > 1 &&
          (favorites.length === 0 || (favorites.length > 0 && favorites.length !== quickActionsTotal)) && (
            <>
              <div className="row mb-3">
                <div className="col-md-12 text-center">
                  <h2 className="dashboard-title">{t('LBL_QUICK_ACTIONS')}</h2>
                </div>
              </div>
              <div className="row">
                {featuresEnum &&
                  Object.keys(featuresEnum).map(key => {
                    if (
                      key !== 'REPORTS' &&
                      key !== 'DASHBOARD' &&
                      key !== 'JOURNAL_TYPES' &&
                      featuresEnum[key]?.id?.split('.')?.length > 1 &&
                      favorites.indexOf(featuresEnum[key].id) === -1 &&
                      checkPrivilegeBySubFeatureCode('view', featuresEnum[key].id) &&
                      !featuresEnum[key].hideFromMenu
                    ) {
                      return (
                        <>
                          <div className="col-xl-3 col-md-3 col-xl-3">
                            <QuickActionsCardWithSkeleton
                              onCardClick={
                                featuresEnum[key].PATH
                                  ? () => {
                                      navigate(featuresEnum[key].PATH);
                                    }
                                  : null
                              }
                              currentSubFeature={featuresEnum[key]}
                              favorites={favorites}
                              setFavorites={setFavorites}
                              showErrorMessage={showErrorMessage}
                              api={api}
                            />
                          </div>
                        </>
                      );
                    } else {
                      return null;
                    }
                  })}
              </div>
            </>
          )}
      </div>
    </div>
  );
}

export default Landing;
