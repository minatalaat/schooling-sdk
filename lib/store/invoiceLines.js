import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  invoiceLines: [],
};

const invoiceLines = createSlice({
  name: 'invoiceLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.invoiceLines = action.payload.invoiceLines;
    },
    deleteLine(state, action) {
      let index = state.invoiceLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.id);
      if (index >= 0) state.invoiceLines.splice(index, 1);
    },
    addLine(state, action) {
      state.invoiceLines.push(action.payload.invoiceLine);
    },
    editLine(state, action) {
      let index = state.invoiceLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.id);
      state.invoiceLines[index] = action.payload.invoiceLine;
    },
    updateAnalyticMoveLines(state, action) {
      let index = state.invoiceLines.findIndex(line => line.lineId !== null && line.lineId === action.payload.id);

      state.invoiceLines[index].analyticMoveLineList = [...action.payload.analtyicMoveLineList];
    },
    resetInvoiceLines(state) {
      state.invoiceLines = [];
    },

    // updateLineAmountDebit(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].debit = action.payload.debit;
    //     state.invoiceLines[index].currencyAmount = action.payload.currencyAmount;
    //   }
    // },
    // updateLineAmountCredit(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].credit = action.payload.credit;
    //     state.invoiceLines[index].currencyAmount = action.payload.currencyAmount;
    //   }
    // },
    // updateLinePartner(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].partner = action.payload.partner;
    //   }
    // },
    // updateLineAccount(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].account = action.payload.account;
    //   }
    // },
    // updateLineCredit(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].credit = action.payload.credit;
    //   }
    // },
    // updateLineDebit(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].debit = action.payload.debit;
    //   }
    // },
    // updateLinesDate(state,action){
    //   state.invoiceLines.forEach((line) => (line.date = action.payload.date));
    // },
    // confirmLine(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index].disabled = true;
    //   }
    // },
    // cancelLine(state, action) {
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.invoiceLines[index] = action.payload.line;
    //     state.invoiceLines[index].disabled = true;
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
    //   let index = state.invoiceLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.prevLine = state.invoiceLines[index];
    //   }
    // },
  },
});

export const invoiceLinesActions = invoiceLines.actions;
export default invoiceLines.reducer;
