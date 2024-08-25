import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import TaxForm from './TaxForm';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';
import FormNotes from '../../components/ui/FormNotes';

const TaxEdit = ({ addNew, enableEdit }) => {
  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures('APP_CONFIG', 'TAXES');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [tax, setTax] = useState({});
  const [taxLine, setTaxLine] = useState({});
  const [accountingConfigLine, setAccountingConfigLine] = useState({});

  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const fields = ['name', 'code', 'typeSelect', 'taxLineList', 'accountManagementList'];

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('TAX_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath('TAXES'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finshedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('TAX_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath('TAXES'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getTaxLineSearchPayload = (id, fieldId) => {
    let payload = {
      fields: ['endDate', 'value', 'startDate'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.TAXES,
          _field: 'taxLineList',
          _field_ids: [fieldId],
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getAccountingConfigSearchPayload = (id, fieldId) => {
    let payload = {
      fields: ['financialDiscountAccount', 'purchFixedAssetsAccount', 'saleAccount', 'purchaseAccount', 'typeSelect', 'company'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: { id: id, _model: MODELS.TAXES, _field: 'accountManagementList', _field_ids: [fieldId] },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchTax = () => {
    const payload = {
      fields: fields,
      related: {},
    };
    return api('POST', getFetchUrl(MODELS.TAXES, id), payload);
  };

  const fetchElementData = async () => {
    if (isLoading === false && !addNew) setIsLoading(true);

    if (addNew) return null;

    const taxResponse = await fetchTax();

    if (!taxResponse || !taxResponse.data || taxResponse.data.status !== 0 || !taxResponse.data.data || !taxResponse.data.data[0]) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let currentTax = taxResponse.data.data[0];

    setTax({ ...currentTax });

    if (currentTax.taxLineList[0]) {
      const taxLineResponse = await api(
        'POST',
        getSearchUrl(MODELS.TAXLINE),
        getTaxLineSearchPayload(currentTax.id, currentTax.taxLineList[0].id)
      );

      if (
        !taxLineResponse ||
        !taxLineResponse.data ||
        taxLineResponse.data.status !== 0 ||
        !taxLineResponse.data.data ||
        !taxLineResponse.data.data[0]
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      setTaxLine({ ...taxLineResponse.data.data[0] });
    }

    if (currentTax.accountManagementList[0]) {
      const accountingManagmentResponse = await api(
        'POST',
        getSearchUrl(MODELS.ACCOUNT_MANAGEMENT),
        getAccountingConfigSearchPayload(currentTax.id, currentTax.accountManagementList[0].id)
      );

      if (
        !accountingManagmentResponse ||
        !accountingManagmentResponse.data ||
        accountingManagmentResponse.data.status !== 0 ||
        !accountingManagmentResponse.data.data ||
        !accountingManagmentResponse.data.data[0]
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      setAccountingConfigLine({ ...accountingManagmentResponse.data.data[0] });
    }

    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath('TAXES', 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath('TAXES', 'edit', { id }));
    setShowMoreAction(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  useEffect(() => {
    fetchElementData();
  }, [addNew, enableEdit]);

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete ? deleteHandler : null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb
                feature="APP_CONFIG"
                subFeature="TAXES"
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t('LBL_TAX')}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t('LBL_TAX')}`
                      : `${t('LBL_ADD_NEW')} ${t('LBL_TAX')}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_TAX') : tax.name ? tax.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && (
                  <button className="btn btn-save" onClick={() => setIsSave(true)} disabled={isSave || isDelete}>
                    {' '}
                    {t('LBL_SAVE')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <Toolbar
                  setShowMoreAction={setShowMoreAction}
                  editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  showSearch={false}
                  canSelectAll={false}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'TAXES',
                  }}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={tax.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <div className="card">
                  <div className="row">
                    {(Object.keys(tax).length > 0 || addNew) && (
                      <>
                        {!addNew && (
                          <TaxForm
                            enableEdit={enableEdit}
                            data={tax}
                            taxLine={taxLine}
                            accountingConfigLine={accountingConfigLine}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            isDelete={isDelete}
                            finshedDeleteHandler={finshedDeleteHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                          />
                        )}
                        {addNew && (
                          <TaxForm
                            data={tax}
                            addNew={addNew}
                            taxLine={taxLine}
                            accountingConfigLine={accountingConfigLine}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                          />
                        )}
                      </>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaxEdit;
