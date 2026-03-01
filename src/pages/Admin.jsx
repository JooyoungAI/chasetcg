import React, { useState } from 'react';
import { catalogItems } from '../data/mockItems';
import { db } from '../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import './Admin.css';

export default function Admin({ products, addProduct, removeProduct, updateProduct }) {
    const defaultProductState = {
        name: '',
        price: '',
        category: 'sealed',
        image: '',
        description: ''
    };

    const [newProduct, setNewProduct] = useState(defaultProductState);
    const [editingProductId, setEditingProductId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    // Search TCGdex States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleEdit = (product) => {
        setEditingProductId(product.id);
        setNewProduct(product);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setNewProduct(defaultProductState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newProductData = {
            ...newProduct,
            price: parseFloat(newProduct.price) || 0
        };

        if (editingProductId && updateProduct) {
            const success = await updateProduct(editingProductId, newProductData);
            if (success) {
                handleCancelEdit();
                alert('Product successfully updated!');
            }
        } else {
            const success = await addProduct(newProductData);
            if (success) {
                handleCancelEdit();
                alert('Product successfully added!');
            }
        }
    };

    const handleSearchTcgDex = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);

        try {
            const response = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            // TCGdex returns an array of objects: { id, localId, name, image }
            // Filter out items without an image to avoid broken UI
            const validCards = (data || []).filter(c => c.image);
            setSearchResults(validCards);
        } catch (error) {
            console.error("Error fetching from TCGdex:", error);
            alert("Failed to search TCGdex. Try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFromSearch = async (card) => {
        // Ask for price
        const priceStr = window.prompt(`Set selling price for ${card.name} (e.g. 5.99):`);
        if (priceStr === null) return; // User cancelled

        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
            alert('Invalid price entered. Cancelled.');
            return;
        }

        try {
            // We need to fetch the specific card details to get the exact Set Name 
            // because the v2/en/cards search endpoint doesn't return the set explicitly
            const detailRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`);
            const detailData = await detailRes.json();

            const setName = detailData.set?.name || 'Unknown Set';
            const fullName = `${detailData.name} - ${setName}`;

            const productToAdd = {
                name: fullName,
                price: price,
                category: 'singles', // default to singles
                image: `${card.image}/high.webp`,
                description: 'A genuine Pokémon Trading Card.',
            };

            const success = await addProduct(productToAdd);
            if (success) {
                alert(`Successfully added ${fullName} for $${price.toFixed(2)}`);
            }
        } catch (error) {
            console.error("Error adding searched card: ", error);
            alert("Something went wrong verifying the card details.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await removeProduct(id);
        }
    }

    const handleForcedSync = async () => {
        if (!window.confirm(`This will completely wipe current items and re-upload all ${catalogItems.length} mock items with the updated Set Names. Continue?`)) return;

        try {
            alert('Starting forced database sync... this may take 10 seconds. Check console for logs.');

            console.log("Starting Web Client Firestore cleanup and migration...");
            const productsCol = collection(db, 'products');

            console.log("1. Deleting all existing products in Firestore...");
            const existingDocs = await getDocs(productsCol);
            let deleteBatch = writeBatch(db);
            existingDocs.forEach((document) => {
                deleteBatch.delete(doc(db, 'products', document.id));
            });

            await deleteBatch.commit();
            console.log("Finished deleting old mock data.");

            console.log("2. Uploading enriched catalogItems to Firestore...");
            let insertBatch = writeBatch(db);

            for (const item of catalogItems) {
                const newDocRef = doc(productsCol);
                insertBatch.set(newDocRef, {
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    description: item.description,
                    image: item.image,
                    createdAt: new Date()
                });
            }

            await insertBatch.commit();
            console.log("Successfully uploaded new mock data.");
            alert('Migration complete! Refresh the page to see live data.');
            window.location.reload();

        } catch (error) {
            console.error("Migration failed:", error);
            alert('Migration failed! ' + error.message);
        }
    }

    const handleDeleteAll = async () => {
        if (products.length === 0) return;
        if (window.confirm(`⚠️ Are you SURE you want to delete all ${products.length} products? This cannot be undone.`)) {
            try {
                // Remove all concurrently
                await Promise.all(products.map(product => removeProduct(product.id)));
                alert('All products successfully deleted!');
            } catch (error) {
                console.error("Error deleting all products:", error);
                alert("An error occurred while deleting some products.");
            }
        }
    }

    const handleFilterChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1);
    };

    const filteredProducts = filterCategory === 'All'
        ? products
        : products.filter(p => p.category === filterCategory);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const validCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="9"></rect>
                        <rect x="14" y="3" width="7" height="5"></rect>
                        <rect x="14" y="12" width="7" height="9"></rect>
                        <rect x="3" y="16" width="7" height="5"></rect>
                    </svg>
                    <h2 style={{ margin: 0 }}>Store Administration</h2>
                </div>
                <p>Manage your inventory, prices, and categories from this dashboard.</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={handleForcedSync}
                        style={{ background: '#ec4899', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
                        title="Setup button to instantly migrate initial mock data to your new database."
                    >
                        Force DB Sync (Update Set Names)
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
                        title="Warning: This deletes everything."
                    >
                        Delete All Items
                    </button>
                </div>
            </header>

            <div className="admin-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>

                {/* Left Side: Forms container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* TCGdex API Search Form */}
                    <section className="admin-section glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Live TCGdex Card Search</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Search any Pokemon card by name, click it, type a price, and it instantly adds to your store!
                        </p>
                        <form className="admin-form" onSubmit={handleSearchTcgDex}>
                            <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. Charizard, Evolving Skies"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ flexGrow: 1 }}
                                />
                                <button type="submit" className="admin-submit-btn" disabled={isSearching} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                                    {isSearching ? '...' : 'Search'}
                                </button>
                            </div>
                        </form>

                        {/* Search Results Display */}
                        {searchResults.length > 0 && (
                            <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', paddingRight: '0.5rem' }}>
                                {searchResults.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => handleAddFromSearch(card)}
                                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        title={`Click to add ${card.name}`}
                                    >
                                        <img src={`${card.image}/low.webp`} alt={card.name} style={{ width: '100%', borderRadius: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                        <span style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: 'bold' }}>{card.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.length === 0 && searchQuery && !isSearching && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Press search to find cards...</span>
                        )}
                    </section>

                    {/* Manual Add/Edit Product Form */}
                    <section className="admin-section form-section glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                            {editingProductId ? 'Edit Specific Product' : 'Add Custom Product'}
                        </h3>
                        <form className="admin-form" onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label htmlFor="name">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newProduct.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Price ($) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    value={newProduct.price}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={newProduct.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="sealed">Sealed</option>
                                    <option value="singles">Singles</option>
                                    <option value="graded">Graded</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Image URL</label>
                                <input
                                    type="url"
                                    id="image"
                                    name="image"
                                    placeholder="https://..."
                                    value={newProduct.image}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={newProduct.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="admin-submit-btn">
                                    {editingProductId ? 'Update Product' : 'Add Product to Store'}
                                </button>
                                {editingProductId && (
                                    <button type="button" onClick={handleCancelEdit} style={{ background: '#64748b', color: 'white', padding: '0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right Side: Current Inventory Table */}
                <section className="admin-section inventory-section glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Current Inventory ({filteredProducts.length})</h3>
                        <div className="filter-group">
                            <label htmlFor="filterCategory" style={{ marginRight: '0.5rem' }}>Filter:</label>
                            <select id="filterCategory" value={filterCategory} onChange={handleFilterChange} style={{ padding: '0.3rem', borderRadius: '4px', background: '#ffffff', color: '#1e293b' }}>
                                <option value="All">All Categories</option>
                                <option value="sealed">Sealed</option>
                                <option value="singles">Singles</option>
                                <option value="graded">Graded</option>
                                <option value="accessories">Accessories</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <img src={product.image} alt={product.name} className="admin-table-img" />
                                        </td>
                                        <td className="font-medium">{product.name}</td>
                                        <td>
                                            <span className={`category-badge ${product.category}`}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="font-bold text-accent">${product.price.toFixed(2)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(product)}
                                                    style={{ background: '#3b82f6', color: 'white', padding: '0.35rem 0.6rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    aria-label="Edit product"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(product.id)}
                                                    aria-label="Delete product"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No products found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={validCurrentPage === 1}
                                style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--panel-border)', background: validCurrentPage === 1 ? 'transparent' : 'var(--panel-bg)', color: validCurrentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ fontWeight: 'bold' }}>
                                Page {validCurrentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={validCurrentPage === totalPages}
                                style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--panel-border)', background: validCurrentPage === totalPages ? 'transparent' : 'var(--panel-bg)', color: validCurrentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
