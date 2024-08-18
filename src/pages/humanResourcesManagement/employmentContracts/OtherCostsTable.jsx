import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { otherCostsLinesActions } from '../../../store/otherCostsLines';
import InnerTable from '../../../components/InnerTable';
import OtherCostsLineModal from './OtherCostsLineModal';

const OtherCostsTable = ({ mode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let otherCostsLines = useSelector(state => state.otherCostsLines.otherCostsLines);

  const [lineData, setLineData] = useState([]);
  const [showNewLine, setShowNewLine] = useState(false);
  const [showEditLine, setShowEditLine] = useState(false);
  const [showViewLine, setShowViewLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});

  const lineHeaders = [t('LBL_AMOUNT'), t('LBL_DESCRIPTION')];

  const addLineHandler = () => {
    setSelectedLine(null);
    setShowNewLine(true);
  };

  const editLineHandler = line => {
    setSelectedLine(line);
    setShowEditLine(true);
  };

  const viewLineHandler = line => {
    setSelectedLine(line);
    setShowViewLine(true);
  };

  const deleteLineHandler = line => {
    dispatch(
      otherCostsLinesActions.deleteLine({
        lineId: line.lineId,
      })
    );
  };

  const openMoreActionHandler = line => {
    setSelectedLine(line);
  };

  useEffect(() => {
    let tempData = [];
    otherCostsLines &&
      otherCostsLines.length > 0 &&
      otherCostsLines.forEach(line => {
        tempData.push({
          isDeleteable: true,
          isEditable: true,
          tableData: [
            { value: line.amount, type: 'number' },
            { value: line.description, type: 'text' },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.amount,
        });
      });
    setLineData(tempData);
  }, [otherCostsLines]);

  return (
    <>
      <InnerTable
        title={t('LBL_OTHERS')}
        pageMode={mode}
        onAddNewLine={addLineHandler}
        onViewLine={viewLineHandler}
        onEditLine={editLineHandler}
        onDeleteLine={deleteLineHandler}
        onOpenMoreAction={openMoreActionHandler}
        lineHeaders={lineHeaders}
        lineData={lineData}
        alternativeID="lineId"
        isRequired={mode !== 'view'}
      />
      {showNewLine && <OtherCostsLineModal show={showNewLine} setShow={setShowNewLine} mode="add" line={selectedLine} />}
      {showEditLine && <OtherCostsLineModal show={showEditLine} setShow={setShowEditLine} mode="edit" line={selectedLine} />}
      {showViewLine && <OtherCostsLineModal show={showViewLine} setShow={setShowViewLine} mode="view" line={selectedLine} />}
    </>
  );
};

export default OtherCostsTable;
