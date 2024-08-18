import { configureStore } from '@reduxjs/toolkit';

import userReducer from './user';
import accountReducer from './accounts';
import moveLinesReducer from './movelines';
import stockMoveLinesReducer from './stockMoveLines';
import companyReducer from './company';
import partnerAccountsReducer from './partnerAccounts';
import analyticDistributionLinesReducer from './analyticDistrbution';
import invoiceLinesReducer from './invoiceLines';
import financialInstitutionsReducer from './financialInstitutions';
import bankDetailsReducer from './bankDetails';
import reconciliationLinesReducer from './reconciliationLines';
import userPrivilagesReducer from './userPrivilages';
import userFeatures from './userFeatures';
import TourSteps from './tourSteps';
import authReducer from './auth';
import generateInvoiceStockMovesLinesReducer from './generateInvoiceStockMovesLines';
import inventoryLinesReducer from './inventoryLines';
import depreciationLinesReducer from './DepreciationLines';
import weekDaysReducer from './weekDays';
import timesheetLinesReducer from './timesheetLines';
import otherCostsLinesReducer from './otherCostsLines';
import alertsReducer from './alerts';
import newTabReducer from './newTab';
import confirmationPopupReducer from './confirmationPopup';
import upgradeConfirmationPopupReducer from './upgradeConfirmationPopup';
import openBanking from './openBanking';
import packagesReducer from './packages';
import integrators from './Integrators';
import offCanvasReducer from './offCanvas';

export const store = configureStore({
  reducer: {
    user: userReducer,
    accounts: accountReducer,
    company: companyReducer,
    lines: moveLinesReducer,
    stockMoveLines: stockMoveLinesReducer,
    partnerAccounts: partnerAccountsReducer,
    analyticDistributionLines: analyticDistributionLinesReducer,
    invoiceLines: invoiceLinesReducer,
    financialInstitutions: financialInstitutionsReducer,
    bankDetails: bankDetailsReducer,
    reconciliationLines: reconciliationLinesReducer,
    features: userPrivilagesReducer,
    userFeatures: userFeatures,
    tourSteps: TourSteps,
    auth: authReducer,
    generateInvoiceStockMovesLines: generateInvoiceStockMovesLinesReducer,
    inventoryLines: inventoryLinesReducer,
    depreciationLines: depreciationLinesReducer,
    weekDays: weekDaysReducer,
    timesheetLines: timesheetLinesReducer,
    otherCostsLines: otherCostsLinesReducer,
    alerts: alertsReducer,
    newTab: newTabReducer,
    confirmationPopup: confirmationPopupReducer,
    upgradeConfirmationPopup: upgradeConfirmationPopupReducer,
    openBanking: openBanking,
    packages: packagesReducer,
    integrators: integrators,
    offCanvas: offCanvasReducer,
  },
});
