import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../../api/account';
import './farmerProfile.css';

const emptyForm = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
};

// The API's response shape varies depending on whether the farmer already
// has a saved address on file — normalize both shapes into one flat object.
function normalizeProfile(data) {
    const record = Array.isArray(data) ? data[0] : data;
    if (!record) return emptyForm;

    const address = record.addresses?.[0] ?? record;

    return {
        ...emptyForm,
        username: record.username ?? '',
        email: record.email ?? '',
        first_name: record.first_name ?? '',
        last_name: record.last_name ?? '',
        phone_number: record.phone_number ?? '',
        address_line1: address?.address_line1 ?? '',
        address_line2: address?.address_line2 ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        country: address?.country ?? '',
        postal_code: address?.postal_code ?? '',
    };
}

const FarmerProfile = () => {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        getProfile()
            .then((data) => setForm(normalizeProfile(data)))
            .catch(() => setError('Could not load your profile.'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const payload = { ...form, address_type: 'user_address' };
        if (!payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        try {
            await updateProfile(payload);
            setSuccess('Profile updated successfully.');
            setForm((prev) => ({ ...prev, password: '', password_confirmation: '' }));
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            setError(firstError || 'Could not update your profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="dashboard-page__state">Loading your profile…</p>;

    return (
        <div className="fp-page">
            <h2 className="fp-title">My Profile</h2>

            <form className="fp-form" onSubmit={handleSubmit}>
                {error && <p className="auth__error-message">{error}</p>}
                {success && <p className="auth__success-message">{success}</p>}

                <h3 className="fp-section-title">Account</h3>
                <div className="fp-row">
                    <input className="fp-input" placeholder="Username" value={form.username} onChange={handleChange('username')} required />
                    <input className="fp-input" type="email" placeholder="Email" value={form.email} onChange={handleChange('email')} required />
                </div>
                <div className="fp-row">
                    <input className="fp-input" placeholder="First name" value={form.first_name} onChange={handleChange('first_name')} />
                    <input className="fp-input" placeholder="Last name" value={form.last_name} onChange={handleChange('last_name')} />
                </div>
                <input className="fp-input" placeholder="Phone number" value={form.phone_number} onChange={handleChange('phone_number')} />

                <h3 className="fp-section-title">Change Password (optional)</h3>
                <div className="fp-row">
                    <input className="fp-input" type="password" placeholder="New password" value={form.password} onChange={handleChange('password')} />
                    <input className="fp-input" type="password" placeholder="Confirm new password" value={form.password_confirmation} onChange={handleChange('password_confirmation')} />
                </div>

                <h3 className="fp-section-title">Farm Address</h3>
                <input className="fp-input" placeholder="Address line 1" value={form.address_line1} onChange={handleChange('address_line1')} />
                <input className="fp-input" placeholder="Address line 2" value={form.address_line2} onChange={handleChange('address_line2')} />
                <div className="fp-row">
                    <input className="fp-input" placeholder="City" value={form.city} onChange={handleChange('city')} />
                    <input className="fp-input" placeholder="State/Province" value={form.state} onChange={handleChange('state')} />
                </div>
                <div className="fp-row">
                    <input className="fp-input" placeholder="Country" value={form.country} onChange={handleChange('country')} />
                    <input className="fp-input" placeholder="Postal code" value={form.postal_code} onChange={handleChange('postal_code')} />
                </div>

                <button type="submit" className="fp-save-btn" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </form>

        </div>
    );
};

export default FarmerProfile;
