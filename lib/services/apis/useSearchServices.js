export const useSearchServices = ({
  SEARCH_FIELDS = [],
  MODEL_NAME = '',
  COLUMNS = [],
  criteria = [],
  offset = 0,
  pageSize = 8,
  payloadDomain = null,
  payloadDomainContext = null,
  extraFields = [],
  operator = 'and',
}) => {
  const getSearchPayload = () => {
    getSearchFields();
    return getPayload();
  };

  const getPayload = () => {
    let payload = {};
    if (criteria && criteria.length > 0) payload = getPayloadWithCriteria();
    else payload = getPayloadWithoutCriteria();
    return payload;
  };

  const getPayloadWithCriteria = () => {
    let payload = {
      fields: SEARCH_FIELDS.filter(field => !field.includes('$')),
      sortBy: null,
      data: {
        _domain: payloadDomain ? payloadDomain : null,
        _domainContext: payloadDomainContext
          ? payloadDomainContext
          : {
              _model: MODEL_NAME,
            },
        operator: operator,
        criteria: criteria,
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
    return payload;
  };

  const getPayloadWithoutCriteria = () => {
    let payload = {
      fields: SEARCH_FIELDS,
      sortBy: null,
      data: {
        _domain: payloadDomain ? payloadDomain : null,
        _domainContext: payloadDomainContext
          ? payloadDomainContext
          : {
              _model: MODEL_NAME,
            },
        operator: operator,
        criteria: [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
    return payload;
  };

  const getSearchFields = () => {
    SEARCH_FIELDS = COLUMNS.map(({ id }) => id);
    if (extraFields && extraFields.length > 0) SEARCH_FIELDS.push(...extraFields);
  };

  return { getSearchPayload };
};
