export const MODES = {
  VIEW: 'view',
  EDIT: 'edit',
  ADD: 'add',
};

export const getMode = (addNew, enableEdit) => {
  if (addNew) return 'add';
  if (enableEdit) return 'edit';
  return 'view';
};
