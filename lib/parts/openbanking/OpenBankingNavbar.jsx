import { useTranslation } from 'react-i18next';

function OpenBankingNavbar({ navItems, show }) {
  const { t } = useTranslation();
  return (
    <ul className="nav nav-tabs" id="TabbankButton" role="tablist">
      {navItems &&
        navItems.map(item => {
          return (
            <li className="nav-item" role="presentation">
              <button
                className={show === item.title ? 'nav-link active' : 'nav-link'}
                id="tab1-tab"
                data-bs-toggle="tab"
                data-bs-target="#tab1"
                type="button"
                role="tab"
                aria-controls="tab1"
                aria-selected="true"
                onClick={item.clickHandler}
              >
                {t(item.title || '')}
              </button>
            </li>
          );
        })}
    </ul>
  );
}

export default OpenBankingNavbar;
