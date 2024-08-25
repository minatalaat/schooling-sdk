import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { SpinnerCircular } from 'spinners-react';

import TextInput from './ui/inputs/TextInput';
import AnalyticLines from '../pages/invoices/components/AnalyticLines';

import { analyticDistributionLinesActions } from '../store/analyticDistrbution';
import { useAxiosFunction } from '../hooks/useAxios';
import { getActionUrl, getFetchUrl, getModelUrl, getSearchUrl } from '../services/getUrl';
import { MODELS } from '../constants/models';
import { checkFlashOrError } from '../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../constants/regex/Regex';
import { alertsActions } from '../store/alerts';

function AddAnalyticDistributionTemplate({ onValidate, isSave, finshedSaveHandler, closeModalHandler, type, parentContext, parentModel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();

  const analyticDistributionLines = useSelector(state => state.analyticDistributionLines.analyticDistributionLines);
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const [validateError, setValidateError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fetchedTemplate, setFetchedTemplate] = useState(null);

  const initVals = {
    name: '',
  };
  const valSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validateOnMount: true,
    validationSchema: valSchema,
  });

  const alertHandler = (title, message) => {
    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const getFetchTemplatePayload = () => {
    return { fields: ['analyticDistributionLineList', 'name', 'company', 'isSpecific'], related: {} };
  };

  const fetchDefaultAnalyticTemplate = async id => {
    let fetchTemplateResponse = await api('POST', getFetchUrl(MODELS.ANALYTICDISTRIBUTION, id), getFetchTemplatePayload());
    if (fetchTemplateResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = fetchTemplateResponse.data.data ? fetchTemplateResponse.data.data[0] : null;
    return data;
  };

  const getSeachDefaultAnalyticLinesPayload = (data, ids) => {
    return {
      fields: ['analyticJournal', 'percentage', 'analyticAccount', 'analyticAxis'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: data?.id || null,
          _model: MODELS.ANALYTICDISTRIBUTION,
          _field: 'analyticDistributionLineList',
          _field_ids: ids,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
  };

  const fetchDefaultAnalyticLines = async data => {
    if (data) {
      let tempIds = [];
      data &&
        data.analyticDistributionLineList.length > 0 &&
        data.analyticDistributionLineList.forEach(item => {
          tempIds.push(item.id);
        });
      let searchDefaultAnalyticLinesResponse = await api(
        'POST',
        getSearchUrl(MODELS.ANALYTIC_DISTRBUTION_LINE),
        getSeachDefaultAnalyticLinesPayload(data, tempIds)
      );
      if (searchDefaultAnalyticLinesResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      dispatch(
        analyticDistributionLinesActions.setLines({
          analyticDistributionLines: searchDefaultAnalyticLinesResponse.data.data,
        })
      );
    }
  };

  const getOnAddNewTemplatePayload = action => {
    return {
      model: parentModel,
      action: action,
      data: {
        criteria: [],
        context: parentContext
          ? parentContext
          : {
              company: company || null,
              _model: parentModel,
            },
      },
    };
  };

  const onAddNewTemplate = async () => {
    let action = 'action-method-fixed-asset-analytic-distribution-template-personalize';
    let onAddNewTemplateResponse = await api('POST', getActionUrl(), getOnAddNewTemplatePayload(action));
    if (onAddNewTemplateResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let data = onAddNewTemplateResponse.data.data[0];

    if (data && data.values) {
      formik.setFieldValue('name', data.values.analyticDistributionTemplate.name);
      let fetchedData = await fetchDefaultAnalyticTemplate(data.values.analyticDistributionTemplate.id);
      fetchDefaultAnalyticLines(fetchedData || null);
      setFetchedTemplate(fetchedData || null);
    }
  };

  const getValidateLinesPayload = action => {
    return {
      model: MODELS.ANALYTICDISTRIBUTION,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.ANALYTICDISTRIBUTION,
          fixedAsset: null,
          analyticDistributionLineList: analyticDistributionLines,
          name: formik.values.name,
          isSpecific: true,
          company: company || null,
          id: fetchedTemplate?.id || null,
          version: fetchedTemplate && fetchedTemplate.version !== null ? fetchedTemplate.version : null,
        },
      },
    };
  };

  const getSavePayload = () => {
    return {
      data: {
        id: fetchedTemplate?.id || null,
        version: fetchedTemplate && fetchedTemplate.version !== null ? fetchedTemplate.version : null,
        name: formik.values.name,
        company: company || null,
        analyticDistributionLineList: analyticDistributionLines,
      },
    };
  };

  const saveTemplate = async () => {
    if (!formik.isValid) {
      alertHandler('Error', t('INVALID_FORM'));
      return finshedSaveHandler();
    }

    setIsLoading(true);
    let action =
      'action-method-analytic-distribution-template-check-analytic-axis,action-analytic-distribution-template-on-save,action-method-parent-fixed-asset-calculate-analytic';
    let validateLinesResponse = await api('POST', getActionUrl(), getValidateLinesPayload(action));

    if (validateLinesResponse.data.status !== 0) {
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    let data = validateLinesResponse.data.data;

    if (data && checkFlashOrError(data) && data[0].error === 'Please fill analytic accounts in all analytic distribution lines.') {
      alertHandler('Error', t('FILL_ALL_COST_CENTERS'));
      return finshedSaveHandler();
    }

    if (
      data &&
      checkFlashOrError(data) &&
      data[0].error === 'The configured distribution is incorrect, the sum of percentages for at least an axis is different than 100%'
    ) {
      alertHandler('Error', t('PERCENTAGE_FOR_EACH_DIMENSION_SHOULD_BE_100'));
      return finshedSaveHandler();
    }

    const saveTemplateResponse = await api('POST', getModelUrl(MODELS.ANALYTICDISTRIBUTION), getSavePayload());

    if (saveTemplateResponse.data.status !== 0) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return finshedSaveHandler();
    }

    alertHandler('Success', t('ANALYTIC_DISTRBUTION_TEMPLATE_SAVED_SUCCESSFULLY'));
    setTimeout(() => {
      finshedSaveHandler(saveTemplateResponse.data.data[0]);
      closeModalHandler();
    }, [3000]);
  };

  useEffect(() => {
    dispatch(analyticDistributionLinesActions.resetAnalyticDistributionLines());
    if (type === 'fixedAsset') onAddNewTemplate();
  }, []);

  useEffect(() => {
    if (onValidate) onValidate(formik.isValid);
  }, [formik.isValid]);

  useEffect(() => {
    if (isSave) saveTemplate();
  }, [isSave]);
  return (
    <>
      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
      {!isLoading && (
        <div className="row">
          <div className="col-md-6" key="name">
            <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="add" isRequired={true} />
          </div>
          <AnalyticLines
            mode="add"
            hasOriginal={false}
            formik={formik}
            po={false}
            type="template"
            parentContext={parentContext}
            context={fetchedTemplate}
            validateError={validateError}
            setValidateError={setValidateError}
            showDistrubuteByQty={false}
            qty={null}
          />
        </div>
      )}
    </>
  );
}

export default AddAnalyticDistributionTemplate;
