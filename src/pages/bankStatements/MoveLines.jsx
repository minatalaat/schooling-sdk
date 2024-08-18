import { useTranslation } from 'react-i18next';

import NoDataAvailable from '../../components/NoDataAvailable';

import ArrowRed from '../../assets/images/arrow-red.svg';
import ArrowGreen from '../../assets/images/arrow-green.svg';

import { formatFloatNumber } from '../../utils/helpers';

const MoveLines = ({ moveLines }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="col-md-12 mt-3 mb-3">
        <div className="title-section float-start">
          <h4>{t('LBL_MOVELINES')}</h4>
        </div>
      </div>
      <div className="table-responsive table-responsive-xxl supplier-po-request">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{t('LBL_NAME')}</th>
              <th>{t('LBL_DATE')}</th>
              <th>{t('LBL_PERIOD')}</th>
              <th>{t('LBL_ACCOUNT')}</th>
              <th>{t('LBL_CUSTOMER_SUPPLIER')}</th>
              <th>
                {t('LBL_DEBIT')} <img src={ArrowGreen} alt="green-arrow" />
              </th>
              <th>
                {t('LBL_CREDIT')} <img src={ArrowRed} alt="red-arrow" />
              </th>
            </tr>
          </thead>
          <tbody>
            {moveLines &&
              moveLines.map(moveLine => {
                return (
                  <tr>
                    <td>{moveLine.name}</td>
                    <td>{moveLine.date}</td>
                    <td>{moveLine.period ? moveLine.period.name : ''}</td>
                    <td>{moveLine.account ? moveLine.account.label : ''}</td>
                    <td>{moveLine.partner ? moveLine.partner.fullName : ''}</td>
                    <td className="color-text-red">{formatFloatNumber(moveLine.debit)}</td>
                    <td className="color-text-green">{formatFloatNumber(moveLine.credit)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {moveLines && moveLines.length === 0 && <NoDataAvailable />}
      </div>
    </>
  );
};

export default MoveLines;
