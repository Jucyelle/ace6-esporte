import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import { Result, Button } from 'antd';

import PrivateRoute from './PrivateRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PasswordRecovery from '../pages/PasswordRecovery';
import Settings from '../pages/Settings';
import Members from '../pages/Members';

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

const AccessDenied = () => {
    const navigate = useNavigate();
  
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Result
                status="403"
                title="403"
                subTitle="Desculpe, você não tem acesso a esta página."
                extra={<Button size="large" type="primary" onClick={() => navigate('/')}>Tela de Início</Button>}
            />
        </div>
    );
};

const RoutesPaths = () => (
    <Router>
        <Routes>
            <Route path="/" element={<PrivateRoute element={Home} />}/>
            <Route path="/configuracoes" element={<PrivateRoute element={Settings} />}/>
            <Route path="/gerenciar-membros" element={<PrivateRoute element={Members} />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/registrar" element={<Register />}/>
            <Route path="/recuperar-senha" element={<PasswordRecovery />}/> 
            <Route path="/acesso-negado" element={<AccessDenied />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
);

export default RoutesPaths;
