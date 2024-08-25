import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ChartOfAccountsList from './ChartOfAccountsList';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';

const ChartOfAccounts = () => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  const [COAData, setCOAData] = useState([]);
  const [parentsCount, setparentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME') },
    { accessor: 'code', Header: t('LBL_CODE') },
    { accessor: 'company.name', Header: t('LBL_COMPANY') },
  ];

  const fetchKeys = arr => {
    let keysArray = [];
    arr.map(obj => keysArray.push(obj.accessor));
    return keysArray;
  };

  const fetchCOA = rowId => {
    setIsLoading(true);

    if (!rowId) {
      if (COAData.length === 0) {
        const payload = {
          data: {
            _domain: 'self.parentAccount is null',
            _domainContext: {
              _countOn: 'parentAccount',
              _id: null,
            },
          },
          fields: fetchKeys(fields),
          limit: 0,
          offset: 0,
          sortBy: null,
          translate: true,
        };
        api('POST', getSearchUrl(MODELS.ACCOUNT), payload, res => {
          if (res.data.total > 0) {
            let modifiedArr = [...res.data.data];
            modifiedArr.forEach(object => {
              object.parentId = '';
            });
            setCOAData([...modifiedArr]);
            setparentCount(modifiedArr.length);
          }

          setIsLoading(false);
        });
      }
    } else {
      const payload = {
        data: {
          _domain: 'self.parentAccount.id = :parentId',
          _domainContext: {
            parentId: rowId,
            _countOn: 'parentAccount',
            _id: null,
          },
        },
        fields: fetchKeys(fields),
        limit: -1,
        offset: 0,
        sortBy: null,
        translate: true,
      };
      api('POST', getSearchUrl(MODELS.ACCOUNT), payload, res => {
        let modifiedArr = [...res.data.data];
        modifiedArr.forEach(object => {
          object.parentId = rowId;
        });
        setCOAData([...COAData, ...modifiedArr]);
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    if (COAData.length === 0) fetchCOA();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ChartOfAccountsList fields={fields} COAData={COAData} fetchData={fetchCOA} parentsCount={parentsCount} isLoading={isLoading} />
        }
      />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default ChartOfAccounts;
