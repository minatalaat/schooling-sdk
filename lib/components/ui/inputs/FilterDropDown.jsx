import { useTranslation } from 'react-i18next';

const FilterDropDown = ({ className, field, onChange, options, keys = { valueKey: null, titleKey: null }, translate = true }) => {
  const { t } = useTranslation();
  return (
    <select
      className={`light-dd-bg ${className ?? ''}`}
      aria-label="Floating label select example"
      placeholder=""
      onChange={e => onChange({ e, field })}
    >
      {options &&
        !(keys.valueKey || keys.titleKey) &&
        Object.entries(options).map(([key, value]) => (
          <option key={key} value={key}>
            {t(value)}
          </option>
        ))}
      {options &&
        keys.valueKey &&
        keys.titleKey &&
        options.map(option => (
          <option className="optionColor" value={option[keys.valueKey]} key={option[keys.valueKey]}>
            {translate ? t(option[keys.titleKey]) : option[keys.titleKey]}
          </option>
        ))}
    </select>
  );
};

export default FilterDropDown;
