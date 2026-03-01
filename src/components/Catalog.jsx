import React, { useState } from 'react';
import ItemCard from './ItemCard';
import './Catalog.css';

export default function Catalog({ items, addToCart }) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const validCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to page 1 if items change (like when category changes)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [items]);

    return (
        <div>
            <section className="catalog-grid">
                {paginatedItems.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        addToCart={addToCart}
                    />
                ))}
            </section>

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={validCurrentPage === 1}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)', background: validCurrentPage === 1 ? 'transparent' : 'var(--panel-bg)', color: validCurrentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        Previous
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Page {validCurrentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={validCurrentPage === totalPages}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)', background: validCurrentPage === totalPages ? 'transparent' : 'var(--panel-bg)', color: validCurrentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
