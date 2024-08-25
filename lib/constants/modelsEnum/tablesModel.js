class Model {
  constructor(name, identifier, titleSingular, titlePlural, modalColumns) {
    this.name = name || '';
    this.identifier = identifier || '';
    this.titlePlural = titlePlural || '';
    this.titleSingular = titleSingular || '';
    this.modalColumns = modalColumns || [];
  }
}

export default Model;
