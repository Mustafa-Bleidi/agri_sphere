import React, { createContext, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

function readStoredUser() {
    try {
        const raw = localStorage.getItem('agrisphere_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persistSession(token, user) {
    localStorage.setItem('agrisphere_token', token);
    localStorage.setItem('agrisphere_user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('agrisphere_token');
    localStorage.removeItem('agrisphere_user');
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [token, setToken] = useState(() => localStorage.getItem('agrisphere_token'));

    const role = user?.roles?.[0]?.name ?? null;

    const login = async (credentials) => {
        const response = await authApi.login(credentials);
        const loggedInUser = {
            id: response.id,
            name: response.name,
            roles: response.roles,
        };

        persistSession(response.token, loggedInUser);
        setToken(response.token);
        setUser(loggedInUser);

        return loggedInUser;
    };

    const register = (payload) => authApi.register(payload);

    const logout = () => {
        clearSession();
        setToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            role,
            isAuthenticated: Boolean(token && user),
            login,
            register,
            logout,
        }),
        [user, token, role]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
