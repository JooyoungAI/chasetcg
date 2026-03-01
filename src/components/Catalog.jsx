import React, { useState } from 'react';
import ItemCard from './ItemCard';
import './Catalog.css';

export default function Catalog({ items, addToCart }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('date-new'); // Default to newest first
    const [searchQuery, setSearchQuery] = useState('');
    const ITEMS_PER_PAGE = 50;

    // Memoize the sorted items so we don't recalculate unless items, sortOption, or search changes
    const sortedItems = React.useMemo(() => {
        let itemsCopy = [...items]; // Clone array to avoid mutating props

        // Filter by search query first
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            itemsCopy = itemsCopy.filter(item =>
                (item.name || '').toLowerCase().includes(lowerQuery)
            );
        }

        switch (sortOption) {
            case 'price-low':
                return itemsCopy.sort((a, b) => a.price - b.price);
            case 'price-high':
                return itemsCopy.sort((a, b) => b.price - a.price);
            case 'alpha-az':
                return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
            case 'alpha-za':
                return itemsCopy.sort((a, b) => b.name.localeCompare(a.name));
            case 'date-old':
                return itemsCopy; // Original fetch order
            case 'date-new':
            default:
                return itemsCopy.reverse(); // Reverse fetch order (newest first)
        }
    }, [items, sortOption, searchQuery]);

    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    const validCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to page 1 if criteria changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [items, sortOption, searchQuery]);

    return (
        <div>
            {/* Sorting Controls */}
            <div className="catalog-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem', gap: '1rem', flexWrap: 'wrap' }}>

                {/* Search Input */}
                <div style={{ flex: '1 1 250px', maxWidth: '400px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '0.75rem' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="sort-dropdown" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</label>
                    <select
                        id="sort-dropdown"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
                    >
                        <option value="date-new">Date: Newest to Oldest</option>
                        <option value="date-old">Date: Oldest to Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="alpha-az">Alphabetical: A-Z</option>
                        <option value="alpha-za">Alphabetical: Z-A</option>
                    </select>
                </div>
            </div>

            <section className="catalog-grid">
                {paginatedItems.length > 0 ? paginatedItems.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        addToCart={addToCart}
                    />
                )) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '1.2rem' }}>No products found matching "{searchQuery}"</p>
                    </div>
                )}
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
