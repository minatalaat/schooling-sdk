import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import InfoIcon from '../assets/images/info-button.svg';
import fieldsDescEnum from '../constants/fieldsDescEnum.json';

function TooltipComp({ fieldKey, customIcon }) {
  if (fieldsDescEnum[fieldKey] && fieldsDescEnum[fieldKey].descEn && fieldsDescEnum[fieldKey].descAr) {
    return (
      <OverlayTrigger
        key={localStorage.getItem('code') === 'en' ? 'right' : 'left'}
        placement={localStorage.getItem('code') === 'en' ? 'right' : 'left'}
        // trigger={'click'}
        arrowProps={{
          style: {
            backgroundColor: 'red',
            color: 'red',
          },
        }}
        overlay={
          <Tooltip id={`tooltip-${localStorage.getItem('code') === 'en' ? 'right' : 'left'}`}>
            {localStorage.getItem('code') === 'en' ? fieldsDescEnum[fieldKey].descEn : fieldsDescEnum[fieldKey].descAr}
          </Tooltip>
        }
      >
        <span
          className="tooltip-main-icon"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title=""
          data-bs-original-title="Hover over the buttons below to see the four tooltips directions: top, right, bottom, and left. Directions are mirrored when using Bootstrap in RTL."
        >
          <img src={customIcon ? customIcon : InfoIcon} alt={InfoIcon} />
        </span>
      </OverlayTrigger>
    );
  }
  // else{
  //     return(
  //         <div></div>
  //     )
  // }
}

export default TooltipComp;
