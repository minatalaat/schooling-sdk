import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { featuresEnum } from '../constants/featuresEnum/featuresEnum';

export const useFeatures = (featureName, subFeatureName) => {
  const features = useSelector(state => state.userFeatures.userFeatures);
  const homePath = '/home';

  const checkPrivilege = (action, checkFeatureName = featureName, checkSubFeateureName = subFeatureName, checkFeatures = features) => {
    if (!checkFeatureName || !checkSubFeateureName) return false;
    if (!featuresEnum[checkFeatureName] || !featuresEnum[checkSubFeateureName]) return false;

    const featureId = featuresEnum[checkFeatureName].id;
    const subFeatureId = featuresEnum[checkSubFeateureName].id;
    if (!subFeatureId || !featureId) return false;

    let feature = checkFeatures.filter(feature => feature.featureCode === featureId)
      ? checkFeatures.filter(feature => feature.featureCode === featureId)[0]
      : null;
    if (!feature) return false;

    let subFeature =
      feature.subFeatureList && feature.subFeatureList.filter(subFeature => subFeature.subFeatureCode === subFeatureId)
        ? feature.subFeatureList.filter(subFeature => subFeature.subFeatureCode === subFeatureId)[0]
        : null;
    if (!subFeature || !subFeature.actions) return false;

    switch (action) {
      case 'view':
        if (subFeature.actions.findIndex(action => action === `1`) !== -1) {
          return true;
        } else {
          return false;
        }

      case 'add':
        if (subFeature.actions.findIndex(action => action === `2`) !== -1) {
          return true;
        } else {
          return false;
        }

      case 'edit':
        if (subFeature.actions.findIndex(action => action === `3`) !== -1) {
          return true;
        } else {
          return false;
        }

      case 'delete':
        if (subFeature.actions.findIndex(action => action === `4`) !== -1) {
          return true;
        } else {
          return false;
        }

      default:
        return false;
    }
  };

  const checkPrivilegeBySubFeatureCode = (action, subFeatureCode) => {
    let currentFeature = features.filter(feature => feature.featureCode === subFeatureCode.split('.')[0])?.[0];
    let currentSubFeature = currentFeature?.subFeatureList?.filter(subFeature => subFeature.subFeatureCode === subFeatureCode)?.[0];

    if (action === 'view') {
      return currentSubFeature?.actions?.filter(action => action === '1') > -1;
    }

    if (action === 'add') {
      return currentSubFeature?.actions?.findIndex(action => action === '2') > -1;
    }

    if (action === 'edit') {
      return currentSubFeature?.actions?.findIndex(action => action === '3') > -1;
    }

    if (action === 'delete') {
      return currentSubFeature?.actions?.findIndex(action => action === '4') > -1;
    }
  };

  const getInitialSearchParams = requiredFeature => {
    if (!requiredFeature.PARAMS?.search) return '';
    if (!requiredFeature.PARAMS?.pagination) return '';
    return '?currentPage=1&pageSize=10';
  };

  const getFeaturePath = (navigateFeature, mode, params) => {
    if (!navigateFeature || !featuresEnum[navigateFeature]) return homePath;
    if (!mode) return featuresEnum[navigateFeature].PATH + getInitialSearchParams(featuresEnum[navigateFeature]);
    return featuresEnum[navigateFeature].getPathWithParams(mode, params);
  };

  const getFeature = ({ currentFeatures = features, featureCode }) => {
    return currentFeatures.filter(feature => feature.featureCode === featureCode)?.[0] || null;
  };

  const getFeatureIndex = ({ currentFeatures = features, featureCode }) => {
    return currentFeatures.findIndex(feature => feature.featureCode === featureCode) || -1;
  };

  const isFeatureAvailable = ({ currentFeatures, featureCode }) => {
    let feature = getFeature({ currentFeatures, featureCode });
    if (!feature) return false;
    if (feature) return true;
    return false;
  };

  const isSubFeatureAvailable = ({ currentFeatures, featureCode, subFeatureCode }) => {
    if (!isFeatureAvailable({ currentFeatures, featureCode })) return false;
    let feature = getFeature({ currentFeatures, featureCode });
    if (!feature) return false;
    let subFeature = feature?.subFeatureList.filter(subFeature => subFeature.subFeatureCode === subFeatureCode);
    if (!subFeature || subFeature?.length === 0) return false;
    if (subFeature?.length > 0) return true;
    return false;
  };

  const removeSubFeatureIfAvailable = ({ currentFeatures, featureCode, subFeatureCode }) => {
    if (isSubFeatureAvailable({ currentFeatures, featureCode, subFeatureCode })) {
      let feature = getFeature({ currentFeatures, featureCode });
      let featureIndex = getFeatureIndex({ currentFeatures, featureCode });
      let subFeatures = feature?.subFeatureList.filter(subFeature => subFeature.subFeatureCode !== subFeatureCode);
      currentFeatures[featureIndex].subFeatureList = subFeatures;
    }
  };

  const canView = useMemo(() => checkPrivilege('view'), [featureName, subFeatureName]);
  const canAdd = useMemo(() => checkPrivilege('add'), [featureName, subFeatureName]);
  const canEdit = useMemo(() => checkPrivilege('edit'), [featureName, subFeatureName]);
  const canDelete = useMemo(() => checkPrivilege('delete'), [featureName, subFeatureName]);

  return {
    checkPrivilege,
    checkPrivilegeBySubFeatureCode,
    getFeaturePath,
    canView,
    canAdd,
    canEdit,
    canDelete,
    featuresEnum,
    isFeatureAvailable,
    isSubFeatureAvailable,
    removeSubFeatureIfAvailable,
  };
};
