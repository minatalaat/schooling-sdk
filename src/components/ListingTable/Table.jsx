// import { useTranslation } from 'react-i18next';

// import Pagination from '../../parts/Pagination';

// import { useFeatures } from './../../hooks/useFeatures';

// const Table = ({
//   fields,
//   data,
//   total,
//   hasActions = true,
//   hasBulkActions = true,
//   tableOnly = false,
//   checked = [],
//   setChecked = () => {},
//   feature,
//   subFeature,
//   infoColors = { field: '', data: [] },
//   children,
//   isCollapsable = false,
//   isPagination = true,
// }) => {
//   const { t } = useTranslation();
//   const { canEdit, canDelete, canView } = useFeatures(feature, subFeature);

//   return (
//     <div className={tableOnly ? '' : 'card'}>
//       {infoColors && infoColors.data && infoColors.data.length > 0 && (
//         <div className="row">
//           <div className="col-md-6">
//             <div className="color-info">
//               {infoColors.data.map(color => {
//                 if (!color.colorId || !color.label) return null;
//                 return (
//                   <div className={`info-${color.colorId} col`} key={color.colorId}>
//                     <p>
//                       <i className={`info-color-${color.colorId}`}></i>
//                       {t(color.label)}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="row">
//         <div className="col-md-12">
//           <div className="tab-content d-block" id="pills-tabContent">
//             <div
//               className="table-responsive table-responsive-new fade show active"
//               id="pills-home"
//               role="tabpanel"
//               aria-labelledby="pills-home-tab"
//             >
//               <table className="table table-responsive-stack dataTable" id="tableOne">
//                 <thead>
//                   <tr>
//                     {hasBulkActions && (
//                       <th>
//                         <input
//                           className="form-check-input"
//                           type="checkbox"
//                           name="chkOrgRow"
//                           value=""
//                           id="defaultCheck1"
//                           onChange={() => {
//                             if (checked.length !== data.length) {
//                               let allChecked = [];

//                               if (data) {
//                                 data.forEach(record => {
//                                   allChecked.push({
//                                     id: record.id,
//                                     version: record.version,
//                                     name: record?.name || record?.busOperator?.username,
//                                   });
//                                 });
//                               }

//                               setChecked([...allChecked]);
//                             } else {
//                               setChecked([]);
//                             }
//                           }}
//                           checked={data.length !== 0 && checked.length === data.length}
//                         />
//                       </th>
//                     )}
//                     {fields.map(field => {
//                       if (!field) return null;
//                       if (!field.isHidden) return <th key={field.Header}>{field.Header}</th>;
//                       return null;
//                     })}
//                     {(canView || canEdit || canDelete || isCollapsable) && hasActions && <th style={{ minWidth: '230px' }}></th>}
//                   </tr>
//                 </thead>
//                 <tbody id="table_detail">{children}</tbody>
//               </table>
//               {total === 0 && (
//                 <div>
//                   <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>
//                 </div>
//               )}
//             </div>
//             {!tableOnly && total > 0 && isPagination && <Pagination total={total} />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;



import { useTranslation } from 'react-i18next';

import Pagination from '../../parts/Pagination';
import NoDataAvailable from '../NoDataAvailable';
import FilterDropDown from '../ui/inputs/FilterDropDown';
// import FilterDropDown from '../ui/inputs/FilterDropDown';

import { useFeatures } from './../../hooks/useFeatures';
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go';

