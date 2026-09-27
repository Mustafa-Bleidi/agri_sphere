import React from 'react';
import { Link, NavLink } from 'react-router';
import { LogOut, ShoppingCart } from 'lucide-react';

import Logo from '../../assets/Logo.png';
import './dashboardNav.css';

function DashboardNav({ title, links, userName, onLogout, cartCount, onCartClick }) {
    return (
        <header className="dashboard-nav">
            <div className="dashboard-nav__top">
                <Link to="/" className="dashboard-nav__brand">
                    <img src={Logo} alt="AgriSphere Logo" className="dashboard-nav__logo" />
                    <span>Agri<b>Sphere</b> · {title}</span>
                </Link>

                <div className="dashboard-nav__user">
                    {onCartClick && (
                        <button type="button" className="dashboard-nav__cart" onClick={onCartClick}>
                            <ShoppingCart size={18} />
                            {cartCount > 0 && <span className="dashboard-nav__cart-badge">{cartCount}</span>}
                        </button>
                    )}
                    <span className="dashboard-nav__user-name">{userName}</span>
                    <button type="button" className="dashboard-nav__logout" onClick={onLogout}>
                        <LogOut size={16} /> Log out
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
