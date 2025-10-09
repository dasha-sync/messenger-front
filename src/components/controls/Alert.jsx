import React from 'react';
import PropTypes from 'prop-types';
import './Controls.css';

const Alert = ({ message, status, onClose }) => {
    const getAlertClass = () => {
        switch (status) {
            case 'WARNING':
                return 'alert-warning';
            case 'DANGER':
                return 'alert-danger';
            case 'INFO':
                return 'alert-info';
            case 'SUCCESS':
                return 'alert-success';
            default:
                return 'alert-info';
        }
    };

    return (
        <div className={`alert ${getAlertClass()} alert-dismissible custom-alert `} role="alert">
            <span>{message}</span>
            {onClose && (
                <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close"
                />
            )}
        </div>
    );
};

Alert.propTypes = {
    message: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['WARNING', 'DANGER', 'INFO', 'SUCCESS']).isRequired,
    onClose: PropTypes.func
};

export default Alert;
