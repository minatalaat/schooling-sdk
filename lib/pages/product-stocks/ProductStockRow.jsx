import React from 'react';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';
import { FaPlusCircle } from 'react-icons/fa';

function ProductStockRow({
  record,
  fields,
  showRows,
  setShowRows,
  collapsableFieldsOne,
  collapsableData,
  setCollapsableData,
  isLoading,
  setIsLoading,
}) {
  const { t } = useTranslation();

  const toggleShowHiddenRow = id => {
    let tempRows = [...showRows];
    let index = tempRows.indexOf(id);

    if (index > -1) {
      tempRows.splice(index, 1);
    } else {
      tempRows = [id];
    }

    setShowRows([...tempRows]);
  };

  return (
    <>
      <tr
        onClick={() => {
          setIsLoading(true);
          setCollapsableData([]);
          toggleShowHiddenRow(parseInt(record.id));
        }}
      >
        <td>
          <div className="table-action-button float-end">
            <button
              type="button"
              className="clickable btn"
              onClick={() => {
                setIsLoading(true);
                setCollapsableData([]);
                toggleShowHiddenRow(parseInt(record.id));
              }}
            >
              <FaPlusCircle color="#6B6EE5" size={18} />
            </button>
          </div>
        </td>
        {fields.map(field => {
          if (field.Header) return <td key={field.accessor}>{field.translate ? t(record[field.accessor]) : record[field.accessor]}</td>;
        })}
      </tr>

      <tr
        id="hidden_row1"
        className="hidden_row"
        style={showRows.indexOf(parseInt(record.id)) > -1 ? { display: 'table-row' } : { display: 'none' }}
      >
        {!isLoading && collapsableData && collapsableData.length > 0 && (
          <td colSpan="10" className="td-sub-view">
            <table className="subtable dataTable">
              <thead>
                <tr>
                  <th></th>
                  {collapsableFieldsOne.map(field => {
                    return <th key={field.Header}>{field.Header}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {collapsableData.map(record => {
                  return (
                    <tr>
                      <td></td>
                      {collapsableFieldsOne.map(field => {
                        return <td key={field.accessor}>{field.translate ? t(record[field.accessor]) : record[field.accessor]}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        )}
        {!isLoading && collapsableData && collapsableData.length === 0 && (
          <td colSpan={7}>
            <h4 className="text-center py-4">{t('NO_DATA_AVAILABLE')}</h4>
          </td>
        )}
        {isLoading && (
          <td colSpan={7}>
            <div className="text-center">
              <SpinnerCircular
                size={70}
                thickness={120}
                speed={100}
                color="rgba(31, 79, 222, 1)"
                secondaryColor="rgba(153, 107, 229, 0.19)"
              />
            </div>
          </td>
        )}
      </tr>
    </>
  );
}

export default ProductStockRow;
