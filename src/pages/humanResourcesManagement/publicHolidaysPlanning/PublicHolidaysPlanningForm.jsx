import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';
import InnerTable from '../../../components/InnerTable';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import PublicHolidayLine from './PublicHolidayLine';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { setFieldValue } from '../../../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';

const PublicHolidaysPlanningForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  const [lineData, setLineData] = useState([]);
  const [showNewLine, setShowNewLine] = useState(false);
  const [showEditLine, setShowEditLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});
  const [showDeleteLineConfirmation, setShowDeleteLineConfirmation] = useState(false);

  const initialValues = {
    name: data?.name || '',
    eventsPlanningLineList: data?.eventsPlanningLineList || [],
  };
  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const lineHeaders = [t('LBL_DATE'), t('LBL_DESCRIPTION')];

  const addLineHandler = () => {
    setSelectedLine(null);
    setShowNewLine(true);
  };

  const editLineHandler = line => {
    setSelectedLine(line);
    setShowEditLine(true);
  };

  const deleteLineHandler = line => {
    setSelectedLine(line);
    setShowDeleteLineConfirmation(true);
  };

  const openMoreActionHandler = line => {
    setSelectedLine(line);
  };

  const savePublicHolidaysPlanLine = line => {
    const payload = {
      model: MODELS.EVENTS_PLANNING_LINE,
      action: 'action-events-planning-line-record-year',
      data: {
        criteria: [],
        context: {
          _model: MODELS.EVENTS_PLANNING_LINE,
          id: line.id || null,
          year: line.year || 0,
          selected: false,
          date: line.date || '',
          _form: true,
          _parent: { _id: data.id || null, name: data.name || '', _model: MODELS.EVENTS_PLANNING, eventsPlanningLineList: [] },
          _viewType: 'grid',
          _viewName: 'events-planning-line-grid',
          _views: [
            { type: 'grid', name: 'events-planning-line-grid' },
            { type: 'form', name: 'events-planning-line-form' },
          ],
          _source: 'date',
        },
      },
    };
    return api('POST', getActionUrl(), payload);
  };

  const saveRecord = async () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let payload = {
        data: {
          name: formik.values.name,
          eventsPlanningLineList: formik.values.eventsPlanningLineList.length > 0 ? formik.values.eventsPlanningLineList : null,
        },
      };
      let errorFlag = false;

      if (formik.values.eventsPlanningLineList.length > 0) {
        for (let line in formik.values.eventsPlanningLineList) {
          const lineResponse = await savePublicHolidaysPlanLine(line);

          if (lineResponse?.data?.status !== 0) errorFlag = true;
        }
      }

      if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

      const saveResposne = await api('POST', getModelUrl(MODELS.EVENTS_PLANNING), payload);

      if (saveResposne?.data?.status !== 0 || errorFlag) {
        setActionInProgress(false);
        return finshedSaveHandler('error');
      }

      setActionInProgress(false);
      finshedSaveHandler('success');
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.EVENTS_PLANNING), payload, () => {
      setActionInProgress(false);
      finshedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit]);

  useEffect(() => {
    let tempData = [];
    formik.values.eventsPlanningLineList.length > 0 &&
      formik.values.eventsPlanningLineList.forEach(line => {
        tempData.push({
          isDeleteable: true,
          isEditable: true,
          isViewable: false,
          tableData: [
            { value: line.date || '', type: 'text' },
            { value: line.description || '', type: 'text' },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.description,
        });
      });
    setLineData(tempData);
  }, [formik.values.eventsPlanningLineList]);

  return (
    <>
      <div className="col-md-6">
        <TextInput
          formik={formik}
          label="LBL_NAME"
          accessor="name"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <InnerTable
        title={t('LBL_PUBLIC_HOLIDAYS_LIST')}
        pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        onAddNewLine={addLineHandler}
        onEditLine={editLineHandler}
        onDeleteLine={deleteLineHandler}
        onOpenMoreAction={openMoreActionHandler}
        lineHeaders={lineHeaders}
        lineData={lineData}
        alternativeID="lineId"
      />
      {showEditLine && (
        <PublicHolidayLine
          show={showEditLine}
          setShow={setShowEditLine}
          checked={selectedLine}
          setChecked={setSelectedLine}
          edit
          data={data}
          parentFormik={formik}
        />
      )}
      {showNewLine && <PublicHolidayLine show={showNewLine} setShow={setShowNewLine} data={data} parentFormik={formik} />}
      {showDeleteLineConfirmation && (
        <ConfirmationPopup
          onClickHandler={() => {
            let index = formik.values.eventsPlanningLineList.findIndex(line =>
              line.lineId ? line.lineId === selectedLine.lineId : line.id === selectedLine.id
            );

            if (index !== -1) {
              if (formik.values.eventsPlanningLineList.length === 1) setSelectedLine(null);
              let tempArr = [...formik.values.eventsPlanningLineList];
              tempArr.splice(index, 1);
              setSelectedLine(null);
              setFieldValue(formik, 'eventsPlanningLineList', [...tempArr]);
            }
          }}
          setConfirmationPopup={setShowDeleteLineConfirmation}
          item={`1 ${t('DELETE_ONE_PUBLIC_HOLIDAYS_PLAN')}`}
        />
      )}
    </>
  );
};

export default PublicHolidaysPlanningForm;