const Table = ({
  fields,
  data,
  total,
  hasActions = true,
  hasBulkActions = true,
  tableOnly = false,
  checked = [],
  setChecked = () => {},
  feature,
  subFeature,
  infoColors = { field: '', data: [] },
  children,
  isCollapsable = false,
  isPagination = true,
  onFilterChange,
  sortFields,
  setSortFields,
}) => {
  const { t } = useTranslation();
  const { canEdit, canDelete, canView } = useFeatures(feature, subFeature);

  const onChangeInsertSortField = (field, action) => {
    let tempSortFields = [...sortFields];
    let fieldIndex = tempSortFields.findIndex(item => item.accessor === field?.accessor);

    if (fieldIndex === -1) {
      if (action === 'desc') {
        tempSortFields.push({
          accessor: field?.accessor,
          desc: true,
          asnd: false,
        });
      } else if (action === 'asnd') {
        tempSortFields.push({
          accessor: field?.accessor,
          desc: false,
          asnd: true,
        });
      }
    } else {
      if (action === 'desc') {
        tempSortFields[fieldIndex] = {
          ...tempSortFields[fieldIndex],
          desc: !tempSortFields[fieldIndex]?.desc,
          asnd: false,
        };
      } else {
        tempSortFields[fieldIndex] = {
          ...tempSortFields[fieldIndex],
          desc: false,
          asnd: !tempSortFields[fieldIndex]?.asnd,
        };
      }
    }

    setSortFields(tempSortFields);

    getArrowColor(field, action, tempSortFields);
  };

  const getArrowColor = (field, action, tempSortFields) => {
    let fieldIndex = tempSortFields.findIndex(item => item?.accessor === field?.accessor);

    if (fieldIndex !== -1) {
      if (action === 'desc' && tempSortFields[fieldIndex]?.desc) {
        return '#6750e9';
      }

      if (action === 'asnd' && tempSortFields[fieldIndex]?.asnd) {
        return '#6750e9';
      }

      return 'white';
    }
  };

  return (
    <>
      {infoColors && infoColors.data && infoColors.data.length > 0 && (
        <div className="row">
          <div className="col-md-6">
            <div className="color-info">
              {infoColors.data.map(color => {
                if (!color.colorId || !color.label) return null;
                return (
                  <div className={`info-${color.colorId} col`} key={color.colorId}>
                    <p>
                      <i className="info-color-1"></i>
                      {t(color.label)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-12">
          <div className="table-responsive" id="pills-tabContent">
            <table className="table table-one table-striped  table-borderless align-middle" id="tableOne">
              <thead>
                <tr>
                  {hasBulkActions && (
                    <th scope="col">
                      <input
                        className="checkbox-input"
                        type="checkbox"
                        name="chkOrgRow"
                        value=""
                        id="defaultCheck1"
                        onChange={() => {
                          if (checked.length !== data.length) {
                            let allChecked = [];

                            if (data) {
                              data.forEach(record => {
                                allChecked.push({
                                  id: record.id,
                                  version: record.version,
                                });
                              });
                            }

                            setChecked([...allChecked]);
                          } else {
                            setChecked([]);
                          }
                        }}
                        checked={data.length !== 0 && checked.length === data.length}
                      />
                    </th>
                  )}
                  {fields.map(field => {
                    if (!field) return null;
                    if (!field.isHidden)
                      return (
                        <th scope="col" key={field.Header}>
                          <div className={field?.allowSort ? 'd-flex flex-row justify-content-between align-items-center' : ''}>
                            {field.Header}
                            {onFilterChange && field.options && (
                              <FilterDropDown field={field} options={field.options} keys={field.keys} onChange={onFilterChange} />
                            )}
                            {field?.allowSort && (
                              <div className="d-flex flex-column justify-content-between h-100">
                                <GoTriangleUp
                                  size={20}
                                  color={getArrowColor(field, 'desc', sortFields)}
                                  onClick={() => onChangeInsertSortField(field, 'desc')}
                                />
                                <GoTriangleDown
                                  size={20}
                                  color={getArrowColor(field, 'asnd', sortFields)}
                                  onClick={() => onChangeInsertSortField(field, 'asnd')}
                                />
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    return null;
                  })}
                  {(canView || canEdit || canDelete || isCollapsable) && hasActions && <th style={{ minWidth: '230px' }}></th>}
                </tr>
              </thead>
              <tbody id="table_detail">{children}</tbody>
            </table>
            {total === 0 && <NoDataAvailable />}
            {/* </div> */}
            {!tableOnly && total > 0 && isPagination && <Pagination total={total} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Table;
