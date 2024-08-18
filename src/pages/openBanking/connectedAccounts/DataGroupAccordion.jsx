import { useState } from 'react';
import i18n from 'i18next';

import OBUserIcon from '../../../assets/images/ob-user-icon.svg';
import OBCreditCard from '../../../assets/images/ob-credit-card.svg';
import OBTransaction from '../../../assets/images/ob-transaction.svg';
import CardIcon from '../../../assets/images/card-icon.svg';

const DataGroupAccordion = ({ dataGroup }) => {
  let { DescriptionEn, DescriptionAr, DataGroupId, Permissions } = dataGroup;
  const [showData, setShowData] = useState(false);

  const dataGroupsImages = {
    AccountDetails: OBUserIcon,
    RegularPayments: OBCreditCard,
    AccountTransactions: OBTransaction,
    PartyDetails: CardIcon,
  };

  return (
    <>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className={showData ? 'accordion-button' : 'accordion-button collapsed'}
            type="button"
            onClick={() => {
              setShowData(!showData);
            }}
          >
            {dataGroupsImages[DataGroupId] && <img src={dataGroupsImages[DataGroupId]} alt={DataGroupId} />}
            {i18n.language === 'en' ? DescriptionEn ?? '' : DescriptionAr ?? ''}
          </button>
        </h2>

        {showData && (
          <div id="question-3" className="accordion-collapse collapse show">
            <div className="accordion-body">
              <div className="row">
                <div className="col-md-12">
                  <div className="data-list">
                    {Permissions &&
                      Permissions.map(permission => (
                        <p>
                          {i18n.language === 'en' ? permission.PermissionDescriptionEn ?? '' : permission.PermissionDescriptionAr ?? ''}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DataGroupAccordion;
