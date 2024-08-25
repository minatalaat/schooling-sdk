import { Routes, Route, Navigate } from 'react-router-dom';

import PrintingSettings from './PrintingSettings';
import AddPrintingSetting from './AddPrintingSetting';
import EditPrintingSetting from './EditPrintingSetting';
import ViewPrintingSetting from './ViewPrintingSetting';

import { useFeatures } from '../../hooks/useFeatures';

const MainPrintingSettings = () => {
  const feature = 'APP_CONFIG';
  const subFeature = 'PRINTING_SETTINGS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<PrintingSettings feature={feature} subFeature={subFeature} />} />
      {canEdit && (
        <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditPrintingSetting feature={feature} subFeature={subFeature} />} />
      )}
      {canView && (
        <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewPrintingSetting feature={feature} subFeature={subFeature} />} />
      )}
      {canAdd && (
        <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddPrintingSetting feature={feature} subFeature={subFeature} />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainPrintingSettings;
