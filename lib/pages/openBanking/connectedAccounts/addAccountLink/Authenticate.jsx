import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import i18n from 'i18next';

import InfoCard from '../../../../components/ui/InfoCard';
import ConsentAccordion from '../ConsentAccordion';
import DataGroupAccordion from '../DataGroupAccordion';
import { useOBServices } from '../../../../services/apis/useOBServices';

const Authenticate = () => {
  const { t } = useTranslation();
  const { getTransactionFromDate } = useOBServices();
  const selectedFinancialInstitution = useSelector(state => state.financialInstitutions.selectedFinancialInstitution);

  let startDate = getTransactionFromDate().locale('en').format('DD/MM/YYYY');

  const accordionWhyItems = [
    {
      title: 'WHY_YOU_NEED_TO_SHARE',
      data: ['REASON_TO_SHARE'],
    },
  ];

  let institutionName =
    i18n.language === 'en'
      ? selectedFinancialInstitution?.FinancialInstitutionName?.NameEn ?? ''
      : selectedFinancialInstitution?.FinancialInstitutionName?.NameAr ?? '';
  return (
    <>
      <div className="card form-steps">
        <div className="col-md-6 offset-md-3">
          <h4>{t('CONNECT_YOUR_ACCOUNTS')}</h4>
          <p>
            {t('CONFIRM_TO_USE_APP')} {institutionName}
          </p>

          <div className="links-list">
            <div id="cya-banks">
              <div className="accordion accordion-flush" id="accordionFlushExample">
                {accordionWhyItems && accordionWhyItems.map(item => <ConsentAccordion item={item} />)}
              </div>
            </div>

            <h5 className="title-links-list">{t('LBL_WHAT_WE_NEED_TO_SHARE')}</h5>

            <div id="cya-banks">
              <div className="accordion accordion-flush" id="accordionFlushExample">
                {selectedFinancialInstitution?.DataGroups &&
                  selectedFinancialInstitution?.DataGroups.map(dataGroup => <DataGroupAccordion dataGroup={dataGroup} />)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8 offset-md-2">
          <div className="footer-form">
            <hr />
            <div className="col-md-9 mx-auto">
              <div className="row mt-5">
                <div className="col-md-12">
                  <div className="card-info-ob">
                    <div className="Last-update">
                      <p>
                        <i className="calender-i"></i>
                        <strong>{t('START_SHARE_DATA')} </strong> <span>{startDate}</span>
                      </p>
                      <p>
                        <i className="timeline"></i>
                        <strong>{t('LBL_ONGOING_ACCESS')}</strong> <span>{t('LBL_CONTROL_ACCESS_FROM_SETTING')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InfoCard text="LBL_CONTINUE_TO_SHARE" />
    </>
  );
};

export default Authenticate;
