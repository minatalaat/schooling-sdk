import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  customerAccounts: [],
};

const customerAccountSlice = createSlice({
  name: 'customerAccounts',
  initialState,
  reducers: {
    setLines(state, action) {
      state.customerAccounts = [...action.payload.customerAccounts];
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
      state.customerAccounts.push(action.payload.customerAccount);
    },
    editLine(state, action) {
      let index = state.customerAccounts.findIndex(account => account.lineId === action.payload.id);
      state.customerAccounts[index] = action.payload.customerAccount;
    },
    // updateLineAmountDebit(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].debit = action.payload.debit;
    //     state.customerAccounts[index].currencyAmount = action.payload.currencyAmount;
    //   }
    // },
    // updateLineAmountCredit(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].credit = action.payload.credit;
    //     state.customerAccounts[index].currencyAmount = action.payload.currencyAmount;
    //   }
    // },
    // updateLinePartner(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].partner = action.payload.partner;
    //   }
    // },
    // updateLineAccount(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].account = action.payload.account;
    //   }
    // },
    // updateLineCredit(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].credit = action.payload.credit;
    //   }
    // },
    // updateLineDebit(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].debit = action.payload.debit;
    //   }
    // },
    // updateLinesDate(state,action){
    //   state.customerAccounts.forEach((line) => (line.date = action.payload.date));
    // },
    // confirmLine(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index].disabled = true;
    //   }
    // },
    // cancelLine(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.customerAccounts[index] = action.payload.line;
    //     state.customerAccounts[index].disabled = true;
    //   }
    //   return state;
    // },
    // setCurrentLine(state, action) {
    //   state.currentLine = action.payload.line;
    // },
    // setCurrentIndex(state, action) {
    //   state.currentIndex = action.payload.index;
    // },
    // setPrevLine(state, action) {
    //   let index = state.customerAccounts.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.prevLine = state.customerAccounts[index];
    //   }
    // },
  },
});

export const CustomerAccountsActions = customerAccountSlice.actions;
export default customerAccountSlice.reducer;
