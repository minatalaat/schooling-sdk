import { useSelector } from 'react-redux';

import ToastCard from './ToastCard';

export default function ToastAccent() {
  const currentAlerts = useSelector(state => state.alerts.alerts);

  return (
    <div className="toast-accent-container">
      {currentAlerts.map(alert => (
        <ToastCard alert={alert} key={alert.id} />
      ))}
    </div>
  );
}
