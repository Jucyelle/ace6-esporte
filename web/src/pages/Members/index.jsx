import React, { useState, useEffect } from 'react';
import { QuestionOutlined, CloseCircleOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Layout, FloatButton, Flex, Input, Table, Space, Switch, Popconfirm, Button, Tooltip, message } from 'antd';
import SidebarMenu from '../../components/SidebarMenu';
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser } from '../../../services/api';
import { UserRole } from '../../enums/UserRole';
import { UserIdentity } from '../../enums/UserIdentity';
import useAdminCheck from '../../hooks/useAdminCheck';
import './styles.css';

const { Search } = Input;
const { Sider } = Layout;

const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFF'
};

const Members = () => {
    useAdminCheck();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const loggedInUserEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
                setFilteredUsers(data);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        const filteredData = users.filter(user => 
            user.name.toLowerCase().includes(value.toLowerCase()) || 
            user.email.toLowerCase().includes(value.toLowerCase()) ||
            (user.student_registration && user.student_registration.toString().includes(value))
        );
        setFilteredUsers(filteredData);
    };

    const handleStatusChange = async (id, active) => {
        try {
            const result = await updateUserStatus(id, active);
            if (result.status === 200) {
                setUsers(prevState => prevState.map(user => 
                    user.id === id ? { ...user, active } : user
                ));
                setFilteredUsers(prevState => prevState.map(user => 
                    user.id === id ? { ...user, active } : user
                ));
            }
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }
    };

    const handleRoleChange = async (id, currentRole) => {
        const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
        try {
            const result = await updateUserRole(id, newRole);
            if (result.status === 200) {
                setUsers(prevState => 
                    prevState.map(user => 
                        user.id === id ? { ...user, role: newRole } : user
                    )
                );
                setFilteredUsers(prevState => 
                    prevState.map(user => 
                        user.id === id ? { ...user, role: newRole } : user
                    )
                );
            }
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const result = await deleteUser(id);
            if (result.status === 200) {
                setUsers(prevState => prevState.filter(user => user.id !== id));
                setFilteredUsers(prevState => prevState.filter(user => user.id !== id));
            }
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Usuário',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                    <div style={{ fontSize: '0.85em', color: '#888' }}>{record.email}</div>
                </div>
            ),
        },
        {
            title: 'Cargo',
            key: 'type',
            render: (text, record) => renderRoleAndIdentity(record.role, record.identity),
        },
        {
            title: 'Matrícula',
            dataIndex: 'student_registration',
            key: 'student_registration',
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'status',
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={(checked) => handleStatusChange(record.id, checked)}
                    style={{
                        backgroundColor: active ? '#27AE60' : '#EB5757',
                        borderColor: active ? '#27AE60' : '#EB5757'
                    }}
                    disabled={record.email === loggedInUserEmail}
                />
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Mudar tipo de usuário">
                        <Popconfirm
                            title={
                                record.role === UserRole.ADMIN
                                    ? "Remover da lista de admins?"
                                    : "Promover a admin?"
                            }
                            onConfirm={() => handleRoleChange(record.id, record.role)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                icon={<UserSwitchOutlined />}
                                type="primary"
                                shape="circle"
                                disabled={!record.active || record.email === loggedInUserEmail}
                            />
                        </Popconfirm>
                    </Tooltip>
                    
                    <Tooltip title="Deletar usuário">
                        <Popconfirm
                            title="Deletar?"
                            onConfirm={() => handleDeleteUser(record.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                icon={<CloseCircleOutlined />}
                                danger
                                type='primary'
                                shape="circle"
                                disabled={record.email === loggedInUserEmail}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];
    
    const renderRoleAndIdentity = (role, identity) => {
        const roleStyles = {
            [UserRole.ADMIN]: { backgroundColor: '#0095DA', color: 'white', padding: '4px 8px', borderRadius: '25px' },
        };
    
        const identityStyles = {
            [UserIdentity.PROFESSOR]: { backgroundColor: '#EF8D2B', color: 'white', padding: '4px 8px', borderRadius: '25px' },
            [UserIdentity.STUDENT]: { backgroundColor: '#E2B93B', color: 'white', padding: '4px 8px', borderRadius: '25px' }
        };
    
        return (
            <div style={{ display: 'flex', gap: '8px' }}>
                {role === UserRole.ADMIN && (
                    <div style={roleStyles[UserRole.ADMIN]}>Admin</div>
                )}
                {identity === UserIdentity.PROFESSOR && (
                    <div style={identityStyles[UserIdentity.PROFESSOR]}>Docente</div>
                )}
                {identity === UserIdentity.STUDENT && (
                    <div style={identityStyles[UserIdentity.STUDENT]}>Discente</div>
                )}
            </div>
        );
    };
    
    return (
        <Layout
            hasSider
            style={{
                minHeight: '100vh',
            }}
        >
            <Sider
                width={233}
                style={siderStyle}
            >
                <SidebarMenu atualPage='members' />
            </Sider>

            <Layout 
                className='membersPage'
                style={{
                    marginInlineStart: 233,
                }}
            >
                <p style={{ fontSize: '20px' }}><b>Gerenciamento de Membros</b></p>

                <Flex align="center" justify="flex-end" style={{ marginTop: '30px' }}>
                    <Search
                        size="large"
                        placeholder="Buscar usuário"
                        allowClear
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            width: 260,
                        }}
                    />
                </Flex>

                <Table 
                    columns={columns} 
                    dataSource={filteredUsers} 
                    loading={loading}
                    rowKey="id" 
                    style={{
                        marginTop: '20px'
                    }}
                    pagination={{
                        pageSize: 7,
                    }}
                />
            </Layout>
            
            <FloatButton icon={<QuestionOutlined />} tooltip={<div>Documentação</div>} type="primary" style={{ insetInlineEnd: 30 }} />
        </Layout>
    )
}

export default Members;