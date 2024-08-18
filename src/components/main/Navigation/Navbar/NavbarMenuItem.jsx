import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavbarMenuItem = ({ onClick = () => {}, path, label, iconClass, state }) => {
  const { t } = useTranslation();
  return (
    <li onClick={onClick}>
      <Link to={path} state={state} className="dropdown-item bg-danger-soft-hover">
        {t(label)}
        <i className={iconClass}></i>
      </Link>
    </li>
  );
};

export default NavbarMenuItem;
