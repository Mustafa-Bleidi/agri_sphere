import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { getOrderDetails } from '../../../api/orders';
import './farmerOrders.css';

const formatAddress = (address) => {
    if (!address) return 'No address on file';
    return [address.address_line1, address.address_line2, address.city, address.state, address.country, address.postal_code]
        .filter(Boolean)
        .join(', ');
};

const FarmerOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = () => {
            setLoading(true);
            setError('');
            getOrderDetails(id)
                .then(setOrder)
                .catch(() => setError('Could not load this order.'))
                .finally(() => setLoading(false));
        };

        loadOrder();
    }, [id]);

    return (
        <div className="fo-page">
            <Link to="/farmer/orders" className="fo-back-link">
                <ArrowLeft size={16} /> Back to orders
            </Link>

            {loading && <p className="dashboard-page__state">Loading order…</p>}
            {!loading && error && <p className="auth__error-message">{error}</p>}

            {!loading && !error && order && (
                <div className="fo-detail-card">
                    <div className="fo-detail-header">
                        <h2 className="fo-title">Order #{order.order_id}</h2>
                        <span className={`fo-status fo-status-${order.order_type === 'rental_order' ? order.rental_status : order.order_status}`}>
                            {order.order_type === 'rental_order' ? order.rental_status : order.order_status}
                        </span>
                    </div>

                    <p className="fo-detail-meta">
                        {order.order_type === 'rental_order' ? 'Equipment Rental' : 'Purchase'} • Payment: {order.payment_method} ({order.payment_status})
                    </p>

                    {order.order_type === 'purchased_order' ? (
                        <>
                            <h3 className="fo-section-title">Items</h3>
                            <div className="fo-items">
                                {(order.purchased_order_items ?? []).map((item) => (
                                    <div key={item.purchased_order_item_id} className="fo-order-item">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>{Number(item.price).toLocaleString()} SYP</span>
                                    </div>
                                ))}
                            </div>
                            <div className="fo-order-item fo-order-total">
                                <span>Grand Total</span>
                                <span>{Number(order.grand_total ?? 0).toLocaleString()} SYP</span>
                            </div>
                            <h3 className="fo-section-title">Shipping Address</h3>
                            <p className="fo-address">{formatAddress(order.shipping_address)}</p>
                        </>
                    ) : (
                        <>
                            <h3 className="fo-section-title">Equipment</h3>
                            <p className="fo-address">{order.rental_product?.product?.name ?? 'Rental equipment'}</p>
                            <div className="fo-order-item fo-order-total">
                                <span>Total</span>
                                <span>{Number(order.total_amount ?? 0).toLocaleString()} SYP</span>
                            </div>
                            <h3 className="fo-section-title">Pickup Address</h3>
                            <p className="fo-address">{formatAddress(order.pickup_address)}</p>
                        </>
                    )}
                </div>
            )}

        </div>
    );
};

export default FarmerOrderDetail;
