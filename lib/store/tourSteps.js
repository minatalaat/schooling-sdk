import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  isTour: 'false',
  isRun: false,
  stepIndex: 0,
  spotlightClicks: false,
  showTourWelcome: 'false',
  showTourSteps: false,
  tourName: '',
  tourSteps: [],
};
const tourStepsSlice = createSlice({
  name: 'tourSteps',
  initialState,
  reducers: {
    setSteps(state, action) {
      state.tourSteps = [...action.payload.steps];
    },
    setIsTour(state, action) {
      state.isTour = action.payload;
    },
    setShowTourWelcome(state, action) {
      state.showTourWelcome = action.payload;
    },
    setShowTourSteps(state, action) {
      state.showTourSteps = action.payload;
    },
    setIsRun(state, action) {
      state.isRun = action.payload;
    },
    setTourName(state, action) {
      state.tourName = action.payload;
    },
    setStepIndex(state, action) {
      state.stepIndex = action.payload;
    },
    setSpotlightClick(state, action) {
      state.spotlightClicks = action.payload;
    },
    reset(state, action) {
      state.isTour = 'false';
      state.isRun = false;
      state.stepIndex = 0;
      state.spotlightClicks = false;
      state.showTourWelcome = 'false';
      state.showTourSteps = false;
      state.tourName = '';
      state.tourSteps = [];
    },
    // deleteAccount(state, action) {
    //   state.accounts = state.accounts.filter(account => account.id !== action.payload.id);
    // },
    // updateAccount(state, action) {
    //
    //   let temp = state.accounts;
    //   temp[action.payload.id].active = !temp[action.payload.id].active;
    //   state.accounts = [...temp];
    // },
  },
  // ,
  // extraReducers: builder => {
  //   builder.addCase('RESET', () => initialState);
  // },
});

export const tourStepsActions = tourStepsSlice.actions;
export default tourStepsSlice.reducer;
