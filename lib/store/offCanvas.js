import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  show: false,
  title: '',
};

const offCanvasSlice = createSlice({
  name: 'offCanvas',
  initialState,
  reducers: {
    push(state, action) {
      state.notifications.push({
        icon: action.payload.icon || null,
        message: action.payload.message || null,
        confirmLabel: action.payload.confirmLabel || null,
        showConfirmAction: action?.payload?.showConfirmAction,
        onConfirmHandler: action.payload.onConfirmHandler || undefined,
        cancelLabel: action.payload.cancelLabel || null,
        showCancelAction: action?.payload?.showCancelAction,
        onCancelHandler: action.payload.onCancelHandler || undefined,
      });
    },
    open(state) {
      state.show = true;
    },
    close(state) {
      state.show = false;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
  },
});

export const offCanvasActions = offCanvasSlice.actions;
export default offCanvasSlice.reducer;
