import React from 'react';
import './ShoppingCart.css';

export default function ShoppingCart({ cart, isOpen, onClose, updateQuantity, removeFromCart }) {
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <>
            {/* Overlay */}
            <div
                className={`cart-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Cart Drawer */}
            <div className={`cart-drawer glass-panel ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button className="close-cart" onClick={onClose} aria-label="Close cart">&times;</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-info">
                                    <h4>{item.name}</h4>
                                    <p className="cart-item-price">${item.price.toFixed(2)}</p>

                                    <div className="quantity-controls">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                                <button className="remove-item" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn">Checkout</button>
                    </div>
                )}
            </div>
        </>
    );
}
