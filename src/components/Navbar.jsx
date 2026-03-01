import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ cart, theme, toggleTheme, toggleCart, currentUser, handleLogout }) {
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const location = useLocation();

    const categories = [
        { name: 'Home', path: '/' },
        { name: 'All Products', path: '/shop' },
        { name: 'Sealed', path: '/shop/sealed' },
        { name: 'Singles', path: '/shop/singles' },
        { name: 'Graded', path: '/shop/graded' },
        { name: 'Accessories', path: '/shop/accessories' }
    ];

    return (
        <nav className="navbar glass-panel">
            <div className="nav-brand">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1>ChaseTCG</h1>
                </Link>
            </div>

            <div className="nav-categories">
                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        to={cat.path}
                        className={`nav-link ${location.pathname === cat.path ||
                            (cat.path !== '/' && location.pathname.startsWith(cat.path))
                            ? 'active' : ''
                            }`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            <div className="nav-actions">
                {currentUser ? (
                    <>
                        <Link to="/admin" className="nav-link admin-link" aria-label="Admin Dashboard">
                            ⚙️ Dashboard
                        </Link>
                        <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            Log out
                        </button>
                    </>
                ) : (
                    <Link to="/admin" className="nav-link admin-link" aria-label="Admin Login">
                        ⚙️ Admin
                    </Link>
                )}
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    )}
                </button>
                <button className="cart-button" onClick={toggleCart} aria-label="Open cart">
                    🛒
                    {cartItemCount > 0 && (
                        <span className="cart-badge">{cartItemCount}</span>
                    )}
                </button>
            </div>
        </nav>
    );
}
