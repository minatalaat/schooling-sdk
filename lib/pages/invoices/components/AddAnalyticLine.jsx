import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';
import DateInput from '../../../components/ui/inputs/DateInput';
import CheckboxInput from '../../../components/ui/inputs/CheckboxInput';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { analyticDistributionLinesActions } from '../../../store/analyticDistrbution';
import { formatFloatNumber } from '../../../utils/helpers';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { setAllValues, setFieldValue } from '../../../utils/formHelpers';
import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';

function AddAnalyticLine({ show, setShow, edit, lineId, id, version, originalAmount, po, type, parentContext, showDistrubuteByQty, qty }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const analyticDistributionLines = useSelector(state => state.analyticDistributionLines.analyticDistributionLines);
  const [calcualtedAmount, setCalculatedAmount] = useState(null);
  const [maxQty, setMaxQty] = useState(parseFloat(qty).toFixed(2));
  const [maxPer, setMaxPer] = useState(100.0);

  const today = new Date();

  const initVals = {
    analyticJournal: null,
    axis: null,
    analyticAccount: null,
    distributeByQty: showDistrubuteByQty,
    qty: qty ? qty : 0.0,
    percentage: 0.0,
    date: moment(new Date()).locale('en').format('YYYY-MM-DD'),
  };
  const valSchema = po
    ? Yup.object().shape({
        axis: Yup.object().required(t('AXIS_VALIDATION_MESSAGE')).nullable(),
        analyticAccount: Yup.object().nullable().required(t('ANALYTIC_ACCOUNT_VALIDATION_MESSAGE')),
        percentage: Yup.number(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
          .typeError(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
          .required(t('PERCENTAGE_VALIDATION_MESSAGE'))
          .min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO'))
          .max(maxPer, t('PERCENTAGE_VALIDATION_MESSAGE_2') + maxPer.toString()),
        date: Yup.date().required(t('DATE_VALIDATION_MESSAGE')),
        qty: showDistrubuteByQty
          ? Yup.number(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
              .typeError(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
              .when('distributeByQty', {
                is: true,
                then: Yup.number(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
                  .typeError(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
                  .min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO'))
                  .max(maxQty, t('QTY_VALIDATION_MESSAGE') + ' ' + maxQty.toString()),
              })
          : null,
      })
    : Yup.object().shape({
        axis: Yup.object().required(t('AXIS_VALIDATION_MESSAGE')).nullable(),
        analyticAccount: Yup.object().required(t('ANALYTIC_ACCOUNT_VALIDATION_MESSAGE')).nullable(),
        percentage: Yup.number()
          .required(t('PERCENTAGE_VALIDATION_MESSAGE'))
          .min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO'))
          .max(maxPer, t('PERCENTAGE_VALIDATION_MESSAGE_2') + maxPer.toString()),
        date: Yup.date(),
        qty: showDistrubuteByQty
          ? Yup.number(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
              .typeError(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
              .when('distributeByQty', {
                is: true,
                then: Yup.number(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
                  .typeError(t('ADDITIONAL_NUMBER_VALIDATION_MESSAGE'))
                  .min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO'))
                  .max(maxQty, t('QTY_VALIDATION_MESSAGE') + ' ' + maxQty.toString()),
              })
          : null,
      });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, undefined, 'modal');

  const onAnalyticJournalSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let analyticJounrals = [];

      if (data) {
        data.forEach(analyticJournal => {
          let temp = {
            id: analyticJournal?.id ?? -1,
            name: analyticJournal?.name ?? '',
            type: analyticJournal?.type?.name ?? '',
            company: analyticJournal?.company?.name ?? '',
            status: analyticJournal?.statusSelect ? 'Active' : 'Not Active',
          };
          analyticJounrals.push(temp);
        });
      }

      setFieldValue(formik, 'analyticJournal', data[0]);
      return { displayedData: [...analyticJounrals], total: response.data.total || 0 };
    }
  };

  const onAnalyticAxisSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let axises = [];

      if (data) {
        data.forEach(axis => {
          let temp = {
            id: axis?.id ?? -1,
            code: axis?.code ?? '',
            name: axis?.name ?? '',
          };
          axises.push(temp);
        });
      }

      return { displayedData: [...axises], total: response.data.total || 0 };
    }
  };

  const onAnalyticAccountSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let analyticAccounts = [];

      if (data) {
        data.forEach(account => {
          let temp = {
            id: account?.id ?? -1,
            code: account?.code ?? '',
            fullName: account?.fullName ?? '',
            analyticAxis: account?.['analyticAxis.name'] ?? '',
            parentAnalyticAxis: account?.parent ?? '',
            status: account?.statusSelect ? 'Active' : 'Not Active',
          };
          analyticAccounts.push(temp);
        });
      }

      return { displayedData: [...analyticAccounts], total: response.data.total || 0 };
    }
  };

  const AddAnalyticDistrbutionLineHandler = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (po) {
      if (formik.isValid) {
        let analyticJournalObj = formik.values.analyticJournal;
        let analyticAxisObj = formik.values.axis;
        let analyticAccountObj = formik.values.analyticAccount;
        let payload = {
          lineId: Math.floor(Math.random() * 100).toString(),
          originalPieceAmount: `${originalAmount}`,
          percentage: formik.values.percentage,
          typeSelect: 2,
          analyticJournal: analyticJournalObj
            ? {
                code: analyticJournalObj?.code ?? '',
                name: analyticJournalObj?.name ?? '',
                id: analyticJournalObj?.id ?? -1,
              }
            : null,
          date:
            po === true ? moment(formik.values.date).locale('en').format('YYYY-MM-DD') : moment(today).locale('en').format('YYYY-MM-DD'),
          analyticAxis: analyticAxisObj
            ? {
                id: analyticAxisObj?.id ?? -1,
                name: analyticAxisObj?.name ?? '',
                code: analyticAxisObj?.code ?? '',
              }
            : null,
          analyticAccount: analyticAccountObj
            ? {
                id: analyticAccountObj?.id ?? -1,
                code: analyticAccountObj?.code ?? '',
                fullName: analyticAccountObj ? `${analyticAccountObj.fullName}` : '',
              }
            : null,
          selected: true,
          id: id ? id : null,
          version: version,
        };

        if (type !== 'template') {
          payload.amount = `${parseFloat(calcualtedAmount).toFixed(2).toString()}`;
        }

        if (edit) {
          dispatch(
            analyticDistributionLinesActions.editLine({
              id: lineId,
              analyticDistributionLine: payload,
            })
          );
          setShow(false);
        } else {
          dispatch(
            analyticDistributionLinesActions.addLine({
              analyticDistributionLine: payload,
            })
          );
          setShow(false);
        }
      } else {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
      }
    } else {
      if (formik.isValid) {
        let analyticJournalObj = formik.values.analyticJournal;
        let analyticAxisObj = formik.values.axis;
        let analyticAccountObj = formik.values.analyticAccount;

        let payload = {
          lineId: Math.floor(Math.random() * 100).toString(),
          originalPieceAmount: `${parseFloat(originalAmount).toFixed(2).toString()}`,
          percentage: formik.values.percentage,
          typeSelect: 2,
          analyticJournal: analyticJournalObj
            ? {
                code: analyticJournalObj?.code ?? '',
                name: analyticJournalObj?.name ?? '',
                id: analyticJournalObj?.id ?? -1,
              }
            : null,
          date:
            po === true ? moment(formik.values.date).locale('en').format('YYYY-MM-DD') : moment(today).locale('en').format('YYYY-MM-DD'),
          analyticAxis: analyticAxisObj
            ? {
                id: analyticAxisObj?.id ?? -1,
                name: analyticAxisObj?.name ?? '',
                code: analyticAxisObj?.code ?? '',
              }
            : null,
          analyticAccount: analyticAccountObj
            ? {
                id: analyticAccountObj?.id ?? -1,
                code: analyticAccountObj?.code ?? '',
                fullName: analyticAccountObj ? `${analyticAccountObj.fullName}` : '',
              }
            : null,
          selected: true,
          id: id ? id : null,
          version: version,
        };

        if (type !== 'template') {
          payload.amount = `${parseFloat(calcualtedAmount).toFixed(2).toString()}`;
        }

        if (edit) {
          dispatch(
            analyticDistributionLinesActions.editLine({
              id: lineId,
              analyticDistributionLine: payload,
            })
          );
          setShow(false);
        } else {
          dispatch(
            analyticDistributionLinesActions.addLine({
              analyticDistributionLine: payload,
            })
          );

          setShow(false);
        }
      } else {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
      }
    }
  };

  useEffect(() => {
    if (edit) {
      let currentLine = analyticDistributionLines.filter(line => line.lineId === lineId)[0];

      const setFetchedValues = () => {
        setAllValues(formik, {
          analyticJournal: currentLine?.analyticJournal || null,
          axis: currentLine?.analyticAxis || null,
          analyticAccount: currentLine?.analyticAccount || null,
          distributeByQty: showDistrubuteByQty,
          qty: currentLine && qty ? ((parseFloat(currentLine.percentage) / 100.0) * parseFloat(qty)).toFixed(2).toString() : '0.00',
          percentage: currentLine?.percentage ?? '',
          amount: currentLine?.amount ?? '',
          date: po === true ? currentLine?.date ?? '' : '',
        });
      };

      setFetchedValues();
    }
  }, [edit]);

  useEffect(() => {
    api(
      'POST',
      getSearchUrl(MODELS.ANALYTICJOURNAL),
      {
        fields: ['name', 'type.name', 'company.name'],
        sortBy: null,
        data: { _domain: null, _domainContext: { _model: 'com.axelor.apps.account.db.AnalyticJournal' }, operator: 'and', criteria: [] },
        limit: -1,
        offset: 0,
        translate: true,
      },
      onAnalyticJournalSuccess
    );
  }, []);

  useEffect(() => {
    if (formik.values.axis) {
      let remainingPerctange = null;
      analyticDistributionLines?.length > 0 &&
        analyticDistributionLines
          .filter(line => line.analyticAxis.id === formik.values.axis.id && line.lineId !== lineId)
          .forEach(line => {
            remainingPerctange = remainingPerctange + parseFloat(line.percentage);
          });
      remainingPerctange = parseFloat(100 - remainingPerctange).toFixed(2);

      if (!edit) {
        setFieldValue(formik, 'qty', parseFloat((remainingPerctange / 100) * qty).toFixed(2));
      }

      setMaxQty(parseFloat((remainingPerctange / 100) * qty).toFixed(2));
      setMaxPer(parseFloat(remainingPerctange).toFixed(2));
    }
  }, [formik.values.axis]);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const getComputeAmountPayload = () => {
    parentContext = { ...parentContext, analyticMoveLineList: analyticDistributionLines };
    return {
      model: MODELS.ANALYTICMOVELINE,
      action: 'action-analytic-move-line-method-compute-amount,action-method-calculate-amount-with-percentage-analytic-move-line',
      data: {
        criteria: [],
        context: {
          _model: MODELS.ANALYTICMOVELINE,
          originalPieceAmount: parseFloat(originalAmount).toFixed(2).toString(),
          amount: '0',
          percentage: parseFloat(formik.values.percentage).toFixed(2).toString(),
          typeSelect: 2,
          analyticJournal: formik.values.analyticJournal,
          date: moment(today).locale('en').format('YYYY-MM-DD'),
          analyticAxis: formik.values.axis,
          analyticAccount: formik.values.analyticAccount,
          _parent: parentContext,
          _viewType: 'grid',
          _viewName: 'analytic-move-line-distribution-grid',
          _views: [
            { type: 'grid', name: 'analytic-move-line-distribution-grid' },
            { type: 'form', name: 'analytic-move-line-distribution-form' },
          ],
          _source: 'percentage',
        },
      },
    };
  };

  const computeAmount = async () => {
    let action = 'action-analytic-move-line-method-compute-amount,action-method-calculate-amount-with-percentage-analytic-move-line';
    let computeAmountResponse = await api('POST', getActionUrl(), getComputeAmountPayload(action));
    if (computeAmountResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setCalculatedAmount(computeAmountResponse.data.data?.[0]?.values?.amount ?? null);
  };

  useEffect(() => {
    if ((type === 'invoice' || type === 'journal') && formik.values.percentage !== '' && parseInt(formik.values.percentage)) {
      computeAmount();
    }
  }, [formik.values.percentage, , formik.values.analyticJournal, formik.values.analyticAccount, formik.values.axis]);

  useEffect(() => {
    if (type === 'invoice' && formik.values.percentage !== '') {
      computeAmount();
    }

    if (showDistrubuteByQty) {
      if (Number(Number(formik.values.qty).toFixed(2)) <= Number(Number(qty).toFixed(2))) {
        setFieldValue(
          formik,
          'percentage',
          ((parseFloat(formik.values.qty).toFixed(2) / parseFloat(qty).toFixed(2)) * 100.0).toFixed(2).toString()
        );
      } else {
        alertHandler('Error', t('QUANTIRY_MORE_THAN_MAX'));
      }
    }
  }, [formik.values.distributeByQty, formik.values.qty, formik.values.analyticJournal, formik.values.analyticAccount, formik.values.axis]);

  return (
    <>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-90w"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="xl"
        id="add-analytic-line"
      >
        <Modal.Header closeButton>
          <h5 className="modal-title" id="add-analytic-line">
            {t('LBL_ANAYLTIC_DISTRIBUTION_LINE')}
          </h5>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="ANALYTIC_AXIS"
                mode={edit ? 'edit' : 'add'}
                isRequired={true}
                onSuccess={onAnalyticAxisSuccess}
                tooltip="dimension"
                defaultValueConfig={{
                  payloadDomain: 'self.id=1',
                }}
              />
            </div>
            {formik.values.axis && (
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="ANALYTIC_ACCOUNTS"
                  mode={edit ? 'edit' : 'add'}
                  isRequired={true}
                  onSuccess={onAnalyticAccountSuccess}
                  payloadDomain={`self.analyticAxis = ${formik.values.axis.id} and self.statusSelect = 1`}
                  tooltip="analyticAccount"
                  selectIdentifier="fullName"
                  defaultValueConfig={null}
                />
              </div>
            )}
          </div>
          <div className="row">
            {showDistrubuteByQty && (
              <div className="col-md-6">
                <CheckboxInput
                  formik={formik}
                  label="LBL_DISTRIBUTE_BY_QTY"
                  accessor="distributeByQty"
                  mode="add"
                  isOnlyCheckboxesInRow={true}
                />
              </div>
            )}
          </div>
          <div className="row">
            {formik.values.distributeByQty && showDistrubuteByQty && (
              <div className="col-md-4">
                <TextInput formik={formik} label="LBL_QUANTITY" accessor="qty" mode="add" />
              </div>
            )}
            <div className="col-md-4">
              <TextInput
                formik={formik}
                label="%"
                accessor="percentage"
                mode="add"
                isRequired={true}
                disabled={formik.values.distributeByQty}
              />
            </div>
            {type !== 'template' && (
              <div className="col-md-4">
                <div className="info-total-ex">
                  <p>{t('LBL_AMOUNT')}</p>
                  <h4>
                    {`${formatFloatNumber(parseFloat(calcualtedAmount).toString())}` !== 'NaN'
                      ? `${formatFloatNumber(parseFloat(calcualtedAmount).toFixed(2).toString())}`
                      : '0'}
                  </h4>
                </div>
              </div>
            )}

            {po === true && (
              <div className="col-md-4">
                <DateInput formik={formik} label="LBL_DATE" accessor="date" mode="add" />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="float-end">
            <PrimaryButton
              theme="white"
              onClick={() => {
                setShow(false);
              }}
            />
            <PrimaryButton theme="purple" text={edit ? 'LBL_OK' : 'LBL_ADD'} onClick={AddAnalyticDistrbutionLineHandler} />
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddAnalyticLine;
