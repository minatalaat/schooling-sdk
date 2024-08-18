import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useTabs } from '../../../hooks/useTabs';
import { useSelector } from 'react-redux';
import { MODELS } from '../../../constants/models';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import WeekDaysLines from './WeekDaysLines';
import { checkFlashOrError } from '../../../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';

const WeeklyPlanningForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finishedSaveHandler,
  isDelete,
  finishedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const { api } = useAxiosFunction();
  const weekDays = useSelector(state => state.weekDays.weekDays);
  const tabsProps = useTabs();
  const { t } = useTranslation();

  const initialValues = {
    name: data?.name || '',
    bonusCoef: data?.bonusCoef || 0.0,
    leaveCoef: data?.leaveCoef || 1.0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    bonusCoef: Yup.number().min(0.0, t('LBL_NUMBER_MUST_NOT_BE_LESS_ZERO')),
    leaveCoef: Yup.number().min(0.0, t('LBL_NUMBER_MUST_NOT_BE_LESS_ZERO')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const getValidatePeriodsPayload = action => {
    return {
      model: MODELS.WEEKLY_PLANNING,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.WEEKLY_PLANNING,
          _id: null,
          bonusCoef: parseFloat(formik.values.bonusCoef).toFixed(2).toString(),
          weekDays: weekDays,
          name: formik.values.name,
          leaveCoef: parseFloat(formik.values.leaveCoef).toFixed(2).toString(),
          typeSelect: 1,
          id: data?.id || null,
          version: data && data.version !== null ? data.version : null,
        },
      },
    };
  };

  const getSavePayload = () => {
    return {
      data: {
        name: formik.values.name,
        id: data?.id || null,
        version: data && data.version !== null ? data.version : null,
        bonusCoef: parseFloat(formik.values.bonusCoef).toFixed(2).toString(),
        leaveCoef: parseFloat(formik.values.leaveCoef).toFixed(2).toString(),
        weekDays: weekDays,
      },
    };
  };

  const saveWeekPlan = async () => {
    setActionInProgress(true);
    let action = 'com.axelor.apps.base.web.weeklyplanning.WeeklyPlanningController:checkPlanning';
    let validatePeriodsResponse = await api('POST', getActionUrl(), getValidatePeriodsPayload(action));
    if (validatePeriodsResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = validatePeriodsResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', data[0].flash);
    let saveRecordResponse = await api('POST', getModelUrl(MODELS.WEEKLY_PLANNING), getSavePayload());
    if (saveRecordResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    finishedSaveHandler('Success', t('WEEK_PLANNING_SAVED_SUCCESSFULLY'));
  };

  const saveRecord = () => {
    if (formik.isValid) {
      saveWeekPlan();
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.WEEKLY_PLANNING), payload, () => {
      setActionInProgress(false);
      finishedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_NAME"
              accessor="name"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-6">
            <NumberInput
              formik={formik}
              step={0.01}
              label="LBL_BONUS_COEF"
              accessor="bonusCoef"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={false}
            />
          </div>
          <div className="col-md-6">
            <NumberInput
              formik={formik}
              step={0.01}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={false}
              label="LBL_LEAVE_COEF"
              accessor="leaveCoef"
            />
          </div>
        </div>
        <WeekDaysLines tableTitle={t('LBL_WEEK_DAYS')} pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
      </div>
    </>
  );
};

export default WeeklyPlanningForm;
