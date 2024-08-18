import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useState } from 'react';
import EditIconBtnHeader from '../../../assets/images/edit-icon.svg';
import MoreActionIcon from '../../../assets/images/more-action.svg';
import deleteIconBtnHrader from '../../../assets/images/delete-icon.svg';
import addNewInvo from '../../../assets/images/add-new-invo.svg';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatFloatNumber } from '../../../utils/helpers';
import { Link } from 'react-router-dom';
import { invoiceLinesActions } from '../../../store/invoiceLines';
import AddProduct from './AddProduct';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { analyticDistributionLinesActions } from '../../../store/analyticDistrbution';
import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';

let currentInvoiceLineReduxId = null;
let currentInvoiceLineId = null;
let currentInvoiceLineVersion = null;

function InvoiceLines({
  formik,
  setShowMoreAction,
  setDeletedLine,
  purchase,
  isOrder,
  hasOriginal,
  setShow,
  show,
  setEdit,
  edit,
  status,
  invoiceType,
  operationTypeSelect,
  operationSubTypeSelect,
  errorMessage,
  modalTitle,
  stockLocation,
  parentModel,
  fromPO_SO = false,
  fetchedInvoicelines,
  mode,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();
  const { validateFormForSubmit } = useFormikSubmit(formik);

  let invoiceLines = useSelector(state => state.invoiceLines.invoiceLines);
  let analyticDistributionLines = useSelector(state => state.analyticDistributionLines.analyticDistributionLines);
  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const today = new Date();
  const [parentContext, setParentContext] = useState({});

  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showRows, setShowRows] = useState([]);

  const editHandler = id => {
    let currentInvoiceLine = invoiceLines.filter(line => line.lineId && line.lineId === id)[0];

    if (currentInvoiceLine.analyticMoveLineList && currentInvoiceLine.analyticMoveLineList.length > 0) {
      let analyticLinesIdsTemp = [];
      currentInvoiceLine.analyticMoveLineList.forEach(line => {
        if (line.id !== null) {
          analyticLinesIdsTemp.push(line.id);
        }
      });

      if (analyticLinesIdsTemp && analyticLinesIdsTemp.length > 0) {
        api(
          'POST',
          getSearchUrl(MODELS.ANALYTICMOVELINE),
          {
            fields: [
              'originalPieceAmount',
              'amount',
              'percentage',
              'typeSelect',
              'analyticJournal',
              'date',
              'analyticAxis',
              'analyticAccount',
              'selected',
              'id',
            ],
            sortBy: ['id'],
            data: {
              _domain: 'self.id in (:_field_ids)',
              _domainContext: {
                id: id,
                _model: 'com.axelor.apps.account.db.InvoiceLine',
                _field: 'analyticMoveLineList',
                _field_ids: analyticLinesIdsTemp,
              },
              _archived: true,
            },
            limit: -1,
            offset: 0,
            translate: true,
          },
          onAnalyticMoveLineSuccess,
          {}
        );
      } else {
        dispatch(
          invoiceLinesActions.editLine({
            id: id,
            invoiceLine: currentInvoiceLine,
          })
        );
        dispatch(
          invoiceLinesActions.updateAnalyticMoveLines({
            id: id,
            analtyicMoveLineList: currentInvoiceLine.analyticMoveLineList,
          })
        );
      }
    } else {
      dispatch(
        invoiceLinesActions.updateAnalyticMoveLines({
          id: id,
          analtyicMoveLineList: analyticDistributionLines,
        })
      );
    }
  };

  const onAnalyticMoveLineSuccess = response => {
    let tempData = [];
    let data = response.data.data;

    if (data) {
      data.forEach(line => {
        tempData.push({
          lineId: Math.floor(Math.random() * 100).toString(),
          ...line,
        });
      });
    }

    dispatch(
      invoiceLinesActions.updateAnalyticMoveLines({
        id: currentInvoiceLineReduxId,
        analtyicMoveLineList: tempData,
      })
    );
    dispatch(
      analyticDistributionLinesActions.setLines({
        analyticDistributionLines: tempData,
      })
    );
  };

  const toggleShowHiddenRow = id => {
    let tempRows = [...showRows];
    let index = tempRows.indexOf(id);

    if (index > -1) {
      tempRows.splice(index, 1);
    } else {
      tempRows.push(id);
    }

    setShowRows([...tempRows]);
  };

  useEffect(() => {
    currentInvoiceLineId = null;
    currentInvoiceLineReduxId = null;
    currentInvoiceLineVersion = null;

    if (!edit) {
      dispatch(analyticDistributionLinesActions.resetAnalyticDistributionLines());
    }
  }, []);
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });
  return (
    <>
      <div className={`row d-contents step-add-customer-invoice-2 ${isOrder ? 'step-add-purchase-order-3' : ''}`}>
        <div className="col-md-6 section-title mt-4">
          {/* <h4>
            {t('LBL_CONTENT')}
            {status === 'Draft' && <span className="required-astrisk">*</span>}
            <TooltipComp fieldKey="invoiceContent" />
          </h4> */}
        </div>
        {status === 'Draft' && !hasOriginal && !fromPO_SO && mode !== 'view' && (
          <div className="col-md-6 section-title">
            <button
              className="btn btn-add-tb mt-4 float-end"
              data-bs-toggle="modal"
              data-bs-target="#add-new-line"
              onClick={async () => {
                const isValid = await validateFormForSubmit();
                if (!isValid) return null;

                let temp = {
                  _operationTypeSelect: operationTypeSelect,
                  todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
                  operationTypeSelect: operationTypeSelect,
                  statusSelect: 1,
                  operationSubTypeSelect: operationSubTypeSelect,
                  company: company || null,
                  currency: formik.values.currency || null,
                  paymentMode: formik.values.paymentMode || null,
                  paymentCondition: formik.values.paymentCondition || null,
                  partner: formik.values.partner || null,
                  address: formik.values.address ? formik.values.address : formik.values.mainAddres ? formik.values.mainAddres : null,
                  language: {
                    code: 'en',
                    name: 'English',
                    id: 1,
                  },
                  paymentVouchersOnInvoice: false,
                  _model: MODELS.INVOICE,
                  invoiceLineList: [],
                };
                setParentContext(temp);
                setShow(true);
                setEdit(false);
              }}
            >
              <img src={addNewInvo} alt={addNewInvo} />
              {t('LBL_ADD_CONTENT')}
            </button>
          </div>
        )}
      </div>

      <div className="tab-content d-block" id="pills-tabContent">
        {windosSize[0] > 1200 && (
          <div className="table-responsive table-responsive-new fade active show">
            <table className="table table-responsive-stack dataTable" id="tableOne">
              <thead>
                <tr>
                  <th>{t('LBL_NAME')}</th>
                  <th>{t('LBL_QUANTITY')}</th>
                  <th>{t('LBL_UNIT_PRICE')}</th>
                  <th>{t('LBL_UNIT')}</th>
                  <th>{t('LBL_TAX')}</th>
                  <th>{t('LBL_TOTAL_WITH_TAX')}</th>
                  <th>{t('LBL_DESCRIPTION')}</th>
                  {status === 'Draft' && <th width="20"></th>}
                  {status === 'Draft' && !hasOriginal && <th width="20"></th>}
                </tr>
              </thead>
              <tbody>
                {invoiceLines &&
                  invoiceLines.map(line => {
                    return (
                      <tr key={line?.lineId}>
                        <td>
                          {line.product ? (line.product.fullName ? line.product.fullName : '') : line.productName ? line.productName : ''}
                        </td>
                        <td>{line.qty ? formatFloatNumber(Number(Number(line.qty).toFixed(2))) : ''}</td>
                        <td>{line.price ? formatFloatNumber(Number(Number(line.price).toFixed(2))) : ''}</td>
                        <td>{line.unit ? (line.unit ? (line.unit.name ? line.unit.name : '') : '') : ''}</td>
                        <td>
                          {line.taxRate
                            ? parseFloat(line.taxRate * 100.0).toFixed(2)
                            : line.taxLine
                              ? line['taxLine.value']
                                ? (parseFloat(line['taxLine.value']) * 100.0).toFixed(2)
                                : ''
                              : ''}
                        </td>
                        <td className="color-text-red">{line.inTaxTotal ? formatFloatNumber(line.inTaxTotal.toString()) : ''}</td>
                        <td>{line.description ? line.description : ''}</td>
                        {status === 'Draft' && mode !== 'view' && (
                          <td
                            width="20"
                            onClick={() => {
                              if (formik.isValid) {
                                currentInvoiceLineReduxId = line.lineId !== null ? line.lineId : null;
                                currentInvoiceLineId = line.id !== null ? line.id : null;
                                currentInvoiceLineVersion = line.version !== null ? line.version : null;
                                let temp = {
                                  _operationTypeSelect: operationTypeSelect,
                                  todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
                                  operationTypeSelect: operationTypeSelect,
                                  statusSelect: 1,
                                  operationSubTypeSelect: operationSubTypeSelect,
                                  company: company || null,
                                  currency: formik.values.currency || null,
                                  paymentMode: formik.values.paymentMode || null,
                                  paymentCondition: formik.values.paymentCondition || null,
                                  partner: formik.values.partner || null,
                                  address: formik.values.address || null,
                                  language: {
                                    code: 'en',
                                    name: 'English',
                                    id: 1,
                                  },
                                  paymentVouchersOnInvoice: false,
                                  _model: MODELS.INVOICE,
                                  invoiceLineList: [],
                                };
                                setParentContext(temp);
                                editHandler(currentInvoiceLineReduxId);
                                setEdit(true);
                                setShow(true);
                              } else {
                                dispatch(alertsActions.initiateAlert({ title: 'Error', message: errorMessage }));
                              }
                            }}
                          >
                            <Link
                              className="clickable"
                              style={{
                                pointerEvents: 'none',
                              }}
                            >
                              <img src={EditIconBtnHeader} alt={EditIconBtnHeader} />
                            </Link>
                          </td>
                        )}
                        {status === 'Draft' && !hasOriginal && !fromPO_SO && mode !== 'view' && (
                          <td
                            width="20"
                            onClick={() => {
                              dispatch(invoiceLinesActions.deleteLine({ id: line.lineId ? line.lineId : line.lineId }));
                            }}
                          >
                            <Link
                              className="clickable"
                              style={{
                                pointerEvents: 'none',
                              }}
                            >
                              <img src={deleteIconBtnHrader} alt={deleteIconBtnHrader} />
                            </Link>
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        {windosSize[0] <= 1200 && (
          <div
            className="table-responsive table-responsive-new show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <table id="table-mobile" className="table table-responsive-stack dataTable">
              <thead>
                <tr>
                  <th width="40%">#</th>
                  <th>{t('LBL_CONTENT')}</th>
                </tr>
              </thead>
              <tbody>
                {invoiceLines &&
                  invoiceLines.map(line => {
                    return (
                      <>
                        <tr className={showRows.indexOf(parseInt(line.lineId)) > -1 ? 'open' : ''}>
                          <td>
                            <button
                              type="button"
                              id="row-mob-1"
                              className="btn-toggle"
                              aria-expanded={showRows.indexOf(parseInt(line.lineId)) > -1 ? 'true' : 'false'}
                              aria-controls="id-1 id-2 id-3 id-4 id-5 id-6"
                              onClick={() => {
                                toggleShowHiddenRow(parseInt(line.lineId));
                              }}
                            >
                              <i className="icon"></i>
                            </button>
                          </td>
                          <td colSpan="2">
                            {line.product ? (line.product.fullName ? line.product.fullName : '') : line.productName ? line.productName : ''}
                          </td>
                          {status === 'Draft' && mode !== 'view' && (
                            <td>
                              <button
                                type="button"
                                className="btn more-popup-trigger"
                                onClick={() => {
                                  setDeletedLine({ id: line.lineId ? line.lineId : null });
                                  currentInvoiceLineReduxId = line.lineId !== null ? line.lineId : null;
                                  currentInvoiceLineId = line.id !== null ? line.id : null;
                                  currentInvoiceLineVersion = line.version !== null ? line.version : null;
                                  let temp = {
                                    _operationTypeSelect: operationTypeSelect,
                                    todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
                                    operationTypeSelect: operationTypeSelect,
                                    statusSelect: 1,
                                    operationSubTypeSelect: operationSubTypeSelect,
                                    company: company || null,
                                    currency: formik.values.currency || null,
                                    paymentMode: formik.values.paymentMode || null,
                                    paymentCondition: formik.values.paymentCondition || null,
                                    partner: formik.values.partner || null,
                                    address: formik.values.address || null,
                                    language: {
                                      code: 'en',
                                      name: 'English',
                                      id: 1,
                                    },
                                    paymentVouchersOnInvoice: false,
                                    _model: MODELS.INVOICE,
                                    invoiceLineList: [],
                                  };
                                  setParentContext(temp);
                                  setShowMoreAction(true);
                                  editHandler(currentInvoiceLineReduxId);
                                }}
                              >
                                <img src={MoreActionIcon} alt={MoreActionIcon} />
                              </button>
                            </td>
                          )}
                        </tr>
                        {showRows.indexOf(parseInt(line.lineId)) > -1 && (
                          <>
                            <tr id="id-2" className="show">
                              <td>{t('LBL_NAME')}</td>
                              <td colSpan="3">
                                {line.product
                                  ? line.product.fullName
                                    ? line.product.fullName
                                    : ''
                                  : line.productName
                                    ? line.productName
                                    : ''}
                              </td>
                            </tr>
                            <tr id="id-3" className="show">
                              <td>{t('LBL_QUANTITY')}</td>
                              <td colSpan="3">{line.qty ? formatFloatNumber(Number(Number(line.qty).toFixed(2))) : ''}</td>
                            </tr>
                            <tr id="id-4" className="show">
                              <td>{t('LBL_UNIT_PRICE')}</td>
                              <td colSpan="3">{line.price ? formatFloatNumber(Number(Number(line.price).toFixed(2))) : ''}</td>
                            </tr>
                            <tr id="id-5" className="show">
                              <td>{t('LBL_UNIT')}</td>
                              <td colSpan="3">{line.unit ? (line.unit ? (line.unit.name ? line.unit.name : '') : '') : ''}</td>
                            </tr>
                            <tr id="id-6" className="show">
                              <td>{t('LBL_TAX')}</td>
                              <td colSpan="3">
                                {line.taxRate
                                  ? parseFloat(line.taxRate * 100.0).toFixed(2)
                                  : line.taxLine
                                    ? line['taxLine.value']
                                      ? (parseFloat(line['taxLine.value']) * 100.0).toFixed(2)
                                      : ''
                                    : ''}
                              </td>
                            </tr>
                            <tr id="id-6" className="show">
                              <td>{t('LBL_TOTAL_WITH_TAX')}</td>
                              <td colSpan="3" className="color-text-red">
                                {line.inTaxTotal ? formatFloatNumber(line.inTaxTotal.toString()) : ''}
                              </td>
                            </tr>
                            <tr id="id-6" className="show">
                              <td>{t('LBL_DESCRIPTION')}</td>
                              <td colSpan="3" className="color-text-red">
                                {line.description ? line.description : ''}
                              </td>
                            </tr>
                          </>
                        )}
                      </>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {show && (
        <AddProduct
          show={show}
          setShow={setShow}
          parentContext={parentContext}
          account={formik.values.account}
          edit={edit}
          invoiceType={invoiceType}
          purchase={purchase}
          isOrder={isOrder}
          hasOriginal={hasOriginal}
          lineId={currentInvoiceLineReduxId}
          id={currentInvoiceLineId}
          version={currentInvoiceLineVersion}
          stockLocation={stockLocation}
          parentModel={parentModel}
          modalTitle={modalTitle}
          fromPO_SO={fromPO_SO}
          fetchedInvoicelines={fetchedInvoicelines}
        />
      )}
    </>
  );
}

export default InvoiceLines;
