import { useDispatch } from 'react-redux';

import { useAxiosFunction } from '../../hooks/useAxios';
import { alertsActions } from '../../store/alerts';
import { MODELS } from '../../constants/models';
import { getActionUrl, getModelUrl, getVerifyUrl } from '../getUrl';
import { checkFlashOrError } from '../../utils/helpers';

export default function useFiscalYearServices() {
  const { api } = useAxiosFunction();

  const dispatch = useDispatch();

  const generatePeriodsService = async (fiscalYearData, periodDurationSelect) => {
    if (!(Number(periodDurationSelect) > 0)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_MISSING_PERIODS' }));
      return false;
    }

    const generatePeriodClickPayload = {
      action: 'action-year-group-generate-period-click',
      model: MODELS.FISCALYEAR,
      data: {
        criteria: [],
        context: {
          ...fiscalYearData,
          periodDurationSelect: Number(periodDurationSelect),
          periodList: [],
          _model: MODELS.FISCALYEAR,
          _signal: 'generatePeriodsBtn',
          _source: 'generatePeriodsBtn',
          _viewName: 'year-period-form',
          _viewType: 'form',
          _views: [
            { type: 'grid', name: 'year-account-grid' },
            { type: 'form', name: 'year-account-form' },
          ],
        },
      },
    };

    const res = await api('POST', getActionUrl(), generatePeriodClickPayload);

    if (checkFlashOrError(res.data.data)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      return false;
    }

    if (!(res.data.status === 0) || !res?.data?.data) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_GENERATING_PERIODS' }));
      return false;
    }

    const res2 = await api('POST', getVerifyUrl(MODELS.FISCALYEAR), {
      data: {
        id: fiscalYearData.id,
        version: fiscalYearData.version,
      },
    });

    if (!(res2.data.status === 0)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_GENERATING_PERIODS' }));
      return false;
    }

    const res3 = await api('POST', getActionUrl(), {
      action: 'action-year-group-generate-period-click[2]',
      model: MODELS.FISCALYEAR,
      data: {
        criteria: [],
        context: {
          ...fiscalYearData,
          periodDurationSelect: Number(periodDurationSelect),
          periodList: [],
          _model: MODELS.FISCALYEAR,
          _signal: 'generatePeriodsBtn',
          _source: 'generatePeriodsBtn',
          _viewName: 'year-account-form',
          _viewType: 'form',
          _views: [
            { type: 'grid', name: 'year-account-grid' },
            { type: 'form', name: 'year-account-form' },
          ],
        },
      },
    });

    if (checkFlashOrError(res3?.data?.data)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_GENERATING_PERIODS' }));
      return false;
    }

    if (!(res3?.data?.status === 0)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_GENERATING_PERIODS' }));
      return false;
    }

    const res4 = await api('POST', getVerifyUrl(MODELS.FISCALYEAR), {
      data: {
        id: fiscalYearData.id,
        version: fiscalYearData.version,
      },
    });

    if (!(res4?.data?.status === 0)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_GENERATING_PERIODS' }));
      return false;
    }

    const res5 = await api('POST', getModelUrl(MODELS.FISCALYEAR), {
      data: {
        id: fiscalYearData.id,
        version: fiscalYearData.version,
        typeselect: 1,
        _original: fiscalYearData,
        periodList: res3?.data?.data?.[0]?.values?.periodList ?? [],
        periodDurationSelect: Number(periodDurationSelect),
      },
    });

    if (!(res5.data.status === 0)) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'LBL_ERROR_GENERATING_PERIODS' }));
      return false;
    }

    return true;
  };

  return { generatePeriodsService };
}
