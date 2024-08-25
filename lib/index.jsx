import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';

import App from './App';

import './assets/css/style.scss';
import './assets/css/responsive.scss';
import './assets/css/rtl.scss';

import './i18n/i18n';

import { store } from './store/index';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
