import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import RentalRequestModal from '../../../components/cart/RentalRequestModal';
import './farmerMarketplace.css';

const ProductCard = ({ product, categoryNameById, onAddToCart }) => (
    <div className="fm-card">
        {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="fm-card-image" />
        ) : (
            <div className="fm-card-image fm-card-image--placeholder">No image</div>
        )}
        <div className="fm-card-body">
            <h3 className="fm-card-name">{product.name}</h3>
            <span className="fm-card-category">{categoryNameById[product.category_id] ?? 'Uncategorized'}</span>
            {product.short_description && <p className="fm-card-desc">{product.short_description}</p>}
            <div className="fm-card-footer">
                <span className="fm-card-price">{Number(product.price ?? 0).toLocaleString()} SYP</span>
                <button
                    type="button"
                    className="fm-add-btn"
                    disabled={Number(product.stock_quantity) === 0}
                    onClick={() => onAddToCart(product)}
                >
                    <ShoppingCart size={16} /> Add to Cart
                </button>
            </div>
            {Number(product.stock_quantity) === 0 && <p className="fm-out-of-stock">Out of stock</p>}
        </div>
    </div>
);

const RentalCard = ({ product, categoryNameById, onRequestRental }) => (
    <div className="fm-card">
        {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="fm-card-image" />
        ) : (
            <div className="fm-card-image fm-card-image--placeholder">No image</div>
        )}
        <div className="fm-card-body">
            <h3 className="fm-card-name">{product.name}</h3>
            <span className="fm-card-category">{categoryNameById[product.category_id] ?? 'Uncategorized'}</span>
            <p className="fm-rental-rate">{Number(product.daily_base_rate ?? 0).toLocaleString()} SYP / day</p>
            <span className={`fm-status-badge fm-status-${product.rent_product_status}`}>
                {product.rent_product_status}
            </span>
            <div className="fm-card-footer">
                <button
                    type="button"
                    className="fm-add-btn"
                    disabled={product.rent_product_status !== 'available'}
                    onClick={() => onRequestRental(product)}
                >
                    Rent Now
                </button>
            </div>
        </div>
    </div>
);

const FarmerMarketplace = ({
    purchasedProducts,
    rentalProducts,
    loading,
    error,
    categories,
    categoryNameById,
    onAddToCart,
    submitRentalOrder,
}) => {
    const [tab, setTab] = useState('shop');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [rentingProduct, setRentingProduct] = useState(null);
    const [rentalSaving, setRentalSaving] = useState(false);
    const [rentalError, setRentalError] = useState('');
    const [rentalSuccess, setRentalSuccess] = useState('');

    const filteredPurchased = categoryFilter === 'all'
        ? purchasedProducts
        : purchasedProducts.filter((product) => String(product.category_id) === categoryFilter);

    const filteredRental = categoryFilter === 'all'
        ? rentalProducts
        : rentalProducts.filter((product) => String(product.category_id) === categoryFilter);

    const handleRentalSubmit = async (form) => {
        setRentalSaving(true);
        setRentalError('');

        try {
            await submitRentalOrder(rentingProduct, form);
            setRentingProduct(null);
            setRentalSuccess(`Rental request for "${rentingProduct.name}" sent successfully.`);
            setTimeout(() => setRentalSuccess(''), 4000);
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setRentalError(firstError || err.response?.data?.message || 'Could not send the rental request.');
        } finally {
            setRentalSaving(false);
        }
    };

    return (
        <div className="fm-page">
            <div className="fm-header">
                <h2 className="fm-title">Marketplace</h2>
                <div className="fm-tabs">
                    <button className={tab === 'shop' ? 'fm-tab active' : 'fm-tab'} onClick={() => setTab('shop')}>
                        Shop
                    </button>
                    <button className={tab === 'rent' ? 'fm-tab active' : 'fm-tab'} onClick={() => setTab('rent')}>
                        Equipment Rental
                    </button>
                </div>
            </div>

            <div className="fm-filters">
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="fm-filter-select">
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.category_id} value={String(category.category_id)}>{category.name}</option>
                    ))}
                </select>
            </div>

            {rentalSuccess && <p className="auth__success-message">{rentalSuccess}</p>}
            {loading && <p className="dashboard-page__state">Loading marketplace…</p>}
            {!loading && error && <p className="auth__error-message">{error}</p>}

            {!loading && !error && tab === 'shop' && (
                <div className="fm-grid">
                    {filteredPurchased.length === 0 && <p className="dashboard-page__state">No products found.</p>}
                    {filteredPurchased.map((product) => (
                        <ProductCard
                            key={product.product_id}
                            product={product}
                            categoryNameById={categoryNameById}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            )}

            {!loading && !error && tab === 'rent' && (
                <div className="fm-grid">
                    {filteredRental.length === 0 && <p className="dashboard-page__state">No equipment found.</p>}
                    {filteredRental.map((product) => (
                        <RentalCard
                            key={product.product_id}
                            product={product}
                            categoryNameById={categoryNameById}
                            onRequestRental={(p) => { setRentingProduct(p); setRentalError(''); }}
                        />
                    ))}
                </div>
            )}

            {rentingProduct && (
                <RentalRequestModal
                    product={rentingProduct}
                    saving={rentalSaving}
                    error={rentalError}
                    onSubmit={handleRentalSubmit}
                    onClose={() => setRentingProduct(null)}
                />
            )}

        </div>
    );
};

export default FarmerMarketplace;
