import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  financialInstitutions: [],
  selectedFinancialInstitution: null,
  accountsLinkId: null,
};

const financialInstitutionsSlice = createSlice({
  name: 'financialInstitutions',
  initialState,
  reducers: {
    setFinancialInstitutions(state, action) {
      state.financialInstitutions = action.payload;
    },
    setSelectedFinancialInstitution(state, action) {
      state.selectedFinancialInstitution = action.payload;
    },
    resetSelectedFinancialInstitution(state) {
      state.selectedFinancialInstitution = null;
    },
    resetAccountsLinkId(state) {
      state.accountsLinkId = null;
    },
    setAccountsLinkId(state, action) {
      state.accountsLinkId = action.payload;
    },
  },
});

export const financialInstitutionsActions = financialInstitutionsSlice.actions;
export default financialInstitutionsSlice.reducer;
