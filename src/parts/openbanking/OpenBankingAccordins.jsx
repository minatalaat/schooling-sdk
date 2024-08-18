import i18next from 'i18next';
import React, { useState } from 'react';
import ObUserIcon from '../../assets/images/ob-user-icon.svg';
import CloseIcon from '../../assets/images/icons-close-ob.svg';
import NoDataAvailable from '../../components/NoDataAvailable';

function OpenBankingAccordins({ currentAccountLink, disconnect }) {
  const [showRows, setShowRows] = useState([]);

  const toggleShowHiddenRow = id => {
    let tempRows = [...showRows];
    let index = tempRows.indexOf(id);

    if (index > -1) {
      tempRows.splice(index, 1);
    } else {
      tempRows.push(id);
    }

    setShowRows([...tempRows]);
  };

  return (
    <div className="accordion accordion-flush" id="accordionFlushExample">
      {currentAccountLink &&
        currentAccountLink.DataGroups &&
        currentAccountLink.DataGroups.length > 0 &&
        currentAccountLink.DataGroups.map(group => {
          return (
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={showRows.indexOf(group.DataGroupId) > -1 ? 'accordion-button' : 'accordion-button collapsed'}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseOne"
                  aria-expanded="true"
                  aria-controls="panelsStayOpen-collapseOne"
                  onClick={() => {
                    toggleShowHiddenRow(group.DataGroupId);
                  }}
                >
                  {!disconnect && <img src={ObUserIcon} alt="ObUserIcon" />}
                  {disconnect && <img src={CloseIcon} alt="CloseIcon" />}

                  {i18next.language === 'en' ? group?.DescriptionEn || '' : group?.DescriptionAr || group?.DescriptionEn || ''}
                </button>
              </h2>
              <div
                id="panelsStayOpen-collapseOne"
                className={showRows.indexOf(group.DataGroupId) > -1 ? 'accordion-collapse collapse show' : 'accordion-collapse collapse'}
              >
                <div className="accordion-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="data-list">
                        {group.Permissions &&
                          group.Permissions.length > 0 &&
                          group.Permissions.map(permission => {
                            return (
                              <p>
                                {i18next.language === 'en'
                                  ? permission?.PermissionDescriptionEn || ''
                                  : permission?.PermissionDescriptionAr}{' '}
                              </p>
                            );
                          })}
                        {group && group.Permissions && group.Permissions.length === 0 && <NoDataAvailable />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      {currentAccountLink && currentAccountLink.dataGroups && currentAccountLink.dataGroups.length === 0 && <NoDataAvailable />}
    </div>
  );
}

export default OpenBankingAccordins;
