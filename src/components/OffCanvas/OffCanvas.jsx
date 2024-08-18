import React from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useDispatch, useSelector } from 'react-redux';
import { offCanvasActions } from '../../store/offCanvas';
import { Button, Card } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';

function OffCanvas() {
  const { show, notifications, title } = useSelector(state => state.offCanvas);

  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(offCanvasActions.close());
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement={document.dir === 'ltr' ? 'end' : 'start'}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{title}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {notifications &&
          notifications.length > 0 &&
          notifications.map(notification => {
            return (
              <Card className="notification-card">
                <Card.Body className="notification-card-body">
                  <div className="notification-card-body-left">
                    <div className="notification-card-body-icon">
                      <FaInfoCircle size={20} color="#1f4fde" />
                    </div>
                    <div className="notification-card-body-message">{notification?.message || ''}</div>
                  </div>
                  {(notification?.showConfirmAction || notification?.showCancelAction) && (
                    <div className="notification-card-body-right">
                      {notification?.showConfirmAction && (
                        <Button
                          className="notification-action"
                          onClick={() => {
                            handleClose();
                            notification?.onConfirmHandler();
                          }}
                        >
                          {notification?.confirmLabel}
                        </Button>
                      )}
                      {notification?.showCancelAction && (
                        <Button
                          className="notification-action danger"
                          onClick={() => {
                            handleClose();
                            notification?.onCancelHandler();
                          }}
                        >
                          {notification?.cancelLabel}
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default OffCanvas;
