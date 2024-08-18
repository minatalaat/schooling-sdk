import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  packages: [],
  freeTierId: null,
  freeTierPriceId: null,
  loading: true,
  pricePlans: [],
};
const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackages(state, action) {
      state.packages = action.payload.packages;
      state.freeTierId = action.payload.freeTierId;
      state.freeTierPriceId = action.payload.freeTierPriceId;
      state.loading = false;
      state.pricePlans = action.payload.pricePlans;
    },
    setLoadingFailed(state) {
      state.loading = false;
    },
    setLoadingStart(state) {
      state.loading = true;
    },
  },
});

export const packagesActions = packagesSlice.actions;
export default packagesSlice.reducer;
