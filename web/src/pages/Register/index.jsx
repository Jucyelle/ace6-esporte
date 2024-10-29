import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Row, Col, message } from 'antd';
import { createUser } from '../../../services/api';
import './styles.css';

const Register = () => {
    const [form] = Form.useForm();
    const [valueUserType, setValueUserType] = useState(0);
    const [passwordError, setPasswordError] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onChangeUserType = (e) => {
        setValueUserType(e.target.value);
        if (e.target.value === 0) {
            form.setFieldsValue({ student_registration: null });
        }
    };

    const handleRedirectToLogin = () => {
        navigate('/login');
    };

    const onFinish = async (values) => {
        try {
            const result = await createUser(values.name, values.email, values.password, values.identity, values.student_registration);
            if (result.status === 201) {
                messageApi.open({
                    type: 'success',
                    content: 'Cadastro realizado com sucesso!',
                    duration: 3,
                    onClose: () => navigate('/login'),
                });
            }
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message,
            });
        }
    };

    const passwordValidator = (_, value) => {
        const errors = [];

        if (value === undefined || value === '') {
            errors.push('Por favor, insira sua senha.');
        }
        else {
            if (value.length < 8) {
                errors.push('Mínimo 8 caracteres.');
            }

            if (!/[A-Z]/.test(value)) {
                errors.push('Pelo menos uma letra maiúscula.');
            }

            if (!/\d/.test(value)) {
                errors.push('Pelo menos um número.');
            }

            if (!/[@$!%*?&#]/.test(value)) {
                errors.push('Pelo menos um caractere especial.');
            }
        }

        if (errors.length > 0) {
            setPasswordError(errors);
            return Promise.reject();
        }

        setPasswordError(null);
        return Promise.resolve();
    };

    return (
        <main>
            <div className='generalPage'>
                <div className='templateAside'>
                    {/* inserir a imagem e logo */}
                </div>
                <div className='registerForm'>
                    {contextHolder}
                    <div className='registerContainer'>
                        <p id='registerTitle'>Cadastre-se</p>
                        <Form
                            form={form}
                            name="register"
                            className="register-form"
                            onFinish={onFinish}
                            size='large'
                            layout="vertical"
                            initialValues={{
                                identity: 0,
                            }}
                            >
                            <Form.Item
                                name="name"
                                label="Nome completo"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira seu nome.',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={10}>
                                    <Form.Item
                                        name="identity"
                                        label="Tipo de usuário"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Por favor, selecione o tipo de usuário.',
                                            },
                                        ]}
                                    >
                                        <Radio.Group onChange={onChangeUserType} value={valueUserType}>
                                            <Radio value={0}>Professor</Radio>
                                            <Radio value={1}>Aluno</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={14}>
                                    <Form.Item
                                        name="student_registration"
                                        label="Matrícula"
                                        rules={[
                                            {
                                                required: valueUserType === 1,
                                                message: 'Por favor, insira sua matrícula.',
                                            },
                                        ]}
                                    >
                                        <Input disabled={valueUserType === 0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name="email"
                                label="E-mail"
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
                                <Input />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="password"
                                        label="Senha"
                                        required
                                        rules={[
                                            {
                                                validator: passwordValidator,
                                            }
                                        ]}
                                        hasFeedback
                                        help={passwordError && (
                                            <span style={{ whiteSpace: 'pre-line' }}>
                                                {passwordError.join('\n')}
                                            </span>
                                        )}
                                        validateStatus={passwordError ? 'error' : ''}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="confirm"
                                        label="Confirme a senha"
                                        dependencies={['password']}
                                        hasFeedback
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Por favor, confirme sua senha.',
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('As senhas não correspondem.'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                style={{
                                    marginTop: '15px',
                                    marginBottom: 0,
                                    textAlign: 'right'
                                }}
                            >
                                <Button
                                    shape="circle"
                                    className="home-form-button"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handleRedirectToLogin}
                                />
                                <Button 
                                    type="primary"
                                    htmlType="submit" 
                                    className="register-form-button"
                                >
                                    Cadastrar
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Register;