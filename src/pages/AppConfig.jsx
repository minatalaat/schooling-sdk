import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { featuresEnum } from '../constants/featuresEnum/featuresEnum';

const actionEnum = {
  view: '1',
  add: '2',
  edit: '3',
  delete: '4',
};

function AppConfig() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  let features = useSelector(state => state.userFeatures.userFeatures);

  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 text-center">
            <h2
              style={{
                color: '#1F4FDE',
              }}
            >
              {t('LBL_APP_CONFIG')}
            </h2>
          </div>
        </div>
        <div className="row">
          {features &&
            features.map(feature => {
              return (
                feature.subFeatureList &&
                feature.subFeatureList.length > 0 &&
                feature.subFeatureList.map(item => {
                  let currentSubFeature;

                  Object.keys(featuresEnum).forEach(subFeature => {
                    if (featuresEnum[subFeature].id === item.subFeatureCode) {
                      currentSubFeature = featuresEnum[subFeature];
                    }
                  });
                  return (
                    <>
                      <div className="col-xl-3 col-md-3 col-xl-3 box-col-12">
                        <div className="card card-no-border">
                          <div
                            className="card-header-q"
                            onClick={
                              currentSubFeature.PATH
                                ? () => {
                                    navigate(currentSubFeature.PATH);
                                  }
                                : null
                            }
                          >
                            <h5
                              className="mb-0"
                              style={{
                                fontSize: '24px',
                              }}
                            >
                              {t(currentSubFeature.LABEL)}
                            </h5>
                          </div>
                          <div className="card-body-q pt-0">
                            {item.actions &&
                            item.actions.length > 0 &&
                            item.actions.findIndex(item2 => item2 === actionEnum['add']) > -1 ? (
                              <Link
                                to={currentSubFeature.ADD_PATH}
                                style={{
                                  fontSize: '18px',
                                }}
                              >
                                {t('LBL_ADD')}
                              </Link>
                            ) : (
                              <Link
                                style={{
                                  fontSize: '18px',
                                }}
                                to={currentSubFeature.PATH}
                              >
                                {t('LBL_VIEW')}
                              </Link>
                            )}

                            {currentSubFeature.NO_DATA_IMG && (
                              <img
                                style={{
                                  width: '50px',
                                  height: '50px',
                                }}
                                src={currentSubFeature.NO_DATA_IMG}
                                alt={currentSubFeature.NO_DATA_IMG}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default AppConfig;
