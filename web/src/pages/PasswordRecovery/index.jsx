import React, { useState } from 'react'; 
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const PasswordRecovery = () => {
    const [form] = Form.useForm();
    const [passwordError, setPasswordError] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        //chamar api de redefinir senha
    };

    const passwordValidator = (_, value) => {
        const errors = [];

        if (value === undefined || value === '') {
            errors.push('Por favor, insira sua nova senha.');
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
                <div className='recoverPasswordForm'>
                    {contextHolder}
                    <div className='formContainer'>
                        <p id='recoverPasswordTitle'>Alterar senha</p>
                        <Form
                            name="recover_password"
                            className="recover-password-form"
                            onFinish={onFinish}
                            size='large'
                            layout='vertical'
                        >
                            <Form.Item
                                name="password"
                                label="Nova senha"
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
                            <Form.Item
                                name="confirm"
                                label="Confirme a nova senha"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, confirme sua nova senha.',
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
                            <Form.Item
                                style={{
                                    marginBottom: 0
                                }}
                            >
                                <Button 
                                    type="primary"
                                    htmlType="submit" 
                                    className="recover-password-form-button"
                                    style={{ marginTop: '10px' }}
                                    block
                                >
                                    Salvar alterações
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default PasswordRecovery;
