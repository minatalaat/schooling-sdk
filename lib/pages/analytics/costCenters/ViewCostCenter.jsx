import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Calendar from '../../../components/ui/Calendar';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';
import MoreAction from '../../../parts/MoreAction';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import TextInput from '../../../components/ui/inputs/TextInput';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import { setAllValues } from '../../../utils/formHelpers';

function ViewCostCenter({ feature, subFeature }) {
  const actionEnum = {
    1: 'LBL_VIEW',
    2: 'LBL_ADD',
    3: 'LBL_EDIT',
    4: 'LBL_DELETE',
  };

  Object.freeze(actionEnum);
  const { api } = useAxiosFunction();
  const { canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [showDeletePop, setShowDeletePop] = useState(false);
  const [deleteCostCenter, setDeleteCostCenter] = useState(null);
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);
  const { t } = useTranslation();
  const [fetchedCostCenter, setFetchedCostCenter] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initVals = {
    name: '',
    code: '',
    axis: null,
    isActive: false,
  };

  const formik = useFormik({
    initialValues: initVals,
    validateOnMount: true,
  });

  useEffect(() => {
    api(
      'POST',
      getFetchUrl(MODELS.ANALYTICACCOUNT, id),
      {
        fields: ['code', 'name', 'analyticAxis', 'statusSelect'],
        related: {},
      },
      onFetchedCostCenterSuccess
    );
  }, []);

  const onFetchedCostCenterSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data[0];
      setFetchedCostCenter(data);
      setDeleteCostCenter({
        id: id,
        version: data.version,
        name: data.name,
      });
      setAllValues(formik, {
        name: data.name ? data.name : '',
        code: data.code ? data.code : '',
        axis: data.analyticAxis ?? null,
        isActive: data.statusSelect === 1 ? true : false,
      });
    }
  };

  const onCostCenterDeleteSuccess = response => {
    if (response.data.status === 0) {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'COST_CENTER_DELETE_MESSAGE' }));
      setTimeout(() => {
        if (response.data.status === 0) {
          navigate(getFeaturePath(subFeature));
        }
      }, 3000);
    } else {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const deleteConfirmHandler = () => {
    if (deleteCostCenter) {
      let deletePayload = {
        records: [
          {
            id: id,
            version: deleteCostCenter.version,
          },
        ],
      };
      api('POST', getRemoveAllUrl(MODELS.ANALYTIC_AXIS), deletePayload, onCostCenterDeleteSuccess);
    }
  };

  return (
    <>
      {showMoreActionToolbar && (
        <MoreAction
          showMoreAction={showMoreActionToolbar}
          setShowMoreAction={setShowMoreActionToolbar}
          editHandler={
            canEdit
              ? () => {
                  navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                }
              : null
          }
          deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
          canSelectAll={false}
        />
      )}{' '}
      {showDeletePop && (
        <ConfirmationPopup
          onClickHandler={deleteConfirmHandler}
          onClickHandlerParams={deleteCostCenter}
          setConfirmationPopup={setShowDeletePop}
          item={`${t('LBL_COST_CENTER')} : ${deleteCostCenter.name}`}
        />
      )}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_COST_CENTER" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_VIEW_COST_CENTER')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                editHandler={
                  canEdit
                    ? () => {
                        navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                      }
                    : null
                }
                deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
                setShowMoreAction={setShowMoreActionToolbar}
              />
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} accessor="code" label="LBL_CODE" mode="view" />
                  </div>
                  <div className="col-md-6">
                    <TextInput formik={formik} accessor="name" label="LBL_NAME" mode="view" />
                  </div>
                  <div className="col-md-6">
                    <SearchModalAxelor formik={formik} modelKey="ANALYTIC_AXIS" mode="view" />
                  </div>
                  <div className="col-md-6">
                    <ToggleSwitch formik={formik} label="LBL_ACTIVATE" accessor="isActive" mode="view" disabled={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewCostCenter;
