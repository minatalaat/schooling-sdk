import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheckSquare, FaTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';
import arrowTbDown from '../../assets/images/arrow-tb-down.svg';

function Features({ setAssignedUserFeatures, edit, initChecked, view }) {
  const actionEnum = {
    view: '1',
    add: '2',
    edit: '3',
    delete: '4',
  };
  const { t } = useTranslation();
  let displayedUserFeatures = useSelector(state => state.userFeatures.userFeatures);
  const [showRows, setShowRows] = useState([]);
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    if ((edit || view) && displayedUserFeatures.length > 1) {
      setChecked(initChecked);
    }
  }, [initChecked, displayedUserFeatures, edit, view]);
  useEffect(() => {
    setAssignedUserFeatures(checked);
  }, [checked]);

  const toggleShowHiddenRow = featureCode => {
    let tempRows = [...showRows];
    let index = tempRows.indexOf(featureCode);

    if (index > -1) {
      tempRows.splice(index, 1);
    } else {
      tempRows.push(featureCode);
    }

    setShowRows([...tempRows]);
  };

  const checkFeatureAllView = featureCode => {
    let index = displayedUserFeatures.findIndex(item => item.featureCode === featureCode);

    if (checked && checked.length > 0) {
      let selectedViewSubFeatures = [];
      displayedUserFeatures[index].subFeatureList &&
        displayedUserFeatures[index].subFeatureList.forEach(temp => {
          if (temp.actions && temp.actions.length > 0 && temp.actions.includes(actionEnum['view'])) {
            if (checked.findIndex(item => item === `${temp.subFeatureCode}:${actionEnum['view']}`) > -1) {
              selectedViewSubFeatures.push(true);
            }
          }
        });

      if (
        selectedViewSubFeatures.length ===
        displayedUserFeatures[index].subFeatureList.filter(
          subFeature => subFeature.actions && subFeature.actions.includes(actionEnum['view'])
        ).length
      ) {
        return true;
      }
    } else {
      return false;
    }
  };

  const checkFeatureAllAdd = featureCode => {
    let index = displayedUserFeatures.findIndex(item => item.featureCode === featureCode);

    if (checked && checked.length > 0) {
      let selectedViewSubFeatures = [];
      displayedUserFeatures[index].subFeatureList &&
        displayedUserFeatures[index].subFeatureList.forEach(temp => {
          if (temp.actions && temp.actions.length > 0 && temp.actions.includes(actionEnum['add'])) {
            if (checked.findIndex(item => item === `${temp.subFeatureCode}:${actionEnum['add']}`) > -1) {
              selectedViewSubFeatures.push(true);
            }
          }
        });

      if (
        selectedViewSubFeatures &&
        selectedViewSubFeatures.length > 0 &&
        selectedViewSubFeatures.length ===
          displayedUserFeatures[index].subFeatureList.filter(
            subFeature => subFeature.actions && subFeature.actions.includes(actionEnum['add'])
          ).length
      ) {
        return true;
      }
    } else {
      return false;
    }
  };

  const checkFeatureAllEdit = featureCode => {
    let index = displayedUserFeatures.findIndex(item => item.featureCode === featureCode);

    if (checked && checked.length > 0) {
      let selectedViewSubFeatures = [];
      displayedUserFeatures[index].subFeatureList &&
        displayedUserFeatures[index].subFeatureList.forEach(temp => {
          if (temp.actions && temp.actions.length > 0 && temp.actions.includes(actionEnum['edit'])) {
            if (checked.findIndex(item => item === `${temp.subFeatureCode}:${actionEnum['edit']}`) > -1) {
              selectedViewSubFeatures.push(true);
            }
          }
        });

      if (
        selectedViewSubFeatures &&
        selectedViewSubFeatures.length > 0 &&
        selectedViewSubFeatures.length ===
          displayedUserFeatures[index].subFeatureList.filter(
            subFeature => subFeature.actions && subFeature.actions.includes(actionEnum['edit'])
          ).length
      ) {
        return true;
      }
    } else {
      return false;
    }
  };

  const checkFeatureAllDelete = featureCode => {
    let index = displayedUserFeatures.findIndex(item => item.featureCode === featureCode);

    if (checked && checked.length > 0) {
      let selectedViewSubFeatures = [];
      displayedUserFeatures[index].subFeatureList &&
        displayedUserFeatures[index].subFeatureList.forEach(temp => {
          if (temp.actions && temp.actions.length > 0 && temp.actions.includes(actionEnum['delete'])) {
            if (checked.findIndex(item => item === `${temp.subFeatureCode}:${actionEnum['delete']}`) > -1) {
              selectedViewSubFeatures.push(true);
            }
          }
        });

      if (
        selectedViewSubFeatures &&
        selectedViewSubFeatures.length > 0 &&
        selectedViewSubFeatures.length ===
          displayedUserFeatures[index].subFeatureList.filter(
            subFeature => subFeature.actions && subFeature.actions.includes(actionEnum['delete'])
          ).length
      ) {
        return true;
      }
    } else {
      return false;
    }
  };

  const checkSubFeatureAll = (subFeatureCode, actions) => {
    if (actions && actions.length > 0) {
      let tempCheckedActions = [];
      actions.forEach(action => {
        if (checked.findIndex(item => item === `${subFeatureCode}:${action}`) > -1) {
          tempCheckedActions.push(true);
        }
      });

      if (tempCheckedActions && tempCheckedActions.length === actions.length) {
        return true;
      }
    } else {
      return false;
    }

    return (
      checked.findIndex(item => item === `${subFeatureCode}:${actionEnum['view']}`) > -1 &&
      checked.findIndex(item => item === `${subFeatureCode}:${actionEnum['add']}`) > -1 &&
      checked.findIndex(item => item === `${subFeatureCode}:${actionEnum['edit']}`) > -1 &&
      checked.findIndex(item => item === `${subFeatureCode}:${actionEnum['delete']}`) > -1
    );
  };

  const checkFeatureAll = featureCode => {
    let tempSubFeatureList = displayedUserFeatures.filter(item => item.featureCode === featureCode)[0].subFeatureList;

    if (checked && checked.length > 0) {
      if (tempSubFeatureList && tempSubFeatureList.length > 0) {
        let tempAllFeatureAction = [];
        tempSubFeatureList.forEach(subFeature => {
          subFeature.actions &&
            subFeature.actions.forEach(action => {
              tempAllFeatureAction.push(`${subFeature.subFeatureCode}:${action}`);
              // if (checked.findIndex((item) => item === `${subFeature.subFeatureCode}:${action}`) > -1) {

              // }
              // else{
              //     return false
              // }
            });
        });

        if (checked.filter(item => item.split(':')[0].split('.')[0] === featureCode).length === tempAllFeatureAction.length) {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  return (
    <>
      <div className="section-title mt-3 col-md-12">
        <h4 className="float-start">{t('FEATURES')}</h4>
      </div>
      {
        <div className="col-md-12">
          <div
            className="table-responsive table-responsive-new fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <table className="table table-responsive-stack dataTable" id="tableOne">
              <thead>
                <th>{t('LBL_ALL')}</th>
                <th>{t('LBL_FEATURE')}</th>
                <th>{t('LBL_VIEW')}</th>
                <th>{t('LBL_ADD')}</th>
                <th>{t('LBL_EDIT')}</th>
                <th>{t('LBL_DELETE')}</th>
                <th></th>
              </thead>
              <tbody id="table_detail">
                {displayedUserFeatures &&
                  displayedUserFeatures
                    .filter(item => item.featureCode === featuresEnum['DASHBOARD'].id)
                    .map(feature => {
                      let featureKey = Object.keys(featuresEnum).find(item => featuresEnum[item].id === feature.featureCode);
                      return (
                        <>
                          <tr
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              toggleShowHiddenRow(feature.featureCode);
                            }}
                          >
                            <td width="40">
                              {!view && (
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name="checked"
                                  checked={checkFeatureAll(feature.featureCode)}
                                  // value={feature.featureCode}
                                  onChange={e => {
                                    let tempChecked = checked;
                                    // let viewIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['view']}`)
                                    // let addIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['add']}`)
                                    // let editIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['edit']}`)
                                    // let deleteIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['delete']}`)
                                    let tempSubFeatureList = displayedUserFeatures.filter(
                                      item => item.featureCode === feature.featureCode
                                    )[0].subFeatureList;

                                    if (checkFeatureAll(feature.featureCode)) {
                                      tempChecked = tempChecked.filter(item => !item.startsWith(feature.featureCode));
                                    } else {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(item => {
                                          item.actions &&
                                            item.actions.forEach(action => {
                                              tempChecked.push(`${item.subFeatureCode}:${action}`);
                                            });
                                        });
                                    }

                                    tempChecked = [...new Set(tempChecked)];
                                    setChecked([...tempChecked]);
                                  }}
                                />
                              )}
                              {view && checkFeatureAll(feature.featureCode) && (
                                <FaCheckSquare
                                  color="#151538"
                                  size={23}
                                  style={{
                                    borderRadius: '0.5rem',
                                  }}
                                />
                              )}
                              {view && !checkFeatureAll(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                            </td>
                            <td
                              width="450"
                              style={{
                                fontFamily: 'Tajawal-Bold',
                              }}
                            >
                              {featuresEnum[featureKey] ? t(featuresEnum[featureKey].LABEL) : ''}
                            </td>

                            <td width="40">
                              {!view && (
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name="checked"
                                  checked={checkFeatureAllView(feature.featureCode)}
                                  //   value={parseInt(customer.id)}
                                  onChange={e => {
                                    let tempChecked = checked;
                                    let tempSubFeatureList = displayedUserFeatures.filter(
                                      item => item.featureCode === feature.featureCode
                                    )[0].subFeatureList;
                                    // let tempSubFeatureCodeList = []
                                    // tempSubFeatureList && tempSubFeatureList.map((item) => {
                                    //     tempSubFeatureCodeList.push(item.subFeatureCode)
                                    // })

                                    if (checkFeatureAllView(feature.featureCode)) {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['view']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['view'])
                                              .forEach(action => {
                                                tempChecked = tempChecked.filter(
                                                  item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                );
                                              });
                                        });
                                    } else {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['view']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['view'])
                                              .forEach(action => {
                                                tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                              });
                                        });
                                    }

                                    tempChecked = [...new Set(tempChecked)];
                                    setChecked([...tempChecked]);
                                  }}
                                  //   onBlur={formik.handleBlur}
                                />
                              )}
                              {view && checkFeatureAllView(feature.featureCode) && (
                                <FaCheckSquare
                                  color="#151538"
                                  size={23}
                                  style={{
                                    borderRadius: '0.5rem',
                                  }}
                                />
                              )}
                              {view && !checkFeatureAllView(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                            </td>
                            <td width="40">
                              {!view && (
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name="checked"
                                  checked={checkFeatureAllAdd(feature.featureCode)}
                                  //   value={parseInt(customer.id)}
                                  onChange={e => {
                                    let tempChecked = checked;
                                    let tempSubFeatureList = displayedUserFeatures.filter(
                                      item => item.featureCode === feature.featureCode
                                    )[0].subFeatureList;
                                    let tempSubFeatureCodeList = [];
                                    tempSubFeatureList &&
                                      tempSubFeatureList.forEach(item => {
                                        tempSubFeatureCodeList.push(item.subFeatureCode);
                                      });

                                    if (checkFeatureAllAdd(feature.featureCode)) {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['add']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['add'])
                                              .forEach(action => {
                                                tempChecked = tempChecked.filter(
                                                  item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                );
                                              });
                                        });
                                    } else {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['add']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['add'])
                                              .forEach(action => {
                                                tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                              });
                                        });
                                    }

                                    tempChecked = [...new Set(tempChecked)];
                                    setChecked([...tempChecked]);
                                  }}
                                  //   onBlur={formik.handleBlur}
                                />
                              )}
                              {view && checkFeatureAllAdd(feature.featureCode) && (
                                <FaCheckSquare
                                  color="#151538"
                                  size={23}
                                  style={{
                                    borderRadius: '0.5rem',
                                  }}
                                />
                              )}
                              {view && !checkFeatureAllAdd(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                            </td>
                            <td width="40">
                              {!view && (
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name="checked"
                                  checked={checkFeatureAllEdit(feature.featureCode)}
                                  //   value={parseInt(customer.id)}
                                  onChange={e => {
                                    let tempChecked = checked;
                                    let tempSubFeatureList = displayedUserFeatures.filter(
                                      item => item.featureCode === feature.featureCode
                                    )[0].subFeatureList;
                                    let tempSubFeatureCodeList = [];
                                    tempSubFeatureList &&
                                      tempSubFeatureList.forEach(item => {
                                        tempSubFeatureCodeList.push(item.subFeatureCode);
                                      });

                                    if (checkFeatureAllEdit(feature.featureCode)) {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['edit']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['edit'])
                                              .forEach(action => {
                                                tempChecked = tempChecked.filter(
                                                  item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                );
                                              });
                                        });
                                    } else {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['edit']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['edit'])
                                              .forEach(action => {
                                                tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                              });
                                        });
                                    }

                                    tempChecked = [...new Set(tempChecked)];
                                    setChecked([...tempChecked]);
                                  }}
                                  //   onBlur={formik.handleBlur}
                                />
                              )}
                              {view && checkFeatureAllEdit(feature.featureCode) && (
                                <FaCheckSquare
                                  color="#151538"
                                  size={23}
                                  style={{
                                    borderRadius: '0.5rem',
                                  }}
                                />
                              )}
                              {view && !checkFeatureAllEdit(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                            </td>
                            <td width="40">
                              {!view && (
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name="checked"
                                  checked={checkFeatureAllDelete(feature.featureCode)}
                                  //   value={parseInt(customer.id)}
                                  onChange={e => {
                                    let tempChecked = checked;
                                    let tempSubFeatureList = displayedUserFeatures.filter(
                                      item => item.featureCode === feature.featureCode
                                    )[0].subFeatureList;

                                    if (checkFeatureAllDelete(feature.featureCode)) {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['delete']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['delete'])
                                              .forEach(action => {
                                                tempChecked = tempChecked.filter(
                                                  item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                );
                                              });
                                        });
                                    } else {
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(subFeature => {
                                          subFeature.actions &&
                                            subFeature.actions.filter(item => item === actionEnum['delete']) &&
                                            subFeature.actions
                                              .filter(item => item === actionEnum['delete'])
                                              .forEach(action => {
                                                tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                              });
                                        });
                                    }

                                    tempChecked = [...new Set(tempChecked)];
                                    setChecked(tempChecked);
                                  }}
                                  //   onBlur={formik.handleBlur}
                                />
                              )}
                              {view && checkFeatureAllDelete(feature.featureCode) && (
                                <FaCheckSquare
                                  color="#151538"
                                  size={23}
                                  style={{
                                    borderRadius: '0.5rem',
                                  }}
                                />
                              )}
                              {view && !checkFeatureAllDelete(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                            </td>
                            <td
                              width="40"
                              onClick={() => {
                                toggleShowHiddenRow(feature.featureCode);
                              }}
                            >
                              <img
                                className={showRows.indexOf(feature.featureCode) > -1 ? 'rotate-up' : ''}
                                src={arrowTbDown}
                                alt={arrowTbDown}
                              />
                            </td>
                          </tr>
                          {showRows.indexOf(feature.featureCode) > -1 &&
                            feature.subFeatureList &&
                            feature.subFeatureList.map(subFeature => {
                              let subFeatureKey = Object.keys(featuresEnum).find(
                                item => featuresEnum[item] && featuresEnum[item].id === subFeature.subFeatureCode
                              );

                              return (
                                <tr>
                                  <td width="40">
                                    {!view && (
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="checked"
                                        checked={checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions)}
                                        //   value={parseInt(customer.id)}
                                        onChange={e => {
                                          let tempChecked = checked;
                                          let index = displayedUserFeatures.findIndex(item => item.featureCode === feature.featureCode);
                                          let subFeatureIndex = displayedUserFeatures[index].subFeatureList.findIndex(
                                            item => item.subFeatureCode === subFeature.subFeatureCode
                                          );

                                          // tempChecked = tempChecked.filter((item) => !(item.startsWith(subFeature.subFeatureCode)))
                                          if (checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions)) {
                                            tempChecked = tempChecked.filter(item => !item.startsWith(`${subFeature.subFeatureCode}`));
                                          } else {
                                            displayedUserFeatures[index].subFeatureList[subFeatureIndex] &&
                                              displayedUserFeatures[index].subFeatureList[subFeatureIndex].actions &&
                                              displayedUserFeatures[index].subFeatureList[subFeatureIndex].actions.length > 0 &&
                                              displayedUserFeatures[index].subFeatureList[subFeatureIndex].actions.forEach(action => {
                                                tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                              });
                                          }

                                          tempChecked = [...new Set(tempChecked)];

                                          setChecked([...tempChecked]);
                                        }}
                                        //   onBlur={formik.handleBlur}
                                      />
                                    )}
                                    {view && checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions) && (
                                      <FaCheckSquare
                                        color="#151538"
                                        size={23}
                                        style={{
                                          borderRadius: '0.5rem',
                                        }}
                                      />
                                    )}
                                    {view && !checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions) && (
                                      <FaTimesCircle color="#151538" size={23} />
                                    )}
                                  </td>
                                  <td width="450" className="subfeature-padding">
                                    {featuresEnum[subFeatureKey] ? t(featuresEnum[subFeatureKey].LABEL) : ''}
                                  </td>
                                  {subFeature.actions &&
                                    subFeature.actions.map(action => {
                                      return (
                                        <td width="40">
                                          {!view && (
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              name="checked"
                                              checked={checked.findIndex(item => item === `${subFeature.subFeatureCode}:${action}`) > -1}
                                              //   value={parseInt(customer.id)}
                                              onChange={e => {
                                                let tempChecked = checked;
                                                let index = tempChecked.findIndex(
                                                  item => item === `${subFeature.subFeatureCode}:${action}`
                                                );

                                                if (index > -1) {
                                                  tempChecked.splice(index, 1);
                                                } else {
                                                  tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                }

                                                tempChecked = [...new Set(tempChecked)];

                                                setChecked([...tempChecked]);
                                              }}
                                              //   onBlur={formik.handleBlur}
                                            />
                                          )}
                                          {view && checked.findIndex(item => item === `${subFeature.subFeatureCode}:${action}`) > -1 && (
                                            <FaCheckSquare
                                              color="#151538"
                                              size={23}
                                              style={{
                                                borderRadius: '0.5rem',
                                              }}
                                            />
                                          )}
                                          {view && !(checked.findIndex(item => item === `${subFeature.subFeatureCode}:${action}`) > -1) && (
                                            <FaTimesCircle color="#151538" size={23} />
                                          )}
                                        </td>
                                      );
                                    })}
                                </tr>
                              );
                            })}
                        </>
                      );
                    })}
                {displayedUserFeatures &&
                  displayedUserFeatures
                    .filter(item => featuresEnum['DASHBOARD'] && item.featureCode !== featuresEnum['DASHBOARD'].id)
                    .map(feature => {
                      let featureKey = Object.keys(featuresEnum).find(
                        item => featuresEnum[item] && featuresEnum[item].id === feature.featureCode
                      );

                      if (featureKey) {
                        return (
                          <>
                            <tr
                              style={{
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                toggleShowHiddenRow(feature.featureCode);
                              }}
                            >
                              <td width="40">
                                {!view && (
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="checked"
                                    checked={checkFeatureAll(feature.featureCode)}
                                    // value={feature.featureCode}
                                    onChange={e => {
                                      let tempChecked = checked;
                                      // let viewIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['view']}`)
                                      // let addIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['add']}`)
                                      // let editIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['edit']}`)
                                      // let deleteIndex = tempChecked.findIndex((item) => item === `${feature.featureCode}:${actionEnum['delete']}`)
                                      let tempSubFeatureList = displayedUserFeatures.filter(
                                        item => item.featureCode === feature.featureCode
                                      )[0].subFeatureList;

                                      if (checkFeatureAll(feature.featureCode)) {
                                        tempChecked = tempChecked.filter(item => !item.startsWith(feature.featureCode));
                                      } else {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(item => {
                                            item.actions &&
                                              item.actions.forEach(action => {
                                                tempChecked.push(`${item.subFeatureCode}:${action}`);
                                              });
                                          });
                                      }

                                      tempChecked = [...new Set(tempChecked)];
                                      setChecked([...tempChecked]);
                                    }}
                                  />
                                )}
                                {view && checkFeatureAll(feature.featureCode) && (
                                  <FaCheckSquare
                                    color="#151538"
                                    size={23}
                                    style={{
                                      borderRadius: '0.5rem',
                                    }}
                                  />
                                )}
                                {view && !checkFeatureAll(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                              </td>
                              <td
                                width="450"
                                style={{
                                  fontFamily: 'Tajawal-Bold',
                                }}
                              >
                                {featuresEnum[featureKey] ? t(featuresEnum[featureKey].LABEL) : ''}
                              </td>

                              <td width="40">
                                {!view && (
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="checked"
                                    checked={checkFeatureAllView(feature.featureCode)}
                                    onChange={e => {
                                      let tempChecked = checked;
                                      let tempSubFeatureList = displayedUserFeatures.filter(
                                        item => item.featureCode === feature.featureCode
                                      )[0].subFeatureList;
                                      // let tempSubFeatureCodeList = []
                                      // tempSubFeatureList && tempSubFeatureList.map((item) => {
                                      //     tempSubFeatureCodeList.push(item.subFeatureCode)
                                      // })

                                      if (checkFeatureAllView(feature.featureCode)) {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['view']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['view'])
                                                .forEach(action => {
                                                  tempChecked = tempChecked.filter(
                                                    item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                  );
                                                });
                                          });
                                      } else {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['view']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['view'])
                                                .forEach(action => {
                                                  tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                });
                                          });
                                      }

                                      tempChecked = [...new Set(tempChecked)];
                                      setChecked([...tempChecked]);
                                    }}
                                    //   onBlur={formik.handleBlur}
                                  />
                                )}
                                {view && checkFeatureAllView(feature.featureCode) && (
                                  <FaCheckSquare
                                    color="#151538"
                                    size={23}
                                    style={{
                                      borderRadius: '0.5rem',
                                    }}
                                  />
                                )}
                                {view && !checkFeatureAllView(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                              </td>
                              <td width="40">
                                {!view && (
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="checked"
                                    checked={checkFeatureAllAdd(feature.featureCode)}
                                    //   value={parseInt(customer.id)}
                                    onChange={e => {
                                      let tempChecked = checked;
                                      let tempSubFeatureList = displayedUserFeatures.filter(
                                        item => item.featureCode === feature.featureCode
                                      )[0].subFeatureList;
                                      let tempSubFeatureCodeList = [];
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(item => {
                                          tempSubFeatureCodeList.push(item.subFeatureCode);
                                        });

                                      if (checkFeatureAllAdd(feature.featureCode)) {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['add']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['add'])
                                                .forEach(action => {
                                                  tempChecked = tempChecked.filter(
                                                    item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                  );
                                                });
                                          });
                                      } else {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['add']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['add'])
                                                .forEach(action => {
                                                  tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                });
                                          });
                                      }

                                      tempChecked = [...new Set(tempChecked)];
                                      setChecked([...tempChecked]);
                                    }}
                                    //   onBlur={formik.handleBlur}
                                  />
                                )}
                                {view && checkFeatureAllAdd(feature.featureCode) && (
                                  <FaCheckSquare
                                    color="#151538"
                                    size={23}
                                    style={{
                                      borderRadius: '0.5rem',
                                    }}
                                  />
                                )}
                                {view && !checkFeatureAllAdd(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                              </td>
                              <td width="40">
                                {!view && (
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="checked"
                                    checked={checkFeatureAllEdit(feature.featureCode)}
                                    //   value={parseInt(customer.id)}
                                    onChange={e => {
                                      let tempChecked = checked;
                                      let tempSubFeatureList = displayedUserFeatures.filter(
                                        item => item.featureCode === feature.featureCode
                                      )[0].subFeatureList;
                                      let tempSubFeatureCodeList = [];
                                      tempSubFeatureList &&
                                        tempSubFeatureList.forEach(item => {
                                          tempSubFeatureCodeList.push(item.subFeatureCode);
                                        });

                                      if (checkFeatureAllEdit(feature.featureCode)) {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['edit']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['edit'])
                                                .forEach(action => {
                                                  tempChecked = tempChecked.filter(
                                                    item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                  );
                                                });
                                          });
                                      } else {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['edit']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['edit'])
                                                .forEach(action => {
                                                  tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                });
                                          });
                                      }

                                      tempChecked = [...new Set(tempChecked)];
                                      setChecked([...tempChecked]);
                                    }}
                                    //   onBlur={formik.handleBlur}
                                  />
                                )}
                                {view && checkFeatureAllEdit(feature.featureCode) && (
                                  <FaCheckSquare
                                    color="#151538"
                                    size={23}
                                    style={{
                                      borderRadius: '0.5rem',
                                    }}
                                  />
                                )}
                                {view && !checkFeatureAllEdit(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                              </td>
                              <td width="40">
                                {!view && (
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="checked"
                                    checked={checkFeatureAllDelete(feature.featureCode)}
                                    //   value={parseInt(customer.id)}
                                    onChange={e => {
                                      let tempChecked = checked;
                                      let tempSubFeatureList = displayedUserFeatures.filter(
                                        item => item.featureCode === feature.featureCode
                                      )[0].subFeatureList;

                                      if (checkFeatureAllDelete(feature.featureCode)) {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['delete']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['delete'])
                                                .forEach(action => {
                                                  tempChecked = tempChecked.filter(
                                                    item => !(item.startsWith(subFeature.subFeatureCode) && item.endsWith(action))
                                                  );
                                                });
                                          });
                                      } else {
                                        tempSubFeatureList &&
                                          tempSubFeatureList.forEach(subFeature => {
                                            subFeature.actions &&
                                              subFeature.actions.filter(item => item === actionEnum['delete']) &&
                                              subFeature.actions
                                                .filter(item => item === actionEnum['delete'])
                                                .forEach(action => {
                                                  tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                });
                                          });
                                      }

                                      tempChecked = [...new Set(tempChecked)];
                                      setChecked(tempChecked);
                                    }}
                                    //   onBlur={formik.handleBlur}
                                  />
                                )}
                                {view && checkFeatureAllDelete(feature.featureCode) && (
                                  <FaCheckSquare
                                    color="#151538"
                                    size={23}
                                    style={{
                                      borderRadius: '0.5rem',
                                    }}
                                  />
                                )}
                                {view && !checkFeatureAllDelete(feature.featureCode) && <FaTimesCircle color="#151538" size={23} />}
                              </td>
                              <td
                                width="40"
                                onClick={() => {
                                  toggleShowHiddenRow(feature.featureCode);
                                }}
                              >
                                <img
                                  className={showRows.indexOf(feature.featureCode) > -1 ? 'rotate-up' : ''}
                                  src={arrowTbDown}
                                  alt={arrowTbDown}
                                />
                              </td>
                            </tr>
                            {showRows.indexOf(feature.featureCode) > -1 &&
                              feature.subFeatureList &&
                              feature.subFeatureList.map(subFeature => {
                                let subFeatureKey = Object.keys(featuresEnum).find(
                                  item => featuresEnum[item] && featuresEnum[item].id === subFeature.subFeatureCode
                                );

                                if (subFeatureKey) {
                                  return (
                                    <tr>
                                      <td width="40">
                                        {!view && (
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="checked"
                                            checked={checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions)}
                                            //   value={parseInt(customer.id)}
                                            onChange={e => {
                                              let tempChecked = checked;
                                              let index = displayedUserFeatures.findIndex(item => item.featureCode === feature.featureCode);
                                              let subFeatureIndex = displayedUserFeatures[index].subFeatureList.findIndex(
                                                item => item.subFeatureCode === subFeature.subFeatureCode
                                              );

                                              // tempChecked = tempChecked.filter((item) => !(item.startsWith(subFeature.subFeatureCode)))
                                              if (checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions)) {
                                                tempChecked = tempChecked.filter(item => !item.startsWith(`${subFeature.subFeatureCode}`));
                                              } else {
                                                displayedUserFeatures[index].subFeatureList[subFeatureIndex] &&
                                                  displayedUserFeatures[index].subFeatureList[subFeatureIndex].actions &&
                                                  displayedUserFeatures[index].subFeatureList[subFeatureIndex].actions.length > 0 &&
                                                  displayedUserFeatures[index].subFeatureList[subFeatureIndex].actions.forEach(action => {
                                                    tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                  });
                                              }

                                              tempChecked = [...new Set(tempChecked)];

                                              setChecked([...tempChecked]);
                                            }}
                                            //   onBlur={formik.handleBlur}
                                          />
                                        )}
                                        {view && checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions) && (
                                          <FaCheckSquare
                                            color="#151538"
                                            size={23}
                                            style={{
                                              borderRadius: '0.5rem',
                                            }}
                                          />
                                        )}
                                        {view && !checkSubFeatureAll(subFeature.subFeatureCode, subFeature.actions) && (
                                          <FaTimesCircle color="#151538" size={23} />
                                        )}
                                      </td>
                                      <td width="450" className="subfeature-padding">
                                        {featuresEnum[subFeatureKey] ? t(featuresEnum[subFeatureKey].LABEL) : ''}
                                      </td>
                                      {subFeature.actions &&
                                        subFeature.actions.map(action => {
                                          return (
                                            <td width="40">
                                              {!view && (
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  name="checked"
                                                  checked={
                                                    checked.findIndex(item => item === `${subFeature.subFeatureCode}:${action}`) > -1
                                                  }
                                                  //   value={parseInt(customer.id)}
                                                  onChange={e => {
                                                    let tempChecked = checked;
                                                    let index = tempChecked.findIndex(
                                                      item => item === `${subFeature.subFeatureCode}:${action}`
                                                    );

                                                    if (index > -1) {
                                                      tempChecked.splice(index, 1);
                                                    } else {
                                                      tempChecked.push(`${subFeature.subFeatureCode}:${action}`);
                                                    }

                                                    tempChecked = [...new Set(tempChecked)];

                                                    setChecked([...tempChecked]);
                                                  }}
                                                  //   onBlur={formik.handleBlur}
                                                />
                                              )}
                                              {view &&
                                                checked.findIndex(item => item === `${subFeature.subFeatureCode}:${action}`) > -1 && (
                                                  <FaCheckSquare
                                                    color="#151538"
                                                    size={23}
                                                    style={{
                                                      borderRadius: '0.5rem',
                                                    }}
                                                  />
                                                )}
                                              {view &&
                                                !(checked.findIndex(item => item === `${subFeature.subFeatureCode}:${action}`) > -1) && (
                                                  <FaTimesCircle color="#151538" size={23} />
                                                )}
                                            </td>
                                          );
                                        })}
                                    </tr>
                                  );
                                }
                              })}
                          </>
                        );
                      }
                    })}
              </tbody>
            </table>
          </div>
        </div>
      }
    </>
  );
}

export default Features;
