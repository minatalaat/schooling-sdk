'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;
var _react = require('react');
var _reactI18next = require('react-i18next');
var _reactRouterDom = require('react-router-dom');
var _ConfirmationPopup = _interopRequireDefault(require('../components/ConfirmationPopup'));
var _ImageWithSkeleton = _interopRequireDefault(require('../components/ui/skeletons/ImageWithSkeleton'));
var _useAxios = require('../services/useAxios');
var _getUrl = require('../services/getUrl');
var _modelsEnum = require('../assets/constants/modelsEnum/modelsEnum');
var _ri = require('react-icons/ri');
var _editIcon = _interopRequireDefault(require('../assets/images/edit-icon.svg'));
var _viewIcon = _interopRequireDefault(require('../assets/images/view-icon.svg'));
var _h = _interopRequireDefault(require('../assets/images/h-4.svg'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function MoreAction(_ref) {
  let {
    showMoreAction,
    setShowMoreAction,
    refreshData,
    deleteHandler,
    editHandler,
    viewHandler,
    viewPDFHandler,
    selectAllHandler = '',
    bulkActionConfig,
    setActionInProgress,
    checked = [],
    setChecked = () => {},
    alertHandler,
    data,
    canSelectAll = true,
  } = _ref;
  const { t } = (0, _reactI18next.useTranslation)();
  const { axiosFetch } = (0, _useAxios.useAxiosFunction)();
  const [searchParams, setSearchParams] = (0, _reactRouterDom.useSearchParams)();
  const [showBulkDeletePopup, setShowBulkDeletePopup] = (0, _react.useState)(false);
  let pageSizeOptions = [
    {
      name: 10,
      value: 10,
    },
    {
      name: 25,
      value: 25,
    },
    {
      name: 50,
      value: 50,
    },
    {
      name: 100,
      value: 100,
    },
  ];
  let itemTitle = '';

  if (bulkActionConfig) {
    itemTitle =
      checked.length > 1
        ? checked.length.toString() + ' ' + t(_modelsEnum.modelsEnum[bulkActionConfig.modelsEnumKey].titlePlural)
        : checked.length.toString() + ' ' + t(_modelsEnum.modelsEnum[bulkActionConfig.modelsEnumKey].titleSingular);
  }

  const checkClose = target => {
    if (target.className === 'b-action is-visible') {
      setShowMoreAction(false);
    }
  };

  const checkIfSelectedOnDelete = () => {
    if (checked && checked.length > 0) {
      onDeleteClick();
    } else {
      alertHandler('Error', t('LBL_ERROR_YOU_SHOULD_SELECT_ITEMS'));
    }
  };

  const removeAllHandler = async () => {
    var _bulkActionConfig$del;
    const removeResponse = await axiosFetch(
      'POST',
      (0, _getUrl.getRemoveAllUrl)(_modelsEnum.modelsEnum[bulkActionConfig.modelsEnumKey].name),
      {
        records: checked,
      }
    );
    setActionInProgress(false);
    setChecked([]);

    if (!removeResponse || removeResponse.data.status !== 0) {
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    let message =
      (_bulkActionConfig$del = bulkActionConfig.deleteSuccessMessage) !== null && _bulkActionConfig$del !== void 0
        ? _bulkActionConfig$del
        : 'DELETED_SUCCESSFULLY';
    alertHandler('Success', t(message));
    setTimeout(() => {
      return refreshData();
    }, [3000]);
  };

  const onDeleteClick = () => {
    setActionInProgress(true);

    if (typeof deleteHandler !== 'function') {
      removeAllHandler();
    } else {
      deleteHandler();
    }
  };

  const selectAllDataHandler = () => {
    if (checked.length !== data.length) {
      let allChecked = [];
      data.forEach(record => {
        allChecked.push({
          id: record.id,
          version: record.version,
        });
      });
      setChecked([...allChecked]);
    } else {
      setChecked([]);
    }
  };

  const onPageSizeChange = val => {
    setSearchParams(params => {
      params.set('currentPage', 1);
      params.set('pageSize', val);
      return params;
    });
  };

  return /*#__PURE__*/ React.createElement(
    React.Fragment,
    null,
    showBulkDeletePopup &&
      checked.length > 0 &&
      /*#__PURE__*/ React.createElement(_ConfirmationPopup.default, {
        onClickHandler: onDeleteClick,
        setConfirmationPopup: setShowBulkDeletePopup,
        item: itemTitle,
      }),
    /*#__PURE__*/ React.createElement(
      'div',
      {
        className: 'more-action-mobile',
        role: 'alert',
        onClick: e => checkClose(e.target),
      },
      /*#__PURE__*/ React.createElement(
        'div',
        {
          className: showMoreAction ? 'b-action is-visible' : 'b-action',
          onClick: e => checkClose(e.target),
        },
        /*#__PURE__*/ React.createElement(
          'div',
          {
            className: 'b-action-container',
          },
          /*#__PURE__*/ React.createElement('div', {
            className: 'border-top',
          }),
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className: 'float-start',
            },
            /*#__PURE__*/ React.createElement('div', {
              className: 'dataTables_length',
              id: 'example_length',
            })
          ),
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className: 'float-end mb-3',
            },
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: 'action-right ',
              },
              /*#__PURE__*/ React.createElement(
                'div',
                {
                  className: 'right-filter-tb',
                },
                /*#__PURE__*/ React.createElement(
                  'ul',
                  {
                    className: 'nav nav-pills',
                    id: 'pills-tab',
                    role: 'tablist',
                  },
                  editHandler &&
                    /*#__PURE__*/ React.createElement(
                      'li',
                      {
                        onClick: () => {
                          editHandler();
                          setShowMoreAction(false);
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        _reactRouterDom.Link,
                        {
                          href: '/',
                        },
                        /*#__PURE__*/ React.createElement(_ImageWithSkeleton.default, {
                          imgSrc: _editIcon.default,
                          imgAlt: _editIcon.default,
                          isListIcon: true,
                        })
                      )
                    ),
                  viewHandler &&
                    /*#__PURE__*/ React.createElement(
                      'li',
                      {
                        onClick: () => {
                          viewHandler();
                          setShowMoreAction(false);
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        _reactRouterDom.Link,
                        {
                          href: '/',
                        },
                        /*#__PURE__*/ React.createElement(_ImageWithSkeleton.default, {
                          imgSrc: _viewIcon.default,
                          imgAlt: _viewIcon.default,
                          isListIcon: true,
                        })
                      )
                    ),
                  viewPDFHandler &&
                    /*#__PURE__*/ React.createElement(
                      'li',
                      {
                        onClick: () => {
                          viewPDFHandler();
                          setShowMoreAction(false);
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        _reactRouterDom.Link,
                        {
                          href: '/',
                        },
                        /*#__PURE__*/ React.createElement(_ImageWithSkeleton.default, {
                          imgSrc: _h.default,
                          imgAlt: _h.default,
                          isListIcon: true,
                        })
                      )
                    ),
                  canSelectAll &&
                    /*#__PURE__*/ React.createElement(
                      'li',
                      {
                        onClick: () => {
                          if (typeof selectAllHandler !== 'function' && data) selectAllDataHandler();
                          else selectAllHandler();
                          setShowMoreAction(false);
                        },
                      },
                      /*#__PURE__*/ React.createElement(
                        _reactRouterDom.Link,
                        {
                          href: '/',
                        },
                        /*#__PURE__*/ React.createElement(_ri.RiCheckboxMultipleFill, {
                          isIcon: true,
                          color:
                            (data === null || data === void 0 ? void 0 : data.length) !== 0 &&
                            (checked === null || checked === void 0 ? void 0 : checked.length) ===
                              (data === null || data === void 0 ? void 0 : data.length)
                              ? '#1f4fde'
                              : '#9D9D9D',
                          size: 23,
                        })
                      )
                    )
                )
              )
            )
          ),
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className: 'buttons-actions',
            },
            searchParams.get('pageSize') &&
              /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                /*#__PURE__*/ React.createElement(
                  'div',
                  {
                    className: 'float-start',
                  },
                  /*#__PURE__*/ React.createElement('label', null, t('LBL_PER_PAGE'))
                ),
                /*#__PURE__*/ React.createElement(
                  'select',
                  {
                    className: 'form-select mb-2',
                    value: searchParams.get('pageSize') || 10,
                    onChange: event => {
                      onPageSizeChange(parseInt(event.target.value));
                      setShowMoreAction(false);
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    'option',
                    {
                      value: '',
                      hidden: true,
                    },
                    t('LBL_PLEASE_SELECT')
                  ),
                  pageSizeOptions.map(option => {
                    return /*#__PURE__*/ React.createElement(
                      'option',
                      {
                        value: option.value,
                      },
                      option.name
                    );
                  })
                )
              ),
            refreshData &&
              /*#__PURE__*/ React.createElement(
                'button',
                {
                  className: 'btn btn-export',
                  onClick: () => {
                    refreshData();
                    setShowMoreAction(false);
                  },
                },
                t('LBL_RELOAD')
              ),
            (bulkActionConfig === null || bulkActionConfig === void 0 ? void 0 : bulkActionConfig.canDelete) &&
              /*#__PURE__*/ React.createElement(
                'button',
                {
                  className: 'btn btn-delete',
                  onClick: () => {
                    checkIfSelectedOnDelete();
                    setShowMoreAction(false);
                  },
                },
                t('LBL_DELETE')
              )
          )
        )
      )
    )
  );
}

var _default = (exports.default = MoreAction);
