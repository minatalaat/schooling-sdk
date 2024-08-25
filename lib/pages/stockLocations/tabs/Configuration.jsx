import { useTranslation } from 'react-i18next';

import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';

export default function Configuration({ formik, mode }) {
  const { t } = useTranslation();

  return (
    <div className="col-md-6">
      <div className="tab-pane" id="pills-Settings" role="tabpanel" aria-labelledby="pills-Settings-tab">
        <ul className="table-list px-0 mt-2">
          <li>
            <div className="text">
              <h5>{t('USABLE_ON_SALE_ORDER')}</h5>
              {/* Example for subtitle */}
              {/* <p>E.g., a warehouse would have stock for online purchase, a 3rd party retailer would not.</p> */}
            </div>

            <ToggleSwitch formik={formik} accessor="usableOnSaleOrder" mode={mode} disabled={true} />
          </li>
          <li>
            <div className="text">
              <h5>{t('USABLE_ON_PURCHASE_ORDER')}</h5>
            </div>

            <ToggleSwitch formik={formik} accessor="usableOnPurchaseOrder" mode={mode} disabled={true} />
          </li>
          <li>
            <div className="text">
              <h5>{t('VALUED')}</h5>
            </div>

            <ToggleSwitch formik={formik} accessor="isValued" mode={mode} />
          </li>
        </ul>
      </div>
    </div>
  );
}
