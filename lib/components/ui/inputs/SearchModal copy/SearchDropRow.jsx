import { useTranslation } from 'react-i18next';

import useMetaFields from '../../../../hooks/metaFields/useMetaFields';

const SearchDropRow = ({ row, columns, selectHandler, selectionType, checked }) => {
  const { t } = useTranslation();
  const metaFieldColumn = columns.filter(column => column.selectionName)[0];
  const selectionKeys = metaFieldColumn?.keys;
  const selectionName = metaFieldColumn?.selectionName;
  const metaFields = useMetaFields(selectionName);
  const metaFieldTranslate = metaFields.mode === 'enum';
  const metaFieldsList = metaFields.list || [];

  const getSelectionNameValues = cellValue => {
    if (selectionKeys.valueKey && selectionKeys.titleKey) {
      let selectedOption = metaFieldsList.find(option => Number(option[selectionKeys.valueKey]) === Number(cellValue));
      if (!selectedOption) return '';
      if (metaFieldTranslate) return t(selectedOption[selectionKeys.titleKey]);
      return selectedOption[selectionKeys.titleKey];
    }
  };

  return (
    <tr
      onClick={() => {
        selectHandler(row);
      }}
    >
      {selectionType === 'all' && (
        <td>
          {
            <input
              className="form-check-input"
              type="checkbox"
              name="checked"
              value=""
              id="defaultCheck1"
              checked={checked.findIndex(x => x.id === row['id']) !== -1}
            />
          }
        </td>
      )}
      {columns.map(column => {
        if (column.selectionName) return <td key={column.accessor}>{getSelectionNameValues(row[column.accessor])}</td>;
        return <td key={column.accessor}>{row[column.accessor]}</td>;
      })}
    </tr>
  );
};

export default SearchDropRow;
