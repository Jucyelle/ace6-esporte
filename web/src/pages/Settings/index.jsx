import React from 'react';
import { QuestionOutlined } from '@ant-design/icons';
import { Layout, FloatButton } from 'antd';
import SidebarMenu from '../../components/SidebarMenu';
import './styles.css';

const { Sider } = Layout;

const Settings = () => {
    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sider
                width={233}
                style={{ backgroundColor: '#fff' }}
            >
                <SidebarMenu atualPage='settings' />
            </Sider>

            <Layout className='settingsPage'>
                <p style={{ fontSize: '20px' }}><b>Configurações</b></p>
            </Layout>
            
            <FloatButton icon={<QuestionOutlined />} tooltip={<div>Documentação</div>} type="primary" style={{ insetInlineEnd: 30 }} />
        </Layout>
    )
}

export default Settings;