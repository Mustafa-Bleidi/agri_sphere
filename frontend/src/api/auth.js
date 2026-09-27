import apiClient from './client';

export function login({ email, password }) {
    return apiClient.post('/login', { email, password }).then((res) => res.data);
}

export function register({ username, email, password, password_confirmation, role, phone_number }) {
    return apiClient
        .post('/register', { username, email, password, password_confirmation, role, phone_number })
        .then((res) => res.data);
}
