import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  show: false,
  message: null,
  title: null,
  instruction: null,
  actionLabel: null,
  showAction: true,
  onConfirmHandler: () => {},
  onCancelHandler: () => {},
};

const confirmationPopupSlice = createSlice({
  name: 'confirmationPopup',
  initialState,
  reducers: {
    closePopup(state) {
      state.show = false;
    },
    openPopup(state, action) {
      state.show = true;
      state.message = action.payload.message || null;
      state.title = action.payload.title || null;
      state.instruction = action.payload.instruction || null;
      state.actionLabel = action.payload.actionLabel || 'LBL_CONFIRM';
      state.showAction = action?.payload?.showAction === false ? false : true;
      state.onConfirmHandler = action.payload.onConfirmHandler || undefined;
      state.onCancelHandler = action.payload.onCancelHandler || undefined;
    },
  },
});

export const confirmationPopupActions = confirmationPopupSlice.actions;
export default confirmationPopupSlice.reducer;
