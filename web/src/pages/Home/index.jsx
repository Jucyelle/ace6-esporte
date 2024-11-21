import React, { useState } from 'react';
import { DownOutlined, PlusOutlined, QuestionOutlined } from '@ant-design/icons';
import { Layout, FloatButton, Input, Row, Col, Flex, Button, Table, Tooltip, Dropdown, Space } from 'antd';
import SidebarMenu from '../../components/SidebarMenu';
import './styles.css';

const { Sider } = Layout;
const { Search } = Input;

const items = [
    {
      label: 'Mais recente',
      key: '1',
    },
    {
      label: 'Mais antigo',
      key: '2',
    },
];

const Home = () => {
    const [buttonOrderText, setButtonOrderText] = useState('Mais recente');
    const today = new Date();

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('pt-BR', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month}, ${year}`;
    };

    const handleMenuDateClick = (e) => {
        const selectedItem = items.find(item => item.key === e.key);
        if (selectedItem) {
            setButtonOrderText(selectedItem.label);
        }
    };

    const menuProps = {
        items,
        onClick: handleMenuDateClick,
    };

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
                <SidebarMenu atualPage='home' />
            </Sider>

            <Layout className='homePage'>
                <p style={{ fontSize: '16px' }}>Hoje é dia <b>{formatDate(today)}</b></p>

                <Row 
                    justify="space-between" 
                    align="middle"
                    style={{ marginTop: '30px' }}
                >
                    <Col span={4}>
                        <Search
                            size="large"
                            placeholder="Buscar"
                            allowClear
                            style={{
                                width: 260,
                            }}
                        />
                    </Col>
                    <Col span={12}>
                        <Flex gap="middle" align="center" justify="flex-end">
                        <Dropdown menu={menuProps}>
                            <Button
                                size='large'
                            >
                                <Space>
                                    {buttonOrderText}
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>

                            <Tooltip placement="left" title="Cadastrar participante">
                                <Button type="primary" shape="circle" size="large" icon={<PlusOutlined />} />
                            </Tooltip>
                        </Flex>
                    </Col>
                </Row>
            </Layout>
            
            <FloatButton icon={<QuestionOutlined />} tooltip={<div>Documentação</div>} type="primary" style={{ insetInlineEnd: 30 }} />
        </Layout>
    )
}

export default Home;