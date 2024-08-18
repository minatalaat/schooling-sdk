import { useSelector } from 'react-redux';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import TextArea from '../../../components/ui/inputs/TextArea';
import FormNotes from '../../../components/ui/FormNotes';
import { MODES } from '../../../constants/enums/FeaturesModes';

const LineContent = ({ lineFormik, mode, onCreditChange, onDebitChange, hidePartnerColumn }) => {
  let company = useSelector(state => state.userFeatures.companyInfo.company);

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={lineFormik}
              modelKey="ACCOUNTS"
              mode={mode}
              payloadDomain="self.statusSelect = 1"
              defaultValueConfig={null}
              isRequired={true}
              selectIdentifier="label"
              extraFields={['analyticDistributionAuthorized']}
            />
          </div>
          {!hidePartnerColumn && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={lineFormik}
                modelKey="PARTNERS"
                mode={mode}
                defaultValueConfig={null}
                selectIdentifier="fullName"
                extraFields={['fullName']}
                payloadDomain={`self.isContact = false AND ${company.id} member of self.companySet`}
              />
            </div>
          )}
          <div className="col-md-6">
            <NumberInput formik={lineFormik} label="LBL_AMOUNT" accessor="currencyAmount" mode="view" />
          </div>
          <div className="col-md-6">
            <NumberInput formik={lineFormik} label="LBL_CURRENCY_RATE" accessor="currencyRate" mode="view" />
          </div>
          <div className="col-md-6">
            <NumberInput
              formik={lineFormik}
              label="LBL_DEBIT"
              accessor="debit"
              mode={mode}
              className="color-text-green"
              onChange={e => {
                onDebitChange(e.target.value);
              }}
            />
          </div>
          <div className="col-md-6">
            <NumberInput
              formik={lineFormik}
              label="LBL_CREDIT"
              accessor="credit"
              mode={mode}
              className="color-text-red"
              onChange={e => {
                onCreditChange(e.target.value);
              }}
            />
          </div>
          <div className="col-md-6">
            <TextArea formik={lineFormik} label="LBL_DESCRIPTION" accessor="description" mode={mode} />
          </div>
        </div>
        {mode !== MODES.VIEW && (
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
    </>
  );
};

export default LineContent;
