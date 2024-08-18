import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAxiosFunction } from '../../hooks/useAxios';
import moment from 'moment';
import { FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import DropDown from '../../components/ui/inputs/DropDown';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { getActionUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Calendar from '../../components/ui/Calendar';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

function ExportCenter() {
  const { t } = useTranslation();
  moment.locale('en');
  const allowedExports = useSelector(state => state.userFeatures.allowedExports);
  const { api, downloadFile } = useAxiosFunction();
  const [buttonClicked, setButtonCliked] = useState(false);
  const dispatch = useDispatch();

  const exportOptions = [
    { name: '', title: `${t('LBL_PLEASE_SELECT')}` },
    { name: 'PDF', title: `${t('LBL_EXPORT_AS')} PDF`, action: 'action-export-pdf-method', type: 'pdf', IconComponent: FaFilePdf },
    { name: 'Excel', title: `${t('LBL_EXPORT_AS')} Excel`, action: 'action-export-excel-method', type: 'xlsx', IconComponent: FaFileExcel },
    { name: 'CSV', title: `${t('LBL_EXPORT_AS')} CSV`, action: 'action-export-csv-method', type: 'csv', IconComponent: FaFileCsv },
  ];

  const initVals = {
    exportModel: null,
    exportFormat: '',
  };
  const valSchema = Yup.object().shape({
    exportModel: Yup.object().nullable().required(t('REQUIRED')),
    exportFormat: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(t('EXPORT_FORMAT_VALIDATION_MESSAGE')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setButtonCliked(false));

  const onAdvancedExportSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let models = [];

      if (data) {
        data.forEach(model => {
          if (!model.name.includes('.Template') && allowedExports && allowedExports.findIndex(item => item === model?.name) !== -1) {
            let temp = {
              id: model.id,
              name: model?.name ?? '',
              metaModel: model ? (model.metaModel ? model.metaModel.name : null) : null,
            };
            models.push(temp);
          }
        });
      }

      return { displayedData: [...models], total: response.data.total || 0 };
    }
  };

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const exportData = async name => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);
    const selectedObject = exportOptions.find(option => option.name === formik.values.exportFormat);

    let modelId = formik.values.exportModel?.id ?? null;

    const getFileResponse = await api('POST', getActionUrl(), {
      model: MODELS.ADVANCED_EXPORT,
      action: selectedObject.action,
      data: {
        context: {
          _model: MODELS.ADVANCED_EXPORT,
          id: modelId,
        },
      },
    });

    if (
      !getFileResponse ||
      !getFileResponse.data ||
      getFileResponse.data.status !== 0 ||
      !getFileResponse.data.data ||
      !getFileResponse.data.data[0] ||
      !getFileResponse.data.data[0].view.views ||
      !getFileResponse.data.data[0].view.views[0] ||
      !getFileResponse.data.data[0].view.views[0].name
    ) {
      setButtonCliked(false);
      alertHandler('Error', t('LBL_FAILED_TO_DOWNLAOD'));
      return null;
    }

    const url = import.meta.env.VITE_BASE_URL + getFileResponse.data.data[0].view.views[0].name;
    const fileName = `${formik.values.exportModel.name}_${selectedObject.name} ${moment().format('YYYY-MM-DD h-mm-ss')}.${
      selectedObject.type
    }`;
    downloadFile(
      url,
      fileName,
      () => {},
      () => {
        setButtonCliked(false);
        alertHandler('Error', t('LBL_FAILED_TO_DOWNLAOD'));
        return null;
      }
    );
    setButtonCliked(false);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature="APP_CONFIG" subFeature="EXPORT_MODEL" />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_EXPORT_MODEL')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" onClick={() => exportData()} text="Invoicing_ActionOptionTwo" />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="ADVANCED_EXPORT"
                      mode="add"
                      isRequired={true}
                      onSuccess={onAdvancedExportSuccess}
                      defaultValueConfig={null}
                    />
                  </div>
                  <div className="col-md-6">
                    <DropDown
                      options={exportOptions}
                      formik={formik}
                      isRequired={true}
                      label="LBL_EXPORT_FORMAT"
                      accessor="exportFormat"
                      // translate={unitTypeSelect.mode === 'enum'}
                      keys={{ valueKey: 'name', titleKey: 'title' }}
                      mode="add"
                    />{' '}
                  </div>
                </div>
                <FormNotes
                  notes={[
                    {
                      title: 'LBL_REQUIRED_NOTIFY',
                      type: 3,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExportCenter;
