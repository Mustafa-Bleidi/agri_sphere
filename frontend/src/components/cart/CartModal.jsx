import React, { useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import './cart.css';

const emptyAddress = {
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
};

const CartModal = ({ items, onClose, onUpdateQuantity, onRemove, onCheckout, saving, error }) => {
    const [address, setAddress] = useState(emptyAddress);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleAddressChange = (field) => (event) => {
        setAddress((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!address.address_line1 || !address.city || !address.country) return;
        onCheckout(address);
    };

    return (
        <div className="cart-overlay">
            <div className="cart-card">
                <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>
                <h3 className="cart-title">Your Cart</h3>

                {items.length === 0 ? (
                    <p className="cart-empty">Your cart is empty.</p>
                ) : (
                    <>
                        <div className="cart-items">
                            {items.map((item) => (
                                <div key={item.product_id} className="cart-item">
                                    <div className="cart-item-info">
                                        <p className="cart-item-name">{item.name}</p>
                                        <p className="cart-item-price">{Number(item.price).toLocaleString()} SYP</p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button type="button" onClick={() => onUpdateQuantity(item.product_id, Math.max(1, item.quantity - 1))}>
                                            <Minus size={14} />
                                        </button>
                                        <span className="cart-item-qty">{item.quantity}</span>
                                        <button type="button" onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}>
                                            <Plus size={14} />
                                        </button>
                                        <button type="button" className="cart-item-remove" onClick={() => onRemove(item.product_id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-subtotal">
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString()} SYP</span>
                        </div>

                        <form className="cart-checkout-form" onSubmit={handleSubmit}>
                            <h4 className="cart-checkout-title">Shipping Address</h4>

                            {error && <p className="auth__error-message">{error}</p>}

                            <input
                                type="text"
                                placeholder="Address line 1"
                                value={address.address_line1}
                                onChange={handleAddressChange('address_line1')}
                                className="cart-input"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Address line 2 (optional)"
                                value={address.address_line2}
                                onChange={handleAddressChange('address_line2')}
                                className="cart-input"
                            />
                            <div className="cart-input-row">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={handleAddressChange('city')}
                                    className="cart-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="State/Province"
                                    value={address.state}
                                    onChange={handleAddressChange('state')}
                                    className="cart-input"
                                />
                            </div>
                            <div className="cart-input-row">
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={address.country}
                                    onChange={handleAddressChange('country')}
                                    className="cart-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Postal code"
                                    value={address.postal_code}
                                    onChange={handleAddressChange('postal_code')}
                                    className="cart-input"
                                />
                            </div>

                            <p className="cart-payment-note">Payment: Cash on delivery</p>

                            <button type="submit" className="cart-checkout-btn" disabled={saving}>
                                {saving ? 'Placing order...' : `Place Order — ${subtotal.toLocaleString()} SYP`}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartModal;
