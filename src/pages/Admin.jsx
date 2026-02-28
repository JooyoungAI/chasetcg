import React, { useState } from 'react';
import { runMigration } from '../migrateData';
import { catalogItems } from '../data/mockItems';
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await removeProduct(id);
        }
    }

    const handleMigration = async () => {
        if (window.confirm(`This will upload ${catalogItems.length} mock items to Firebase. Are you sure?`)) {
            const success = await runMigration();
            if (success) alert('Migration complete! Refresh to see live data.');
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
                <h2>🛠️ Store Administration</h2>
                <p>Manage your inventory, prices, and categories from this dashboard.</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={handleMigration}
                        style={{ background: '#ec4899', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
                        title="Setup button to instantly migrate initial mock data to your new database."
                    >
                        Run Firebase Initial Data Upload
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

            <div className="admin-content">

                {/* Left Side: Add/Edit Product Form */}
                <section className="admin-section form-section glass-panel">
                    <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
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
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(product)}
                                                style={{ background: '#3b82f6', color: 'white', padding: '0.35rem 0.6rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.8rem' }}
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
                                style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', background: validCurrentPage === 1 ? '#cbd5e1' : '#3b82f6', color: 'white', cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ fontWeight: 'bold' }}>
                                Page {validCurrentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={validCurrentPage === totalPages}
                                style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', background: validCurrentPage === totalPages ? '#cbd5e1' : '#3b82f6', color: 'white', cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer' }}
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
