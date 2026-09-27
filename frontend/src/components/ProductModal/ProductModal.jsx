import React, { useState } from 'react';
import { X } from 'lucide-react';
import './modal.css';

const emptyForm = {
    name: '',
    sku: '',
    category_id: '',
    brand_id: '',
    price: '',
    compare_price: '',
    stock_quantity: '',
    short_description: '',
    description: '',
};

function productToForm(product) {
    if (!product) return emptyForm;

    return {
        name: product.name ?? '',
        sku: product.sku ?? '',
        category_id: product.category_id ?? '',
        brand_id: product.brand_id ?? '',
        price: product.purchased_product?.price ?? '',
        compare_price: product.purchased_product?.compare_price ?? '',
        stock_quantity: product.stock_quantity ?? '',
        short_description: product.short_description ?? '',
        description: product.description ?? '',
    };
}

const ProductModal = ({ product, categories = [], brands = [], onSave, onClose, saving = false, error = '' }) => {
    const [formData, setFormData] = useState(() => productToForm(product));

    const handleChange = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.name || !formData.sku || !formData.category_id || !formData.price) {
            return;
        }

        onSave(formData);
    };

    return (
        <div className="harvest-overlay">
            <div className="crop-card">
                <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>

                <h3 className="crop-title">{product ? 'Edit Product' : 'Add New Product'}</h3>

                {error && <p className="auth__error-message">{error}</p>}

                <form className="agri-form" onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label className="field-label">Product Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleChange('name')}
                            className="field-input"
                            placeholder="Product Name"
                            required
                        />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label">SKU</label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={handleChange('sku')}
                                className="field-input"
                                placeholder="Unique product code"
                                required
                            />
                        </div>
                        <div className="field-group">
                            <label className="field-label">Stock Quantity</label>
                            <input
                                type="number"
                                value={formData.stock_quantity}
                                onChange={handleChange('stock_quantity')}
                                className="field-input"
                            />
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label">Price (SYP)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange('price')}
                                className="field-input"
                                required
                            />
                        </div>
                        <div className="field-group">
                            <label className="field-label">Compare Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.compare_price}
                                onChange={handleChange('compare_price')}
                                className="field-input"
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Category</label>
                        <select
                            value={formData.category_id}
                            onChange={handleChange('category_id')}
                            className="field-select"
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Brand</label>
                        <select
                            value={formData.brand_id}
                            onChange={handleChange('brand_id')}
                            className="field-select"
                        >
                            <option value="">No brand</option>
                            {brands.map((brand) => (
                                <option key={brand.brand_id} value={brand.brand_id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Short Description</label>
                        <input
                            type="text"
                            value={formData.short_description}
                            onChange={handleChange('short_description')}
                            className="field-input"
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={handleChange('description')}
                            className="field-input"
                            rows={3}
                        />
                    </div>

                    <div className="action-bar">
                        <button type="submit" className="confirm-btn" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Product'}
                        </button>
                        <button type="button" onClick={onClose} className="discard-btn">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
