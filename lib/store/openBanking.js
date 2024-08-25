import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  OBToken: null,
};
const openBankingSlice = createSlice({
  name: 'openBanking',
  initialState,
  reducers: {
    setOBToken(state, action) {
      state.OBToken = action.payload;
    },
  },
});

export const openBankingActions = openBankingSlice.actions;
export default openBankingSlice.reducer;
