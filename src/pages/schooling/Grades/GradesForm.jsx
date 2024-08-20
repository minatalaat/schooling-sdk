import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useTabs } from '../../../hooks/useTabs';
import MoreAction from '../../../components/ui/MoreAction/MoreAction';
import Toolbar from '../../../components/Toolbar/Toolbar';
import Card from '../../../components/CardsList/Card.jsx';
import CardsList from '../../../components/CardsList/CardsList';
import TableRow from '../../../components/ListingTable/TableRow';
import Table from '../../../components/ListingTable/Table';
import BackButton from '../../../components/ui/buttons/BackButton.jsx';

const GradesForm = ({ data, importData }) => {
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const feature = 'SCHOOLING';
  const subFeature = 'GRADES';
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);

  const fields = [
    { accessor: 'id', Header: t('LBL_COURSE'), type: 'text' },
    { accessor: 'midtermGrade', Header: t('LBL_MID_TERM'), type: 'text' },
    { accessor: 'finalGrade', Header: t('LBL_FIRST_TERM'), type: 'text' },
    { accessor: 'creditPoints', Header: t('LBL_CREDIT_POINTS'), type: 'text' },
    { accessor: 'totalGrade', Header: t('LBL_TOTAL'), type: 'text' },
    { accessor: 'letterGrade', Header: t('LBL_LETTER_GRADE'), type: 'text' },
    { accessor: 'gradePoints', Header: t('LBL_GRADE_POINTS'), type: 'text' },
  ];

  const subTitles = [
    { key: 'midtermGrade', label: 'LBL_MID_TERM' },
    { key: 'finalGrade', label: 'LBL_FIRST_TERM' },
    { key: 'creditPoints', label: 'LBL_CREDIT_POINTS' },
    { key: 'totalGrade', label: 'LBL_TOTAL' },
    { key: 'letterGrade', label: 'LBL_LETTER_GRADE' },
    { key: 'gradePoints', label: 'LBL_GRADE_POINTS' },
  ];
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });
  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);
  const groupedBySemesterKey = data?.data?.grades?.reduce((acc, current) => {
    const { semsterKey } = current;

    if (!acc[semsterKey]) {
      acc[semsterKey] = [];
    }

    acc[semsterKey].push(current);
    return acc;
  }, {});
  useEffect(() => {
    setFetchedData(data?.data);
  }, []);
  return (
    <>
      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData?.data || []}
      />
      <div className="row">
        <div className="container-fluid">
          <div className="row"></div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{`${data?.data?.student?.name} ${t('LBL_GRADES')}`} </h4>
              </div>
              {/* <div className="reverse-page float-end">
                <BackButton text="LBL_BACK" />
              </div> */}
            </div>
          </div>
          <div className="col-md-12">
            {/* <Toolbar
              canSelectAll={false}
              show={show}
              setShow={setShow}
              setShowMoreAction={setShowMoreAction}
              checked={checked}
              setChecked={setChecked}
              data={fetchedData?.data || []}
              refreshData={importData}
              showSearch={false}
            /> */}
            {data?.data?.grades?.length > 0 ? (
              Object.keys(groupedBySemesterKey)?.map(semesterKey => {
                return groupedBySemesterKey[semesterKey]?.map(grade => {
                  return show === 'table' && windosSize[0] > 1200 ? (
                    <div className="card gap-4">
                      <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ color: '#6b6ee5', fontSize: '20px', fontWeight: 'bold' }}>
                          {`${t(grade?.termGrade?.semesterKey)} ${t('LBL_GRADES')}`}{' '}
                        </h4>
                        <div style={{ flexDirection: 'row', display: 'flex', gap: '100px' }}>
                          <div style={{ color: '#6b6ee5', fontSize: '20px', display: 'flex', gap: '20px' }}>
                            {t('LBL_TOTAL_GRADE')}
                            <span style={{ color: '#4F4F4F' }}>{grade?.termGrade?.totalGrade}</span>{' '}
                          </div>{' '}
                          <div style={{ color: '#6b6ee5', fontSize: '20px', display: 'flex', gap: '20px' }}>
                            {t('LBL_GPA')}
                            <span style={{ color: '#4F4F4F' }}>{grade?.termGrade?.gradePoints}</span>{' '}
                          </div>
                        </div>
                      </div>
                      <Table
                        hasBulkActions={false}
                        tableOnly={true}
                        key={semesterKey} // You may want to provide a more unique key here
                        fields={fields}
                        data={grade?.grades || []}
                        total={10 || 0}
                        checked={checked}
                        setChecked={setChecked}
                        feature={feature}
                        subFeature={subFeature}
                        hasActions={false}
                      >
                        {grade?.grades &&
                          grade?.grades?.length > 0 &&
                          grade?.grades?.map(record => {
                            return (
                              <TableRow
                                hasBulkActions={false}
                                key={record.id}
                                record={record}
                                fields={fields}
                                checked={checked}
                                setChecked={setChecked}
                                feature={feature}
                                subFeature={subFeature}
                                isEditable={false}
                                isDeletable={false}
                                isViewable={false}
                              />
                            );
                          })}
                      </Table>
                    </div>
                  ) : (
                    (show === 'card' || windosSize[0] <= 1200) && (
                      <div className="card gap-4">
                        <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ color: '#6b6ee5', fontSize: '20px', fontWeight: 'bold' }}>
                            {`${t(grade?.termGrade?.semesterKey)} ${t('LBL_GRADES')}`}{' '}
                          </h4>
                          <div style={{ flexDirection: 'row', display: 'flex', gap: '100px' }}>
                            <div style={{ color: '#6b6ee5', fontSize: '20px', display: 'flex', gap: '20px' }}>
                              {t('LBL_TOTAL_GRADE')}
                              <span style={{ color: '#4F4F4F' }}>{grade?.termGrade?.totalGrade}</span>{' '}
                            </div>{' '}
                            <div style={{ color: '#6b6ee5', fontSize: '20px', display: 'flex', gap: '20px' }}>
                              {t('LBL_GPA')}
                              <span style={{ color: '#4F4F4F' }}>{grade?.termGrade?.gradePoints}</span>{' '}
                            </div>
                          </div>
                        </div>
                        <CardsList cardsOnly={true} total={10 || 0}>
                          {grade?.grades &&
                            grade?.grades?.length > 0 &&
                            grade?.grades?.map(record => {
                              return (
                                <Card
                                  key={record.id}
                                  feature={feature}
                                  subFeature={subFeature}
                                  record={record}
                                  title="name"
                                  subTitles={subTitles}
                                  checked={checked}
                                  setChecked={setChecked}
                                  isEditable={false}
                                  isViewable={false}
                                  isDeletable={false}
                                />
                              );
                            })}
                        </CardsList>
                      </div>
                    )
                  );
                });
              })
            ) : (
              <div className="card">
                <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GradesForm;
