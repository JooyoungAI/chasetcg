import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ cart, theme, toggleTheme, toggleCart, currentUser, handleLogout }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const location = useLocation();

    // Close mobile menu when navigating
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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

            <button
                className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            <div className={`nav-menu-container ${isMobileMenuOpen ? 'open' : ''}`}>
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <Link to="/admin" className="nav-link admin-link" aria-label="Admin Login">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Admin
                        </Link>
                    )}
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                            </svg>
                        )}
                    </button>
                    <button className="cart-button" onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }} aria-label="Open cart">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="cart-badge">{cartItemCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}
