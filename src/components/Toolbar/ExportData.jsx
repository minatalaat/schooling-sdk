import { useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { FaDownload, FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { SiGooglesheets } from 'react-icons/si';
import Dropdown from 'react-bootstrap/Dropdown';
import { SpinnerCircular } from 'spinners-react';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl, getActionUrl, getImportTemplateUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';

export default function ExportData({ dataModel, onAlert, isImport, searchPayload }) {
  const { t } = useTranslation();
  const { api, downloadFile, downloadAttachment } = useAxiosFunction();
  moment.locale('en');

  const [isLoading, setIsLoading] = useState(false);

  const exportOptions = [
    { name: 'PDF', title: `${t('LBL_EXPORT_AS')} PDF`, action: 'action-export-pdf-method', type: 'pdf', IconComponent: FaFilePdf },
    { name: 'Excel', title: `${t('LBL_EXPORT_AS')} Excel`, action: 'action-export-excel-method', type: 'xlsx', IconComponent: FaFileExcel },
    { name: 'CSV', title: `${t('LBL_EXPORT_AS')} CSV`, action: 'action-export-csv-method', type: 'csv', IconComponent: FaFileCsv },
  ];

  if (isImport) {
    exportOptions.unshift({
      name: 'Template',
      title: t('IMPORT_TEMPLATE'),
      action: 'action-export-excel-method',
      type: 'xlsx',
      IconComponent: SiGooglesheets,
    });
  }

  const exportData = async name => {
    setIsLoading(true);
    const selectedObject = exportOptions.find(option => option.name === name);

    const input = dataModel;
    const period = input.lastIndexOf('.');
    const packageName = input.substring(0, period);
    const modelName = input.substring(period + 1);

    if (name !== 'Template') {
      const searchExportsResponse = await api('POST', getSearchUrl(MODELS.ADVANCED_EXPORT), {
        fields: ['metaModel', 'name'],
        data: {
          _domain: 'self.metaModel.name = :modelName ',
          _domainContext: {
            modelName: modelName,
            packageName: packageName,
          },
        },
      });

      if (
        !searchExportsResponse ||
        !searchExportsResponse.data ||
        searchExportsResponse.data.status !== 0 ||
        !searchExportsResponse.data.data ||
        searchExportsResponse.data.data.length === 0
      ) {
        setIsLoading(false);
        onAlert('Error', t('LBL_FAILED_TO_DOWNLAOD'));
        return null;
      }

      let modelId = null;

      if (!modelId) {
        modelId = searchExportsResponse.data.data.find(record => !record.name.includes('.Template'))?.id;
      }

      if (!modelId) {
        setIsLoading(false);
        onAlert('Error', t('LBL_FAILED_TO_DOWNLAOD'));
        return null;
      }

      const fetchFilteredData = await api('POST', getSearchUrl(dataModel), { ...searchPayload, limit: -1, offset: 0 });

      let idsList = '[]';

      if (fetchFilteredData?.data?.data?.length > 0) {
        const idsArray = fetchFilteredData?.data?.data.map(record => record.id);
        idsList = `[${idsArray.join(', ')}]`;
      }

      const getFileResponse = await api('POST', getActionUrl(), {
        model: MODELS.ADVANCED_EXPORT,
        action: selectedObject.action,
        data: {
          context: {
            _model: MODELS.ADVANCED_EXPORT,
            id: modelId,
            _criteria: idsList,
          },
        },
      });

      if (
        !getFileResponse ||
        !getFileResponse.data ||
        getFileResponse.data.status !== 0 ||
        !getFileResponse.data.data ||
        !getFileResponse.data.data[0] ||
        !getFileResponse.data.data[0].view ||
        !getFileResponse.data.data[0].view.views ||
        !getFileResponse.data.data[0].view.views[0] ||
        !getFileResponse.data.data[0].view.views[0].name
      ) {
        setIsLoading(false);
        onAlert('Error', t('LBL_FAILED_TO_DOWNLAOD'));
        return null;
      }

      const url = import.meta.env.VITE_BASE_URL + getFileResponse.data.data[0].view.views[0].name;
      const fileName = `${modelName}_${selectedObject.name} ${moment().format('YYYY-MM-DD h-mm-ss')}.${selectedObject.type}`;

      downloadFile(
        url,
        fileName,
        () => {},
        () => {
          setIsLoading(false);
          onAlert('Error', t('LBL_FAILED_TO_DOWNLAOD'));
          return null;
        }
      );
      setIsLoading(false);
    } else if (name === 'Template' && isImport) {
      // const getTemplateResponse = await api('GET', getImportTemplateUrl(`${modelName}.xlsx`));

      const getFileData = async () => {
        const response = await downloadAttachment(getImportTemplateUrl(`${modelName}.xlsx`), 'application/octet-stream');
        const reader = new FileReader();

        reader.onabort = () => {};

        reader.onerror = () => {};

        reader.onload = () => {
          const data = reader.result;
          const link = document.createElement('a');
          link.target = '_blank';
          link.download = `${modelName}.xlsx`;
          link.href = URL.createObjectURL(new Blob([data]));
          link.click();
        };

        reader.readAsArrayBuffer(response);
      };

      getFileData();
      setIsLoading(false);
    }
  };

  return (
    <Dropdown className="float-end export-dropdown" onSelect={exportData}>
      {!isLoading && (
        <Dropdown.Toggle variant="">
          <FaDownload isIcon={true} size={23} style={{ margin: '0 0.5rem' }} />
        </Dropdown.Toggle>
      )}
      {isLoading && (
        <SpinnerCircular
          size={35}
          thickness={138}
          speed={100}
          color="rgba(31, 79, 222, 1)"
          secondaryColor="rgba(153, 107, 229, 0.19)"
          style={{ marginTop: '12px' }}
        />
      )}

      <Dropdown.Menu>
        {exportOptions.map(option => (
          <Dropdown.Item key={option.name} className={option.type} eventKey={option.name}>
            <option.IconComponent isIcon={true} size={23} style={{ margin: '0 0.5rem' }} values={option.name} />
            {option.title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
