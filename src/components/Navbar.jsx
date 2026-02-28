import React from 'react';

export default function Navbar({ cart, theme, toggleTheme, toggleCart }) {
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="navbar glass-panel">
            <div className="nav-brand">
                <h1>ChaseTCG</h1>
            </div>
            <div className="nav-actions">
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
