import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import InnerTable from '../../components/InnerTable';
import BankAccountModal from './bankDetails/BankAccountModal';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { bankDetailsActions } from '../../store/bankDetails';
import { alertsActions } from '../../store/alerts';

export default function BankDetails(props) {
  let company = props.data;
  let companyID = company.id;
  let companyName = company.name;
  let companyCode = company.code;
  let companyPartner = company.partner;
  let { formik, bankDetailsList, setBankDetailsList } = props;

  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editID, setEditID] = useState(null);
  const [viewID, setViewID] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  let bankDetails = useSelector(state => state.bankDetails.bankDetails);
  let bankDetailsIDs = useSelector(state => state.bankDetails.bankDetailsIDs);
  const dispatch = useDispatch();

  const initVals = {
    checked: [],
    deleteID: null,
  };

  const formikBD = useFormik({
    initialValues: initVals,
  });

  useEffect(() => {
    setBankDetailsList(bankDetails);
  }, [bankDetails]);

  useEffect(() => {
    getBankDetailsFromBR();
  }, []);

  const showErrorMessage = message => dispatch(alertsActions.initiateAlert({ message }));

  const onGetDefaultBankDetailsSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return showErrorMessage('LBL_ERROR_LOADING_BANK_DETAILS');
    }

    if (data) {
      data.forEach(acc => (acc.bic = acc['bank.code']));
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const getBankDetailsFromBRPayload = () => {
    let payload = {
      fields: ['bankDetails'],
      data: {
        _domain: null,
      },
    };
    return payload;
  };

  const getBankDetailsFromBR = async () => {
    const response = await api('POST', getSearchUrl(MODELS.BANK_RECONCILIATION), getBankDetailsFromBRPayload());
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      dispatch(bankDetailsActions.setBankDetailsOperations({ ids: [] }));
      return showErrorMessage('LBL_ERROR_LOADING_BANK_DETAILS');
    }

    if (!data) {
      dispatch(bankDetailsActions.setBankDetailsOperations({ ids: [] }));
    }

    if (data) {
      let brIDs = [];
      brIDs = data.map(({ bankDetails, ...keepAttrs }) => bankDetails.id);
      dispatch(bankDetailsActions.setBankDetailsOperations({ ids: brIDs }));
    }
  };

  const handleSingleDelete = index => {
    formikBD.setFieldValue('deleteID', [index.toString()]);
    setShowDeletePopup(true);
  };

  const deleteBankDetails = ids => {
    if (ids.length > 0) {
      dispatch(bankDetailsActions.deleteBankDetails({ bankDetailsIDs: ids }));
      formik.setFieldValue('checked', []);
    } else {
      showErrorMessage('LBL_ERROR_YOU_SHOULD_SELECT_ITEMS');
    }
  };

  // Inner Table Data
  const [lineData, setLineData] = useState([]);

  const lineHeaders = [t('LBL_OWNER_NAME'), t('LBL_SWIFT_ADDRESS'), t('LBL_IBAN_BBAN'), t('LBL_BIC'), t('ACTIVE')];

  const viewLineHandler = line => {
    setShowViewModal(true);
    setViewID(line.lineId);
  };

  const editLineHandler = line => {
    setShowEditModal(true);
    setEditID(line.lineId);
  };

  const deleteLineHandler = (line, index) => {
    handleSingleDelete(index);
  };

  const openMoreActionHandler = line => {};

  useEffect(() => {
    let tempData = [];
    bankDetailsList &&
      bankDetailsList.length > 0 &&
      bankDetailsList.forEach(line => {
        tempData.push({
          isDeleteable: line.canDelete,
          isEditable: line.canEdit,
          isViewable: true,
          tableData: [
            { value: line.ownerName, type: 'text' },
            { value: line.bankAddress?.fullAddress ?? '', type: 'text' },
            { value: line.iban, type: 'text' },
            { value: line['bank.code'] ?? '', type: 'text' },
            { value: line.active, type: 'checkbox' },
          ],
          data: line,
          key: line.lineId,
          headData: line.iban,
        });
      });
    setLineData(tempData);
  }, [bankDetailsList]);

  useEffect(() => {
    if (!formik.isValid) formik.validateForm();
  }, [formik.isValid]);

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-6" key="defaultBankDetails">
            <SearchModalAxelor
              formik={formik}
              modelKey="DEFAULT_BANK_DETAILS"
              mode="edit"
              onSuccess={onGetDefaultBankDetailsSuccess}
              originalData={company?.defaultBankDetails || null}
              payloadDomain="self.id in (:_field_ids)"
              payloadDomainContext={{
                id: companyCode,
                _model: MODELS.COMPANY,
                _field: 'bankDetailsList',
                _field_ids: bankDetailsIDs,
              }}
              selectIdentifier="fullName"
              extraFields={['bank.code', 'ownerName', 'bankAddress', 'iban', 'active']}
            />
          </div>
          <InnerTable
            title={t('LBL_BANK_ACCOUNTS')}
            pageMode="edit"
            onAddNewLine={() => setShowAddBankModal(true)}
            onViewLine={viewLineHandler}
            onEditLine={editLineHandler}
            onDeleteLine={deleteLineHandler}
            onOpenMoreAction={openMoreActionHandler}
            lineHeaders={lineHeaders}
            lineData={lineData}
            alternativeID="lineId"
          />
        </div>
      </div>
      {showAddBankModal && (
        <BankAccountModal
          show={showAddBankModal}
          setShow={setShowAddBankModal}
          companyID={companyID}
          companyName={companyName}
          companyCode={companyCode}
          companyPartner={companyPartner}
          mode="add"
          bankDetailsList={bankDetailsList}
          setBankDetailsList={setBankDetailsList}
        />
      )}
      {showViewModal && (
        <BankAccountModal
          show={showViewModal}
          setShow={setShowViewModal}
          companyID={companyID}
          companyName={companyName}
          companyCode={companyCode}
          companyPartner={companyPartner}
          mode="view"
          lineId={viewID}
        />
      )}
      {showEditModal && (
        <BankAccountModal
          show={showEditModal}
          setShow={setShowEditModal}
          companyID={companyID}
          companyName={companyName}
          companyCode={companyCode}
          companyPartner={companyPartner}
          bankDetailsList={bankDetailsList}
          setBankDetailsList={setBankDetailsList}
          mode="edit"
          lineId={editID}
        />
      )}
      {showDeletePopup && (
        <ConfirmationPopup
          onClickHandler={deleteBankDetails}
          onClickHandlerParams={formikBD.values.deleteID}
          setConfirmationPopup={setShowDeletePopup}
          item={t('LBL_BANK_ACCOUNT')}
        />
      )}
    </>
  );
}
