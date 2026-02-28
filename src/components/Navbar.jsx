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
                    {theme === 'light' ? '🌙' : '☀️'}
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
