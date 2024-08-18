import { createSlice } from '@reduxjs/toolkit';
import { clearLocalStorage } from '../utils/localStorage';

const initialState = {
  authLoading: true,
  redirect: {
    isRedirect: false,
    text: 'LBL_REDIRECTING',
  },
  displayedRoutes: [],
  firstLogin: null,
  payOnly: false,
  changePassword: false,
  tempToken: {
    csrf: null,
    checksum: null,
    authorization: null,
  },
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading(state) {
      state.authLoading = true;
    },
    endLoading(state) {
      state.authLoading = false;
      state.redirecting = false;
    },
    resetLocalStorage(state) {
      state.changePassword = false;
      state.firstLogin = false;
      state.displayedRoutes = [];
      state.tempToken = {
        csrf: null,
        checksum: null,
        authorization: null,
      };
      clearLocalStorage();
    },
    getRoutes(state, action) {
      state.displayedRoutes = action.payload;
    },
    getFirstLogin(state, action) {
      state.firstLogin = action.payload;
    },
    setPayOnly(state) {
      state.payOnly = true;
    },
    enableChangePassword(state, action) {
      state.changePassword = action.payload;
    },
    setTempToken(state, action) {
      state.tempToken = {
        csrf: action.payload.csrf || null,
        checksum: action.payload.checksum || null,
        authorization: action.payload.authorization || null,
      };
    },
    redirectStart(state, action) {
      state.redirect.isRedirect = true;
      state.redirect.text = action.payload?.text ?? 'LBL_REDIRECTING';
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
