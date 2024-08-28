class Feature {
  constructor({ BASE_PATH = '', LABEL = '', SUB_PATHS, IS_SEARCHABLE = false, IS_PAGINATED = false }) {
    this.BASE_PATH = `${BASE_PATH}`;
    this.SUB_PATHS = SUB_PATHS;
    this.LABEL = LABEL;
    this.IS_SEARCHABLE = IS_SEARCHABLE;
    this.IS_PAGINATED = IS_PAGINATED;

    if (SUB_PATHS && Object.keys(SUB_PATHS)?.length > 0) {
      Object.keys(SUB_PATHS).forEach(key => {
        this[`${key}_PATH`] = BASE_PATH + SUB_PATHS[key];
        this[`${key}_ONLY`] = SUB_PATHS[key];
      });
    }
  }

  getPathWithParams(mode, params = {}) {
    let updatedPath = this.BASE_PATH;
  
    if (mode) {
      updatedPath = this[`${mode.toUpperCase()}_PATH`] || '';
    }

    Object.keys(params).forEach(key => {
      updatedPath = updatedPath.replace(`:${key}`, params[key]);
    });
    return updatedPath;
  }
}

export default Feature;
