import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';
import { MODES } from '../../constants/enums/FeaturesModes';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';

export default function BreadCrumb({ feature, subFeature, modeText, moreBreadCrumb = [], mode, modelsEnumKey }) {
  const { t } = useTranslation();

  const getInitialSearchParams = requiredFeature => {
    if (!requiredFeature.PARAMS?.search) return '';
    if (!requiredFeature.PARAMS?.pagination) return '';
    return '?currentPage=1&pageSize=10';
  };

  if (!modeText && mode && modelsEnumKey)
    modeText =
      mode === MODES.EDIT
        ? `${t('LBL_EDIT')} ${t(modelsEnum[modelsEnumKey].titleSingular)}`
        : mode === MODES.VIEW
          ? `${t('LBL_VIEW')} ${t(modelsEnum[modelsEnumKey].titleSingular)}`
          : `${t('LBL_ADD_NEW')} ${t(modelsEnum[modelsEnumKey].titleSingular)}`;

  return (
    <div className="breadcrumb-page float-start">
      <p>
        {feature && featuresEnum[feature] && <span>{t(featuresEnum[feature].LABEL) || ''}</span>}
        {subFeature && featuresEnum[subFeature] && featuresEnum[subFeature].LABEL && (
          <>
            <i className="breadcoumb-icon"></i>
            {featuresEnum[subFeature].PATH && modeText ? (
              <Link to={{ pathname: featuresEnum[subFeature].PATH, search: getInitialSearchParams(featuresEnum[subFeature]) } || ''}>
                <span>{t(featuresEnum[subFeature].LABEL) || ''}</span>
              </Link>
            ) : (
              <span>{t(featuresEnum[subFeature].LABEL) || ''}</span>
            )}
          </>
        )}
        {modeText && (
          <>
            <i className="breadcoumb-icon"></i>
            <span>{t(modeText)}</span>
          </>
        )}
        {moreBreadCrumb.length > 0 &&
          moreBreadCrumb.map(item => {
            if (item.path) {
              return (
                <>
                  <i className="breadcoumb-icon"></i>
                  <Link to={item.path}>
                    <span>{t(item.name) || ''}</span>
                  </Link>
                </>
              );
            }

            return (
              <>
                <i className="breadcoumb-icon"></i>
                <span>{t(item.name || '')}</span>
              </>
            );
          })}
      </p>
    </div>
  );
}
