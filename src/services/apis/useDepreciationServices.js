import { useTranslation } from 'react-i18next';

import { MODELS } from '../../constants/models';
import { useMainAxelorServices } from './useMainAxelorServices';
import { checkFlashOrError } from '../../utils/helpers';
import moment from 'moment';

export const useDepreciationServices = alertHandler => {
  const { actionService, fetchService, saveService } = useMainAxelorServices();
  const { t } = useTranslation();

  const FIXED_ASSET_LINES_SEARCH_FIELDS = [
    'statusSelect',
    'depreciationBase',
    'cumulativeDepreciation',
    'fixedAsset.statusSelect',
    'fiscalFixedAsset.statusSelect',
    'ifrsFixedAsset.statusSelect',
    'accountingValue',
    'depreciationDate',
    'depreciation',
    'depreciationAccountMove',
  ];

  const getRealizeFirstActionPayload = (action, line) => {
    if (!line) return {};
    return {
      model: MODELS.FIXED_ASSET_LINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET_LINE,
          statusSelect: 1,
          depreciationBase: line?.depreciationBase || null,
          cumulativeDepreciation: line?.cumulativeDepreciation || null,
          'fixedAsset.statusSelect': line['fixedAsset.statusSelect'] || null,
          'ifrsFixedAsset.statusSelect': line['fixedAsset.statusSelect'] || null,
          accountingValue: line?.accountingValue || null,
          id: line?.id || null,
          depreciationDate: line?.depreciationDate || null,
          depreciation: line?.depreciation || null,
          selected: true,
          _parent: {
            _id: null,
            acquisitionDate: line['fixedAsset.acquisitionDate'] || null,
            alreadyDepreciatedAmount: line['fixedAsset.alreadyDepreciatedAmount'] || null,
            depreciationPlanSelect: '1',
            periodicityTypeSelect: 1,
            fixedAssetDerogatoryLineList: [],
            reference: line['fixedAsset.reference'] || null,
            durationInMonth: line['fixedAsset.durationInMonth'] || null,
            computationMethodSelect: line['fixedAsset.computationMethodSelect'] || null,
            firstDepreciationDateInitSelect: line['fixedAsset.firstDepreciationDateInitSelect'] || null,
            id: line['fixedAsset.id'] || null,
            firstServiceDate: line['fixedAsset.firstServiceDate'] || null,
            firstDepreciationDate: line['fixedAsset.firstDepreciationDate'] || null,
            serialNumber: null,
            fiscalNbrOfPastDepreciations: line['fixedAsset.fiscalNbrOfPastDepreciations'] || 0,
            fiscalAlreadyDepreciatedAmount: line['fixedAsset.fiscalAlreadyDepreciatedAmount'] || null,
            nbrOfPastDepreciations: line['fixedAsset.nbrOfPastDepreciations'] || 0,
            purchaseAccount: line['fixedAsset.purchaseAccount'] || null,
            version: line['fixedAsset.version'] || 0,
            grossValue: line['fixedAsset.grossValue'] || null,
            qty: '1.00',
            name: line['fixedAsset.name'] || null,
            fiscalFirstDepreciationDateInitSelect: line['fixedAsset.fiscalFirstDepreciationDateInitSelect'] || null,
            numberOfDepreciation: line['fixedAsset.numberOfDepreciation'] || null,
            correctedAccountingValue: line['fixedAsset.correctedAccountingValue'] || null,
            residualValue: line['fixedAsset.residualValue'] || null,
            fiscalFirstDepreciationDate: line['fixedAsset.fiscalFirstDepreciationDate'] || null,
            journal: line['fixedAsset.journal'] || null,
            company: line['fixedAsset.company'] || null,
            fiscalNumberOfDepreciation: line['fixedAsset.fiscalNumberOfDepreciation'] || null,
            periodicityInMonth: line['fixedAsset.periodicityInMonth'] || null,
            disposalValue: line['fixedAsset.disposalValue'] || null,
            fiscalPeriodicityInMonth: line['fixedAsset.fiscalPeriodicityInMonth'] || null,
            statusSelect: line['fixedAsset.statusSelect'] || null,
            originSelect: line['fixedAsset.originSelect'] || null,
            partner: line['fixedAsset.partner'] || null,
            fixedAssetSeq: line['fixedAsset.fixedAssetSeq'] || null,
            accountingValue: line['fixedAsset.accountingValue'] || null,
            fiscalPeriodicityTypeSelect: line['fixedAsset.fiscalPeriodicityTypeSelect'] || null,
            fixedAssetCategory: line['fixedAsset.fixedAssetCategory'] || null,
            fiscalComputationMethodSelect: line['fixedAsset.fiscalComputationMethodSelect'] || null,
            fiscalDurationInMonth: line['fixedAsset.fiscalDurationInMonth'] || null,
            wkfStatus: null,
            _model: MODELS.FIXED_ASSET,
          },
        },
      },
    };
  };

  const getOnAccountClickPayload = (action, move) => {
    let payload = {
      model: MODELS.MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          id: move.id,
        },
      },
    };
    return payload;
  };

  const realizeLineService = async (line, type) => {
    // const updatedLineBefore = await saveService(MODELS.FIXED_ASSET_LINE, {
    //   data: {
    //     depreciationDate: moment().locale('en').format('YYYY-MM-DD'),
    //     id: line.id,
    //     version: line.version,
    //   },
    // });

    // if (updatedLineBefore.status !== 0 || !updatedLineBefore?.data[0]) {
    //   if (type !== 'bulk') alertHandler('Error', t('SOMETHING_WENT_WRONG_REALIZE'));
    //   return false;
    // }

    let action = 'action-fixed-asset-line-method-realize';
    const realizeActionResponse = await actionService(getRealizeFirstActionPayload(action, line));

    if (realizeActionResponse.status !== 0 || !realizeActionResponse.data) {
      if (type !== 'bulk') alertHandler('Error', t('SOMETHING_WENT_WRONG_REALIZE'));
      return false;
    }

    if (
      checkFlashOrError(realizeActionResponse.data) &&
      realizeActionResponse?.data[0]?.flash?.includes('No period found or it has been closed')
    ) {
      if (type !== 'bulk') alertHandler('Error', t('ERROR_PERIOD_NOT_FOUND_OR_CLOSED'));
      return false;
    }

    if (
      checkFlashOrError(realizeActionResponse.data) &&
      realizeActionResponse?.data[0]?.flash === "Line can't be realized because previous line is still planned"
    ) {
      if (type !== 'bulk') alertHandler('Error', t('ERROR_DEPRECIATION_BEFORE_PREVIOUS'));
      return false;
    }

    if (realizeActionResponse.data && checkFlashOrError(realizeActionResponse.data)) {
      if (type !== 'bulk') alertHandler('Error', t('SOMETHING_WENT_WRONG_REALIZE'));
      return false;
    }

    if (
      realizeActionResponse.data &&
      checkFlashOrError(realizeActionResponse.data) &&
      realizeActionResponse.data[0].flash.includes('No period found')
    ) {
      if (type !== 'bulk') alertHandler('Error', t('NO_PERIOD_FOUND'));
      return false;
    }

    if (realizeActionResponse.data && checkFlashOrError(realizeActionResponse.data)) {
      if (type !== 'bulk') alertHandler('Error', t('SOMETHING_WENT_WRONG_REALIZE'));
      return false;
    }

    const fixedAssetLineResponse = await fetchService(MODELS.FIXED_ASSET_LINE, line.id, {
      fields: FIXED_ASSET_LINES_SEARCH_FIELDS,
      related: {},
    });

    let data = fixedAssetLineResponse?.data[0];
    const depreciationMove = data ? (data?.depreciationAccountMove ? data?.depreciationAccountMove : null) : null;

    if (!depreciationMove) {
      if (type !== 'bulk') alertHandler('Error', t('DEPRECIATION_MOVE_POSTED_ERROR'));
      return false;
    }

    action = 'action-account-move-group-accounting-click[1]';
    const deprecitaionMovePostFirstActionResponse = await actionService(getOnAccountClickPayload(action, depreciationMove));

    if (deprecitaionMovePostFirstActionResponse.status !== 0) {
      if (type !== 'bulk') alertHandler('Error', t('DEPRECIATION_MOVE_POSTED_ERROR'));
      return false;
    }

    if (deprecitaionMovePostFirstActionResponse.data && checkFlashOrError(deprecitaionMovePostFirstActionResponse.data)) {
      if (type !== 'bulk') alertHandler('Error', t('DEPRECIATION_MOVE_POSTED_ERROR'));
      return false;
    }

    action = 'action-account-move-group-accounting-click[2]';
    const deprecitaionMovePostSecondActionResponse = await actionService(getOnAccountClickPayload(action, depreciationMove));

    if (deprecitaionMovePostSecondActionResponse.status !== 0) {
      if (type !== 'bulk') alertHandler('Error', t('DEPRECIATION_MOVE_POSTED_ERROR'));
      return false;
    }

    if (deprecitaionMovePostSecondActionResponse.data && checkFlashOrError(deprecitaionMovePostSecondActionResponse.data)) {
      if (type !== 'bulk') alertHandler('Error', t('DEPRECIATION_MOVE_POSTED_ERROR'));
      return false;
    }

    // const updatedLineAfter = await saveService(MODELS.FIXED_ASSET_LINE, {
    //   data: {
    //     depreciationDate: line.depreciationDate,
    //     id: data.id,
    //     version: data.version,
    //   },
    // });

    // if (updatedLineAfter.status !== 0 || !updatedLineAfter.data) {
    //   if (type !== 'bulk') alertHandler('Error', t('SOMETHING_WENT_WRONG_REALIZE'));
    //   return false;
    // }

    return true;
  };

  const bulkRealizeService = async depreciationLinesObject => {
    const total = depreciationLinesObject.total;
    const list = depreciationLinesObject.data;

    let successfulCount = 0;

    for (const record of list) {
      const realizeActionResposne = await realizeLineService(record, 'bulk');
      if (realizeActionResposne) successfulCount += 1;
    }

    return { successfulCount, total };
  };

  return { realizeLineService, bulkRealizeService };
};
