import React, { useState } from 'react';
import { Bell, Check, Edit2, Trash2, Plus } from 'lucide-react';
import './marketplace.css';

const PendingOrdersSection = ({ pendingOrders, setSelectedOrder, setShowOrderModal }) => {
  if (pendingOrders.length === 0) return null;
  return (
    <div className="pending-orders-section">
      <h3 className="section-title">
        <Bell className="bell-icon" /> Pending Orders ({pendingOrders.length})
      </h3>
      <div className="orders-list">
        {pendingOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-content">
              <h4 className="farmer-name-market">{order.farmer}</h4>
              <p className="product-name">{order.productName}</p>
              <pre className="order-details">
                Quantity: {order.quantity} {order.unit} • Total: {order.totalPrice} SYP
              </pre>
              <p className="order-date">{order.date}</p>
            </div>
            <div className="order-actions">
              <button
                onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                className="review-btn"
              >
                <Check size={18} /> Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActiveOrdersSection = ({ activeOrders, handleShipOrder, handleDeliverOrder, getStatusColor }) => {
  if (activeOrders.length === 0) return null;
  return (
    <div className="active-orders-section card">
      <h3 className="section-title">Active Orders ({activeOrders.length})</h3>
      <div className="orders-list">
        {activeOrders.map(order => (
          <div key={order.id} className="active-order-item">
            <div className="order-header">
              <div className="farmer-and-status">
                <h4 className="farmer-name-market">{order.farmer}</h4>
                <span className={`status-badge ${getStatusColor(order.status)}`}>
                  {order.status === 'processing' ? 'Processing' : 'On Way'}
                </span>
              </div>
              <p className="product-name">{order.productName}</p>
              <pre className="order-details">{order.quantity} {order.unit} • {order.totalPrice} SYP</pre>
              {order.approvedDate && <p className="timestamp">Approved: {order.approvedDate}</p>}
              {order.shippedDate && <p className="timestamp">Shipped: {order.shippedDate}</p>}
            </div>
            <div className="order-actions">
              {order.status === 'processing' && (
                <button onClick={() => handleShipOrder(order.id)} className="ship-btn">
                  Mark as Shipped
                </button>
              )}
              {order.status === 'on-way' && (
                <button onClick={() => handleDeliverOrder(order.id)} className="deliver-btn">
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsSection = ({ products, loading, error, categoryNameById, setEditingProduct, setShowProductModal, handleDeleteProduct }) => (
  <div className="products-section">
    <h3 className="section-title">My Products</h3>

    {loading && <p className="dashboard-page__state">Loading your products…</p>}
    {!loading && error && <p className="auth__error-message">{error}</p>}
    {!loading && !error && products.length === 0 && (
      <p className="dashboard-page__state">You haven't listed any products yet.</p>
    )}

    <div className="products-grid">
      {products.map(product => (
        <div key={product.product_id} className="product-card card">
          <div className="product-header">
            <div className="product-info">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="product-image" />
              ) : (
                <div className="product-image product-image--placeholder">No image</div>
              )}
              <div className="product-text">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{Number(product.purchased_product?.price ?? 0).toLocaleString()} SYP</p>
                <p className={`product-stock ${Number(product.stock_quantity ?? 0) < 20 ? 'low-stock' : ''}`}>
                  Stock: {product.stock_quantity ?? 0}
                </p>
                <span className="category-badge">
                  {categoryNameById[product.category_id] ?? `Category #${product.category_id}`}
                </span>
              </div>
            </div>
            <div className="product-actions">
              <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="edit-btn">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDeleteProduct(product.product_id)} className="delete-btn">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarketplacePage = ({
  products, loading, error,
  categoryNameById,
  setShowProductModal, setEditingProduct,
  handleDeleteProduct,
}) => {
  const [orders, setOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => order.status === 'processing' || order.status === 'on-way');

  const handleApproveOrder = (orderId) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'processing', approvedDate: now }
          : order
      )
    );
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleShipOrder = (orderId) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'on-way', shippedDate: now }
          : order
      )
    );
  };

  const handleDeliverOrder = (orderId) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'delivered', deliveredDate: now }
          : order
      )
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'on-way': return 'on-way';
      case 'delivered': return 'delivered';
      default: return 'other';
    }
  };

  return (
    <div className="marketplace-page">
      <div className="page-header">
        <h2 className="page-title">My Store</h2>
        <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="add-product-btn">
          <Plus size={20} /> Add New Product
        </button>
      </div>

      <PendingOrdersSection
        pendingOrders={pendingOrders}
        setSelectedOrder={setSelectedOrder}
        setShowOrderModal={setShowOrderModal}
      />

      <ActiveOrdersSection
        activeOrders={activeOrders}
        handleShipOrder={handleShipOrder}
        handleDeliverOrder={handleDeliverOrder}
        getStatusColor={getStatusColor}
      />

      <ProductsSection
        products={products}
        loading={loading}
        error={error}
        categoryNameById={categoryNameById}
        setEditingProduct={setEditingProduct}
        setShowProductModal={setShowProductModal}
        handleDeleteProduct={handleDeleteProduct}
      />

      {showOrderModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-conten-product-market">
            <h3 className="modal-title-product">Order Review</h3>
            <div className="modal-body-product">
              <div className="modal-field-product">
                <p className="field-label">Customer</p>
                <p className="field-value">{selectedOrder.farmer}</p>
              </div>
              <div className="modal-field">
                <p className="field-label">Product</p>
                <p className="field-value">{selectedOrder.productName}</p>
              </div>
              <div className="modal-grid">
                <div className="modal-field">
                  <p className="field-label">Quantity</p>
                  <p className="field-value">{selectedOrder.quantity} {selectedOrder.unit}</p>
                </div>
                <div className="modal-field">
                  <p className="field-label">Total Price</p>
                  <p className="field-value price">{selectedOrder.totalPrice} SYP</p>
                </div>
              </div>
              <div className="modal-field">
                <p className="field-label">Order Date</p>
                <p className="field-value">{selectedOrder.date}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => handleApproveOrder(selectedOrder.id)} className="approve-btn">
                <Check size={18} /> Approve Order
              </button>
              <button onClick={() => { setShowOrderModal(false); setSelectedOrder(null); }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MarketplacePage;
