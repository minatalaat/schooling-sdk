import 'moment/locale/ar';

import { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useSelector } from 'react-redux';

import CloseFiscalYear from './CloseFiscalYear';
import FiscalYearInnerTable from './FiscalYearInnerTable';
import CloseConfirmationPopUp from './CloseConfirmationPopUp';
import BorderSection from '../../components/ui/inputs/BorderSection';
import TextInput from '../../components/ui/inputs/TextInput';
import DateInput from '../../components/ui/inputs/DateInput';
import DropDown from '../../components/ui/inputs/DropDown';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getFetchUrl, getModelUrl, getRemoveAllUrl, getVerifyUrl } from '../../services/getUrl';
import { checkFlashOrError } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { getItem } from '../../utils/localStorage';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { setFieldValue } from '../../utils/formHelpers';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';
import useFiscalYearServices from '../../services/apis/useFiscalYearServices';

const FiscalYearForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
  refreshData,
  periodList,
  setPeriodList,
  periodLoading,
  closeFYStart,
  setCloseFYStart,
}) => {
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { generatePeriodsService } = useFiscalYearServices();

  moment.locale(getItem('code'));

  const company = useSelector(state => state.userFeatures.companyInfo.company);
  const periodDurationSelect = useMetaFields('base.year.period.duration.select');
  const periodStatusSelect = useMetaFields('base.period.status.select');

  const [showCloseFY, setShowCloseFY] = useState(false);
  const [fiscalYearDetails, setFiscalYearDetails] = useState({});

  const initialValues = {
    name: addNew ? '' : data.name,
    code: addNew ? '' : data.code,
    fromDate: addNew ? '' : data.fromDate,
    toDate: addNew ? '' : data.toDate,
    reportedBalanceDate: addNew ? '' : data.reportedBalanceDate,
    periodDurationSelect: addNew || !data.periodDurationSelect ? 0 : data.periodDurationSelect,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    fromDate: Yup.date().required(t('REQUIRED')),
    toDate: Yup.date()
      .required(t('REQUIRED'))
      .test('is-greater', t('INVALID_FROM_TO_DATE'), function (value) {
        const { fromDate } = this.parent;
        return !fromDate || !value || value > fromDate;
      }),
    reportedBalanceDate: Yup.date().required(t('REQUIRED')),
    periodDurationSelect: Yup.number().min(1, t('REQUIRED')),
  });

  const fiscalyearStatus = useMemo(() => {
    if (addNew) {
      return t('LBL_OPENED');
    }

    if (data.statusSelect) {
      switch (data.statusSelect) {
        case 1:
          return t('LBL_OPENED');
        case 2:
          return t('LBL_CLOSED');
        case 3:
          return t('LBL_ADJUSTING');
        default:
          return '';
      }
    } else {
      return '';
    }
  }, [data.statusSelect, getItem('code')]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const handleCloseFiscalYear = () => {
    if (
      !(
        fiscalYearDetails.plAccounts &&
        fiscalYearDetails.retainedAccount &&
        fiscalYearDetails.closingAccount &&
        fiscalYearDetails.plAccounts.length >= 1 &&
        fiscalYearDetails.retainedAccount.length === 1 &&
        fiscalYearDetails.closingAccount.length === 1
      )
    ) {
      return alertHandler('Error', t('INVALID_FORM'));
    }

    const fromDate = new Date(formik.values.fromDate);
    const toDate = new Date(formik.values.toDate);

    if (!(!isNaN(fromDate) && !isNaN(toDate) && fromDate.getFullYear() === toDate.getFullYear())) {
      return alertHandler('Error', t('INVALID_FROM_TO_DATE'));
    }

    const plAccountsIds = fiscalYearDetails.plAccounts.map(account => account.id);
    const retainedAccountId = fiscalYearDetails.retainedAccount.map(account => account.id)[0];
    const closingAccountId = fiscalYearDetails.closingAccount.map(account => account.id)[0];

    const afterSave = res => {
      api(
        'POST',
        getActionUrl(),
        {
          action: 'action-group-account-year-close-click[2]',
          model: MODELS.FISCALYEAR,
          data: {
            criteria: [],
            context: {
              ...res.data.data[0],
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
        },
        res1 => {
          if (checkFlashOrError(res1.data.data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

          if (res1.data.status === 0 && !res1.data.data.find(el => el.flash)) {
            api(
              'POST',
              getFetchUrl(MODELS.FISCALYEAR, data.id),
              {
                fields: [
                  'name',
                  'code',
                  'fromDate',
                  'toDate',
                  'reportedBalanceDate',
                  'company',
                  'periodList',
                  'statusSelect',
                  'periodDurationSelect',
                  'typeSelect',
                  'closureDateTime',
                ],
                related: {},
              },
              res2 => {
                if (res2.data.status === 0) {
                  api(
                    'POST',
                    getActionUrl(),
                    {
                      action: 'action-group-account-year-close-click[3]',
                      model: MODELS.FISCALYEAR,
                      data: {
                        criteria: [],
                        context: {
                          ...res2.data.data[0],
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
                    },
                    res3 => {
                      if (checkFlashOrError(res3.data.data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

                      if (res3.data.status === 0) {
                        api(
                          'POST',
                          getActionUrl(),
                          {
                            action: 'action-lite-closing-year-end',
                            data: {
                              plAccounts: plAccountsIds,
                              periodYear: fromDate.getFullYear(),
                              retainedAccount: retainedAccountId,
                              closingAccount: closingAccountId,
                            },
                          },
                          res4 => {
                            if (checkFlashOrError(res4.data.data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

                            if (res4.data.status === 0) {
                              setActionInProgress(false);

                              if (enableEdit) {
                                navigate(getFeaturePath('FISCAL_YEARS', 'view', { id: res2.data.data[0].id }), { replace: true });
                              } else {
                                refreshData();
                              }
                            } else {
                              setActionInProgress(false);
                              alertHandler('Error', t('SOMETHING_WENT_WRONG'));
                            }
                          }
                        );
                      } else {
                        setActionInProgress(false);
                        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
                      }
                    }
                  );
                } else {
                  setActionInProgress(false);
                  alertHandler('Error', t('SOMETHING_WENT_WRONG'));
                }
              }
            );
          } else {
            setActionInProgress(false);

            if (res1?.data?.data?.find(el => el.flash)) {
              alertHandler('Error', t('LBL_ERROR_CLOSE_PREVIOUS_FISCAL_YEARS'));
            } else {
              alertHandler('Error', t('SOMETHING_WENT_WRONG'));
            }
          }
        }
      );
    };

    saveRecord(true, afterSave);
  };

  const handleStartCloseFiscalYear = async () => {
    if (!closeFYStart) {
      const isValid = await validateFormForSubmit();
      if (!isValid) return null;
      return setCloseFYStart(true);
    } else {
      setShowCloseFY(true);
    }
  };

  const saveRecord = async (closeFY, callback) => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let payload = { ...formik.values, company: company || null, periodList, typeSelect: 1 };

    let savePayload = { data: { ...payload } };
    if (enableEdit || closeFY)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.FISCALYEAR), savePayload, res => {
      if (res.data.status === 0) {
        if (!closeFY) {
          if (addNew) {
            const isPeriodsGenerated = generatePeriodsService({ ...res.data.data[0] }, formik.values.periodDurationSelect);
            if (!isPeriodsGenerated) return setActionInProgress(false);
            finshedSaveHandler('success');
            setActionInProgress(false);
          }

          setActionInProgress(false);
          finshedSaveHandler('success');
        } else {
          callback(res);
        }
      } else {
        setActionInProgress(false);
        finshedSaveHandler('error');
      }
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.FISCALYEAR), payload, res => {
      setActionInProgress(false);

      if (res.data.status === 0) {
        finshedDeleteHandler('success');
      } else {
        finshedDeleteHandler('error');
      }
    });
  };

  useEffect(() => {
    if (isSave) saveRecord();
    if (isDelete) deleteRecord();
    if (!enableEdit && !addNew && closeFYStart) setCloseFYStart(false);
  }, [isSave, isDelete, addNew, enableEdit]);

  useEffect(() => {
    formik.resetForm({
      values: {
        ...initialValues,
      },
    });
  }, [data]);

  useEffect(() => {
    if (enableEdit && data.statusSelect === 2) {
      navigate(getFeaturePath('FISCAL_YEARS', 'view', { id: data.id }));
      alertHandler('Error', t('LBL_FISCAL_YEAR_CLOSED'));
    }
  }, [data.statusSelect, enableEdit]);

  useEffect(() => {
    if (formik.isValid) setFieldValue(formik, 'code', `${company.name}_${formik.values.name}`);
  }, [formik.values.name, formik.isValid]);

  // Inner Table Data
  const [lineData, setLineData] = useState([]);

  const lineHeaders = [t('LBL_NAME'), t('LBL_FISCAL_YEAR'), t('LBL_FROM'), t('LBL_TO'), t('LBL_STATUS')];

  const handleClosePeriod = line => {
    setActionInProgress(true);
    api(
      'POST',
      getModelUrl(MODELS.PERIOD),
      {
        data: {
          ...line,
        },
      },
      res => {
        if (res.data.status === 0) {
          api(
            'POST',
            getActionUrl(),
            {
              action: 'action-period-group-close',
              model: MODELS.PERIOD,
              data: {
                criteria: [],
                context: {
                  ...res.data.data[0],
                  _model: MODELS.PERIOD,
                  _signal: 'generatePeriodsBtn',
                  _source: 'generatePeriodsBtn',
                  _viewName: 'period-form',
                  _viewType: 'form',
                  _views: [
                    { type: 'grid', name: 'period-grid' },
                    { type: 'form', name: 'period-form' },
                  ],
                },
              },
            },
            res1 => {
              if (checkFlashOrError(res1.data.data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

              if (res1.data.status === 0) {
                api(
                  'POST',
                  getVerifyUrl(MODELS.PERIOD),
                  {
                    data: {
                      id: res.data.data[0].id,
                      version: res.data.data[0].version,
                    },
                  },
                  res2 => {
                    if (checkFlashOrError(res2.data.data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

                    if (res2.data.status === 0) {
                      api(
                        'POST',
                        getActionUrl(),
                        {
                          action: 'action-period-group-close[1]',
                          model: MODELS.PERIOD,
                          data: {
                            criteria: [],
                            context: {
                              ...res.data.data[0],
                              _model: MODELS.PERIOD,
                              _signal: 'generatePeriodsBtn',
                              _source: 'generatePeriodsBtn',
                              _viewName: 'period-form',
                              _viewType: 'form',
                              _views: [
                                { type: 'grid', name: 'period-grid' },
                                { type: 'form', name: 'period-form' },
                              ],
                            },
                          },
                        },
                        res3 => {
                          if (res3.data.status === 0) {
                            if (checkFlashOrError(res3.data.data)) {
                              setActionInProgress(false);

                              if (res3.data.data[0].alert === 'The previous period is not closed.') {
                                return alertHandler('Error', t('ERROR_CLOSE_PREVIOUS_PERIODS'));
                              } else {
                                return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
                              }
                            }

                            api(
                              'POST',
                              getFetchUrl(MODELS.PERIOD, res.data.data[0].id),
                              {
                                fields: [
                                  'year.company',
                                  'fromDate',
                                  'statusSelect',
                                  'closureDateTime',
                                  'temporarilyCloseDate',
                                  'code',
                                  'year',
                                  'toDate',
                                  'name',
                                  'year.statusSelect',
                                  'allowExpenseCreation',
                                  'year.typeSelect',
                                ],
                                related: {},
                              },
                              res4 => {
                                setActionInProgress(false);

                                if (res4.data.status === 0) {
                                  let tempPeriods = [...periodList];
                                  let selectedPeriod = tempPeriods.findIndex(period => (line ? period.id === line.id : false));

                                  if (selectedPeriod !== -1) {
                                    tempPeriods[selectedPeriod] = {
                                      ...res4.data.data[0],
                                      'year.company': res4.data.data[0].year.company,
                                    };
                                    setPeriodList([...tempPeriods]);
                                  }
                                } else {
                                  alertHandler('Error', t('SOMETHING_WENT_WRONG'));
                                }
                              }
                            );
                          }
                        }
                      );
                    } else {
                      setActionInProgress(false);
                      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
                    }
                  }
                );
              } else {
                setActionInProgress(false);
                alertHandler('Error', t('SOMETHING_WENT_WRONG'));
              }
            }
          );
        } else {
          setActionInProgress(false);
          alertHandler('Error', t('SOMETHING_WENT_WRONG'));
        }
      }
    );
  };

  useEffect(() => {
    let tempData = [];
    periodStatusSelect.list &&
      periodStatusSelect.list.length > 0 &&
      !periodLoading &&
      periodList &&
      periodList.length > 0 &&
      periodList.forEach(line => {
        tempData.push({
          isClosable: line.statusSelect === 1,
          tableData: [
            { value: line.name, type: 'text' },
            { value: line.year ? line.year.name : '', type: 'text' },
            { value: line.fromDate, type: 'text' },
            { value: line.toDate, type: 'text' },
            {
              value: periodStatusSelect.list.find(duration => line.statusSelect === Number(duration.value))?.title || '',
              type: 'text',
            },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.name,
        });
      });
    setLineData(tempData);
  }, [periodList, periodStatusSelect.list]);

  return (
    <>
      {!closeFYStart && (
        <div className="col-md-9">
          <div className="card">
            <div className="row">
              <div className="col-md-6">
                <TextInput formik={formik} label="LBL_NAME" accessor="name" mode={addNew ? 'add' : 'view'} isRequired={true} />
              </div>
              <BorderSection title="LBL_DATES" />
              <div className="col-md-6">
                <DateInput
                  formik={formik}
                  label="LBL_FROM"
                  accessor="fromDate"
                  mode={addNew ? 'add' : 'view'}
                  tooltip="fiscalYearStart"
                  isRequired={true}
                />
              </div>
              <div className="col-md-6">
                <DateInput
                  formik={formik}
                  label="LBL_TO"
                  accessor="toDate"
                  mode={addNew ? 'add' : 'view'}
                  tooltip="fiscalYearEnd"
                  isRequired={true}
                />
              </div>
              <div className="col-md-6">
                <DateInput
                  formik={formik}
                  label="LBL_REPORTED_BALANCE_DATE"
                  accessor="reportedBalanceDate"
                  mode={addNew ? 'add' : 'view'}
                  tooltip="fiscalYearReportedBalanceDate"
                  isRequired={true}
                />
              </div>
              <div className="col-md-6">
                <DropDown
                  formik={formik}
                  accessor="periodDurationSelect"
                  label="LBL_PERIOD_DURATION"
                  keys={{ valueKey: 'value', titleKey: 'label' }}
                  options={periodDurationSelect.list}
                  translate={periodDurationSelect.mode === 'enum'}
                  mode={addNew ? 'add' : 'view'}
                  initialValue={0}
                  isRequired={true}
                />
              </div>
              {!addNew && (
                <FiscalYearInnerTable
                  title={t('LBL_PERIOD_LIST')}
                  pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  OnClosePeriod={handleClosePeriod}
                  lineHeaders={lineHeaders}
                  lineData={lineData}
                />
              )}
            </div>
            {(addNew || enableEdit) && (
              <FormNotes
                notes={[
                  {
                    title: 'LBL_REQUIRED_NOTIFY',
                    type: 3,
                  },
                ]}
              />
            )}
          </div>
        </div>
      )}
      {closeFYStart && <CloseFiscalYear updateFYDetails={setFiscalYearDetails} />}
      <div className="col-md-3">
        <div className="card right-more">
          <div className="row">
            <div className="col-md-12">
              <div className="list-info">
                <div className="list">
                  <p>{t('LBL_THE_TYPE')}</p>
                  <h4>{t('LBL_FISCALYEAR')}</h4>
                </div>
                <div className="list">
                  <p>{t('LBL_STATUS')}</p>
                  <h4>{fiscalyearStatus}</h4>
                </div>
                {data && data.closureDateTime && data.statusSelect === 2 && (
                  <>
                    <div className="list">
                      <p>{t('LBL_CLOSURE_DATE')}</p>
                      <h4>{moment(data.closureDateTime).format('Do MMMM YYYY')}</h4>
                    </div>
                    <div className="list">
                      <p></p>
                      <h4>{moment(data.closureDateTime).format('h:mm:ss a')}</h4>
                    </div>
                  </>
                )}
              </div>
              {showCloseFY && (
                <CloseConfirmationPopUp
                  onClickHandler={() => {
                    setShowCloseFY(false);
                    handleCloseFiscalYear();
                  }}
                  setConfirmationPopup={setShowCloseFY}
                  message="LBL_CONFIRM_CLOSING_FISCAL_YEAR"
                />
              )}

              {data && (data.statusSelect === 1 || data.statusSelect === 3) && (
                <>
                  <div className="border-solid"></div>
                  <div className="actionbtn-right-page">
                    <button
                      className="btn btn-show btn-w-100"
                      onClick={enableEdit ? handleStartCloseFiscalYear : () => {}}
                      disabled={!enableEdit}
                    >
                      {t('LBL_CLOSE_FISCAL_YEAR')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FiscalYearForm;
