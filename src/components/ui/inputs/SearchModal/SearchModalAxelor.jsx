import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Multiselect from 'multiselect-react-dropdown';
import i18n from 'i18next';

import ErrorMessage from '../ErrorMessage';
import TooltipComp from '../../../TooltipComp';
import AddModal from './AddModal';
import SearchModal from './SearchModal';

import SearchIconForm from '../../../../assets/images/search-icon-form.svg';
import deleteIcon from '../../../../assets/images/Close_square_duotone_form.svg';
import addIcon from '../../../../assets/images/Add_square_duotone.svg';
import { modelsEnum } from '../../../../constants/modelsEnum/modelsEnum';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { getSearchPayload } from '../../../../services/getSearchPayload';
import { getSearchUrl } from '../../../../services/getUrl';
import { setFieldValue } from '../../../../utils/formHelpers';

export default function SearchModalAxelor({
  formik,
  modelKey,
  selectionType = 'single',
  selectIdentifier = 'name',
  isRequired = false,
  mode = 'view',
  disabled,
  onSuccess,
  tooltip,
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
}) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDispalyedData, setModalDisplayedData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [pageCount, setPageCount] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showError, setShowError] = useState(false);
  const [checked, setChecked] = useState([]);

  let paginationProps = {
    offset,
    setOffset,
    total,
    setTotal,
    pageSize,
    setPageSize,
    pageCount,
    setPageCount,
    searchValue,
    setSearchValue,
    criteria,
    setCriteria,
  };

  const fieldIdentifier = modelsEnum[modelKey].identifier;
  const currentFormikValue = formik.values[fieldIdentifier] ? formik.values[fieldIdentifier][selectIdentifier] : '';

  const selectHandler = async () => {
    if (selectionType === 'single') {
      setFieldValue(formik, fieldIdentifier, removeVersion ? removeObjectVersion(checked[0]) || null : checked[0] || null);
      if (selectCallback) selectCallback(removeVersion ? removeObjectVersion(checked[0]) || null : checked[0] || null);
    }

    if (selectionType === 'all') {
      setFieldValue(formik, fieldIdentifier, checked);
      if (selectCallback) selectCallback(checked);
    }

    showModalHandler(false);
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

    if (removeCallback) removeCallback();
  };

  const defaultOnError = () => {
    setIsLoading(false);
    return { displayedData: [], total: 0 };
  };

  const onSearchSuccess = async res => {
    const defaultSuccessHandler = () => {
      if (!(res?.data?.status === 0) || res.data.total === null || res.data.total === undefined)
        return onError ? onError() : defaultOnError();
      const data = res.data?.data || [];
      if (onSuccessCallback) onSuccessCallback(data);
      return { displayedData: [...data], total: res.data.total || 0 };
    };

    const { displayedData, total } = onSuccess ? await onSuccess(res) : defaultSuccessHandler();
    setModalDisplayedData(displayedData || []);
    setTotal(total || 0);
  };

  const handleCloseModal = () => {
    setOffset(0);
    setTotal(0);
    setPageSize(8);
    setPageCount(1);
    setCriteria([]);
    setModalDisplayedData([]);
    setChecked([]);
  };

  const searchDefaultValue = () => {
    let payload = getSearchPayload({
      MODEL_NAME: modelsEnum[modelKey].name,
      COLUMNS: modelsEnum[modelKey].modalColumns,
      criteria: paginationProps.criteria,
      offset: paginationProps.offset,
      pageSize: paginationProps.pageSize,
      payloadDomain: defaultValueConfig?.payloadDomain || payloadDomain,
      payloadDomainContext: defaultValueConfig?.payloadDomainContext || payloadDomainContext,
      extraFields: defaultValueConfig?.extraFields || extraFields,
    });
    api('POST', getSearchUrl(modelsEnum[modelKey].name), payload, async res => {
      let customDefaultSuccess = defaultValueConfig.customDefaultSuccess;
      if (customDefaultSuccess) return await customDefaultSuccess(res);
      await defaultSuccess(res);
    });
  };

  const defaultSuccess = async res => {
    if (!res.data || !res.data.data || res.data.data.length === 0) return null;
    setFieldValue(formik, fieldIdentifier, removeVersion ? removeObjectVersion(res.data.data[0]) || null : res.data.data[0] || null);
    if (selectCallback) selectCallback(removeVersion ? removeObjectVersion(res.data.data[0]) || null : res.data.data[0] || null);
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
  };

  const openAddFormHandler = () => {
    const newTab = window.open(addConfig?.path, '_blank');

    // Pass a reference to the original tab
    newTab.opener = window;

    setTimeout(() => {
      newTab.close();
    }, 60000);
  };

  useEffect(() => {
    setInitialValue();
  }, [mode, checkDefaultValueDependencies]);

  useEffect(() => {
    if (resetInitialDependencies?.length > 0) setInitialValue();
  }, [...resetInitialDependencies]);

  useEffect(() => {
    if (selectionType === 'all') {
      const multiSelectInputField = document.getElementById('search_input');
      multiSelectInputField.onclick = disabled || mode === 'view' ? () => {} : () => showModalHandler(true);
    }
  }, [disabled, mode, selectionType]);

  useEffect(() => {
    if (!showError && mode === 'add' && selectionType === 'single' && defaultValueConfig && currentFormikValue !== '') {
      if (formik.errors[fieldIdentifier]) formik.validateField(fieldIdentifier);
      if (!formik.errors[fieldIdentifier]) setShowError(true);
    }

    if (!showError && (mode !== 'add' || !defaultValueConfig)) setShowError(true);
  }, [currentFormikValue, selectionType, mode, formik.errors[fieldIdentifier], showError]);

  const showModalHandler = bool => {
    setShowModal(bool);
    if (!bool) formik.setFieldTouched(fieldIdentifier, true);
  };

  return (
    <>
      <div className="search-ex">
        <label htmlFor="exampleDataList" className="form-label">
          {t(modelsEnum[modelKey].titleSingular)}
          {isRequired && (mode === 'add' || mode === 'edit') && <span>*</span>}
        </label>
        {tooltip && <TooltipComp fieldKey={tooltip} />}

        {selectionType === 'single' && (
          <>
            {mode !== 'view' && !disabled ? (
              <>
                <button className="btn" type="button" onClick={() => showModalHandler(true)}>
                  <img src={SearchIconForm} alt="search-icon" />
                </button>
                {addConfig && (
                  <button className="btn m-0" type="button" onClick={addConfig?.path ? openAddFormHandler : () => setShowAddModal(true)}>
                    <img src={addIcon} alt="add-icon" />
                  </button>
                )}
                {currentFormikValue && currentFormikValue !== '' && showRemoveOption && (
                  <button
                    className="btn close-icon-form"
                    type="button"
                    style={i18n.dir() === 'ltr' ? {} : { marginLeft: '1rem !important' }}
                    onClick={removeSelectedHandler}
                  >
                    <img src={deleteIcon} alt="delete-icon" />
                  </button>
                )}
                <input
                  type="text"
                  className={`form-control ${formik.touched[fieldIdentifier] && formik.errors[fieldIdentifier] ? 'validation' : ''}`}
                  id="Label"
                  placeholder={`${t('LBL_SELECT')} ${t(modelsEnum[modelKey].titleSingular)}`}
                  name={fieldIdentifier}
                  value={currentFormikValue}
                  onClick={() => showModalHandler(true)}
                  onChange={() => {}}
                  disabled={disabled || mode === 'view'}
                  autoComplete="off"
                  style={{ overflow: 'hidden' }}
                />
                {showError && <ErrorMessage formik={formik} mode={mode} identifier={fieldIdentifier} />}
              </>
            ) : (
              <input type="text" className="form-control" id="Label" placeholder="" value={currentFormikValue} disabled />
            )}
          </>
        )}
        {selectionType === 'all' && (
          <Multiselect
            className="multi-select form-control"
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
            selectedValueDecorator={v => v.substring(0, 30) + '...'}
            onClick={disabled || mode === 'view' ? () => {} : () => showModalHandler(true)}
            onRemove={selectedList => setFieldValue(formik, fieldIdentifier, selectedList)}
            customCloseIcon={disabled || mode === 'view' ? <></> : null}
          />
        )}
        {showModal && (
          <SearchModal
            show={showModal}
            setShow={showModalHandler}
            title={t(modelsEnum[modelKey].titlePlural)}
            data={modalDispalyedData}
            MODEL_NAME={modelsEnum[modelKey].name}
            columns={modelsEnum[modelKey].modalColumns}
            successFunction={onSearchSuccess}
            paginationProps={paginationProps}
            select={selectionType}
            selectHandler={selectHandler}
            closeHandler={() => {
              showModalHandler(false);
              handleCloseModal();
            }}
            isModal={true}
            payloadDomain={payloadDomain}
            payloadDomainContext={payloadDomainContext}
            extraFields={extraFields}
            currentValue={formik.values[fieldIdentifier]}
            checked={checked}
            setChecked={setChecked}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        {showAddModal && (
          <AddModal
            show={showAddModal}
            setShow={setShowAddModal}
            title={addConfig?.title}
            FormComponent={addConfig?.FormComponent}
            selectCallback={addCallback}
            additionalProps={addConfig?.additionalProps}
          />
        )}
      </div>
    </>
  );
}
