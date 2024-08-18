import { useTranslation } from 'react-i18next';

export const useTourServices = () => {
  const { t } = useTranslation();

  const getTourLocales = () => {
    return {
      back: t('LBL_BACK'),
      close: t('LBL_CLOSE'),
      last: t('LBL_FINISH'),
      next: t('LBL_NEXT'),
      open: t('LBL_OPEN'),
      skip: t('LBL_SKIP'),
    };
  };

  const addStepsOptions = (tempSteps, locale) => {
    for (var i = 0; i < tempSteps.length; i++) {
      let tempStep = { ...tempSteps[i] };
      tempStep.disableBeacon = true;
      tempStep.locale = locale ? locale : getTourLocales();
      tempSteps[i] = { ...tempStep };
    }
  };

  return {
    getTourLocales,
    addStepsOptions,
  };
};
