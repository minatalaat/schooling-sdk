import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import MoreAction from '../parts/MoreAction';
import TooltipComp from './TooltipComp';
import InnerTableSkeleton from './ui/skeletons/InnerTableSkeleton';
import PrimaryButton from './ui/buttons/PrimaryButton';

import MoreActionIcon from '../assets/images/more-action.svg';
import addNewInvo from '../assets/images/add-new-invo.svg';
import { formatFloatNumber } from '../utils/helpers';
import { DeleteIcon, EditIcon, ViewIcon } from './ui/actions/Actions';

export default function InnerTable({
  title,
  pageMode,
  onAddNewLine,
  lineHeaders,
  lineData,
  onViewLine,
  onEditLine,
  onDeleteLine,
  onOpenMoreAction,
  alternativeID,
  fieldKey,
  isRequired = false,
  isLoading = false,
  withBorderSection = true,
  canAdd = true,
  isAddDisabled = false,
  hasActions = true,
  hasCustomAction = false,
  customActionHandler,
  canSelectAll,
}) {
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showRows, setShowRows] = useState([]);
  const [showMoreAction, setShowMoreAction] = useState(false);

  const { t } = useTranslation();

  const widthBreakPoint = 1200;
  const ariaHeaders = useMemo(() => {
    let tempAriaHeaders = '';
    lineHeaders.forEach((header, i) => {
      if (header) {
        if (i === 0) {
          tempAriaHeaders = 'id-1';
        } else {
          tempAriaHeaders = tempAriaHeaders + ` id-${i + 1}`;
        }
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
      {withBorderSection && <div className="border-section"></div>}
      {isLoading && <InnerTableSkeleton />}

      {!isLoading && (
        <>
          <div className="row d-contents">
            {title && (
              <div className=" col-md-6 section-title mt-2 mb-4">
                <h4>
                  {t(title)} {isRequired && <span className="required-astrisk">*</span>}{' '}
                  {fieldKey ? <TooltipComp fieldKey={fieldKey} /> : null}
                </h4>
              </div>
            )}
            {(pageMode === 'edit' || pageMode === 'add') && canAdd && (
              <div className="col-md-6 mt-2 mb-4">
                <button
                  type="button"
                  className="btn btn-add-tb float-end"
                  style={i18n.dir() ? { float: 'right' } : { float: 'left' }}
                  onClick={onAddNewLine}
                  disabled={isAddDisabled}
                >
                  <img src={addNewInvo} alt={addNewInvo} />
                  {t('LBL_ADD_ROW')}
                </button>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="tab-content d-block" id="pills-tabContent">
                {windosSize[0] > widthBreakPoint && (
                  <div
                    className="table-responsive table-responsive-new fade active show"
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <table className="table table-responsive-stack dataTable" id="tableOne">
                      <thead>
                        <tr>
                          {lineHeaders.map(header => {
                            if (!header) return null;
                            return <th key={header}>{t(header)}</th>;
                          })}
                          <th style={{ minWidth: '150px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineData &&
                          lineData.map((line, index) => {
                            return (
                              <tr key={line.key}>
                                {line.data &&
                                  line.tableData.map(tableData => {
                                    if (!tableData) return null;

                                    if (tableData) {
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
                                      }

                                      if (tableData?.type === 'number') {
                                        return <td key={'tableData' + Math.random()}>{formatFloatNumber(tableData.value)}</td>;
                                      }

                                      return (
                                        <td key={'tableData' + Math.random()}>
                                          {tableData.translate ? t(tableData.value || '') : tableData.value ?? ''}
                                        </td>
                                      );
                                    }

                                    return null;
                                  })}

                                {hasActions && (
                                  <td style={{ minWidth: '150px' }}>
                                    <div className="table-action-button float-end">
                                      {(pageMode === 'edit' || pageMode === 'add') && hasCustomAction && (
                                        <PrimaryButton theme="clickableIcon" onClick={() => customActionHandler(line.data, index)}>
                                          {line.customActionIcon}
                                        </PrimaryButton>
                                      )}
                                      {line.isViewable && (
                                        <PrimaryButton
                                          theme="clickableIcon"
                                          onClick={() => onViewLine(line.data, index)}
                                          title={t('LBL_VIEW')}
                                        >
                                          <ViewIcon />
                                        </PrimaryButton>
                                      )}
                                      {(pageMode === 'edit' || pageMode === 'add') && line.isEditable && (
                                        <PrimaryButton
                                          theme="clickableIcon"
                                          onClick={() => onEditLine(line.data, index)}
                                          title={t('LBL_EDIT')}
                                        >
                                          <EditIcon />
                                        </PrimaryButton>
                                      )}
                                      {(pageMode === 'edit' || pageMode === 'add') && line.isDeleteable && (
                                        <PrimaryButton
                                          theme="clickableIcon"
                                          onClick={() => onDeleteLine(line.data, index)}
                                          title={t('LBL_DELETE')}
                                        >
                                          <DeleteIcon />
                                        </PrimaryButton>
                                      )}
                                    </div>
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
                          <th>#</th>
                          <th>{t(title)}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineData &&
                          lineData.map((line, index) => {
                            return (
                              <>
                                {showMoreAction && (
                                  <MoreAction
                                    showMoreAction={showMoreAction}
                                    setShowMoreAction={setShowMoreAction}
                                    viewHandler={line.isViewable ? () => onViewLine(line.data, index) : null}
                                    editHandler={line.isEditable ? () => onEditLine(line.data, index) : null}
                                    deleteHandler={
                                      line.isDeleteable
                                        ? () => {
                                            onDeleteLine(line.data, index);
                                            setShowMoreAction(false);
                                          }
                                        : null
                                    }
                                    data={line}
                                    hasCustomAction={hasCustomAction}
                                    customActionHandler={customActionHandler}
                                    canSelectAll={canSelectAll}
                                  />
                                )}
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
                                  <td colSpan={pageMode === 'edit' || pageMode === 'add' ? '1' : '2'}>{line.headData}</td>
                                  {(pageMode === 'edit' || pageMode === 'add') && (
                                    <td>
                                      <button
                                        type="button"
                                        className="btn more-popup-trigger"
                                        onClick={() => {
                                          onOpenMoreAction(line.data);
                                          setShowMoreAction(true);
                                        }}
                                      >
                                        <img src={MoreActionIcon} alt={MoreActionIcon} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                                {showRows.indexOf(parseInt(line.data.id ? line.data.id : line.data[alternativeID])) > -1 &&
                                  line.tableData.map((tableData, i) => {
                                    return (
                                      <tr id={`id-${i + 1}`} className="show" key={'tableData' + Math.random()}>
                                        <td>{lineHeaders[i]}</td>
                                        {tableData?.type === 'number' ? (
                                          <td colSpan="3">{formatFloatNumber(tableData.value)}</td>
                                        ) : (
                                          <td colSpan="3">
                                            {tableData.value ? (tableData.translate ? t(tableData.value) : tableData.value) : ''}
                                          </td>
                                        )}
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
      )}
    </>
  );
}
