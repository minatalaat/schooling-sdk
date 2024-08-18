import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import closeIconBtn from '../../assets/images/close.svg';
import TooltipComp from '../../components/TooltipComp';

export default function FiscalYearInnerTable({ title, pageMode, OnClosePeriod, lineHeaders, lineData, alternativeID = 'id', fieldKey }) {
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showRows, setShowRows] = useState([]);

  const { t } = useTranslation();

  const widthBreakPoint = 1200;
  const ariaHeaders = useMemo(() => {
    let tempAriaHeaders = '';
    lineHeaders.forEach((header, i) => {
      if (i === 0) {
        tempAriaHeaders = 'id-1';
      } else {
        tempAriaHeaders = tempAriaHeaders + ` id-${i + 1}`;
      }
    });
    return tempAriaHeaders;
  }, [lineHeaders]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

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
    <>
      <div className="border-section"></div>
      <div className="row d-contents">
        <div className=" col-md-6 section-title mt-2 mb-4">
          <h4>
            {title} {fieldKey ? <TooltipComp fieldKey={fieldKey} /> : null}
          </h4>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="tab-content d-block" id="pills-tabContent">
            {windosSize[0] > widthBreakPoint && (
              <div
                className="table-responsive-new fade show active table-responsive"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                <table className="table table-responsive-stack dataTable" id="tableOne">
                  <thead>
                    <tr>
                      {lineHeaders.map(header => (
                        <th scope="col" className="moveTableLabel" key={header}>
                          {header}
                        </th>
                      ))}
                      {pageMode === 'edit' && <th scope="col" width="20" className="moveTableLabel"></th>}
                    </tr>
                  </thead>
                  <tbody id="table_detail">
                    {lineData &&
                      lineData.map(line => {
                        return (
                          <tr key={line.key}>
                            {line.data &&
                              line.tableData.map(tableData => {
                                if (tableData.value && tableData.type === 'checkbox') {
                                  return (
                                    <td key={'tableData' + Math.random()}>
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="chkOrgRow"
                                        value={tableData.value}
                                        checked={tableData.value}
                                        onChange={() => {}}
                                        id="defaultCheck1"
                                      />
                                    </td>
                                  );
                                } else {
                                  return <td key={'tableData' + Math.random()}>{tableData.value ? tableData.value : ''}</td>;
                                }
                              })}
                            {pageMode === 'edit' && (
                              <td>
                                {pageMode === 'edit' && line.isClosable && (
                                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                  <a onClick={() => OnClosePeriod(line.data)} style={{ cursor: 'pointer' }}>
                                    <img src={closeIconBtn} alt={closeIconBtn} />
                                  </a>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
            {windosSize[0] <= widthBreakPoint && (
              <div
                className="table-responsive table-responsive-new show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                <table id="table-mobile" className="table table-responsive-stack dataTable">
                  <thead>
                    <tr>
                      <th width="40%">#</th>
                      <th>{title}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineData &&
                      lineData.map(line => {
                        return (
                          <>
                            <tr
                              className={
                                showRows.indexOf(parseInt(line.data.id ? line.data.id : line.data[alternativeID])) > -1 ? 'open' : ''
                              }
                            >
                              <td>
                                <button
                                  type="button"
                                  id="row-mob-1"
                                  className="btn-toggle"
                                  aria-expanded={
                                    showRows.indexOf(parseInt(line.data.id ? line.data.id : line.data[alternativeID])) > -1
                                      ? 'true'
                                      : 'false'
                                  }
                                  aria-controls={ariaHeaders}
                                  onClick={() => {
                                    toggleShowHiddenRow(parseInt(line.data.id ? line.data.id : line.data[alternativeID]));
                                  }}
                                >
                                  <i className="icon"></i>
                                </button>
                              </td>
                              <td>{line.headData}</td>
                              <td>
                                {pageMode === 'edit' && line.isClosable && (
                                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                  <a onClick={() => OnClosePeriod(line.data)} style={{ cursor: 'pointer' }}>
                                    <img src={closeIconBtn} alt={closeIconBtn} />
                                  </a>
                                )}
                              </td>
                            </tr>
                            {showRows.indexOf(parseInt(line.data.id ? line.data.id : line.data[alternativeID])) > -1 &&
                              line.tableData.map((tableData, i) => {
                                return (
                                  <tr id={`id-${i + 1}`} className="show" key={'tableData' + Math.random()}>
                                    <td>{lineHeaders[i]}</td>
                                    <td colSpan="3">{tableData.value ? tableData.value : ''}</td>
                                  </tr>
                                );
                              })}
                          </>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
            {(!lineData || (lineData && lineData.length === 0)) && (
              <div>
                <h4 className="text-center py-4">{t('NO_DATA_AVAILABLE')}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
