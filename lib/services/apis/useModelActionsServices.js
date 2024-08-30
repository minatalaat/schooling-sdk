import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useFeatures } from '../../hooks/useFeatures';
import { useAxiosFunction } from '../../hooks/useAxios';
import { useGetUrl } from '../useGetUrl';
import { alertsActions } from '../../store/alerts';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';

export const useModelActionsServices = ({ feature, subFeature, modelsEnumKey, id, setIsLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();
  const { getFeaturePath } = useFeatures(feature, subFeature);
  const { getCopyUrl } = useGetUrl();

  const copyHandler = async () => {
    setIsLoading(true);
    const response = await api('GET', getCopyUrl(modelsEnum[modelsEnumKey].name, id));
    if (!response?.data?.data || !response?.data?.data[0])
      return dispatch(
        alertsActions.initiateAlert({
          title: 'Error',
          message: t('LBL_ERROR_DUPLICATING') + t(modelsEnum[modelsEnumKey].titleSingular),
        })
      );
    let duplicateObject = response.data.data[0];
    setIsLoading(false);
    navigate(getFeaturePath(subFeature, 'add'), { state: { duplicateObject } });
  };

  return { copyHandler };
};
