import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (email, password) => {
    try {
        const response = await api.post('login', {
            email: email,
            password: password
        });
        return response;
    } catch (error) {
        if (error.request.status === 404) {
            throw Error('Usuário não encontrado.');
        }
        else if (error.request.status === 401) {
            throw Error('Credenciais inválidas ou usuário inativo.');
        }
        else {
            throw Error('Ocorreu um erro ao fazer o login. Tente novamente.');
        }  
    }
}

export const verifyToken = async (token) => {
    try {
        const response = await api.post('verify-token', {}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return { isValid: true, userEmail: response.data.user_email };
        } else {
            return { isValid: false, userEmail: null };
        }
    } catch (error) {
        return { isValid: false, userEmail: null };
    }
}

export const createUser = async (name, email, password, identity, student_registration) => {
    try {
        const response = await api.post('register', {
            name: name,
            email: email,
            password: password,
            identity: identity,
            student_registration: student_registration
        });
        return response;
    } catch (error) {
        if (error.response.data.detail === "Student registration already exists") {
            throw Error('Matrícula já registrada.');
        }
        else if (error.response.data.detail === "Email already registered") {
            throw Error('E-mail em uso.');
        }
        else {
            throw Error('Ocorreu um erro ao fazer o cadastro. Tente novamente.');
        }
    }
}

export const sendPasswordRecoveryCode = async (email) => {
    try {
        const response = await api.post('send-password-recovery-code', {
            email: email
        });
        return response;
    } catch (error) {
        if (error.request.status === 404) {
            throw Error('Usuário não encontrado.');
        }
        else {
            throw Error('Ocorreu um erro ao enviar o código. Tente novamente.');
        }  
    }
}

export const verifyRecoveryCode = async (email, recovery_code) => {
    try {
        const response = await api.post('verify-recovery-code', {
            email: email,
            recovery_code: recovery_code
        });
        console.log(response)
        return response;
    } catch (error) {
        if (error.request.status === 404) {
            throw Error('Código de recuperação não encontrado para este e-mail.');
        }
        else if (error.request.status === 400) {
            throw Error('Código inválido ou expirado.');
        }
        else {
            throw Error('Ocorreu um erro ao validar o código. Tente novamente.');
        }  
    }
}

export const resetPassword = async (token, new_password, confirm_password) => {
    try {
        const response = await api.post('reset-password', {
            token: token,
            new_password: new_password,
            confirm_password: confirm_password
        });
        return response;
    } catch (error) {
        if (error.request.status === 401) {
            throw Error('Token inválido.');
        }
        else if (error.request.status === 400) {
            throw Error('As senhas não correspondem.');
        }
        else {
            throw Error('Ocorreu um erro ao redefinir a senha. Tente novamente.');
        }  
    }
}

export const getUserByEmail = async (email) => {
    try {
        const response = await api.post('get-user', {
            email: email
        });

        return response.data;
    } catch (error) {
        if (error.request.status === 404) {
            throw Error('Usuário não encontrado.');
        }
        else {
            throw Error('Ocorreu um erro ao buscar usuário. Tente novamente.');
        }  
    }
}

export const getAllUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data.users;
    } catch (error) {
        throw Error('Ocorreu um erro ao buscar os usuários. Tente novamente.');
    }
}

export const updateUserRole = async (id, role) => {
    try {
        const response = await api.post('update-user-role', {
            id: id,
            role: role
        });

        return response;
    } catch (error) {
        throw Error('Ocorreu um erro ao atualizar o tipo do usuário. Tente novamente.');
    }
}

export const updateUserStatus = async (id, active) => {
    try {
        const response = await api.post('update-user-status', {
            id: id,
            active: active
        });

        return response;
    } catch (error) {
        throw Error('Ocorreu um erro ao atualizar o status do usuário. Tente novamente.');
    }
}

export const deleteUser = async (id) => {
    try {
        const response = await api.post('delete-user', {
            id: id
        });

        return response;
    } catch (error) {
        throw Error('Ocorreu um erro ao deletar o usuário. Tente novamente.');
    }
}