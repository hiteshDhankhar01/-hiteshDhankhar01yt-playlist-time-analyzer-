// Alert.js
import { useEffect, useState } from 'react';
import './Alert.css';

const Alert = ({ message }) => {
    const [showAlert, setShowAlert] = useState(true);

    const handleClose = () => {
        setShowAlert(false);
    };

    return (
        showAlert && (
            <div className="custom-alert">
                <p>⚠️ {message}</p>
                {/* <button onClick={handleClose}>&times;</button> */}
            </div>
        )
    );
};

export default Alert;
