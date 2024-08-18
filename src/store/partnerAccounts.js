import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  partnerAccounts: [],
};

const partnerAccountSlice = createSlice({
  name: 'partnerAccounts',
  initialState,
  reducers: {
    setLines(state, action) {
      state.partnerAccounts = [...action.payload.partnerAccounts];
    },
    deleteLine(state, action) {
      let index = null;

      if (typeof action.payload.id === 'number') {
        index = state.partnerAccounts.findIndex(account => account.id === action.payload.id);
      } else {
        index = state.partnerAccounts.findIndex(account => account.lineId === action.payload.id);
      }

      if (index >= 0) state.partnerAccounts.splice(index, 1);
    },
    addLine(state, action) {
      state.partnerAccounts.push(action.payload.partnerAccount);
    },
    editLine(state, action) {
      let index = null;

      if (typeof action.payload.id === 'number') {
        index = state.partnerAccounts.findIndex(account => account.id === action.payload.id);
      } else {
        index = state.partnerAccounts.findIndex(account => account.lineId === action.payload.id);
      }

      if (index >= 0) state.partnerAccounts[index] = action.payload.partnerAccount;
    },
  },
});

export const PartnerAccountsActions = partnerAccountSlice.actions;
export default partnerAccountSlice.reducer;
