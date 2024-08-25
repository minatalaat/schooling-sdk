import { createSlice } from '@reduxjs/toolkit';
import { MODELS } from '../constants/models';
import { REST_ENDPOINTS } from '../constants/rest';

let textPlainJSON = 'text/plain;json';

const initialState = {
  company: [],
};
const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    companyFetch(state, action) {
      const payload = {
        fields: ['id', 'name', 'code'],
        sortBy: null,
        data: {
          _domain: null,
          _domainContext: {
            _id: null,
            _model: MODELS.COMPANY,
          },
          operator: 'and',
          criteria: [],
        },
        operator: 'and',
        criteria: [],
        limit: 40,
        offset: 0,
        translate: true,
      };
      action.payload(
        'POST',
        import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + MODELS.COMPANY + REST_ENDPOINTS.SEARCH,
        payload,
        res => {
          state = { ...state, company: [...res.data.data] };
        },
        null,
        textPlainJSON
      );
    },
  },
});
export const companyActions = companySlice.actions;
export default companySlice.reducer;
