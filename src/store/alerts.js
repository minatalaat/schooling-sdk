import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment/moment';

const initialState = {
  alerts: [],
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    initiateAlert(state, action) {
      let title = action.payload.title || 'Error';

      let existingMessageIndex = state.alerts.findIndex(alert => alert.message === action.payload.message);

      if (existingMessageIndex !== -1) {
        let newAlerts = [...state.alerts];
        newAlerts[existingMessageIndex] = {
          ...newAlerts[existingMessageIndex],
          timestamp: moment.utc(new Date().getTime()).utcOffset('+03').locale('en').format('DD/MM/YYYY:hh:mm:ss'),
        };
        state.alerts = newAlerts;
        return;
      }

      const getTitle = () => {
        switch (title) {
          case 'Info':
            return { translatedTitle: 'LBL_INFO', alertAction: 'info' };

          case 'Success':
            return { translatedTitle: 'LBL_SUCCESS', alertAction: 'success' };

          case 'Warning':
            return { translatedTitle: 'LBL_WARNING', alertAction: 'warning' };

          case 'Error':
            return { translatedTitle: 'LBL_ERROR', alertAction: 'error' };

          default:
            return { translatedTitle: 'LBL_ERROR', alertAction: 'error' };
        }
      };

      const { translatedTitle, alertAction } = getTitle();

      let newId = state.alerts.length === 0 ? 0 : state.alerts[state.alerts.length - 1].id + 1;

      state.alerts = [
        ...state.alerts,
        {
          message: action.payload.message,
          timeout: action.payload.timeout || undefined,
          autoClose: action.payload.autoClose === false ? false : true,
          title: translatedTitle,
          action: alertAction,
          timestamp: moment.utc(new Date().getTime()).utcOffset('+03').locale('en').format('DD/MM/YYYY:hh:mm:ss'),
          id: newId,
          translate: action.payload.translate === false ? false : true,
          dissappearOnLocationChange: action.payload.dissappearOnLocationChange === false ? false : true,
        },
      ];
    },
    closeAlert(state, action) {
      state.alerts = [...state.alerts].filter(alert => alert.id !== action.payload);
    },
    clearAlerts(state) {
      state.alerts = [];
    },
  },
});

export const alertsActions = alertsSlice.actions;
export default alertsSlice.reducer;
