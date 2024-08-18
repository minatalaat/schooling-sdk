import { useSelector } from 'react-redux';

import { getReportUrl } from '../../services/getUrl';

function ViewReport(props) {
  let { url, formik } = props;
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);

  if (formik?.values?.format === 'pdf') {
    return (
      <div className={'iframe_wrapper'}>
        <iframe src={getReportUrl(url, tenantId)} title="Report Preview" />
      </div>
    );
  } else {
    return (
      <iframe
        src={getReportUrl(url, tenantId)}
        style={{
          height: '0px',
        }}
      />
    );
  }
}

export default ViewReport;
