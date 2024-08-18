import { useTranslation } from 'react-i18next';

const IntegrationAppTabNav = ({ activeTab, tabName, setActiveTab, title }) => {
  const { t } = useTranslation();

  return (
    <li className="nav-item" role="presentation">
      <button
        className={`nav-link ${activeTab === tabName ? 'active' : ''}`}
        id={`${tabName}-tab`}
        data-bs-target={`#${tabName}`}
        type="button"
        data-bs-toggle="tab"
        role="tab"
        aria-controls={tabName}
        aria-selected={activeTab === tabName}
        onClick={() => setActiveTab(tabName)}
      >
        {t(title)}
      </button>
    </li>
  );
};

export default IntegrationAppTabNav;
