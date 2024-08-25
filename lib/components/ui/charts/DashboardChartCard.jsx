import { useTranslation } from 'react-i18next';

import DashboardChart from './DashboardChart';
import DateInput from '../inputs/DateInput';
import PrimaryButton from '../buttons/PrimaryButton';
import DropDown from '../inputs/DropDown';
import SearchModalAxelor from '../inputs/SearchModal/SearchModalAxelor';

const DashboardChartCard = ({ title = '', type = 'BAR', options, data, formik, btnOptions, infoColors, dropDownOptions, children }) => {
  const { t } = useTranslation();

  return (
    <div className="card section-card">
      <div className="card-header-q">
        <h5 className="float-start">{t(title)}</h5>
        {btnOptions && (
          <PrimaryButton theme="dashboardChart" text={btnOptions?.text} onClick={btnOptions?.onClick} style={{ fontSize: '0.9rem' }}>
            {btnOptions?.src && <img src={btnOptions?.src} alt={btnOptions?.alt} />}
          </PrimaryButton>
        )}
        {dropDownOptions && (
          <div className="col-md-4 float-end">
            <DropDown
              options={dropDownOptions.options}
              formik={dropDownOptions.formik}
              isRequired={dropDownOptions.isRequired}
              label={dropDownOptions.label}
              accessor={dropDownOptions.accessor}
              translate={dropDownOptions.translate}
              keys={{ valueKey: dropDownOptions.valueKey, titleKey: dropDownOptions.titleKey }}
              mode="add"
              onChange={dropDownOptions.onChange}
              type={dropDownOptions.type}
              noLabel={dropDownOptions.noLabel}
            />
          </div>
        )}
      </div>
      <div className={children ? 'card-body-q pt-3' : 'card-body-q pt-0'}>
        {children && (
          <div className="row">
            {children.map(child => {
              if (child.type === 'DATE')
                return (
                  <div className="col-md-6">
                    <DateInput formik={formik} label={child?.label} accessor={child?.accessor} mode="add" onChange={child?.onChange} />
                  </div>
                );
              if (child.type === 'SEARCH')
                return (
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey={child?.modelKey}
                      mode="add"
                      defaultValueConfig={child?.defaultValueConfig}
                      isRequired={child?.isRequired}
                      payloadDomain={child?.payloadDomain}
                      payloadDomainContext={child?.payloadDomainContext}
                      extraFields={child?.extraFields}
                      selectCallback={child?.selectCallback}
                      removeCallback={child?.removeCallback}
                      showRemoveOption={child?.showRemoveOption}
                    />
                  </div>
                );
            })}
          </div>
        )}

        {infoColors?.data?.length > 0 && (
          <div className="row">
            <div className="color-info">
              {infoColors.data.map(color => {
                if (!color.colorId || !color.label) return null;
                return (
                  <div className={`info-${color.colorId} col`} key={color.colorId}>
                    <p>
                      <i className={`info-color-${color.colorId}`}></i>
                      {t(color.label)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="row">
          <div className={children ? 'dashboard-chart-wc-wrapper' : 'dashboard-chart-wrapper'}>
            {data && <DashboardChart type={type} options={options} data={data} />}
            {!data && <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChartCard;
