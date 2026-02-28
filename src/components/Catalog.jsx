import React from 'react';
import ItemCard from './ItemCard';
import './Catalog.css';

export default function Catalog({ items, addToCart }) {
    return (
        <section className="catalog-grid">
            {items.map(item => (
                <ItemCard
                    key={item.id}
                    item={item}
                    addToCart={addToCart}
                />
            ))}
        </section>
    );
}
