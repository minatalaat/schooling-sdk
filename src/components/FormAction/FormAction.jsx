import PrimaryButton from '../ui/buttons/PrimaryButton';
import { useFeatures } from '../../hooks/useFeatures';
import { useTranslation } from 'react-i18next';
import { useModelActionsServices } from '../../services/apis/useModelActionsServices';

function FormAction({
  editHandler,
  viewHandler,
  viewPDFHandler,
  printSnapShotHandler,
  editHandlerParams,
  viewHandlerParams,
  feature,
  subFeature,
  setIsOpen,
  copyOptions,
  forceShow = false,
}) {
  const { canView, canEdit } = useFeatures(feature, subFeature);
  const { t } = useTranslation();
  const { copyHandler } = useModelActionsServices({
    feature,
    subFeature,
    modelsEnumKey: copyOptions?.modelsEnumKey,
    id: copyOptions?.id,
    setIsLoading: copyOptions?.setActionInProgress,
  });

  return (
    <>
      {((canView && viewHandler) || (canEdit && editHandler) || viewPDFHandler || printSnapShotHandler || copyOptions || forceShow) && (
        <div>
          <div className="form-action col-md-12 mb-4">
            {editHandler && (
              <PrimaryButton theme="formAction" icon="edit" text={t('LBL_EDIT')} onClick={() => editHandler(editHandlerParams)} />
            )}
            {viewHandler && (
              <PrimaryButton theme="formAction" icon="view" text={t('LBL_VIEW')} onClick={() => viewHandler(viewHandlerParams)} />
            )}
            {viewPDFHandler && (
              <PrimaryButton
                theme="formAction"
                icon="print"
                text={t('LBL_PRINT')}
                onClick={() => {
                  setIsOpen(false);
                  viewPDFHandler();
                }}
              />
            )}
            {printSnapShotHandler && <PrimaryButton theme="formAction" icon="snap" text={t('LBL_SNAP')} onClick={printSnapShotHandler} />}
            {copyOptions && <PrimaryButton theme="formAction" icon="copy" text={t('LBL_DUPLICATE')} onClick={copyHandler} />}
          </div>
        </div>
      )}
    </>
  );
}

export default FormAction;
