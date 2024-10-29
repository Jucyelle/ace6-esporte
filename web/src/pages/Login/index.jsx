import React, { useState } from 'react'; 
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Flex, Form, Input, Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login, sendPasswordRecoveryCode, verifyRecoveryCode } from '../../../services/api';
import { validateEmailInput } from '../../utils/ValidateUtils';
import './styles.css';

const Login = () => {
    const [modalForgotPasswordOpen, setModalForgotPasswordOpen] = useState(false);
    const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const result = await login(values.email, values.password);
            if (result.status === 200) {
                localStorage.setItem('authToken', result.data.access_token);
                navigate('/');
            }
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }
    };

    const handleRegisterNavigate = () => {
        navigate('/registrar');
    };

    const handleRequestNewPassword = async () => {
        const validationMessage = validateEmailInput(email);
    
        if (validationMessage) {
            messageApi.open({
                type: 'error',
                content: validationMessage,
            });
        } else {
            try {
                const result = await sendPasswordRecoveryCode(email);
                if (result.status === 200) {
                    messageApi.open({
                        type: 'success',
                        content: 'Código enviado com sucesso!',
                    });

                    setModalForgotPasswordOpen(false);
                    setModalConfirmOpen(true);
                }
            } catch (error) {
                messageApi.open({
                    type: 'error',
                    content: error.message,
                });
            }
        }
    };

    const handleVerificationSubmit = async () => {
        if (!verificationCode) {
            messageApi.open({
                type: 'error',
                content: 'Por favor, insira o código de verificação.',
            });

            return;
        }

        try {
            const result = await verifyRecoveryCode(email, verificationCode);
            
            if (result.status === 200) {
                messageApi.open({
                    type: 'success',
                    content: 'Código verificado com sucesso!',
                });
                
                setModalConfirmOpen(false);

                const token = result.data.reset_token;
                navigate(`/recuperar-senha?token=${token}`);
            }
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }
    };

    return (
        <main>
            <div className='generalPage'>
                <div className='templateAside'>
                    {/* inserir a imagem e logo */}
                </div>
                <div className='loginForm'>
                    {contextHolder}
                    <div className='formContainer'>
                        <p id='loginTitle'>Login</p>
                        <Form
                            name="normal_login"
                            className="login-form"
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={onFinish}
                            size='large'
                        >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    type: 'email',
                                    message: 'O e-mail não é válido.',
                                },
                                {
                                    required: true,
                                    message: 'Por favor, insira seu e-mail.',
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="site-form-item-icon" />} 
                                placeholder="E-mail" 
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                            {
                                required: true,
                                message: 'Por favor, insira sua senha.',
                            },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder="Senha"
                            />
                        </Form.Item>
                        <Form.Item 
                            style={{
                                marginBottom: 0
                            }}
                        >
                            <Flex className='rememberMe' justify='space-between' align='center'>
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox>Lembrar de mim</Checkbox>
                                </Form.Item>

                                <Button
                                    type="link"
                                    size='small'
                                    onClick={() => setModalForgotPasswordOpen(true)}
                                >
                                    Esqueceu a senha?
                                </Button>

                                <Modal
                                    className='modalForgotPassword'
                                    centered
                                    maskClosable={false}
                                    keyboard={false}
                                    open={modalForgotPasswordOpen}
                                    footer={[
                                        <Button size='large' key="submit" type="primary" onClick={handleRequestNewPassword}>
                                            Solicitar nova senha
                                        </Button>
                                    ]}
                                    onCancel={() => {
                                        setModalForgotPasswordOpen(false);
                                        setEmail('');
                                    }}
                                >
                                    <div className="modal-header">
                                        <div className="icon-container">
                                            <div className='circle'>
                                                <LockOutlined className="lock-icon" />
                                            </div>
                                        </div>
                                        <h2 className="modal-title">Esqueceu a senha?</h2>
                                    </div>
                                    <p>Não se preocupe! Digite seu e-mail para solicitar uma nova senha.</p>
                                    <Input
                                        type="email"
                                        placeholder="E-mail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ marginBottom: '20px' }}
                                    />
                                </Modal>

                                <Modal
                                    className='modalConfirmPassword'
                                    centered
                                    maskClosable={false}
                                    keyboard={false}
                                    open={modalConfirmOpen}
                                    footer={[
                                        <Button size='large' key="submit" type="primary" onClick={handleVerificationSubmit}>
                                            Verificar código
                                        </Button>
                                    ]}
                                    onCancel={() => {
                                        setModalConfirmOpen(false);
                                        setEmail('');
                                    }}
                                >
                                    <div className="modal-header">
                                        <div className="icon-container">
                                            <div className='circle'>
                                                <LockOutlined className="lock-icon" />
                                            </div>
                                        </div>
                                        <h2 className="modal-title">Código de verificação</h2>
                                    </div>
                                    <p>Digite o código enviado para o seu e-mail.</p>
                                    <Input.OTP 
                                        length={5} 
                                        formatter={(str) => str.toUpperCase()} 
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e)}
                                        style={{ marginBottom: '20px' }}
                                    />
                                </Modal>
                            </Flex>
                        </Form.Item>

                        <Form.Item
                            style={{
                                marginBottom: 0
                            }}
                        >
                            <Button 
                                type="primary"
                                htmlType="submit" 
                                className="login-form-button"
                                block
                            >
                                Entrar
                            </Button>

                            <p className='registrationOption' style={{textAlign: 'center', marginTop: 5, marginBottom: 5}}>
                                <b>Não tem uma conta?</b>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={handleRegisterNavigate}
                                >
                                    Registre-se aqui.
                                </Button>
                            </p>
                        </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login;
