export const validateEmailInput = (value) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!value) {
        return 'Informe o e-mail.';
    }
    if (!value.match(emailPattern)) {
        return 'O e-mail não é válido.';
    }
};