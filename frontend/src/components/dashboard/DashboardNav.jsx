import React from 'react';
import { Link, NavLink } from 'react-router';
import { LogOut, ShoppingCart } from 'lucide-react';

import Logo from '../../assets/Logo.png';
import { useTheme } from '../../context/ThemeContext';
import './dashboardNav.css';

function DashboardNav({ title, links, userName, onLogout, cartCount, onCartClick }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="dashboard-nav">
            <div className="dashboard-nav__top">
                <Link to="/" className="dashboard-nav__brand">
                    <img src={Logo} alt="AgriSphere Logo" className="dashboard-nav__logo" />
                    <span>Agri<b>Sphere</b> · {title}</span>
                </Link>

                <div className="dashboard-nav__user">
                    <div className="dashboard-nav__theme-toggle">
                        <label htmlFor="dashboard-theme-switch" className="dashboard-switch">
                            <input
                                type="checkbox"
                                id="dashboard-theme-switch"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            />
                            <span className="dashboard-slider"></span>
                        </label>
                    </div>
                    {onCartClick && (
                        <button type="button" className="dashboard-nav__cart" onClick={onCartClick}>
                            <ShoppingCart size={18} />
                            {cartCount > 0 && <span className="dashboard-nav__cart-badge">{cartCount}</span>}
                        </button>
                    )}
                    <span className="dashboard-nav__user-name">{userName}</span>
                    <button type="button" className="dashboard-nav__logout" onClick={onLogout} aria-label="Log out">
                        <LogOut size={16} /> <span className="dashboard-nav__logout-text">Log out</span>
                    </button>
                </div>
            </div>

            <nav className="dashboard-nav__links">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            isActive ? 'dashboard-nav__link active' : 'dashboard-nav__link'
                        }
                        end={link.end}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}

export default DashboardNav;
