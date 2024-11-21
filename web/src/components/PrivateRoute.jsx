import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { verifyToken } from '../../services/api';

const PrivateRoute = ({ element: Component }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const checkToken = async () => {
            if (token) {
                const { isValid, userEmail } = await verifyToken(token);
                setIsAuthenticated(isValid);

                if (isValid && userEmail) {
                    localStorage.setItem('userEmail', userEmail);
                } else {
                    localStorage.removeItem('userEmail');
                }
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
            }
        };
        checkToken();
    }, [token]);

    if (isAuthenticated === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" />
        </div>;
    }
    
    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;