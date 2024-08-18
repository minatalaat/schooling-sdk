import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  show: false,
  message: null,
  title: null,
  instruction: null,
  actionLabel: null,
  showAction: true,
  cancelLabel: null,
  thirdActionLabel: null,
  thirdActionHandler: () => {},
  onConfirmHandler: () => {},
};

const upgradeConfirmationPopupSlice = createSlice({
  name: 'upgradeConfirmationPopup',
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
      state.cancelLabel = action.payload.cancelLabel || undefined;
      state.thirdActionLabel = action.payload.thirdActionLabel || undefined;
      state.thirdActionHandler = action.payload.thirdActionHandler || undefined;
    },
  },
});

export const upgradeConfirmationPopupActions = upgradeConfirmationPopupSlice.actions;
export default upgradeConfirmationPopupSlice.reducer;
