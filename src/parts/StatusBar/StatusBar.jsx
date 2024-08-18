import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const StatusBar = ({ items }) => {
  const { t } = useTranslation();
  return (
    <div className="steps-bar">
      {items.length > 1 && <span className="prog-line-default"></span>}
      <ul className="steps-indicator">
        {items &&
          items.map((item, index) => {
            return (
              <li className={item.className} key={index}>
                <div>
                  <Link style={{ pointerEvents: 'none' }}>{t(item.label)}</Link>
                  {item.className === 'done' && index !== items.length - 1 && items.length > 1 && <span className="prog-line"></span>}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default StatusBar;
