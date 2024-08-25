import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allowedExports: [],
  tierFeatures: [],
  userFeatures: [],
  email: '',
  name: '',
  group: -1,
  companyInfo: null,
  subInfo: null,
  quickActionsTotal: 0,
  id: -1,
  userFavorites: [],
  userData: null,
  publicKey:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApfTowD37Mjyn6tGJGU92Rpxekcr/ikucSK3aextSu8R1biYkl3vbwBNIleGF3pEH/iPJPOqmbk9vYLZNTmt9eQGjUEFB4wDJwp9vgpS+fiMs5eg+cbsb4NLGiGoSBwLd6tMOltiLCZl7Fgw24fhiKkXJsPamV2674dmt5H5eRJhoaYdg8WV0UfGEvhH+8EDMKZROTkfvXrFjA6lc2cLKWP+mGcSR02bZIAAAdptvxO3GY6j7iNIyli3Tk8Ib2cajAx0pqPLknL7Li/AKBJZ8McKtUTgXmB6EEr6qNIMRQDfX9z0yfsSTW9+EKQADCnSi9nhJoGG0VHp7H7ITfXj5VwIDAQAB',
};
const userFeaturesSlice = createSlice({
  name: 'userFeatures',
  initialState,
  reducers: {
    getUserFeatures(state, action) {
      state.userFeatures = action.payload.features;
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.group = action.payload.group;
      state.quickActionsTotal = action.payload.quickActionsTotal;
      state.userData = action.payload.userData;
    },
    getCompanyInfoProvision(state, action) {
      let newCompanyInfo = {
        ...action.payload,
        company: {
          id: action.payload.company.id,
          code: action.payload.company.code,
          name: action.payload.company.name,
          // taxNumberList: action.payload.taxNumberList,
        },
      };
      state.companyInfo = newCompanyInfo;
    },
    resetUserFeatures(state) {
      state.userFeatures = [];
      state.email = '';
      state.name = '';
      state.group = -1;
      state.companyInfo = null;
      state.quickActionsTotal = 0;
      state.id = -1;
      state.userData = null;
      state.userFavorites = [];
    },
    setQuickActionsTotal(state, action) {
      state.quickActionsTotal = action.payload;
    },
    getFavorites(state, action) {
      state.userFavorites = action.payload;
    },
    getPublicKey(state, action) {
      state.publicKey = action.payload;
    },
    setTaxNumberList(state, action) {
      state.companyInfo = {
        ...state.companyInfo,
        mainData: {
          ...state.companyInfo.mainData,
          taxNumberList: action.payload,
        },
      };
    },
    setUserPartnerImg(state, action) {
      state.userData = {
        ...state.userData,
        partner: {
          ...state.userData?.partner,
          img: action.payload,
        },
      };
    },
    setUserPartnerTitleSelect(state, action) {
      state.userData = {
        ...state.userData,
        partner: {
          ...state.userData?.partner,
          titleSelect: action.payload,
        },
      };
    },
    setCompanyLogo(state, action) {
      state.companyInfo = {
        ...state.companyInfo,
        mainData: {
          ...state.companyInfo.mainData,
          logo: {
            id: action.payload,
          },
        },
      };
    },
    setTierFeatures(state, action) {
      state.tierFeatures = action.payload;
    },
    setAllowedExports(state, action) {
      state.allowedExports = action.payload;
    },
    setSubInfo(state, action) {
      state.subInfo = action.payload;
    },
  },
});

export const userFeaturesActions = userFeaturesSlice.actions;
export default userFeaturesSlice.reducer;
