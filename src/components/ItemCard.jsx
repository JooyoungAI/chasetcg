import React from 'react';
import './ItemCard.css';

export default function ItemCard({ item, addToCart }) {
    return (
        <div className="item-card glass-panel">
            <div className="item-image-wrapper">
                <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
            </div>
            <div className="item-content">
                <h3 className="item-title">{item.name}</h3>
                <p className="item-desc">{item.description}</p>
                <div className="item-footer">
                    <span className="item-price">${item.price.toFixed(2)}</span>
                    <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(item)}
                        aria-label={`Add ${item.name} to cart`}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
