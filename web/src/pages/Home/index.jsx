import React, { useEffect, useState } from 'react';
import { Avatar, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import {HomeOutlined, BellOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'; 
import './styles.css';

const Home = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [selectedKey, setSelectedKey] = useState('1'); 
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Usuário'); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName') || 'Usuário');
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
    
  const handleClick = (e) => {
    setSelectedKey(e.key);
    console.log('click ', e);
    if (e.key === "logout") {
      localStorage.removeItem('userName');
      navigate('/login');
    }
  };

  return (
    <main>
      <div className='generalPage'>
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
            style={{ width: 233, backgroundColor: '#0095DA' }}
            selectedKeys={[selectedKey]} 
            mode='inline'
          >
            <Menu.Item 
              key='Home' 
              style={{ 
                backgroundColor: selectedKey === '1' ? '#00AEFF' : '', 
                color: '#FFFFFF',
                borderRadius: 0, 
                margin: 0,
                width: 233,
                height: 50
              }}
            >
              <HomeOutlined />  
              <span>Início</span>
            </Menu.Item>

            <Menu.Item 
              key='Notification'
              style={{ 
                backgroundColor: selectedKey === '2' ? '#00AEFF' : '', 
                color: '#FFFFFF',
                borderRadius: 0, 
                margin: 0, 
                width: 233,
                height: 50
              }}
            >
              <BellOutlined />  
              <span>Notificações</span>
            </Menu.Item>

            <div style={{
              width: 215, 
              borderBottom: '1px solid rgba(255, 255, 255, 0.28)',
              marginLeft: 8,
              marginRight: 8,
              }}>
            </div>

            <Menu.Item 
              key='Setting'
              style={{
                backgroundColor: selectedKey === '3' ? '#00AEFF' : '', 
                color: '#FFFFFF',
                borderRadius: 0, 
                margin: 0, 
                width: 233,
                height: 50
              }}
            >
              <SettingOutlined />  
              <span>Configurações</span>
            </Menu.Item>
            
            <Menu.Item 
              key='logout'
              style={{
                backgroundColor: selectedKey === 'logout' ? '#00AEFF' : '', 
                color: '#FFFFFF',
                borderRadius: 0, 
                margin: 0, 
                width: 233,
                height: 50,
                position: 'absolute',
                bottom: 50
              }}
            >
              <LogoutOutlined />  
              <span>Sair</span>
            </Menu.Item>
          </Menu>
        </div>

        <div className='homePage'>
          {/* Conteúdo da homePage */}
        </div>

      </div>
    </main>
  )
}

export default Home;