import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  originTab: window.opener,
};

const newTabSlice = createSlice({
  name: 'newTab',
  initialState,
  reducers: {
    returnToOrigin(state) {
      state.originTab.focus();
      window.close();
    },
  },
});

export const newTabActions = newTabSlice.actions;
export default newTabSlice.reducer;
