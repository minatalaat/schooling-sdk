import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import PrintingSettingsForm from './PrintingSettingsForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getFetchUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const ViewPrintingSetting = ({ feature, subFeature }) => {
  const mode = 'view';
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const dispatch = useDispatch();

  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [fetchedPrintingSetting, setFetchedPrintingSetting] = useState(null);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);

  const initValues = {
    name: '',
    defaultMailBirtTemplate: null,
    logoPositionSelect: '',
    colorCode: '',
    addressPositionSelect: '',
    pdfHeader: '',
    pdfHeaderHeight: '',
    pdfFooter: '',
    pdfFooterHeight: '',
  };

  const formik = useFormik({
    initialValues: initValues,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);

    if (title === 'Success') {
      setTimeout(() => {
        setDisableSave(false);
      }, 3000);
    } else {
      setDisableSave(false);
    }
  };

  useEffect(() => {
    fetchPrintingSettings();
  }, []);

  const onFetchPayload = () => {
    let payload = {
      fields: [
        'pdfFooterHeight',
        'pdfHeader',
        'pdfHeaderHeight',
        'name',
        'pdfFooter',
        'colorCode',
        'addressPositionSelect',
        'defaultMailBirtTemplate',
        'logoPositionSelect',
      ],
      related: {},
    };
    return payload;
  };

  const fetchPrintingSettings = () => {
    api('POST', getFetchUrl(MODELS.PRINTING_SETTINGS, id), onFetchPayload(), onFetchSuccess);
  };

  const onFetchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) navigate(getFeaturePath(subFeature));

    if (data && data[0]) {
      let printing = data[0];
      setFetchedPrintingSetting(printing);
      formik.setValues({
        name: printing.name,
        defaultMailBirtTemplate: printing.defaultMailBirtTemplate ?? null,
        logoPositionSelect: printing.logoPositionSelect,
        colorCode: printing.colorCode ?? '',
        addressPositionSelect: printing.addressPositionSelect,
        pdfHeader: printing.pdfHeader ?? '',
        pdfHeaderHeight: printing.pdfHeaderHeight ?? '',
        pdfFooter: printing.pdfFooter ?? '',
        pdfFooterHeight: printing.pdfFooterHeight ?? '',
      });
    }
  };

  const getDeletePayload = () => {
    let payload = {
      records: [
        {
          id: id,
        },
      ],
    };
    return payload;
  };

  const singleDeleteHandler = () => {
    setButtonClicked(true);
    setDisableSave(true);
    api('POST', getRemoveAllUrl(MODELS.PRINTING_SETTINGS), getDeletePayload(), onSettingsDeleteSuccess);
  };

  const onSettingsDeleteSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_DELETE_PRINTING_SETTINGS'));

    if (data) {
      alertHandler('Success', t('LBL_PRINTING_SETTINGS_DELETED'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    }
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_PRINTING_SETTINGS" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{formik.values.name}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={disableSave} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                editHandler={() => {
                  navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                }}
                deleteHandler={() => setShowDeletePopup(true)}
                setShowMoreAction={setShowMoreAction}
              />
              <PrintingSettingsForm formik={formik} mode={mode} alertHandler={alertHandler} />
            </div>
          </div>
        </div>
      </div>
      {showMoreAction && (
        <MoreAction
          editHandler={() => {
            navigate(getFeaturePath(subFeature, 'edit', { id: id }));
          }}
          deleteHandler={() => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
      {showDeletePopup && (
        <ConfirmationPopup
          onClickHandler={singleDeleteHandler}
          setConfirmationPopup={setShowDeletePopup}
          item={fetchedPrintingSetting.name}
        />
      )}
    </>
  );
};

export default ViewPrintingSetting;
