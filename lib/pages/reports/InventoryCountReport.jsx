import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import i18next from 'i18next';

import Calendar from '../../components/ui/Calendar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import ViewReport from './ViewReport';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl } from '../../services/getUrl';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';
import { supportedFormats } from './constants';
import DropDown from '../../components/ui/inputs/DropDown';

function InventoryCountReport({ feature, subFeature }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [buttonClicked, setButtonCliked] = useState(false);
  const [pdfURL, setPdfURL] = useState('');

  const initVals = {
    stockCount: null,
    format: '',
  };
  const valSchema = Yup.object().shape({
    stockCount: Yup.object().required(t('REQUIRED')).nullable(),
    format: Yup.string().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setButtonCliked(false));

  const onInventoriesSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let inventories = [];
      if (data && data.length > 0)
        data.forEach(inventory => {
          let temp = {
            id: inventory ? (inventory.id ? inventory.id : -1) : -1,
            inventorySeq: inventory ? (inventory.inventorySeq ? inventory.inventorySeq : '') : '',
            stockLocation: inventory ? (inventory['stockLocation.name'] ? inventory['stockLocation.name'] : '') : '',
            plannedStartDateT: inventory
              ? inventory.plannedStartDateT
                ? moment(inventory.plannedStartDateT).locale('en').format('YYYY-MM-DD')
                : ''
              : '',
            description: inventory ? (inventory.description ? inventory.description : '') : '',
          };
          inventories.push(temp);
        });
      return { displayedData: [...inventories], total: response.data.total || 0 };
    }
  };

  const generateReport = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);
    let reportPayload = {
      action: 'action-print-inventory-count-report',
      data: {
        InventoryCountCode: formik.values.stockCount ? formik.values.stockCount.inventorySeq : null,
        Locale: i18next.language,
        format: formik.values.format,
      },
    };

    if (reportPayload) {
      api('POST', getActionUrl(), reportPayload, onGenerateReportSuccess);
    } else {
      setButtonCliked(false);
    }
  };

  const onGenerateReportSuccess = response => {
    if (response.data.status === 0) {
      const url = response.data.data
        ? response.data.data[0]
          ? response.data.data[0].view
            ? response.data.data[0].view.views
              ? response.data.data[0].view.views[0].name
                ? response.data.data[0].view.views[0].name
                : ''
              : ''
            : ''
          : ''
        : '';

      if (url !== '') {
        setButtonCliked(false);
        setPdfURL(url);
      } else {
        setButtonCliked(false);
      }
    } else {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };
  useEffect(() => {
    if (formik.values.format !== '') {
      setPdfURL('');
    }
  }, [formik.values.format]);
  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_INVENTORY_COUNT_REPORT')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_GENERATE_REPORT" onClick={() => generateReport()} />
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
                      modelKey="STOCK_COUNT"
                      mode="add"
                      isRequired={true}
                      onSuccess={onInventoriesSuccess}
                      defaultValueConfig={null}
                      selectIdentifier="inventorySeq"
                      payloadDomain="self.statusSelect = 5"
                    />
                  </div>
                  <div className="col-md-6">
                    <DropDown
                      options={supportedFormats}
                      formik={formik}
                      isRequired={true}
                      label="LBL_FORMAT"
                      accessor="format"
                      type="STRING"
                      keys={{ valueKey: 'value', titleKey: 'name' }}
                      mode="add"
                    />
                  </div>
                  <FormNotes
                    notes={[
                      {
                        title: 'LBL_REQUIRED_NOTIFY',
                        type: 3,
                      },
                    ]}
                  />
                  {pdfURL !== '' && <ViewReport url={pdfURL} formik={formik} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InventoryCountReport;
