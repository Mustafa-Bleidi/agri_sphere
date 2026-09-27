import React, { useState } from 'react';
import { X } from 'lucide-react';
import './cart.css';

const emptyAddress = {
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
};

const RentalRequestModal = ({ product, onClose, onSubmit, saving, error }) => {
    const [address, setAddress] = useState(emptyAddress);
    const [days, setDays] = useState(1);

    const dailyRate = Number(product.daily_base_rate ?? 0);
    const baseAmount = dailyRate * Math.max(1, days);

    const handleAddressChange = (field) => (event) => {
        setAddress((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!address.address_line1 || !address.city || !address.country) return;
        onSubmit({ address, days: Math.max(1, days), baseAmount });
    };

    return (
        <div className="cart-overlay">
            <div className="cart-card">
                <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>
                <h3 className="cart-title">Rent {product.name}</h3>

                {error && <p className="auth__error-message">{error}</p>}

                <form className="cart-checkout-form" onSubmit={handleSubmit}>
                    <label className="cart-checkout-title" htmlFor="rental-days">Number of days</label>
                    <input
                        id="rental-days"
                        type="number"
                        min="1"
                        value={days}
                        onChange={(event) => setDays(Number(event.target.value))}
                        className="cart-input"
                    />

                    <h4 className="cart-checkout-title">Pickup Address</h4>

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
                        {saving ? 'Sending request...' : `Request Rental — ${baseAmount.toLocaleString()} SYP`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RentalRequestModal;
