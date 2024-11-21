import React, { useEffect, useState } from 'react';
import { Avatar, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import {HomeOutlined, BellOutlined, SettingOutlined, UserOutlined, LogoutOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { getUserByEmail } from '../../../services/api';
import './styles.css';
import { UserRole } from '../../enums/UserRole';

const SidebarMenu = ({ atualPage }) => {
    const [selectedKey, setSelectedKey] = useState(atualPage);
    const [userName, setUserName] = useState('user');
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchUserName = async () => {
            const userEmail = localStorage.getItem('userEmail');
        
            if (userEmail) {
                const userData = await getUserByEmail(userEmail);
                if (userData) {
                    setUserName(userData.user.name.split(' ')[0]);

                    const userRole = parseInt(userData.user.role, 10);
                    localStorage.setItem('userRole', userRole);
                    setIsAdmin(userRole === UserRole.ADMIN);
                }
            }
        };
    
        fetchUserName();
    }, []);

    const items = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: 'Início',
        },
        {
            key: 'notifications',
            icon: <BellOutlined />,
            label: 'Notificações',
        },
        ...(isAdmin ? [{
            key: 'members',
            icon: <UsergroupAddOutlined />,
            label: 'Gerenciar Membros',
        }] : []),
        {
            type: 'divider',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Configurações',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            style: { position: 'absolute', bottom: 50 },
        },
    ]

    const handleClick = (e) => {
        setSelectedKey(e.key);

        if (e.key === 'home') {
            navigate('/');
        } else if (e.key === 'notifications') {
            navigate('/notificacoes');
        } else if (e.key === 'settings') {
            navigate('/configuracoes');
        } else if (e.key === 'members') {
            navigate('/gerenciar-membros');
        } else if (e.key === 'logout') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            navigate('/login');
        }
    };

    return (
        <div className='sideBar'>
            <div className='avatarContainer'>
                <Avatar style={{ 
                    backgroundColor: '#E0E0E0', 
                    color: '#333333',
                    }}
                    size= {63}
                    icon={<UserOutlined />}
                />

                <p className='avatarText'>
                    <strong>Olá,</strong> {userName}
                </p>
            </div>

            <Menu
                onClick={handleClick} 
                style={{ backgroundColor: '#0095DA' }}
                selectedKeys={[selectedKey]} 
                mode='inline'
                id='header-menu'
                items={items}
            />
        </div>
    )
}

export default SidebarMenu;