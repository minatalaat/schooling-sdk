import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormNotes from '../FormNotes';

export default function Tabs({
  children,
  selectedTab,
  setSelectedTab,
  isSeperateCard = false,
  tabsList = [],
  showTabsContent,
  isModal = false,
  formik,
  goTo,
  submitFlag = false,
}) {
  const { t } = useTranslation();

  const errorTabs = useMemo(() => {
    if (!formik?.errors) return [];

    let tabsWithErrors = [];
    const errorFields = Object.keys(formik?.errors);
    const touchedFields = Object.keys(formik?.touched);

    tabsList.forEach(tab => {
      if (!tab.relatedFields?.length > 0) return null;
      tab.relatedFields.forEach(f => {
        if (errorFields?.includes(f) && touchedFields?.includes(f)) tabsWithErrors.push(tab.accessor);
      });
    });

    if (tabsWithErrors.length > 0 && submitFlag) goTo(tabsWithErrors[0]);

    return tabsWithErrors;
  }, [formik?.errors, formik?.touched, submitFlag]);

  useEffect(() => {
    let updatedList = tabsList.filter(tab => !tab.isHidden);
    if (updatedList.length > 0) setSelectedTab(updatedList[0].accessor || null);
  }, []);

  return (
    <>
      {!isModal && (
        <div className={`card${!isSeperateCard ? ' pills-tab-container' : ' head-pills'}`}>
          <div className={`row${!isSeperateCard ? ' pills-tab-new mb-4' : ''}`}>
            <div className="col-md-12">
              <ul className={`nav nav-pills${!isSeperateCard ? ' w-100' : ''}`} id="pills-tab" role="tablist">
                {tabsList.map(tab => {
                  if (tab.isHidden) return null;
                  return (
                    <li className="nav-item" role="presentation" key={tab.accessor}>
                      <button
                        className={`${selectedTab === tab.accessor ? 'nav-link active' : 'nav-link'} ${
                          errorTabs.includes(tab.accessor) ? 'validation-tab' : ''
                        }`}
                        id="pills-Main-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-Main"
                        type="button"
                        role="tab"
                        aria-controls="pills-Main"
                        aria-selected={selectedTab === tab.accessor ? 'true' : 'false'}
                        onClick={() => {
                          if (tab.isConditional) {
                            if (tab.isEnabled) {
                              setSelectedTab(tab.accessor);
                            } else {
                              tab.isDisabledFn();
                            }
                          } else {
                            setSelectedTab(tab.accessor);
                          }
                        }}
                      >
                        {t(tab.label)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {!isSeperateCard && showTabsContent && (
            <>
              {React.Children.map(children, Child => {
                if (!Child.props.accessor) return null;
                let selectedTabTemp = tabsList.find(tab => tab.accessor === Child.props.accessor);
                return <>{selectedTab === Child.props.accessor && !selectedTabTemp.isHidden && Child}</>;
              })}
              <FormNotes
                notes={[
                  {
                    title: 'LBL_REQUIRED_NOTIFY',
                    type: 3,
                  },
                ]}
              />
            </>
          )}
        </div>
      )}
      {isModal && (
        <>
          <div className={`row${!isSeperateCard ? ' pills-tab-new mb-4' : ''}`}>
            <div className="col-md-12">
              <ul className={`nav nav-pills${!isSeperateCard ? ' w-100' : ''}`} id="pills-tab" role="tablist">
                {tabsList.map(tab => {
                  if (tab.isHidden) return null;
                  return (
                    <li className="nav-item" role="presentation" key={tab.accessor}>
                      <button
                        className={`${selectedTab === tab.accessor ? 'nav-link active' : 'nav-link'} ${
                          errorTabs.includes(tab.accessor) ? 'validation-tab' : ''
                        }`}
                        id="pills-Main-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-Main"
                        type="button"
                        role="tab"
                        aria-controls="pills-Main"
                        aria-selected={selectedTab === tab.accessor ? 'true' : 'false'}
                        onClick={() => {
                          if (tab.isConditional) {
                            if (tab.isEnabled) {
                              setSelectedTab(tab.accessor);
                            } else {
                              tab.isDisabledFn();
                            }
                          } else {
                            setSelectedTab(tab.accessor);
                          }
                        }}
                      >
                        {t(tab.label)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {!isSeperateCard && showTabsContent && (
            <>
              {React.Children.map(children, Child => {
                if (!Child.props.accessor) return null;
                let selectedTabTemp = tabsList.find(tab => tab.accessor === Child.props.accessor);
                return <>{selectedTab === Child.props.accessor && !selectedTabTemp.isHidden && Child}</>;
              })}
            </>
          )}
        </>
      )}
      {isSeperateCard && showTabsContent && (
        <div className="card">
          <div className="row">
            {React.Children.map(children, Child => {
              if (!Child.props.accessor) return null;
              let selectedTabTemp = tabsList.find(tab => tab.accessor === Child.props.accessor);
              return <>{selectedTab === Child.props.accessor && !selectedTabTemp.isHidden && Child}</>;
            })}
          </div>
        </div>
      )}
    </>
  );
}
