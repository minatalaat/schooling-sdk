import { useState, useEffect, useMemo, useRef, useId, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import SearchDropTable from './SearchDropTable';
import DisabledInput from '../DisabledInput/DisabledInput';
import FormModal from '../../modals/FormModal';
import Plus from '../../../../assets/images/svgs/Plus';

import { modelsEnum } from '../../../../constants/modelsEnum/modelsEnum';
import { useCriteriaServices } from '../../../../services/apis/useCriteriaServices';
import { setFieldValue } from '../../../../utils/formHelpers';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { useSearchServices } from '../../../../services/apis/useSearchServices';
import { getSearchUrl } from '../../../../services/getUrl';
import Multiselect from 'multiselect-react-dropdown';
import { Tooltip } from 'react-tooltip';
import { useOverflowDetector } from 'react-detectable-overflow';
import ErrorMessage from '../ErrorMessage';
import { debounce } from '../../../../utils/helpers';
import CheckedValue from '../../CheckedValue';

const SearchModalAxelor = ({
  formik,
  modelKey,
  selectionType = 'single',
  selectIdentifier = 'name',
  mode = 'view',
  disabled,
  onSuccess,
  payloadDomain,
  payloadDomainContext,
  extraFields,
  defaultValueConfig = {
    payloadDomain: null,
    payloadDomainContext: null,
    extraFields: null,
    dependencies: null,
    customDefaultSuccess: null,
  },
  selectCallback,
  removeCallback,
  resetInitialDependencies = [],
  addConfig,
  isNeedVersion = false,
  removeVersion = true,
  onError,
  onSuccessCallback,
  showRemoveOption = true,
  label,
  tooltipIdentifier,
  isInteractiveTable = false,
  parentFormik,
  parentAccessor,
  index,
}) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { ref, overflow } = useOverflowDetector({ handleWidth: true, handleHeight: true });

  const dropdownRef = useRef(null);
  const generatedId = useId();
  //   const [isLoading, setIsLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [displayedData, setDisplayedData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  // const [pageCount, setPageCount] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showError, setShowError] = useState(false);
  const [checked, setChecked] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);

  const fieldIdentifier = modelsEnum[modelKey].identifier;
  const currentFormikValue = formik.values[fieldIdentifier] ? formik.values[fieldIdentifier][selectIdentifier] : '';
  const columns = modelsEnum[modelKey].modalColumns;

  const toggleTable = () => {
    setSearchValue('');
    setCriteria([]);
    setShowTable(!showTable);
  };

  const { updateCriteria } = useCriteriaServices({
    columns,
    criteria,
    setCriteria,
  });

  const { getSearchPayload } = useSearchServices({
    MODEL_NAME: modelsEnum[modelKey].name,
    COLUMNS: columns,
    criteria,
    offset,
    pageSize,
    payloadDomain: defaultValueConfig?.payloadDomain || payloadDomain,
    payloadDomainContext: defaultValueConfig?.payloadDomainContext || payloadDomainContext,
    extraFields: defaultValueConfig?.extraFields || extraFields,
    operator: 'or',
  });

  const selectHandler = async value => {
    if (selectionType === 'single') {
      setFieldValue(formik, fieldIdentifier, removeVersion ? removeObjectVersion(value) || null : value || null);
      if (selectCallback) selectCallback(removeVersion ? removeObjectVersion(value) || null : value || null);
      setSearchValue('');
      setShowTable(false);
    }

    //TODO: selection multiple of search

    if (selectionType === 'all') {
      let index = checked.findIndex(item => item?.id === value?.id);

      if (index === -1) {
        let newChecked = [...checked, value];
        setChecked(newChecked);
        setFieldValue(formik, fieldIdentifier, newChecked);
        if (selectCallback) selectCallback(newChecked);
      } else {
        let newChecked = checked.filter(item => item.id !== value.id);
        setChecked(newChecked);
        setFieldValue(formik, fieldIdentifier, newChecked);
        if (selectCallback) selectCallback(newChecked);
      }
    }
  };

  const removeObjectVersion = input => {
    if (isNeedVersion) return input;
    if (!input) return input;
    let tempObj = { ...input };
    if (tempObj.hasOwnProperty('version')) delete tempObj['version'];
    if (tempObj.hasOwnProperty('$version')) delete tempObj['$version'];
    return tempObj;
  };

  const removeSelectedHandler = () => {
    setFieldValue(formik, fieldIdentifier, null);
    formik.validateForm();
    if (removeCallback) removeCallback();
    setShowTable(false);
  };

  const defaultOnError = () => {
    //   setIsLoading(false);
    return { displayedData: [], total: 0 };
  };

  const onSearchSuccess = async res => {
    let resData = res.data;

    const defaultSuccessHandler = resData => {
      if (!(resData?.status === 0) || resData.total === null || resData.total === undefined) return onError ? onError() : defaultOnError();
      const data = resData?.data || [];
      if (onSuccessCallback) onSuccessCallback(data);
      return { displayedData: [...data], total: resData.total || 0 };
    };

    const { displayedData, total } = onSuccess ? await onSuccess(res) : defaultSuccessHandler(resData);
    setDisplayedData(displayedData || []);
    setTotal(total || 0);
  };

  const searchDefaultValue = async () => {
    const defaultSuccess = async res => {
      if (!res.data || !res.data.data || res.data.data.length === 0) return null;
      setFieldValue(formik, fieldIdentifier, removeVersion ? removeObjectVersion(res.data.data[0]) || null : res.data.data[0] || null);
      if (selectCallback) selectCallback(removeVersion ? removeObjectVersion(res.data.data[0]) || null : res.data.data[0] || null);
    };

    let payload = getSearchPayload();
    const res = await api('POST', getSearchUrl(modelsEnum[modelKey].name), payload);
    let customDefaultSuccess = defaultValueConfig.customDefaultSuccess;
    if (customDefaultSuccess) return await customDefaultSuccess(res);
    await defaultSuccess(res);
  };

  const checkDefaultValueDependencies = useMemo(() => {
    let isReady = true;

    if ((defaultValueConfig?.dependencies || null) && defaultValueConfig.dependencies.length > 0) {
      defaultValueConfig.dependencies.forEach(prop => {
        if (prop === '' || prop === null || prop === undefined) isReady = false;
      });
    }

    return isReady;
  }, [...(defaultValueConfig?.dependencies || [])]);

  const setInitialValue = () => {
    if (mode === 'add' && selectionType === 'single' && currentFormikValue === '' && defaultValueConfig && checkDefaultValueDependencies)
      searchDefaultValue();
  };

  const addCallback = addedData => {
    if (addedData) setFieldValue(formik, fieldIdentifier, addedData);
    if (addConfig?.selectCallback) addConfig.selectCallback(addedData);
    setSearchValue('');
    setShowTable(false);
  };

  useEffect(() => {
    setInitialValue();
  }, [mode, checkDefaultValueDependencies]);

  useEffect(() => {
    if (resetInitialDependencies?.length > 0) setInitialValue();
  }, [...resetInitialDependencies]);

  // useEffect(() => {
  //   if (selectionType === 'all') {
  //     const multiSelectInputField = document.getElementById('search_input');
  //     multiSelectInputField.onclick = disabled || mode === 'view' ? () => {} : () => showModalHandler(true);
  //   }
  // }, [disabled, mode, selectionType]);

  useEffect(() => {
    if (!showError && mode === 'add' && selectionType === 'single' && defaultValueConfig && currentFormikValue !== '') {
      if (formik.errors[fieldIdentifier]) formik.validateField(fieldIdentifier);
      if (!formik.errors[fieldIdentifier]) setShowError(true);
    }

    if (!showError && (mode !== 'add' || !defaultValueConfig)) setShowError(true);

    // if(showError&&formik.errors[fieldIdentifier]){
    //   dropdownRef.current.scrollIntoView({ behavior: 'smooth' });
    // }
  }, [currentFormikValue, selectionType, mode, formik.errors[fieldIdentifier], showError]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTable(false);
      }
    };

    document.body.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.body.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleEnterKeyPress = event => {
    if (event.key === 'Enter') {
      updateCriteria(searchValue);
    }
  };

  const debouncedOnChangeValue = useCallback(
    debounce(
      e => {
        updateCriteria(e.target.value);
      },
      1000,
      timeoutId,
      setTimeoutId
    ),
    [searchValue]
  );

  return (
    <>
      {showAddModal && (
        <FormModal
          FormComponent={addConfig.FormComponent}
          title={addConfig.modalTitle}
          show={showAddModal}
          setShow={setShowAddModal}
          selectCallback={addCallback}
          additionalProps={addConfig.additionalProps}
        />
      )}
      {mode !== 'view' && !disabled ? (
        <>
          <div
            className={`dropdown select-option ${(formik.touched[fieldIdentifier] && formik.errors[fieldIdentifier]) ||
              (isInteractiveTable && parentFormik?.errors?.[parentAccessor]?.[index]?.[fieldIdentifier])
              ? 'validation'
              : ''
              } `}
            ref={dropdownRef}
          >
            <div
              className={isInteractiveTable ? 'dropdown-toggle interactive-table-dropdown-toggle ' : 'dropdown-toggle '}
              role="button"
              id="dropdownMenuButton"
              aria-haspopup="true"
              aria-expanded="false"
              onClick={toggleTable}
              data-tooltip-id={generatedId}
            >
              <span id="selectedlabel">{label ? t(label) : t(modelsEnum[modelKey].titleSingular)}</span>
              <br />
              <span id="selectedOption" ref={ref}>
                {currentFormikValue?.length > 0 ? currentFormikValue : t('LBL_PLEASE_SELECT')}
              </span>

              {tooltipIdentifier && (
                <Tooltip place="top" id={generatedId}>
                  {formik.values[fieldIdentifier] ? formik.values[fieldIdentifier][tooltipIdentifier] : ''}
                </Tooltip>
              )}

              {!tooltipIdentifier && overflow && (
                <Tooltip place="top" id={generatedId}>
                  {currentFormikValue}
                </Tooltip>
              )}
            </div>
            <div className={showTable ? 'dropdown-menu show' : 'dropdown-menu'}>
              <div className="search-select">
                <i className="search-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  placeholder={t('LBL_SEARCH')}
                  value={searchValue}
                  onChange={e => {
                    setSearchValue(e.target.value);

                    debouncedOnChangeValue(e);
                  }}
                // onKeyPress={handleEnterKeyPress}
                />
              </div>
              {selectionType === 'all' && (
                <Multiselect
                  className="multi-select form-control "
                  selectedValues={formik.values[fieldIdentifier] || []}
                  displayValue={selectIdentifier}
                  placeholder={`${mode === 'view' || disabled ? '' : t('LBL_CLICK_HERE_TO_ADD')}`}
                  style={{
                    optionContainer: { display: 'none' },
                    searchBox: { border: 'none' },
                    inputField: { color: '#9e9e9e', border: 'none', background: 'none', margin: '0 0.5rem' },
                    chips: { float: i18n.dir() === 'ltr' ? 'left' : 'right' },
                  }}
                  disable={disabled || mode === 'view'}
                  showCheckbox={true}
                  selectedValueDecorator={v => v.substring(0, 30) + '...'}
                  onClick={disabled || mode === 'view' ? () => { } : () => { }}
                  onRemove={selectedList => setFieldValue(formik, fieldIdentifier, selectedList)}
                  customCloseIcon={disabled || mode === 'view' ? <></> : null}
                />
              )}
              <SearchDropTable
                columns={columns}
                MODEL_NAME={modelsEnum[modelKey].name}
                data={displayedData}
                //   setData={setDisplayedData}
                showTable={showTable}
                successFunction={onSearchSuccess}
                criteria={criteria}
                offset={offset}
                pageSize={pageSize}
                payloadDomain={payloadDomain}
                payloadDomainContext={payloadDomainContext}
                extraFields={extraFields}
                selectHandler={selectHandler}
                selectionType={selectionType}
                checked={checked}
              />
              {addConfig && (
                <div className="section-create-new d-flex justify-content-center">
                  <a
                    className="d-flex align-items-center"
                    id="createNewCustomer"
                    onClick={() => {
                      setShowAddModal(true);
                    }}
                  >
                    <Plus />
                    <div className="text">{t(addConfig.title)}</div>
                  </a>
                </div>
              )}

              {currentFormikValue && currentFormikValue !== '' && showRemoveOption && (
                <div className="section-create-new d-flex justify-content-center">
                  <a className="d-flex align-items-center" id="createNewCustomer" onClick={removeSelectedHandler}>
                    <div className="text">{t('LBL_CLEAR')}</div>
                  </a>
                </div>
              )}
            </div>
          </div>
          {selectionType === 'all' && checked && checked.length > 0 && (
            <div
              className="d-flex flex-row gap-2"
              style={{
                flexWrap: 'wrap',
              }}
            >
              {checked.map(item => {
                return (
                  <CheckedValue
                    data={item}
                    accessor={selectIdentifier}
                    onRemoveHandler={selectHandler}
                    tooltipIdentifier={tooltipIdentifier}
                  />
                );
              })}
            </div>
          )}
          {showError && (
            <ErrorMessage
              formik={formik}
              mode={mode}
              identifier={fieldIdentifier}
              parentFormik={parentFormik}
              parentAccessor={parentAccessor}
              isInteractiveTable={isInteractiveTable}
              index={index}
              tooltipId={generatedId}
            />
          )}
        </>
      ) : (
        <DisabledInput
          inputValue={currentFormikValue}
          labelValue={label ? t(label) : t(modelsEnum[modelKey].titleSingular)}
          tooltipIdentifier={tooltipIdentifier}
          formikFieldValues={formik.values[fieldIdentifier]}
        />
      )}
    </>
  );
};

export default SearchModalAxelor;
