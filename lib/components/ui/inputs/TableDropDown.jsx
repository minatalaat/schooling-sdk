import { useTranslation } from 'react-i18next';

const TableDropDown = ({
  placeholder = 'LBL_PLEASE_SELECT',
  translate = true,
  initialValue = '',
  onDropDownChange,
  values,
  index,
  column,
  options,
}) => {
  const { t } = useTranslation();
  const keys = column.keys || { valueKey: null, titleKey: null };

  return (
    <>
      <select
        className={`form-select placeholder-shown${Number(values[index]) !== 0 ? ' edit' : ''}`}
        placeholder=""
        value={values[index] || ''}
        onChange={e => {
          onDropDownChange(column, index, e.target.value);
        }}
      >
        <option value={initialValue}>{t(placeholder)}</option>
        {options &&
          keys.valueKey &&
          keys.titleKey &&
          options.map(option => (
            <option value={option[keys.valueKey]} key={option[keys.valueKey]}>
              {translate ? t(option[keys.titleKey]) : option[keys.titleKey]}
            </option>
          ))}
      </select>
    </>
  );
};

export default TableDropDown;
