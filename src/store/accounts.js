import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  accounts: [],
};
const accountsSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addAccount(state, action) {
      state.accounts.push(action.payload);
    },
    deleteAccount(state, action) {
      state.accounts = state.accounts.filter(account => account.id !== action.payload.id);
    },
    updateAccount(state, action) {
      let temp = state.accounts;
      temp[action.payload.id].active = !temp[action.payload.id].active;
      state.accounts = [...temp];
    },
  },
});

export const accountActions = accountsSlice.actions;
export default accountsSlice.reducer;
