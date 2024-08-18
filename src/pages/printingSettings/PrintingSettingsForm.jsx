import { useTranslation } from 'react-i18next';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import DropDown from '../../components/ui/inputs/DropDown';
import TextInput from '../../components/ui/inputs/TextInput';
import TextArea from '../../components/ui/inputs/TextArea';
import NumberInput from '../../components/ui/inputs/NumberInput';

import useMetaFields from '../../hooks/metaFields/useMetaFields';
import FormNotes from '../../components/ui/FormNotes';

const PrintingSettingsForm = ({ formik, mode, alertHandler }) => {
  const { t } = useTranslation();

  const addressPositionSelect = useMetaFields('printing.setting.address.position');
  const logoPositionSelect = useMetaFields('printing.setting.logo.position');

  const onBirtTemplatesSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_BIRT_TEMPLATES'));
    }

    let tempTemplates = [];

    if (data) {
      data.forEach(template => {
        tempTemplates.push({
          id: template.id,
          name: template.name,
          templateFileName: template.templateLink,
        });
      });
    }

    return { displayedData: [...tempTemplates], total: response?.data?.total || 0 };
  };

  return (
    <div className="card">
      <div className="row">
        <div className="col-md-6">
          <TextInput formik={formik} label="LBL_NAME" accessor="name" isRequired={true} mode={mode} />
        </div>
        <div className="col-md-6">
          <SearchModalAxelor formik={formik} modelKey="BIRT_TEMPLATES" mode={mode} onSuccess={onBirtTemplatesSuccess} />
        </div>
        <div className="col-md-6">
          <DropDown
            formik={formik}
            mode={mode}
            label="LBL_LOGO_POSITION"
            accessor="logoPositionSelect"
            options={logoPositionSelect.list}
            translate={logoPositionSelect.mode === 'enum'}
            keys={{ valueKey: 'value', titleKey: 'label' }}
            type={logoPositionSelect.data?.type}
          />
        </div>
        <div className="col-md-6">
          <TextInput formik={formik} label="LBL_COLOR_CODE" accessor="colorCode" mode={mode} />
        </div>
        <div className="col-md-6">
          <DropDown
            formik={formik}
            mode={mode}
            label="LBL_ADDRESS_POSITION"
            accessor="addressPositionSelect"
            options={addressPositionSelect.list}
            translate={addressPositionSelect.mode === 'enum'}
            keys={{ valueKey: 'value', titleKey: 'label' }}
            type={addressPositionSelect.data?.type}
          />
        </div>
        <div className="border-section"></div>
        <div className="col-md-12">
          <TextArea formik={formik} label="LBL_COMPANY_HEADER" accessor="pdfHeader" mode={mode} />
        </div>
        <div className="col-md-6">
          <NumberInput formik={formik} label="LBL_COMPANY_HEADER_HEIGHT" accessor="pdfHeaderHeight" mode={mode} step={0.1} />
        </div>
        <div className="col-md-12">
          <TextArea formik={formik} label="LBL_COMPANY_FOOTER" accessor="pdfFooter" mode={mode} />
        </div>
        <div className="col-md-6">
          <NumberInput formik={formik} label="LBL_COMPANY_FOOTER_HEIGHT" accessor="pdfFooterHeight" mode={mode} step={0.1} />
        </div>
      </div>
      {mode !== 'view' && (
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
  );
};

export default PrintingSettingsForm;
