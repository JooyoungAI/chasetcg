import React, { useState } from 'react';
import './Admin.css';

export default function Admin({ products, setProducts }) {
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: 'sealed',
        image: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create new product object
        const addedProduct = {
            ...newProduct,
            id: Date.now(), // Generate a simple unique ID
            price: parseFloat(newProduct.price) || 0
        };

        // Add to main product state
        setProducts([...products, addedProduct]);

        // Reset form
        setNewProduct({
            name: '',
            price: '',
            category: 'sealed',
            image: '',
            description: ''
        });

        alert('Product successfully added!');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h2>🛠️ Store Administration</h2>
                <p>Manage your inventory, prices, and categories from this dashboard.</p>
            </header>

            <div className="admin-content">

                {/* Left Side: Add New Product Form */}
                <section className="admin-section form-section glass-panel">
                    <h3>Add New Product</h3>
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

                        <button type="submit" className="admin-submit-btn">Add Product to Store</button>
                    </form>
                </section>

                {/* Right Side: Current Inventory Table */}
                <section className="admin-section inventory-section glass-panel">
                    <h3>Current Inventory ({products.length})</h3>
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
                                {products.map(product => (
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
                                                className="delete-btn"
                                                onClick={() => handleDelete(product.id)}
                                                aria-label="Delete product"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No products found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}
