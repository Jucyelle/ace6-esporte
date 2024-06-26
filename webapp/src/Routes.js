import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import { Result, Button } from 'antd';

import Home from './pages/home'
import Login from './pages/login';

const NotFound = () => {
    const navigate = useNavigate();
  
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Result
                status="404"
                title="404"
                subTitle="Desculpe, a página que você solicitou não foi encontrada."
                extra={<Button size="large" type="primary" onClick={() => navigate('/')}>Tela de Início</Button>}
            />
        </div>
    );
};

const RoutesPaths = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
);

export default RoutesPaths;