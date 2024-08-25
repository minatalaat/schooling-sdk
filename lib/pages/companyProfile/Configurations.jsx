import { useDispatch } from 'react-redux';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../components/ui/inputs/TextInput';
import DropDown from '../../components/ui/inputs/DropDown';

import useMetaFields from '../../hooks/metaFields/useMetaFields';
import NumberInput from '../../components/ui/inputs/NumberInput';
import { alertsActions } from '../../store/alerts';

export default function Configurations({ formik, data }) {
  const dispatch = useDispatch();
  const defaultPartnerTypeSelect = useMetaFields('company.partner.type.select');
  const defaultPartnerCategorySelect = useMetaFields('company.partner.category.select');
  const timezone = useMetaFields('company.timezone.select');

  const onCurrencySuccess = res => {
    if (res.data.status === 0) {
      if (res.data.data) {
        return { displayedData: [...(res?.data?.data || [])], total: res.data.total || 0 };
      }
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const onLanguagesSuccess = res => {
    if (res.data.status === 0) {
      if (res.data.data) {
        return { displayedData: [...(res?.data?.data || [])], total: res.data.total || 0 };
      }
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6" key="currency">
          <SearchModalAxelor
            formik={formik}
            modelKey="CURRENCIES"
            mode="view"
            onSuccess={onCurrencySuccess}
            originalData={data?.currency || null}
            isRequired={true}
          />
        </div>

        <div className="col-md-6" key="printingSettings">
          <TextInput formik={formik} label="LBL_PRINTING_SETTING" accessor="printingSettings" mode="view" />
        </div>
        {/* <div className="col-md-6">
          <DropDown
            formik={formik}
            accessor="defaultPartnerTypeSelect"
            label="LBL_PARTNER_TYPE"
            keys={{ valueKey: 'value', titleKey: 'label' }}
            options={defaultPartnerTypeSelect.list}
            translate={defaultPartnerTypeSelect.mode === 'enum'}
            mode="edit"
            initialValue={0}
          />
        </div>
        <div className="col-md-6">
          <DropDown
            formik={formik}
            accessor="defaultPartnerCategorySelect"
            label="LBL_PARTNER_DEFAULT_CATEGORY"
            keys={{ valueKey: 'value', titleKey: 'label' }}
            options={defaultPartnerCategorySelect.list}
            translate={defaultPartnerCategorySelect.mode === 'enum'}
            mode="edit"
            initialValue={0}
          />
        </div>
        <div className="col-md-6">
          <NumberInput formik={formik} label="LBL_SUPPLIER_PAYMENT_DELAY" accessor="supplierPaymentDelay" mode="edit" />
        </div>
        <div className="col-md-6">
          <NumberInput formik={formik} label="LBL_CUSTOMER_PAYMENT_DELAY" accessor="customerPaymentDelay" mode="edit" />
        </div>
        <div className="col-md-6" key="language">
          <SearchModalAxelor
            formik={formik}
            modelKey="LANGUAGES"
            mode="edit"
            onSuccess={onLanguagesSuccess}
            originalData={data?.language || null}
          />
        </div>
        <div className="col-md-6">
          <DropDown
            formik={formik}
            accessor="timezone"
            label="TIMEZONE"
            keys={{ valueKey: 'value', titleKey: 'label' }}
            options={timezone.list}
            translate={false}
            mode="edit"
            initialValue=""
          />
        </div> */}
      </div>
    </div>
  );
}
