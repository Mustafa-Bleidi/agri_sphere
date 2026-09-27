import React from 'react';
import { Link } from 'react-router';
import './farmerOrders.css';

const statusOf = (order) => order.order_type === 'rental_order' ? order.rental_status : order.order_status;
const totalOf = (order) => order.order_type === 'rental_order' ? order.rental_total_amount : order.grand_total;

const FarmerOrders = ({ orders, loading, error }) => (
    <div className="fo-page">
        <h2 className="fo-title">My Orders</h2>

        {loading && <p className="dashboard-page__state">Loading your orders…</p>}
        {!loading && error && <p className="auth__error-message">{error}</p>}
        {!loading && !error && orders.length === 0 && (
            <p className="dashboard-page__state">You haven't placed any orders yet. Visit the marketplace to get started.</p>
        )}

        {!loading && !error && orders.length > 0 && (
            <div className="fo-list">
                {orders.map((order) => (
                    <Link key={order.order_id} to={`/farmer/orders/${order.order_id}`} className="fo-item">
                        <div className="fo-item-main">
                            <span className="fo-item-type">
                                {order.order_type === 'rental_order' ? 'Equipment Rental' : 'Purchase'}
                            </span>
                            <span className="fo-item-id">Order #{order.order_id}</span>
                        </div>
                        <div className="fo-item-details">
                            <span className={`fo-status fo-status-${statusOf(order)}`}>{statusOf(order)}</span>
                            <span className="fo-total">{Number(totalOf(order) ?? order.amount ?? 0).toLocaleString()} SYP</span>
                        </div>
                    </Link>
                ))}
            </div>
        )}

    </div>
);

export default FarmerOrders;
