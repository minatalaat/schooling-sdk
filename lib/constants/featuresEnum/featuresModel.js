class Feature {
  constructor(id, PATH, LABEL, paths = {}, ICON, NO_DATA_IMG, DESC, PARAMS, hideFromMenu = false, exportName, importName) {
    this.id = id;
    this.PATH = PATH || '';
    this.LABEL = LABEL || '';
    this.ICON = ICON || null;
    this.NO_DATA_IMG = NO_DATA_IMG || null;
    this.DESC = DESC || '';
    this.PARAMS = PARAMS || { search: true, pagination: true };
    this.hideFromMenu = hideFromMenu || false;
    this.exportName = exportName || null;
    this.importName = importName || null;
    Object.keys(paths).forEach(key => {
      this[`${key}_PATH`] = PATH + paths[key];
      this[`${key}_ONLY`] = paths[key];
    });
  }

  getPathWithParams(mode, params = {}) {
    let updatedPath = this.PATH;

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
