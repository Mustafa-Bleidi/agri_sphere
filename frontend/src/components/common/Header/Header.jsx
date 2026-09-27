import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

import { public_links, roles } from '../../../Data';
import { useAuth } from '../../../context/AuthContext';
import { useAuthModal } from '../../../context/AuthModalContext';

import Logo from '../../../assets/Logo.png';
import Facebook from '../../../assets/facebook-btn.svg';
import Google from '../../../assets/google-btn.svg';

import UserProfile from '../../../assets/user-bold 1.png';

import './header.css';

const DASHBOARD_PATH_BY_ROLE = {
    farmer: '/farmer/home',
    engineer: '/engineer/home',
    dealer: '/dealer/home',
};

function Header() {
    const [showMenu, setShowMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showPopupForgetpassword, setShowPopupForgetpassword] = useState(false);

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
    });
    const [registerRole, setRegisterRole] = useState('farmer');
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);

    const navigate = useNavigate();
    const { user, role, isAuthenticated, login, register, logout } = useAuth();
    const { mode, defaultRole, openLogin, openRegister, close } = useAuthModal();

    useEffect(() => {
        if (mode === 'register') setRegisterRole(defaultRole);
    }, [mode, defaultRole]);

    const handleLoginChange = (event) => {
        setLoginForm({ ...loginForm, [event.target.name]: event.target.value });
    };

    const handleRegisterChange = (event) => {
        setRegisterForm({ ...registerForm, [event.target.name]: event.target.value });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const loggedInUser = await login(loginForm);
            close();
            setLoginForm({ email: '', password: '' });

            const loggedInRole = loggedInUser.roles?.[0]?.name;
            const dashboardPath = DASHBOARD_PATH_BY_ROLE[loggedInRole];

            if (dashboardPath) navigate(dashboardPath);
        } catch (error) {
            setLoginError(
                error.response?.data?.message ||
                    error.response?.data?.errors?.email?.[0] ||
                    'Unable to log in. Please try again.'
            );
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        setRegisterError('');
        setRegisterSuccess('');

        if (registerForm.password !== registerForm.password_confirmation) {
            setRegisterError('Passwords do not match.');
            return;
        }

        setRegisterLoading(true);

        try {
            await register({ ...registerForm, role: registerRole });
            setRegisterSuccess('Account created! You can now log in.');
            setLoginForm({ email: registerForm.email, password: '' });
            setRegisterForm({
                username: '',
                email: '',
                phone_number: '',
                password: '',
                password_confirmation: '',
            });

            setTimeout(() => {
                setRegisterSuccess('');
                openLogin();
            }, 1200);
        } catch (error) {
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setRegisterError(firstError || error.response?.data?.message || 'Unable to register. Please try again.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setShowAccountMenu(false);
        navigate('/');
    };

    const dashboardPath = DASHBOARD_PATH_BY_ROLE[role];

    return (
        <>
            <header className='header'>
                <nav className="nav container">
                    <Link to='/' className='nav__logo'  >
                        <img src={Logo} alt="AgriShpere Logo" className="nav__logo-img" />

                        <div className="nav__logo-txt">
                            Agri<span>Sphere</span>
                        </div>
                    </Link>

                    <div className={ `${ showMenu ? 'nav__menu show__menu' : 'nav__menu' } ` } id='nav-menu'>
                        <ul className="nav__list">
                            {
                                public_links.map( ( { name, path }, index ) => {
                                    return (
                                        <li className="nav__item" key={index}>
                                            <NavLink
                                                to={path}
                                                className={ ( { isActive } ) =>
                                                    isActive ? 'nav__link active__nav-link' : 'nav__link'
                                                }
                                                onClick={ () => setShowMenu(!showMenu)}
                                            >
                                                {name}
                                            </NavLink>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>

                    <div className='header__user-actions'>
                        <div className="theme__toggle" id="theme-toggle">
                            <label htmlFor="" className="switch">
                                <input type="checkbox" name="" id="" />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {isAuthenticated ? (
                            <div className="header__account">
                                <button
                                    type="button"
                                    className="header__account-trigger"
                                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                                >
                                    <img
                                        src={UserProfile}
                                        alt="User Profile"
                                        className='header__user-profile'
                                    />
                                    <span className="header__account-name">{user?.name}</span>
                                </button>

                                {showAccountMenu && (
                                    <div className="header__account-menu">
                                        <p className="header__account-role">Signed in as {role}</p>
                                        {dashboardPath && (
                                            <Link
                                                to={dashboardPath}
                                                className="header__account-link"
                                                onClick={() => setShowAccountMenu(false)}
                                            >
                                                Go to dashboard
                                            </Link>
                                        )}
                                        <button
                                            type="button"
                                            className="header__account-logout"
                                            onClick={handleLogout}
                                        >
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <img
                                src={UserProfile}
                                alt="User Profile Image"
                                className='header__user-profile'
                                onClick={ () => openLogin() }
                            />
                        )}
                    </div>
                </nav>
            </header>

            <div className={ ` ${ mode === 'login' ? 'login__popup open' : 'login__popup' } ` }>
                <div className="login__popup-inner">
                    <div className="login__popup-content flex">
                        <button type="button" className="popup__close-btn" onClick={close} aria-label="Close">
                            &times;
                        </button>

                        <h4 className="login__popup-title">Welcome back</h4>

                        <form className="login__popup-form" onSubmit={handleLoginSubmit}>
                            {loginError && <p className="auth__error-message">{loginError}</p>}

                            <input
                                type="email"
                                name="email"
                                id="login_email"
                                className='login__popup-input'
                                placeholder='Email'
                                value={loginForm.email}
                                onChange={handleLoginChange}
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                id="login_password"
                                className='login__popup-input'
                                placeholder='Password'
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                required
                            />

                            <div className="login__popup-remember-forget flex">
                                <div className="login__popup-remember-me flex">
                                    <input
                                        type="radio"
                                        name="rememberme"
                                        id="rememberme"
                                        className='login__popup-remember-radio'
                                    />

                                    <label htmlFor="rememberme" className='rememberme'>
                                        Remember me
                                    </label>
                                </div>

                                <p
                                    className="login__popup-forget-password"
                                    onClick={
                                        () => {
                                            close();
                                            setShowPopupForgetpassword(true);
                                        }
                                    }
                                >
                                    Forgot Password?
                                </p>
                            </div>

                            <button type="submit" className='login__popup-btn' disabled={loginLoading}>
                                {loginLoading ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>

                        <div className="login__popup-assistant">
                            <span className="login__popup-account">Don't have an account?</span>
                            <span
                                className='login__popup-singup'
                                onClick={ () => openRegister('farmer') }
                            >Sign Up</span>
                        </div>

                        <p className='login__popup-divider'>
                            Or With
                        </p>

                        <div className="login__popup-socials flex">
                            <button type="button" className="login__popup-social facebook-btn">
                                <img
                                    src={Facebook}
                                    alt="Facebook Icon"
                                    className='login__popup-facebook-icon'
                                />
                                Facebook
                            </button>

                            <button type="button" className="login__popup-social google-btn">
                                <img
                                    src={Google}
                                    alt="Google Icon"
                                    className='login__popup-google-icon'
                                />
                                Log in with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={` ${ mode === 'register' ? 'register__popup open' : 'register__popup' }  ` }>
                <div className="register__popup-inner">
                    <div className="register__popup-content">
                        <button type="button" className="popup__close-btn" onClick={close} aria-label="Close">
                            &times;
                        </button>

                        <h4 className="register__popup-title">Create account</h4>

                        <p className="register__popup-subtitle">
                            I am registering as...
                        </p>

                        <div className="register__popup-registration-method">
                            {
                                roles.map( ( { name, value, icon }, index ) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`register__popup-registration-method-box ${registerRole === value ? 'active' : ''}`}
                                            onClick={() => setRegisterRole(value)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="register__popup-registration-method-img-wrapper">
                                                <img
                                                    src={icon}
                                                    alt={`${name} Icon`}
                                                    className="register__popup-registration-method-img"
                                                />
                                            </div>

                                            <p className="register__popup-registration-method-role">
                                                {name}
                                            </p>
                                        </div>
                                    )
                                } )
                            }
                        </div>

                        <form className="register__popup-form" onSubmit={handleRegisterSubmit}>
                            {registerError && <p className="auth__error-message">{registerError}</p>}
                            {registerSuccess && <p className="auth__success-message">{registerSuccess}</p>}

                            <input
                                type="text"
                                name="username"
                                id="register_name"
                                className='register__popup-input'
                                placeholder='Name'
                                value={registerForm.username}
                                onChange={handleRegisterChange}
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                id="register_email"
                                className='register__popup-input'
                                placeholder='Email'
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                                required
                            />

                            <input
                                type="tel"
                                name="phone_number"
                                id="phone"
                                className='register__popup-input'
                                placeholder='Phone'
                                value={registerForm.phone_number}
                                onChange={handleRegisterChange}
                            />

                            <input
                                type="password"
                                name="password"
                                id="register_password"
                                className='register__popup-input'
                                placeholder='Password'
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                required
                            />

                            <input
                                type="password"
                                name="password_confirmation"
                                id="register_password_confirmation"
                                className='register__popup-input'
                                placeholder='Confirm Password'
                                value={registerForm.password_confirmation}
                                onChange={handleRegisterChange}
                                required
                            />

                            <button type="submit" className='register__popup-btn' disabled={registerLoading}>
                                {registerLoading ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <div className="register__popup-assistant">
                            Already have an account?
                            <span
                                className='register__popup-singin'
                                onClick={ () => openLogin() }
                            >Log in</span>
                        </div>

                        <p className='register__popup-divider'>
                            Or With
                        </p>

                        <div className="login__popup-socials flex">
                            <button type="button" className="login__popup-social facebook-btn">
                                <img
                                    src={Facebook}
                                    alt="Facebook Icon"
                                    className='login__popup-facebook-icon'
                                />
                                Facebook
                            </button>

                            <button type="button" className="login__popup-social google-btn">
                                <img
                                    src={Google}
                                    alt="Google Icon"
                                    className='login__popup-google-icon'
                                />
                                Log in with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={ ` ${ showPopupForgetpassword ?'forgetpassword__popup open' : 'forgetpassword__popup' } ` }>
                <div className="forgetpassword__popup-inner">
                    <div className="forgetpassword__popup-content flex">
                        <button
                            type="button"
                            className="popup__close-btn"
                            onClick={() => setShowPopupForgetpassword(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <h6 className='forgetpassword__popup-title'>Forget Password</h6>

                        <form className="forgetpassword__popup-form" onSubmit={(event) => event.preventDefault()}>
                            <label htmlFor="forget_email" className="forgetpassword__popup-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="forget_email"
                                id="forget_email"
                                className="forgetpassword__popup-input"
                                placeholder='Enter your email'
                            />

                            <button type="submit" className="forgetpassword__popup-btn">Send Email</button>
                        </form>

                        <p className="forgetpassword__popup-assistant">
                            Don't have an account?
                            <span
                                className="forgetpassword__popup-singup"
                                onClick={
                                    () => {
                                        setShowPopupForgetpassword(false);
                                        openRegister('farmer');
                                    }
                                }
                            >Sing up now</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
