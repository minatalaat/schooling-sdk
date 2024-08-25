import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  analyticDistributionLines: [],
};

const analyticDistributionLines = createSlice({
  name: 'analyticDistributionLines',
  initialState,
  reducers: {
    setLines(state, action) {
      state.analyticDistributionLines = action.payload.analyticDistributionLines;
    },
    deleteLine(state, action) {
      let index = state.analyticDistributionLines.findIndex(line => line.lineId === action.payload.id);
      if (index >= 0) state.analyticDistributionLines.splice(index, 1);
    },
    addLine(state, action) {
      state.analyticDistributionLines.push(action.payload.analyticDistributionLine);
    },
    editLine(state, action) {
      let index = state.analyticDistributionLines.findIndex(line => line.lineId === action.payload.id);
      state.analyticDistributionLines[index] = action.payload.analyticDistributionLine;
    },
    resetAnalyticDistributionLines(state) {
      state.analyticDistributionLines = [];
    },
    // updateLineAmountDebit(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].debit = action.payload.debit;
    //     state.analyticDistributionLines[index].currencyAmount = action.payload.currencyAmount;
    //   }
    // },
    // updateLineAmountCredit(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].credit = action.payload.credit;
    //     state.analyticDistributionLines[index].currencyAmount = action.payload.currencyAmount;
    //   }
    // },
    // updateLinePartner(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].partner = action.payload.partner;
    //   }
    // },
    // updateLineAccount(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].account = action.payload.account;
    //   }
    // },
    // updateLineCredit(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].credit = action.payload.credit;
    //   }
    // },
    // updateLineDebit(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].debit = action.payload.debit;
    //   }
    // },
    // updateLinesDate(state,action){
    //   state.analyticDistributionLines.forEach((line) => (line.date = action.payload.date));
    // },
    // confirmLine(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index].disabled = true;
    //   }
    // },
    // cancelLine(state, action) {
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.analyticDistributionLines[index] = action.payload.line;
    //     state.analyticDistributionLines[index].disabled = true;
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
    //   let index = state.analyticDistributionLines.findIndex(
    //     (line) => line.id === action.payload.index
    //   );
    //   if(index>=0){
    //     state.prevLine = state.analyticDistributionLines[index];
    //   }
    // },
  },
});

export const analyticDistributionLinesActions = analyticDistributionLines.actions;
export default analyticDistributionLines.reducer;
