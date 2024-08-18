export const getUserCreationErrorMessage = response => {
  if (response?.data?.fault) {
    let error = response?.data?.fault?.statusCode;

    switch (error) {
      case 'CMP_EDIT_001':
        return 'ERROR_COMPANY_REACHED_MAX_USERS';
      case 'GN_DUP':
        return 'ERROR_EMAIL_ALREADY_EXISTS';
      default:
        return 'SOMETHING_WENT_WRONG';
    }
  }

  return 'SOMETHING_WENT_WRONG';
};
