import { MODELS } from '../../constants/models';
import { useMainAxelorServices } from './useMainAxelorServices';

export const useTaxesServices = () => {
  const { searchService } = useMainAxelorServices();

  const searchTaxLineService = async (id, fieldIds, payload) => {
    const servicePayload = payload || {
      fields: ['endDate', 'value', 'startDate', 'name'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.TAXES,
          _field: 'taxLineList',
          _field_ids: [fieldIds],
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return await searchService(MODELS.TAXLINE, servicePayload);
  };

  return { searchTaxLineService };
};
