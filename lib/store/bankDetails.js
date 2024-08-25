import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  defaultBankDetails: {},
  bankDetails: [],
  bankDetailsIDs: [],
};

const bankDetails = createSlice({
  name: 'bankDetails',
  initialState,
  reducers: {
    setBankDetails(state, action) {
      state.bankDetails = action.payload.bankDetails;
      state.bankDetails.forEach(element => {
        element.canDelete = false;
        element.canEdit = false;
      });
    },
    setBankDetailsOperations(state, action) {
      let brIDs = action.payload.ids;
      state.bankDetails.forEach(element => {
        let canEdit = !brIDs.includes(element.id);
        element.canDelete = canEdit;
        element.canEdit = canEdit;
      });
    },
    addBankDetail(state, action) {
      let newAccount = { ...action.payload.bankDetail };
      newAccount.canDelete = true;
      newAccount.canEdit = true;
      state.bankDetails.push(newAccount);
    },
    editBankDetail(state, action) {
      let tempBankDetail = { ...action.payload.bankDetail };
      tempBankDetail.canDelete = true;
      tempBankDetail.canEdit = true;
      let index = state.bankDetails.findIndex(bankDetail => bankDetail.lineId === action.payload.lineId);

      if (index >= 0) {
        state.bankDetails[index] = tempBankDetail;
      }
    },
    deleteBankDetails(state, action) {
      let ids = action.payload.bankDetailsIDs;

      if (ids.length > 0) {
        state.bankDetails = state.bankDetails.filter((bd, index) => !ids.includes(index.toString()));
      }
    },
    setBankDetailsIDs(state, action) {
      state.bankDetailsIDs = action.payload.bankDetailsIDs;
    },
    setDefaultBankDetails(state, action) {
      state.defaultBankDetails = action.payload.defaultBankDetails;
    },
  },
});

export const bankDetailsActions = bankDetails.actions;
export default bankDetails.reducer;
