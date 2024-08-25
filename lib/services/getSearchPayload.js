let SEARCH_FIELDS = [];
let MODEL_NAME = '';
let COLUMNS = [];
let criteria = [];
let offset = 0;
let pageSize = 8;
let payloadDomain = null;
let payloadDomainContext = null;
let extraFields = [];

export const getSearchPayload = props => {
  MODEL_NAME = props.MODEL_NAME;
  COLUMNS = props.COLUMNS;
  criteria = props.criteria;
  offset = props.offset;
  pageSize = props.pageSize;
  payloadDomain = props.payloadDomain;
  payloadDomainContext = props.payloadDomainContext;
  extraFields = props.extraFields;
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
    fields: SEARCH_FIELDS,
    sortBy: null,
    data: {
      _domain: payloadDomain ? payloadDomain : null,
      _domainContext: payloadDomainContext
        ? payloadDomainContext
        : {
            _model: MODEL_NAME,
          },
      operator: 'and',
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
      operator: 'and',
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
