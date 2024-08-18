import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MetaFieldsEnum } from './metaFieldsEnum';
import { getModelFieldsUrl } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';

const useMetaFields = selection => {
  const mode = 'enum';

  const { api } = useAxiosFunction();
  const navigate = useNavigate();

  const data = useMemo(() => MetaFieldsEnum.find(field => field.selection === selection) || null, [selection]);

  const [list, setList] = useState(data?.list?.length > 0 && mode === 'enum' ? data.list : null);

  const model = data?.model || null;

  const fetch = async () => {
    if (!data) return;
    let fetchResposne = await api('GET', getModelFieldsUrl(model));

    if (
      !fetchResposne ||
      !fetchResposne.data ||
      fetchResposne.data.status !== 0 ||
      !fetchResposne.data.data ||
      !fetchResposne.data.data.fields
    )
      return navigate('/error');

    let fieldList = fetchResposne.data.data.fields.find(field => field.selection === selection);

    let listWithLabel = [...(fieldList?.selectionList || [])].map(field => {
      return { ...field, label: field.title };
    });

    setList(listWithLabel);
    return listWithLabel;
  };

  const convertValues = async (arr, type = mode) => {
    if (!(arr?.length > 0) || !data) return [];
    let fetchedList = list;

    if (type === 'axelor' && !list) {
      fetchedList = await fetch();
    }

    const convertedArray = arr.map(record => {
      let newRecord = { ...record };

      if (newRecord[data.name] !== null && newRecord[data.name] !== undefined && newRecord[data.name] !== 0) {
        let newSelection;

        if (data.type === 'STRING') {
          newSelection = fetchedList.find(sel => sel.value === record[data.name]);
        } else {
          newSelection = fetchedList.find(sel => Number(sel.value) === Number(record[data.name]));
        }

        if (newSelection) newRecord[data.name] = newSelection.label;
        if (!newSelection) newRecord[data.name] = '';
      } else {
        newRecord[data.name] = '';
      }

      return newRecord;
    });

    return convertedArray;
  };

  useEffect(() => {
    if (mode === 'axelor') fetch();
  }, []);

  return { data, list, model, mode, fetch, convertValues };
};

export default useMetaFields;
