import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TooltipComp from '../../../components/TooltipComp';
import AddAnalyticLine from './AddAnalyticLine';
import MoreAction from '../../../parts/MoreAction';

import AddNewInvoiceIcon from '../../../assets/images/add-new-invo.svg';
import EditIconBtnHeader from '../../../assets/images/edit-icon.svg';
import MoreActionIcon from '../../../assets/images/more-action.svg';
import deleteIconBtnHrader from '../../../assets/images/delete-icon.svg';

import { analyticDistributionLinesActions } from '../../../store/analyticDistrbution';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { formatFloatNumber } from '../../../utils/helpers';
import { setFieldValue } from '../../../utils/formHelpers';

let currentAnalyticLineReduxId = null;
let currentAnalyticLineId = null;
let currentAnalyticLineVersion = null;

function AnalyticLines({
  hasOriginal,
  formik,
  po,
  lineAmount,
  type,
  parentContext,
  setValidateError,
  alertHandler,
  showDistrubuteByQty,
  qty,
}) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  const analyticDistributionLines = useSelector(state => state.analyticDistributionLines.analyticDistributionLines);

  const [displayedAnalyticDistributionLines, setDisplayedAnalyticDistributionLines] = useState(analyticDistributionLines);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [showRows, setShowRows] = useState([]);
  const [showAddAnalyticDistributionLinePop, setShowAddAnalyticDistributionLinePop] = useState(false);
  const [showEditAnalyticDistributionLinePop, setShowEditAnalyticDistributionLinePop] = useState(false);

  const deleteAnalyticDistributionLine = id => {
    dispatch(
      analyticDistributionLinesActions.deleteLine({
        id: id,
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
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const getValidateMoveLinesPayload = action => {
    return {
      model: MODELS.INVOICELINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVOICELINE,
          taxEquiv: null,
          companyExTaxTotal: parentContext?.exTaxTotal || null,
          discountAmount: '0.0000000000',
          project: null,
          description: '',
          typeSelect: 0,
          analyticMoveLineList: analyticDistributionLines,
          discountTypeSelect: 0,
          productName: parentContext?.productName || null,
          isHideUnitAmounts: false,
          isShowTotal: false,
          price: parentContext?.price || null,
          fixedAssets: false,
          id: parentContext?.id || null,
          budget: null,
          inTaxTotal: parentContext?.inTaxTotal || null,
          product: null,
          saleOrderLine: null,
          budgetDistributionList: [],
          taxLine: parentContext?.taxLine || null,
          budgetDistributionSumAmount: '0.00',
          exTaxTotal: parentContext?.exTaxTotal || null,
          inTaxPrice: parentContext?.inTaxPrice || null,
          purchaseOrderLine: null,
          version: parentContext && parentContext.version !== null ? parentContext.version : null,
          unit: parentContext?.unit || null,
          companyInTaxTotal: parentContext?.companyInTaxTotal || null,
          priceDiscounted: parentContext?.priceDiscounted || null,
          qty: parentContext?.qty || null,
          analyticDistributionTemplate: null,
          fixedAssetCategory: null,
          account: parentContext?.account || null,
          wkfStatus: null,
          partnerLanguage: 'EN',
          isFilterOnSupplier: true,
          _viewType: 'grid',
          _viewName: 'analytic-move-line-distribution-grid',
          _views: [
            { type: 'grid', name: 'analytic-move-line-distribution-grid' },
            { type: 'form', name: 'analytic-move-line-distribution-form' },
          ],
          _source: 'analyticMoveLineList',
        },
      },
    };
  };

  const validateAnalyticMoveLines = async () => {
    let action = 'action-analytic-move-line-group-analytic-move-line-list-onchange,action-attrs-account-invoice-line-onnew-onload';
    let validateMoveLinesResponse = await api('POST', getActionUrl(), getValidateMoveLinesPayload(action));
    if (validateMoveLinesResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = validateMoveLinesResponse.data.data;

    if (data && data[0] && data[0].attrs && data[0].attrs.isValidAnalyticMoveLineList && !data[0].attrs.isValidAnalyticMoveLineList.value) {
      setValidateError(true);

      if (type === 'journal') {
        return alertHandler(t('PERCENTAGE_FOR_EACH_DIMENSION_SHOULD_BE_100'));
      } else {
        return alertHandler('Error', t('PERCENTAGE_FOR_EACH_DIMENSION_SHOULD_BE_100'));
      }
    }

    setValidateError(false);
  };

  useEffect(() => {
    if (formik) {
      setFieldValue(formik, 'analyticDistributionLines', analyticDistributionLines);
      formik.setFieldTouched('analyticDistributionLines', true);
    }

    if (analyticDistributionLines && analyticDistributionLines.length > 0) {
      let tempLines = [];
      analyticDistributionLines &&
        analyticDistributionLines.length &&
        analyticDistributionLines.forEach(item => {
          if (tempLines && tempLines.length > 0 && tempLines.filter(item2 => item2.name === item.analyticAxis.name).length === 0) {
            tempLines.push({
              name: item.analyticAxis.name,
              dimLines: analyticDistributionLines.filter(item3 => item3.analyticAxis.name === item.analyticAxis.name),
            });
          } else if (tempLines.length === 0) {
            tempLines.push({
              name: item.analyticAxis.name,
              dimLines: analyticDistributionLines.filter(
                item4 => item4 && item4.analyticAxis && item4.analyticAxis.name === item.analyticAxis.name
              ),
            });
          }
        });
      setDisplayedAnalyticDistributionLines(tempLines);
    } else {
      setDisplayedAnalyticDistributionLines([]);
    }

    if ((type === 'invoice' || type === 'journal') && analyticDistributionLines && analyticDistributionLines.length > 0) {
      validateAnalyticMoveLines();
    }
  }, [analyticDistributionLines]);

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={() => {
            setShowEditAnalyticDistributionLinePop(true);
          }}
          deleteHandler={() => deleteAnalyticDistributionLine(currentAnalyticLineId)}
        />
      )}
      <div className="row d-contents">
        <div className="col-md-6  section-title mt-4">
          <h4>
            {t('LBL_ANALYTIC_DISTRBUTION_LINES')}
            <TooltipComp fieldKey="analyticDistributionLines" />
          </h4>
        </div>
        <div className="col-md-6">
          {!hasOriginal && (
            <button
              className="btn btn-add-tb mt-4 float-end"
              data-bs-toggle="modal"
              data-bs-target="#add-analytic-line"
              onClick={() => setShowAddAnalyticDistributionLinePop(true)}
            >
              <img src={AddNewInvoiceIcon} alt={AddNewInvoiceIcon} />
              {t('LBL_ADD_ROW')}
            </button>
          )}
        </div>
      </div>
      {displayedAnalyticDistributionLines &&
        displayedAnalyticDistributionLines.length > 0 &&
        displayedAnalyticDistributionLines.map((item, i) => {
          return (
            <>
              <div className="row d-contents">
                <div className="col-md-6  section-title mb-0">
                  <h4>{item ? item.name : ''}</h4>
                </div>
              </div>
              <div className="row">
                <div className="tab-content d-block" id="add-new-line">
                  {windosSize[0] > 1200 && (
                    <div className="table-responsive table-responsive-new show active">
                      <table className="table table-responsive-stack dataTable" id="tableOne">
                        <thead>
                          <tr>
                            <th>{t('LBL_AXIS')}</th>
                            <th>{t('LBL_ANALYTIC_ACCOUNT')}</th>
                            <th>%</th>
                            {type !== 'template' && <th>{t('LBL_AMOUNT')}</th>}
                            {!hasOriginal && <th></th>}
                            {!hasOriginal && <th></th>}
                          </tr>
                        </thead>
                        <tbody id="table_detail">
                          {item.dimLines &&
                            item.dimLines.map(analyticDistributionLine => {
                              return (
                                <tr>
                                  <td>{analyticDistributionLine?.analyticAxis?.name ?? ''}</td>
                                  <td>{analyticDistributionLine?.analyticAccount?.fullName ?? ''}</td>
                                  <td>
                                    {' '}
                                    {analyticDistributionLine ? parseFloat(analyticDistributionLine.percentage).toFixed(2).toString() : ''}
                                  </td>
                                  {type !== 'template' && <td>{formatFloatNumber(analyticDistributionLine?.amount)}</td>}
                                  {!hasOriginal && (
                                    <td
                                      width="40"
                                      onClick={() => {
                                        currentAnalyticLineReduxId =
                                          analyticDistributionLine.lineId !== null ? analyticDistributionLine.lineId : null;
                                        currentAnalyticLineId = analyticDistributionLine.id !== null ? analyticDistributionLine.id : null;
                                        currentAnalyticLineVersion =
                                          analyticDistributionLine.version !== null ? analyticDistributionLine.version : null;
                                        setShowEditAnalyticDistributionLinePop(true);
                                      }}
                                    >
                                      <Link
                                        style={{
                                          pointerEvents: 'none',
                                        }}
                                      >
                                        <img src={EditIconBtnHeader} alt={EditIconBtnHeader} />
                                      </Link>
                                    </td>
                                  )}
                                  {!hasOriginal && (
                                    <td
                                      width="40"
                                      onClick={() => {
                                        currentAnalyticLineId = analyticDistributionLine.lineId;
                                        deleteAnalyticDistributionLine(analyticDistributionLine.lineId);
                                      }}
                                    >
                                      <Link
                                        className="clickable"
                                        style={{
                                          pointerEvents: 'none',
                                          // marginTop: "0",
                                          // width: "24px",
                                          // marginLeft: "auto",
                                          // marginRight: "auto"
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
                            <th>{t('LBL_ANALYTIC_DISTRBUTION_LINES')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.dimLines &&
                            item.dimLines.map(analyticDistributionLine => {
                              return (
                                <>
                                  <tr className={showRows.indexOf(parseInt(analyticDistributionLine.lineId)) > -1 ? 'open' : ''}>
                                    <td>
                                      <button
                                        type="button"
                                        id="row-mob-1"
                                        className="btn-toggle"
                                        aria-expanded={showRows.indexOf(parseInt(analyticDistributionLine.lineId)) > -1 ? 'true' : 'false'}
                                        aria-controls="id-1 id-2 id-3 id-4 id-5 id-6"
                                        onClick={() => {
                                          toggleShowHiddenRow(parseInt(analyticDistributionLine.lineId));
                                        }}
                                      >
                                        <i className="icon"></i>
                                      </button>
                                    </td>
                                    <td colSpan="2">{analyticDistributionLine?.analyticAccount?.fullName ?? ''}</td>
                                    {!hasOriginal && (
                                      <td>
                                        <button
                                          type="button"
                                          className="btn more-popup-trigger"
                                          onClick={() => {
                                            currentAnalyticLineReduxId = analyticDistributionLine.lineId;
                                            setShowMoreAction(true);
                                          }}
                                        >
                                          <img src={MoreActionIcon} alt={MoreActionIcon} />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                  {showRows.indexOf(parseInt(analyticDistributionLine.lineId)) > -1 && (
                                    <>
                                      <tr id="id-2" className="show">
                                        <td>{t('LBL_AXIS')}</td>
                                        <td colSpan="3">{analyticDistributionLine?.analyticAxis?.name ?? ''}</td>
                                      </tr>
                                      <tr id="id-3" className="show">
                                        <td>{t('LBL_ANALYTIC_ACCOUNT')}</td>
                                        <td colSpan="3">{analyticDistributionLine?.analyticAccount?.fullName ?? ''}</td>
                                      </tr>
                                      <tr id="id-4" className="show">
                                        <td>%</td>
                                        <td colSpan="3">
                                          {analyticDistributionLine
                                            ? parseFloat(analyticDistributionLine.percentage).toFixed(2).toString()
                                            : ''}
                                        </td>
                                      </tr>
                                      {type !== 'template' && (
                                        <tr id="id-5" className="show">
                                          <td>{t('LBL_AMOUNT')}</td>
                                          <td colSpan="3">{formatFloatNumber(analyticDistributionLine?.amount)}</td>
                                        </tr>
                                      )}
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
              </div>
            </>
          );
        })}

      {showAddAnalyticDistributionLinePop && (
        <AddAnalyticLine
          show={showAddAnalyticDistributionLinePop}
          setShow={setShowAddAnalyticDistributionLinePop}
          edit={false}
          originalAmount={
            lineAmount
              ? lineAmount
              : parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice) > 0.0
                ? (parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice)).toFixed(2)
                : 0.0
          }
          po={po === true ? true : false}
          type={type}
          parentContext={parentContext}
          showDistrubuteByQty={showDistrubuteByQty}
          qty={qty}
        />
      )}
      {showEditAnalyticDistributionLinePop && (
        <AddAnalyticLine
          show={showEditAnalyticDistributionLinePop}
          setShow={setShowEditAnalyticDistributionLinePop}
          edit={true}
          lineId={currentAnalyticLineReduxId}
          id={currentAnalyticLineId}
          version={currentAnalyticLineVersion}
          originalAmount={
            lineAmount
              ? lineAmount
              : parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice) > 0.0
                ? (parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice)).toFixed(2)
                : 0.0
          }
          po={po === true ? true : false}
          type={type}
          parentContext={parentContext}
          showDistrubuteByQty={showDistrubuteByQty}
          qty={qty}
        />
      )}
    </>
  );
}

export default AnalyticLines;
