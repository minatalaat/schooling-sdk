import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  supplierAccounts: [],
};

const supplierAccountSlice = createSlice({
  name: 'supplierAccounts',
  initialState,
  reducers: {
    setLines(state, action) {
      state.supplierAccounts = [...action.payload.supplierAccounts];
    },
    deleteLine(state, action) {
      let index = null;

      if (typeof action.payload.id === 'number') {
        index = state.supplierAccounts.findIndex(account => account.id === action.payload.id);
      } else {
        index = state.supplierAccounts.findIndex(account => account.lineId === action.payload.id);
      }

      if (index >= 0) state.supplierAccounts.splice(index, 1);
    },
    addLine(state, action) {
      state.supplierAccounts.push(action.payload.supplierAccount);
    },
    editLine(state, action) {
      let index = null;

      if (typeof action.payload.id === 'number') {
        index = state.supplierAccounts.findIndex(account => account.id === action.payload.id);
      } else {
        index = state.supplierAccounts.findIndex(account => account.lineId === action.payload.id);
      }

      if (index >= 0) state.supplierAccounts[index] = action.payload.supplierAccount;
    },
  },
});

export const SupplierAccountsActions = supplierAccountSlice.actions;
export default supplierAccountSlice.reducer;
