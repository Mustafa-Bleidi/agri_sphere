import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
    // mode is one of: null | 'login' | 'register'
    const [mode, setMode] = useState(null);
    const [defaultRole, setDefaultRole] = useState('farmer');

    const value = useMemo(
        () => ({
            mode,
            defaultRole,
            openLogin: () => setMode('login'),
            openRegister: (role = 'farmer') => {
                setDefaultRole(role);
                setMode('register');
            },
            close: () => setMode(null),
        }),
        [mode, defaultRole]
    );

    return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
    const context = useContext(AuthModalContext);

    if (!context) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }

    return context;
}
