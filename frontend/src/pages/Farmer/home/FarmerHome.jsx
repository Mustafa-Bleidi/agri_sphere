import React from 'react';
import { Link } from 'react-router';
import { ShoppingCart, ClipboardList, User as UserIcon, Package } from 'lucide-react';
import './farmerHome.css';

const statusOf = (order) => order.order_type === 'rental_order' ? order.rental_status : order.order_status;

const FarmerHome = ({ userName, orders, ordersLoading, cartCount }) => {
    const pendingCount = orders.filter((order) => statusOf(order) === 'pending' || statusOf(order) === 'quote').length;

    return (
        <div className="fh-page">
            <h2 className="fh-title">Welcome back, {userName}</h2>

            <div className="fh-stats">
                <div className="fh-stat-card">
                    <Package className="fh-stat-icon" />
                    <div>
                        <p className="fh-stat-value">{ordersLoading ? '…' : orders.length}</p>
                        <p className="fh-stat-label">Total Orders</p>
                    </div>
                </div>
                <div className="fh-stat-card">
                    <ClipboardList className="fh-stat-icon" />
                    <div>
                        <p className="fh-stat-value">{ordersLoading ? '…' : pendingCount}</p>
                        <p className="fh-stat-label">Pending / In Progress</p>
                    </div>
                </div>
                <div className="fh-stat-card">
                    <ShoppingCart className="fh-stat-icon" />
                    <div>
                        <p className="fh-stat-value">{cartCount}</p>
                        <p className="fh-stat-label">Items in Cart</p>
                    </div>
                </div>
            </div>

            <div className="fh-actions">
                <Link to="/farmer/marketplace" className="fh-action-card">
                    <ShoppingCart size={22} />
                    <span>Browse Marketplace</span>
                </Link>
                <Link to="/farmer/orders" className="fh-action-card">
                    <ClipboardList size={22} />
                    <span>Track My Orders</span>
                </Link>
                <Link to="/farmer/profile" className="fh-action-card">
                    <UserIcon size={22} />
                    <span>Manage Profile</span>
                </Link>
            </div>

            {!ordersLoading && orders.length > 0 && (
                <div className="fh-recent">
                    <h3 className="fh-section-title">Recent Orders</h3>
                    <div className="fh-recent-list">
                        {orders.slice(0, 3).map((order) => (
                            <Link key={order.order_id} to={`/farmer/orders/${order.order_id}`} className="fh-recent-item">
                                <span>Order #{order.order_id}</span>
                                <span className="fh-recent-status">{statusOf(order)}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default FarmerHome;
